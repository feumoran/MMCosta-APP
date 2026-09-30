import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Center = { id: string; nome: string; tipo: string; obra_id: string | null };
type Form = { id?: string; centro_custo_id: string; data: string; tipo: "recebimento" | "pagamento"; categoria: string; valor: string; descricao: string };
const today = () => new Date().toISOString().slice(0, 10);
const fresh: Form = { centro_custo_id: "", data: today(), tipo: "pagamento", categoria: "", valor: "", descricao: "" };
const centerLabel = (c: Center, works: { id: string; nome: string }[]) => c.tipo === "obra" ? `Obra · ${works.find(w => w.id === c.obra_id)?.nome ?? c.nome}` : `Centro · ${c.nome}`;

export function ManualEntries() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(fresh);

  const { data, isLoading, error } = useQuery({
    queryKey: ["financeiro-manual"], queryFn: async () => {
      const [{ data: user }, { data: centers }, { data: works }, { data: cats }, { data: entries, error: ee }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("centros_custo").select("id,nome,tipo,obra_id").eq("ativo", true).order("tipo").order("nome"),
        supabase.from("obras").select("id,nome").eq("ativo", true),
        supabase.from("categorias_lancamento").select("*").eq("ativo", true).order("nome"),
        supabase.from("lancamentos").select("*").is("deleted_at", null).order("data", { ascending: false }).limit(200),
      ]);
      if (ee) throw ee;
      return { user: user.user, centers: (centers ?? []) as Center[], works: works ?? [], cats: cats ?? [], entries: entries ?? [] };
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!data || !form.centro_custo_id || !form.categoria) throw new Error("Preencha centro de custo e categoria.");
      const valor = Number(form.valor.replace(",", ".")); if (!Number.isFinite(valor) || valor <= 0) throw new Error("Informe um valor válido.");
      const center = data.centers.find(c => c.id === form.centro_custo_id);
      const payload = { centro_custo_id: form.centro_custo_id, obra_id: center?.obra_id ?? null, data: form.data, tipo: form.tipo, categoria: form.categoria, valor, descricao: form.descricao || "—", created_by: data.user?.id ?? null };
      const { error } = form.id ? await supabase.from("lancamentos").update(payload).eq("id", form.id) : await supabase.from("lancamentos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(form.id ? "Lançamento atualizado." : "Lançamento registrado."); setForm(fresh); qc.invalidateQueries({ queryKey: ["financeiro-manual"] }); qc.invalidateQueries({ queryKey: ["cost-centers-details"] }); qc.invalidateQueries({ queryKey: ["extrato"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("lancamentos").update({ deleted_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Lançamento excluído."); qc.invalidateQueries({ queryKey: ["financeiro-manual"] }); qc.invalidateQueries({ queryKey: ["cost-centers-details"] }); qc.invalidateQueries({ queryKey: ["extrato"] }); },
    onError: e => toast.error(e instanceof Error ? e.message : "Não foi possível excluir."),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando lançamentos…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar os lançamentos.</p>;

  return <div className="space-y-6">
    <section className="border-t-2 border-primary bg-card p-5 ring-1 ring-border">
      <h2 className="font-display text-xl font-bold">Lançamento manual</h2>
      <p className="mt-1 text-sm text-muted-foreground">Lance direto em qualquer centro de custo — de obra ou administrativo (Depósito, Escritório).</p>
      <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="mt-4 grid gap-3 rounded-lg bg-muted p-4 md:grid-cols-2 xl:grid-cols-6">
        <Select value={form.centro_custo_id} onValueChange={v => setForm({ ...form, centro_custo_id: v })}><SelectTrigger><SelectValue placeholder="Centro de custo" /></SelectTrigger><SelectContent>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{centerLabel(c, data.works)}</SelectItem>)}</SelectContent></Select>
        <Input type="date" className="font-mono" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
        <Select value={form.tipo} onValueChange={(v: "recebimento" | "pagamento") => setForm({ ...form, tipo: v, categoria: "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recebimento">Recebimento</SelectItem><SelectItem value="pagamento">Pagamento</SelectItem></SelectContent></Select>
        <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{data.cats.filter(c => c.tipo_permitido === form.tipo || c.tipo_permitido === "ambos").map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select>
        <Input inputMode="decimal" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
        <Input placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required />
        <div className="flex gap-2 xl:col-span-6"><Button disabled={save.isPending}><Plus />{form.id ? "Salvar alterações" : "Lançar"}</Button>{form.id && <Button type="button" variant="ghost" size="icon" onClick={() => setForm(fresh)} aria-label="Cancelar edição"><X /></Button>}</div>
      </form>
    </section>
    <section>
      <h2 className="font-display text-xl font-bold">Últimos lançamentos</h2>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-y bg-muted/50 text-[11px] uppercase text-muted-foreground"><tr><th className="p-3">Data</th><th>Centro</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th className="text-right">Valor</th><th className="w-20"></th></tr></thead><tbody>
        {data.entries.map(l => <tr key={l.id} className="border-b"><td className="p-3 font-mono text-xs">{dateBR(l.data)}</td><td>{data.centers.find(c => c.id === l.centro_custo_id)?.nome ?? "—"}</td><td><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${l.tipo === "recebimento" ? "bg-good/10 text-good" : "bg-destructive/10 text-destructive"}`}>{l.tipo}</span></td><td>{data.cats.find(c => c.id === l.categoria)?.nome ?? l.categoria}</td><td className="max-w-xs truncate">{l.descricao}</td><td className="text-right font-mono font-semibold">{brl.format(l.valor)}</td><td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setForm({ id: l.id, centro_custo_id: l.centro_custo_id, data: l.data, tipo: l.tipo, categoria: l.categoria, valor: String(l.valor).replace(".", ","), descricao: l.descricao })}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => confirm("Excluir este lançamento?") && remove.mutate(l.id)}><Trash2 /></Button></div></td></tr>)}
        {data.entries.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhum lançamento encontrado.</td></tr>}
      </tbody></table></div>
    </section>
  </div>;
}
