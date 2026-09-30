import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Center = { id: string; nome: string; tipo: string; obra_id: string | null };

export function Statement() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [centerFilter, setCenterFilter] = useState("todos");

  const { data, isLoading, error } = useQuery({
    queryKey: ["extrato"], queryFn: async () => {
      const [{ data: entries, error: ee }, { data: centers }, { data: works }] = await Promise.all([
        supabase.from("lancamentos").select("*").is("deleted_at", null).order("data", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("centros_custo").select("id,nome,tipo,obra_id").eq("ativo", true),
        supabase.from("obras").select("id,nome"),
      ]);
      if (ee) throw ee;
      return { entries: entries ?? [], centers: (centers ?? []) as Center[], works: works ?? [] };
    },
  });

  const rows = useMemo(() => {
    if (!data) return [];
    let saldo = 0;
    return data.entries
      .filter(l => (!from || l.data >= from) && (!to || l.data <= to) && (centerFilter === "todos" || l.centro_custo_id === centerFilter))
      .map(l => { saldo += l.tipo === "recebimento" ? l.valor : -l.valor; return { ...l, saldo }; });
  }, [data, from, to, centerFilter]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando extrato…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar o extrato.</p>;
  const totalEntradas = rows.filter(r => r.tipo === "recebimento").reduce((s, r) => s + r.valor, 0);
  const totalSaidas = rows.filter(r => r.tipo === "pagamento").reduce((s, r) => s + r.valor, 0);

  return <div className="space-y-6">
    <header><h2 className="font-display text-xl font-bold">Extrato consolidado</h2><p className="mt-1 text-sm text-muted-foreground">Todos os lançamentos de todas as obras e centros, em ordem cronológica, com saldo acumulado.</p></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <Input type="date" className="font-mono" value={from} onChange={e => setFrom(e.target.value)} aria-label="De" />
      <Input type="date" className="font-mono" value={to} onChange={e => setTo(e.target.value)} aria-label="Até" />
      <Select value={centerFilter} onValueChange={setCenterFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os centros</SelectItem>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{c.tipo === "obra" ? (data.works.find(w => w.id === c.obra_id)?.nome ?? c.nome) : c.nome}</SelectItem>)}</SelectContent></Select>
      <div className="rounded-md bg-good/10 px-4 py-2 text-xs text-good">Entradas <strong className="ml-2 font-mono">{brl.format(totalEntradas)}</strong></div>
      <div className="rounded-md bg-destructive/10 px-4 py-2 text-xs text-destructive">Saídas <strong className="ml-2 font-mono">{brl.format(totalSaidas)}</strong></div>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="border-y bg-muted/50 text-[11px] uppercase text-muted-foreground"><tr><th className="p-3">Data</th><th>Descrição</th><th>Centro</th><th className="text-right">Entrada</th><th className="text-right">Saída</th><th className="text-right">Saldo</th></tr></thead><tbody>
      {rows.map(r => <tr key={r.id} className="border-b"><td className="p-3 font-mono text-xs">{dateBR(r.data)}</td><td className="max-w-xs truncate">{r.descricao}</td><td>{data.centers.find(c => c.id === r.centro_custo_id)?.nome ?? "—"}</td><td className="text-right font-mono text-good">{r.tipo === "recebimento" ? brl.format(r.valor) : ""}</td><td className="text-right font-mono text-destructive">{r.tipo === "pagamento" ? brl.format(r.valor) : ""}</td><td className="text-right font-mono font-semibold">{brl.format(r.saldo)}</td></tr>)}
      {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Nenhum lançamento no período.</td></tr>}
    </tbody></table></div>
  </div>;
}
