import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditEntryDialog, type EditableEntry } from "@/components/erp/editar-lancamento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Center = { id: string; nome: string; tipo: string; obra_id: string | null };
type Row = { id: string; data: string; descricao: string; centro_custo_id: string; tipo: "recebimento" | "pagamento"; valor: number; categoria?: string | null };

const monthLabel = (month: string) => new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export function Statement() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [centerFilter, setCenterFilter] = useState("todos");
  const [editing, setEditing] = useState<EditableEntry | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["extrato"], queryFn: async () => {
      const [{ data: entries, error: ee }, { data: centers }, { data: works }, { data: teamCosts, error: te }, { data: categories }] = await Promise.all([
        supabase.from("lancamentos").select("id,data,descricao,centro_custo_id,tipo,valor,categoria").is("deleted_at", null).order("data", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("centros_custo").select("id,nome,tipo,obra_id").eq("ativo", true),
        supabase.from("obras").select("id,nome"),
        supabase.from("funcionario_custos_diarios").select("centro_custo_id,data,valor_diaria"),
        supabase.from("categorias_lancamento").select("id,nome").eq("ativo", true),
      ]);
      if (ee) throw ee;
      if (te) throw te;
      // Mesma regra dos centros de custo: o custo diário da equipe entra como saída (agrupado por centro e mês).
      const team = new Map<string, Row>();
      for (const cost of teamCosts ?? []) {
        const month = cost.data.slice(0, 7);
        const key = `${cost.centro_custo_id}-${month}`;
        const current = team.get(key) ?? { id: `equipe-${key}`, data: cost.data, descricao: `Equipe — custo de ${monthLabel(month)}`, centro_custo_id: cost.centro_custo_id, tipo: "pagamento" as const, valor: 0 };
        current.valor += Number(cost.valor_diaria);
        if (cost.data > current.data) current.data = cost.data;
        team.set(key, current);
      }
      const rows: Row[] = [...(entries ?? []).map(l => ({ ...l, valor: Number(l.valor) }) as Row), ...team.values()].sort((a, b) => a.data.localeCompare(b.data));
      return { entries: rows, centers: (centers ?? []) as Center[], works: works ?? [], categories: categories ?? [] };
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
    <header><h2 className="font-display text-xl font-bold">Extrato consolidado</h2><p className="mt-1 text-sm text-muted-foreground">Todos os lançamentos de todas as obras e centros, em ordem cronológica, com saldo acumulado.</p><p className="mt-1 text-xs text-muted-foreground">Entram nos totais: lançamentos não excluídos (recebimentos e pagamentos) e o custo da equipe por funcionário alocado — a mesma regra dos Centros de custo. Contas a pagar só entram depois de marcadas como pagas.</p></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <Input type="date" className="font-mono" value={from} onChange={e => setFrom(e.target.value)} aria-label="De" />
      <Input type="date" className="font-mono" value={to} onChange={e => setTo(e.target.value)} aria-label="Até" />
      <Select value={centerFilter} onValueChange={setCenterFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os centros</SelectItem>{data.centers.map(c => <SelectItem key={c.id} value={c.id}>{c.tipo === "obra" ? (data.works.find(w => w.id === c.obra_id)?.nome ?? c.nome) : c.nome}</SelectItem>)}</SelectContent></Select>
      <div className="rounded-md bg-good/10 px-4 py-2 text-xs text-good">Entradas <strong className="ml-2 font-mono">{brl.format(totalEntradas)}</strong></div>
      <div className="rounded-md bg-destructive/10 px-4 py-2 text-xs text-destructive">Saídas <strong className="ml-2 font-mono">{brl.format(totalSaidas)}</strong></div>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="border-y bg-muted/50 text-[11px] uppercase text-muted-foreground"><tr><th className="px-3 py-3">Data</th><th className="px-3">Descrição</th><th className="px-3">Centro</th><th className="px-3 text-right">Entrada</th><th className="px-3 text-right">Saída</th><th className="px-3 text-right">Saldo</th><th className="px-3"></th></tr></thead><tbody>
      {rows.map(r => <tr key={r.id} className="border-b"><td className="px-3 py-3 font-mono text-xs">{dateBR(r.data)}</td><td className="max-w-xs truncate px-3">{r.descricao}</td><td className="px-3">{data.centers.find(c => c.id === r.centro_custo_id)?.nome ?? "—"}</td><td className="px-3 text-right font-mono text-good">{r.tipo === "recebimento" ? brl.format(r.valor) : ""}</td><td className="px-3 text-right font-mono text-destructive">{r.tipo === "pagamento" ? brl.format(r.valor) : ""}</td><td className="px-3 text-right font-mono font-semibold">{brl.format(r.saldo)}</td><td className="px-3">{!r.id.startsWith("equipe-") && <Button size="icon" variant="ghost" aria-label="Corrigir categoria e centro" onClick={() => setEditing({ id: r.id, data: r.data, descricao: r.descricao, valor: r.valor, centro_custo_id: r.centro_custo_id, categoria: r.categoria ?? null })}><Pencil /></Button>}</td></tr>)}
      {rows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhum lançamento no período.</td></tr>}
    </tbody></table></div>
    <EditEntryDialog entry={editing} centers={data.centers} categories={data.categories} onClose={() => setEditing(null)} />
  </div>;
}
