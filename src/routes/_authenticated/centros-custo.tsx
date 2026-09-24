import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Landmark, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CenterFilter = "todos" | "obra" | "administrativo";

export const Route = createFileRoute("/_authenticated/centros-custo")({
  validateSearch: (search: Record<string, unknown>) => ({ centro: typeof search["centro"] === "string" ? search["centro"] : undefined }),
  head: () => ({ meta: [
    { title: "Centros de custo | MMcosta Engenharia" },
    { name: "description", content: "Totais e movimentações dos centros de custo da MMcosta Engenharia." },
    { property: "og:title", content: "Centros de custo | MMcosta Engenharia" },
    { property: "og:description", content: "Consulta financeira dos centros de custo de obras e administrativos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CostCentersPage,
});

function CostCentersPage() {
  const { centro } = Route.useSearch();
  const [selectedId, setSelectedId] = useState(centro ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CenterFilter>("todos");
  const monthStart = new Date(); monthStart.setDate(1);
  const [dateFrom, setDateFrom] = useState(monthStart.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const access = useQuery({ queryKey: ["cost-centers-access"], queryFn: async () => {
    const { data, error } = await supabase.rpc("can_manage");
    if (error) throw error;
    return Boolean(data);
  }});
  const query = useQuery({
    queryKey: ["cost-centers-details"],
    enabled: access.data === true,
    queryFn: async () => {
      const [{ data: centers, error: centersError }, { data: entries, error: entriesError }, { data: categories, error: categoriesError }, { data: employeeCosts, error: costsError }, { data: employees, error: employeesError }] = await Promise.all([
        supabase.from("centros_custo").select("id,nome,tipo,obra_id,ativo,obras(nome)").order("tipo").order("nome"),
        supabase.from("lancamentos").select("id,centro_custo_id,obra_id,data,tipo,categoria,descricao,valor,obras(nome)").is("deleted_at", null).order("data", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("categorias_lancamento").select("id,nome"),
        supabase.from("funcionario_custos_diarios").select("id,centro_custo_id,obra_id,funcionario_id,data,valor_diaria").order("data", { ascending: false }),
        supabase.from("funcionarios").select("id,nome"),
      ]);
      if (centersError || entriesError || categoriesError || costsError || employeesError) throw centersError ?? entriesError ?? categoriesError ?? costsError ?? employeesError;
      return { centers: centers ?? [], entries: entries ?? [], categories: categories ?? [], employeeCosts: employeeCosts ?? [], employees: employees ?? [] };
    },
  });
  const visibleCenters = useMemo(() => (query.data?.centers ?? []).filter((item) => {
    const matchesType = filter === "todos" || item.tipo === filter;
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return matchesType && (!term || item.nome.toLocaleLowerCase("pt-BR").includes(term) || item.obras?.nome?.toLocaleLowerCase("pt-BR").includes(term));
  }), [filter, query.data?.centers, search]);
  const selected = query.data?.centers.find((item) => item.id === selectedId) ?? visibleCenters[0];
  const allEntries = (query.data?.entries ?? []).filter((item) => item.data >= dateFrom && item.data <= dateTo);
  const allEmployeeCosts = (query.data?.employeeCosts ?? []).filter((item) => item.data >= dateFrom && item.data <= dateTo);
  const categories = query.data?.categories ?? [];
  const entries = selected ? allEntries.filter((item) => item.centro_custo_id === selected.id) : [];
  const employeeCosts = selected ? allEmployeeCosts.filter((item) => item.centro_custo_id === selected.id) : [];
  const received = entries.filter((item) => item.tipo === "recebimento").reduce((total, item) => total + Number(item.valor), 0);
  const teamPaid = employeeCosts.reduce((total, item) => total + Number(item.valor_diaria), 0);
  const paid = entries.filter((item) => item.tipo === "pagamento").reduce((total, item) => total + Number(item.valor), 0) + teamPaid;

  if (access.isLoading) return <p className="text-sm text-muted-foreground">Verificando acesso…</p>;
  if (access.error) return <p className="text-sm text-destructive">Não foi possível verificar seu acesso.</p>;
  if (!access.data) return <div className="border-y py-16 text-center"><Landmark className="mx-auto size-8 text-muted-foreground"/><h1 className="mt-4 font-display text-2xl font-bold">Acesso restrito</h1><p className="mt-2 text-sm text-muted-foreground">Os valores dos centros de custo estão disponíveis para administração e escritório.</p></div>;
  if (query.isLoading) return <p className="text-sm text-muted-foreground">Carregando centros de custo…</p>;
  if (query.error) return <p className="text-sm text-destructive">Não foi possível carregar os centros de custo.</p>;

  return <div className="space-y-6">
    <header className="border-b pb-6"><p className="text-xs font-bold uppercase text-primary">Financeiro</p><h1 className="font-display text-3xl font-bold">Centros de custo</h1><p className="mt-1 text-sm text-muted-foreground">Consulte obras, áreas administrativas e todas as movimentações registradas.</p></header>
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="min-w-0 border-r-0 lg:border-r lg:pr-6">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar centro de custo" className="pl-9"/></div>
        <div className="mt-3 flex gap-1 overflow-x-auto">{(["todos", "obra", "administrativo"] as CenterFilter[]).map((value) => <Button key={value} size="sm" variant={filter === value ? "default" : "ghost"} onClick={() => setFilter(value)}>{value === "todos" ? "Todos" : value === "obra" ? "Obras" : "Administrativos"}</Button>)}</div>
        <div className="mt-4 max-h-[58vh] space-y-1 overflow-y-auto">{visibleCenters.map((item) => {const itemEntries = allEntries.filter((entry) => entry.centro_custo_id === item.id);const total = itemEntries.reduce((sum, entry) => sum + (entry.tipo === "recebimento" ? Number(entry.valor) : -Number(entry.valor)), 0);return <Button key={item.id} variant={selected?.id === item.id ? "secondary" : "ghost"} className="h-auto w-full justify-start px-3 py-3 text-left" onClick={() => setSelectedId(item.id)}><span className="flex min-w-0 flex-1 items-center gap-3">{item.tipo === "obra" ? <Building2 className="size-4 shrink-0"/> : <Landmark className="size-4 shrink-0"/>}<span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.nome}</span><span className="block truncate text-[11px] font-normal text-muted-foreground">{item.tipo === "obra" ? item.obras?.nome ?? "Obra" : "Administrativo"} · {itemEntries.length} lançamentos</span></span><span className="shrink-0 font-mono text-xs">{brl.format(total)}</span></span></Button>})}{visibleCenters.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum centro encontrado.</p>}</div>
      </aside>
      <section className="min-w-0">{selected ? <><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-primary">{selected.tipo === "obra" ? "Centro da obra" : "Centro administrativo"}</p><h2 className="font-display text-2xl font-bold">{selected.nome}</h2>{selected.obras?.nome && <p className="mt-1 text-sm text-muted-foreground">{selected.obras.nome}</p>}</div>{!selected.ativo && <span className="rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">Inativo</span>}</div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">{[["Recebimentos", received], ["Pagamentos", paid], ["Saldo", received - paid]].map(([label, value]) => <div key={String(label)} className="bg-card p-4"><p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-2 font-mono text-xl font-semibold">{brl.format(Number(value))}</p></div>)}</div>
        <div className="mt-7 flex items-end justify-between border-b pb-3"><div><h3 className="font-display text-lg font-bold">Movimentações</h3><p className="text-xs text-muted-foreground">Mais recentes primeiro</p></div><span className="text-xs text-muted-foreground">{entries.length} registros</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/50 text-[11px] uppercase text-muted-foreground"><tr><th className="p-3">Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Obra</th><th className="pr-3 text-right">Valor</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b"><td className="p-3 font-mono text-xs">{dateBR(entry.data)}</td><td><span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase ${entry.tipo === "recebimento" ? "bg-good/10 text-good" : "bg-destructive/10 text-destructive"}`}>{entry.tipo}</span></td><td>{categories.find((category) => category.id === entry.categoria)?.nome ?? entry.categoria}</td><td className="max-w-xs truncate">{entry.descricao}</td><td>{entry.obras?.nome ?? "—"}</td><td className="pr-3 text-right font-mono font-semibold">{brl.format(Number(entry.valor))}</td></tr>)}</tbody></table>{entries.length === 0 && <p className="border-b py-14 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada neste centro de custo.</p>}</div></> : <div className="border-y py-16 text-center text-sm text-muted-foreground">Selecione um centro de custo.</div>}</section>
    </div>
  </div>;
}