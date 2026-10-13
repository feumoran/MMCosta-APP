import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CalendarDays, CirclePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { dateBR } from "@/lib/erp";

export const Route = createFileRoute("/_authenticated/obras/")({
  head: () => ({
    meta: [
      { title: "Obras | MMcosta Engenharia" },
      { name: "description", content: "Acesso às obras da MMcosta Engenharia." },
      { property: "og:title", content: "Obras | MMcosta Engenharia" },
      { property: "og:description", content: "Acesso às obras e aos seus controles operacionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorksPage,
});

function WorksPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["works-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id,nome,tipo_obra,status,data_inicio,data_fim_prevista,clientes(nome)")
        .eq("ativo", true)
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useWebMCP({
    name: "ler_obras_visiveis",
    description: "Lista as obras exibidas nesta página com identificação, status e datas.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("ler_obras_visiveis", () => {
      if (isLoading) return "Carregando obras…";
      if (error) throw new Error("Não foi possível carregar as obras.");
      return data.length ? data.map(work => `${work.id}: ${work.nome}; ${work.status}; ${dateBR(work.data_inicio)} — ${dateBR(work.data_fim_prevista)}`).join("\n") : "Nenhuma obra ativa.";
    }),
  });
  useWebMCP({
    name: "abrir_obra_visivel",
    description: "Abre o painel de uma das obras exibidas nesta página.",
    enabled: !isLoading && !error,
    inputSchema: { type: "object", properties: { obra_id: { type: "string", description: "Identificador de uma obra retornada por ler_obras_visiveis." } }, required: ["obra_id"], additionalProperties: false },
    execute: ({ obra_id }: { obra_id: string }) => runWebMCPTool("abrir_obra_visivel", async () => {
      if (isLoading || error) throw new Error("As obras ainda não estão disponíveis.");
      if (typeof obra_id !== "string") throw new Error("Identificador inválido.");
      const work = data.find(row => row.id === obra_id);
      if (!work) throw new Error("Obra não disponível nesta página.");
      await navigate({ to: "/obras/$id/painel", params: { id: work.id } });
      return "Painel da obra aberto.";
    }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando obras…</p>;
  if (error) return <p className="text-sm text-destructive">Não foi possível carregar as obras.</p>;

  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div><p className="text-xs font-bold uppercase text-primary">Operação</p><h1 className="font-display text-3xl font-bold">Obras</h1><p className="mt-1 text-sm text-muted-foreground">Escolha uma obra para acessar o painel e seus registros.</p></div>
      <Button asChild variant="outline"><Link to="/cadastros"><CirclePlus /> Nova obra</Link></Button>
    </header>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((work) => <Link key={work.id} to="/obras/$id/painel" params={{ id: work.id }} className="group border-t-4 border-primary bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Building2 className="size-5" /></div><span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{work.status.replaceAll("_", " ")}</span></div>
        <h2 className="mt-5 font-display text-xl font-bold">{work.nome}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{work.clientes?.nome}</p>
        <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground"><CalendarDays className="size-4" /><span className="font-mono">{dateBR(work.data_inicio)} — {dateBR(work.data_fim_prevista)}</span></div>
        <div className="mt-4 flex items-center justify-end text-xs font-bold text-primary">Abrir obra <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" /></div>
      </Link>)}
      {data.length === 0 && <div className="col-span-full border-y py-16 text-center text-sm text-muted-foreground">Nenhuma obra ativa.</div>}
    </section>
  </div>;
}