import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, Plus, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR, fileHash } from "@/lib/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Center = { id: string; nome: string; tipo: string; obra_id: string | null };
const statusLabel: Record<string, string> = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada", paga: "Paga", cancelada: "Cancelada" };
const statusTone: Record<string, string> = { pendente: "bg-warning/15 text-warning", aprovada: "bg-primary/10 text-primary", rejeitada: "bg-destructive/10 text-destructive", paga: "bg-good/10 text-good", cancelada: "bg-muted text-muted-foreground" };
const today = () => new Date().toISOString().slice(0, 10);
const normalize = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").trim();
const centerLabel = (c: Center, works: { id: string; nome: string }[]) => c.tipo === "obra" ? `Obra · ${works.find(w => w.id === c.obra_id)?.nome ?? c.nome}` : `Centro · ${c.nome}`;
const emptyForm = { fornecedor: "", descricao: "", categoria: "", valor: "", vencimento: today(), centro_custo_id: "" };

export function Purchases() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState("todas");
  const ddaInput = useRef<HTMLInputElement>(null);
  const [ddaCenter, setDdaCenter] = useState("");
  const [ddaCategoria, setDdaCategoria] = useState("");
  const [ddaReading, setDdaReading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["compras"], queryFn: async () => {
      const [{ data: user }, { data: roles }, { data: compras, error: ce }, { data: centers }, { data: works }, { data: cats }, { data: imports }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("user_roles").select("role"),
        supabase.from("compras").select("*").order("vencimento", { ascending: true }),
        supabase.from("centros_custo").select("id,nome,tipo,obra_id").eq("ativo", true),
        supabase.from("obras").select("id,nome").eq("ativo", true),
        supabase.from("categorias_lancamento").select("id,nome").eq("ativo", true),
        supabase.from("importacoes").select("*").eq("tipo", "dda" as never).order("created_at", { ascending: false }),
      ]);
      if (ce) throw ce;
      return { user: user.user, role: roles?.[0]?.role ?? "leitura", compras: (compras ?? []) as any[], centers: (centers ?? []) as Center[], works: works ?? [], cats: cats ?? [], imports: (imports ?? []) as any[] };
    },
  });
  const isAdmin = data?.role === "admin";
  const canCreate = data?.role === "admin" || data?.role === "escritorio" || data?.role === "engenharia";

  const create = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("Carregando…");
      if (!form.fornecedor.trim() || !form.categoria || !form.centro_custo_id) throw new Error("Preencha fornecedor, categoria e centro de custo.");
      const valor = Number(form.valor.replace(",", "."));
      if (!Number.isFinite(valor) || valor <= 0) throw new Error("Informe um valor válido.");
      const center = data.centers.find(c => c.id === form.centro_custo_id);
      const { error: ie } = await supabase.from("compras").insert({ fornecedor: form.fornecedor.trim(), descricao: form.descricao.trim() || form.fornecedor.trim(), categoria: form.categoria, valor, vencimento: form.vencimento, centro_custo_id: form.centro_custo_id, obra_id: center?.obra_id ?? null, status: "pendente", origem: "manual", created_by: data.user?.id ?? null } as never);
      if (ie) throw ie;
    },
    onSuccess: () => { toast.success("Compra registrada como pendente."); setForm(emptyForm); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível registrar a compra."),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc("aprovar_compra" as never, { _compra: id } as never); if (error) throw error; },
    onSuccess: () => { toast.success("Compra aprovada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível aprovar."),
  });
  const reject = useMutation({
    mutationFn: async (id: string) => { const motivo = prompt("Motivo da rejeição (opcional)") ?? undefined; const { error } = await supabase.rpc("rejeitar_compra" as never, { _compra: id, _motivo: motivo } as never); if (error) throw error; },
    onSuccess: () => { toast.success("Compra rejeitada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível rejeitar."),
  });
  const markPaid = useMutation({
    mutationFn: async (c: { id: string; valor: number }) => {
      const dataPagamento = prompt("Data do pagamento (aaaa-mm-dd)", today()); if (!dataPagamento) return;
      const valorTexto = prompt("Valor efetivamente pago (R$)", String(c.valor).replace(".", ",")); if (valorTexto === null) return;
      const valor = Number(valorTexto.replace(",", ".")); if (!Number.isFinite(valor) || valor <= 0) throw new Error("Valor inválido.");
      const { error } = await supabase.rpc("marcar_compra_paga" as never, { _compra: c.id, _data: dataPagamento, _valor: valor } as never);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Compra paga. Lançamento criado no fluxo de caixa."); qc.invalidateQueries({ queryKey: ["compras"] }); qc.invalidateQueries({ queryKey: ["cost-centers-details"] }); qc.invalidateQueries({ queryKey: ["extrato"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível marcar como paga."),
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("compras").update({ status: "cancelada" } as never).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Compra cancelada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível cancelar."),
  });

  const uploadDda = async (file: File) => {
    if (!data) return;
    if (!ddaCenter || !ddaCategoria) { toast.error("Escolha o centro de custo e a categoria para lançar os títulos desta planilha."); return; }
    setDdaReading(true);
    try {
      const hash = await fileHash(file);
      const dup = data.imports.find(i => (i as { hash_arquivo?: string }).hash_arquivo === hash);
      if (dup) throw new Error(`Este arquivo já foi enviado antes (${dup.arquivo_nome}, em ${dateBR(dup.created_at)}).`);
      const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0] ?? ""] ?? {}, { defval: "" });
      if (!raw.length) throw new Error("A planilha está vazia.");
      const pick = (r: Record<string, unknown>, words: string[]) => { const k = Object.keys(r).find(key => words.some(w => normalize(key).includes(w))); return k ? String(r[k] ?? "").trim() : ""; };
      const rows = raw.map(r => ({
        fornecedor: pick(r, ["beneficiario", "favorecido", "fornecedor", "cedente"]),
        descricao: pick(r, ["descricao", "historico", "especie"]),
        valor: Number(pick(r, ["valor"]).replace(/\./g, "").replace(",", ".")) || 0,
        vencimento: pick(r, ["vencimento", "data"]) || today(),
        linha: pick(r, ["linha digitavel", "codigo de barras", "linha"]),
        documento: pick(r, ["documento", "nosso numero", "titulo"]),
      })).filter(r => r.fornecedor && r.valor > 0);
      if (!rows.length) throw new Error("Não encontrei títulos válidos (beneficiário e valor) na planilha.");
      const center = data.centers.find(c => c.id === ddaCenter);
      const { data: user } = await supabase.auth.getUser();
      const path = `${user.user?.id ?? "dda"}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: ue } = await supabase.storage.from("importacoes").upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (ue) throw ue;
      const { data: imp, error: ie } = await supabase.from("importacoes").insert({ tipo: "dda" as never, arquivo_path: path, arquivo_nome: file.name, arquivo_tipo: file.type || "application/octet-stream", hash_arquivo: hash, status: "concluida", linhas_total: rows.length, valor_total: rows.reduce((s, r) => s + r.valor, 0), entidades_envolvidas: [ddaCenter], created_by: user.user?.id ?? null } as never).select("id").single();
      if (ie) throw ie;
      const payload = rows.map(r => ({ fornecedor: r.fornecedor, descricao: r.descricao || r.fornecedor, categoria: ddaCategoria, valor: r.valor, vencimento: /^\d{4}-\d{2}-\d{2}$/.test(r.vencimento) ? r.vencimento : today(), centro_custo_id: ddaCenter, obra_id: center?.obra_id ?? null, status: "pendente", origem: "dda", linha_digitavel: r.linha || null, numero_documento: r.documento || null, importacao_id: imp.id, created_by: user.user?.id ?? null }));
      const { error: pe } = await supabase.from("compras").insert(payload as never);
      if (pe) throw pe;
      toast.success(`${rows.length} título(s) importado(s) como compras pendentes.`);
      qc.invalidateQueries({ queryKey: ["compras"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível importar a planilha."); }
    finally { setDdaReading(false); }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando compras…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar as compras.</p>;
  const shown = data.compras.filter(c => statusFilter === "todas" || c.status === statusFilter);

  return <div className="space-y-8">
    {canCreate && <section className="border-t-2 border-primary bg-card p-5 ring-1 ring-border">
      <h2 className="font-display text-xl font-bold">Nova compra</h2>
      <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="mt-4 grid gap-3 rounded-lg bg-muted p-4 md:grid-cols-2 xl:grid-cols-6">
        <Input placeholder="Fornecedor" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} required />
        <Input placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
        <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{data.cats.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select>
        <Select value={form.centro_custo_id} onValueChange={v => setForm({ ...form, centro_custo_id: v })}><SelectTrigger><SelectValue placeholder="Centro de custo" /></SelectTrigger><SelectContent>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{centerLabel(c, data.works)}</SelectItem>)}</SelectContent></Select>
        <Input inputMode="decimal" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
        <Input type="date" className="font-mono" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} required />
        <Button disabled={create.isPending} className="xl:col-span-6"><Plus />{create.isPending ? "Registrando…" : "Registrar compra pendente"}</Button>
      </form>
    </section>}

    {canCreate && <section className="border-t-2 border-primary bg-card p-5 ring-1 ring-border">
      <h2 className="font-display text-xl font-bold">Importar DDA</h2>
      <p className="mt-1 text-sm text-muted-foreground">Exporte a lista de títulos do internet banking como planilha (CSV/XLSX) e envie aqui. Cada título vira uma compra pendente.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Select value={ddaCenter} onValueChange={setDdaCenter}><SelectTrigger><SelectValue placeholder="Centro de custo padrão" /></SelectTrigger><SelectContent>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{centerLabel(c, data.works)}</SelectItem>)}</SelectContent></Select>
        <Select value={ddaCategoria} onValueChange={setDdaCategoria}><SelectTrigger><SelectValue placeholder="Categoria padrão" /></SelectTrigger><SelectContent>{data.cats.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select>
        <input ref={ddaInput} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadDda(f); e.target.value = ""; }} />
        <Button type="button" variant="outline" disabled={ddaReading} onClick={() => ddaInput.current?.click()}>{ddaReading ? <LoaderCircle className="animate-spin" /> : <Upload />}{ddaReading ? "Lendo…" : "Enviar planilha de DDA"}</Button>
      </div>
    </section>}

    <section>
      <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Compras a pagar</h2><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todos os status</SelectItem>{Object.entries(statusLabel).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[920px] text-sm"><thead className="border-y bg-muted/50 text-left text-[11px] uppercase text-muted-foreground"><tr><th className="p-3">Vencimento</th><th>Fornecedor</th><th>Descrição</th><th>Centro</th><th className="text-right">Valor</th><th>Status</th><th className="pr-3 text-right">Ações</th></tr></thead><tbody>
        {shown.map(c => <tr key={c.id} className="border-b"><td className="p-3 font-mono">{dateBR(c.vencimento)}</td><td>{c.fornecedor}</td><td className="max-w-xs truncate">{c.descricao}</td><td>{data.centers.find(x => x.id === c.centro_custo_id)?.nome ?? "—"}</td><td className="text-right font-mono font-semibold">{brl.format(c.valor)}</td><td><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[c.status]}`}>{statusLabel[c.status]}</span></td><td className="pr-3 text-right"><div className="flex justify-end gap-1">
          {isAdmin && c.status === "pendente" && <Button size="sm" variant="ghost" aria-label="Aprovar" onClick={() => approve.mutate(c.id)}><CheckCircle2 /></Button>}
          {isAdmin && c.status === "pendente" && <Button size="sm" variant="ghost" aria-label="Rejeitar" onClick={() => reject.mutate(c.id)}><XCircle /></Button>}
          {isAdmin && c.status === "aprovada" && <Button size="sm" onClick={() => markPaid.mutate({ id: c.id, valor: c.valor })}>Marcar como paga</Button>}
          {isAdmin && (c.status === "pendente" || c.status === "aprovada") && <Button size="sm" variant="ghost" onClick={() => confirm("Cancelar esta compra?") && cancel.mutate(c.id)}>Cancelar</Button>}
        </div></td></tr>)}
        {shown.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhuma compra encontrada.</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
