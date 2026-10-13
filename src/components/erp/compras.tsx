import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Eye, Paperclip, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { usePrivateFiles } from "@/lib/private-files";
import { askConfirm, askFields, parseDateInput, parseMoneyInput } from "@/components/erp/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Center = { id: string; nome: string; tipo: string; obra_id: string | null };
const statusLabel: Record<string, string> = { pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada", paga: "Paga", cancelada: "Cancelada" };
const statusTone: Record<string, string> = { pendente: "bg-warning/15 text-warning", aprovada: "bg-primary/10 text-primary", rejeitada: "bg-destructive/10 text-destructive", paga: "bg-good/10 text-good", cancelada: "bg-muted text-muted-foreground" };
const today = () => new Date().toISOString().slice(0, 10);
const centerLabel = (c: Center, works: { id: string; nome: string }[]) => c.tipo === "obra" ? `Obra · ${works.find(w => w.id === c.obra_id)?.nome ?? c.nome}` : `Centro · ${c.nome}`;
const emptyForm = { fornecedor: "", descricao: "", categoria: "", valor: "", vencimento: today(), centro_custo_id: "", numero_documento: "", justificativa: "" };

export function Purchases({ formOnly = false }: { formOnly?: boolean }) {
  const privateFiles = usePrivateFiles();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [nf, setNf] = useState<File | null>(null);
  const nfInput = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState("abertas");  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["compras"], queryFn: async () => {
      const [{ data: user }, { data: roles }, { data: compras, error: ce }, { data: centers }, { data: works }, { data: cats }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("user_roles").select("role"),
        supabase.from("compras").select("*").order("vencimento", { ascending: true }),
        supabase.from("centros_custo").select("id,nome,tipo,obra_id").eq("ativo", true),
        supabase.from("obras").select("id,nome").eq("ativo", true),
        supabase.from("categorias_lancamento").select("id,nome").eq("ativo", true),
      ]);
      if (ce) throw ce;
      return { user: user.user, role: roles?.[0]?.role ?? "leitura", compras: (compras ?? []) as any[], centers: (centers ?? []) as Center[], works: works ?? [], cats: cats ?? [] };
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
      if (!form.vencimento) throw new Error("Informe a data de vencimento.");
      if (!nf && !form.justificativa.trim()) throw new Error("Anexe a NF ou o cupom fiscal. Se não houver, escreva a justificativa.");
      const center = data.centers.find(c => c.id === form.centro_custo_id);
      let anexoPath: string | null = null;
      if (nf) {
        anexoPath = `${data.user?.id ?? "compras"}/${crypto.randomUUID()}-${nf.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: ue } = await supabase.storage.from("compras").upload(anexoPath, nf, { contentType: nf.type || "application/octet-stream" });
        if (ue) throw ue;
      }
      const { error: ie } = await supabase.from("compras").insert({ fornecedor: form.fornecedor.trim(), descricao: form.descricao.trim() || form.fornecedor.trim(), categoria: form.categoria, valor, vencimento: form.vencimento, centro_custo_id: form.centro_custo_id, obra_id: center?.obra_id ?? null, numero_documento: form.numero_documento.trim() || null, anexo_path: anexoPath, ...(nf ? {} : { justificativa: form.justificativa.trim() }), status: "pendente", origem: "manual", created_by: data.user?.id ?? null } as never);
      if (ie) { if (anexoPath) await supabase.storage.from("compras").remove([anexoPath]); throw ie; }
    },
    onSuccess: () => { toast.success("Compra registrada como pendente."); setForm(emptyForm); setNf(null); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error((e as { message?: string })?.message ?? "Não foi possível registrar a compra."),
  });

  const approve = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.rpc("aprovar_compra" as never, { _compra: id } as never); if (error) throw error; },
    onSuccess: () => { toast.success("Compra aprovada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível aprovar."),
  });
  const reject = useMutation({
    mutationFn: async (c: { id: string; fornecedor: string; valor: number }) => { const answer = await askFields({ title: "Rejeitar compra", details: [{ label: "Fornecedor", value: c.fornecedor }, { label: "Valor", value: brl.format(c.valor) }], fields: [{ name: "motivo", label: "Motivo da rejeição (opcional)" }], confirmLabel: "Rejeitar", destructive: true }); if (!answer) return false; const motivo = answer.motivo.trim() || undefined; const id = c.id; const { error } = await supabase.rpc("rejeitar_compra" as never, { _compra: id, _motivo: motivo } as never); if (error) throw error; return true; },
    onSuccess: (done) => { if (!done) return; toast.success("Compra rejeitada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível rejeitar."),
  });
  const markPaid = useMutation({
    mutationFn: async (c: { id: string; fornecedor: string; valor: number }) => {
      const answer = await askFields({ title: "Marcar como paga", details: [{ label: "Fornecedor", value: c.fornecedor }, { label: "Valor da conta", value: brl.format(c.valor) }], fields: [{ name: "data", label: "Data do pagamento", type: "date", defaultValue: today().split("-").reverse().join("-"), required: true }, { name: "valor", label: "Valor pago (R$)", type: "money", defaultValue: String(c.valor).replace(".", ","), required: true }], confirmLabel: "Confirmar pagamento" });
      if (!answer) return false;
      const dataPagamento = parseDateInput(answer.data);
      const valor = parseMoneyInput(answer.valor);
      if (!dataPagamento) throw new Error("Data inválida. Use dd-mm-aaaa.");
      if (!Number.isFinite(valor) || valor <= 0) throw new Error("Valor inválido.");
      const { error } = await supabase.rpc("marcar_compra_paga" as never, { _compra: c.id, _data: dataPagamento, _valor: valor } as never);
      if (error) throw error;
      return true;
    },
    onSuccess: (done) => { if (!done) return; toast.success("Compra paga. Lançamento criado no fluxo de caixa."); qc.invalidateQueries({ queryKey: ["compras"] }); qc.invalidateQueries({ queryKey: ["cost-centers-details"] }); qc.invalidateQueries({ queryKey: ["extrato"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível marcar como paga."),
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("compras").update({ status: "cancelada" } as never).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Compra cancelada."); qc.invalidateQueries({ queryKey: ["compras"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível cancelar."),
  });

  const openNf = async (path: string, name: string, download = false) => {
    try {
    const lower = path.toLowerCase();
    if (!download && (/\.(png|jpe?g|webp|gif|heic)$/.test(lower) || lower.endsWith(".pdf"))) { setPreview({ url: await privateFiles.preview("compras", path), type: lower.endsWith(".pdf") ? "application/pdf" : "image/*", name }); return; }
    await privateFiles.download("compras", path, name);
    } catch { toast.error("Não foi possível abrir o anexo."); }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando contas a pagar…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar as contas a pagar.</p>;
  const shown = data.compras
    .filter(c => statusFilter === "todas" ? true : statusFilter === "abertas" ? (c.status === "pendente" || c.status === "aprovada") : c.status === statusFilter)
    .sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)));
  const centerOf = (c: { centro_custo_id: string; obra_id: string | null }) => { const center = data.centers.find(x => x.id === c.centro_custo_id); const work = data.works.find(w => w.id === (c.obra_id ?? center?.obra_id)); return center ? <><span className="block font-medium">{center.nome}</span>{work && work.nome !== center.nome && <span className="block text-muted-foreground">Obra: {work.nome}</span>}</> : "—"; };
  const fileName = (path: string) => path.split("/").pop()?.replace(/^[0-9a-f-]{36}-/, "") ?? "anexo";

  return <div className="space-y-8">
    {canCreate && formOnly && <section className="border-t-2 border-primary bg-card p-5 ring-1 ring-border">
      <h2 className="font-display text-xl font-bold">Nova compra</h2>
      <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="mt-4 grid gap-3 rounded-lg bg-muted p-4 md:grid-cols-2 xl:grid-cols-6">
        <Input placeholder="Fornecedor" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} required />
        <Input placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
        <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{data.cats.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select>
        <Select value={form.centro_custo_id} onValueChange={v => setForm({ ...form, centro_custo_id: v })}><SelectTrigger><SelectValue placeholder="Centro de custo" /></SelectTrigger><SelectContent>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{centerLabel(c, data.works)}</SelectItem>)}</SelectContent></Select>
        <Input inputMode="decimal" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
        <label className="space-y-1 text-xs text-muted-foreground">Data de vencimento<Input type="date" className="font-mono" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} required /></label>
        <Input placeholder="Nº da NF / cupom" value={form.numero_documento} onChange={e => setForm({ ...form, numero_documento: e.target.value })} />
        <div className="flex items-center gap-2 md:col-span-2 xl:col-span-2">
          <input ref={nfInput} type="file" accept=".pdf,image/*" className="hidden" onChange={e => { setNf(e.target.files?.[0] ?? null); e.target.value = ""; }} />
          <Button type="button" variant="outline" onClick={() => nfInput.current?.click()}><Paperclip />{nf ? "Trocar anexo" : "Anexar NF ou cupom fiscal"}</Button>
          {nf && <span className="truncate text-xs">{nf.name}</span>}
          {nf && <Button type="button" variant="ghost" size="sm" onClick={() => setNf(null)}>Remover</Button>}
        </div>
        {!nf && <Textarea className="md:col-span-2 xl:col-span-3" placeholder="Sem NF ou cupom? Escreva a justificativa (obrigatória)" value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })} />}
        <Button disabled={create.isPending} className="xl:col-span-6"><Plus />{create.isPending ? "Registrando…" : "Registrar compra pendente"}</Button>
      </form>
    </section>}

    {!formOnly && (() => { const reembolsar = data.compras.filter(c => c.origem === "comprovante" && (c.status === "pendente" || c.status === "aprovada")).reduce((s, c) => s + c.valor, 0); return reembolsar > 0 && <section className="border-t-2 border-warning bg-warning/5 p-5"><p className="text-xs font-bold uppercase text-warning">Reembolso a funcionários</p><p className="mt-1 text-sm text-muted-foreground">Soma dos caixas (comprovantes) já distribuídos e ainda não pagos ao funcionário.</p><p className="mt-2 font-mono text-2xl font-bold">{brl.format(reembolsar)}</p></section>; })()}

    {!formOnly && <section>
      <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Contas a pagar</h2><p className="text-xs text-muted-foreground">Ordenadas pelo vencimento, do mais próximo ao mais distante.</p></div><div className="flex items-center gap-2"><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="abertas">A pagar (pendentes e aprovadas)</SelectItem><SelectItem value="todas">Todas</SelectItem>{Object.entries(statusLabel).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1180px] text-sm"><thead className="border-y bg-muted/50 text-left text-[11px] uppercase text-muted-foreground"><tr><th className="px-3 py-3">Vencimento</th><th className="px-3">Descrição</th><th className="px-3">Centro / Obra</th><th className="px-3">Nº NF</th><th className="px-3">Pagamento</th><th className="px-3 text-right">Valor</th><th className="px-3">Status</th><th className="px-3">NF</th><th className="px-3 text-right">Ações</th></tr></thead><tbody>
        {shown.map(c => <tr key={c.id} className="border-b"><td className="px-3 py-3 font-mono">{dateBR(c.vencimento)}</td><td className="max-w-xs px-3"><span className="block truncate font-medium">{c.fornecedor}</span><span className="block truncate text-xs text-muted-foreground">{c.descricao}{c.justificativa ? ` · Sem NF: ${c.justificativa}` : ""}</span></td><td className="max-w-[200px] px-3 text-xs">{centerOf(c)}</td><td className="px-3 font-mono text-xs">{c.numero_documento ?? "—"}</td><td className="px-3 font-mono">{c.data_pagamento ? dateBR(c.data_pagamento) : "—"}</td><td className="px-3 text-right font-mono font-semibold">{brl.format(c.valor)}</td><td className="px-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[c.status]}`}>{statusLabel[c.status]}</span></td><td className="px-3">{c.anexo_path ? <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Visualizar NF" onClick={() => openNf(c.anexo_path, fileName(c.anexo_path))}><Eye /></Button><Button size="icon" variant="ghost" aria-label="Baixar NF" onClick={() => openNf(c.anexo_path, fileName(c.anexo_path), true)}><Download /></Button></div> : <span className="text-xs text-muted-foreground">—</span>}</td><td className="px-3 text-right"><div className="flex justify-end gap-1">
          {isAdmin && c.status === "pendente" && <Button size="sm" variant="ghost" aria-label="Aprovar" onClick={() => approve.mutate(c.id)}><CheckCircle2 /></Button>}
          {isAdmin && c.status === "pendente" && <Button size="sm" variant="ghost" aria-label="Rejeitar" onClick={() => reject.mutate(c)}><XCircle /></Button>}
          {isAdmin && c.status === "aprovada" && <Button size="sm" onClick={() => markPaid.mutate(c)}>Marcar como paga</Button>}
          {isAdmin && (c.status === "pendente" || c.status === "aprovada") && <Button size="sm" variant="ghost" onClick={() => void askConfirm({ title: "Cancelar compra", description: "Esta compra deixará de aparecer entre as contas a pagar.", details: [{ label: "Fornecedor", value: c.fornecedor }, { label: "Vencimento", value: dateBR(c.vencimento) }, { label: "Valor", value: brl.format(c.valor) }], confirmLabel: "Cancelar compra", destructive: true }).then(ok => ok && cancel.mutate(c.id))}>Cancelar</Button>}
        </div></td></tr>)}
        {shown.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Nenhuma conta encontrada.</td></tr>}
      </tbody></table></div>
    </section>}
    <Dialog open={Boolean(preview)} onOpenChange={o => !o && setPreview(null)}><DialogContent className="h-[90vh] max-w-5xl"><DialogHeader><DialogTitle>{preview?.name}</DialogTitle></DialogHeader>{preview?.type === "application/pdf" ? <iframe src={preview.url} title={preview.name} className="h-full w-full" /> : preview && <img src={preview.url} alt={preview.name} className="h-full w-full object-contain" />}</DialogContent></Dialog>
  </div>;
}
