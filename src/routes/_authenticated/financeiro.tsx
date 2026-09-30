import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Purchases } from "@/components/erp/compras";
import { ManualEntries } from "@/components/erp/lancamento-manual";
import { Statement } from "@/components/erp/extrato";
import { CostCenters } from "@/components/erp/centros-custo";

export const Route = createFileRoute("/_authenticated/financeiro")({
  validateSearch: (search: Record<string, unknown>): { aba?: "contas" | "centros" | "extrato"; centro?: string } => ({
    aba: search["aba"] === "centros" || search["aba"] === "extrato" ? search["aba"] : "contas",
    centro: typeof search["centro"] === "string" ? search["centro"] : undefined,
  }),
  head: () => ({ meta: [
    { title: "Financeiro | MMcosta Engenharia" },
    { name: "description", content: "Compras a pagar, centros de custo e extrato consolidado da MMcosta Engenharia." },
    { property: "og:title", content: "Financeiro | MMcosta Engenharia" },
    { property: "og:description", content: "Contas a pagar, centros de custo e extrato consolidado." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FinancePage,
});

function FinancePage() {
  const { aba, centro } = Route.useSearch();
  const { data: access, isLoading } = useQuery({
    queryKey: ["financeiro-access"], queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      const [{ data: canManage }, { data: rh }] = await Promise.all([
        supabase.rpc("can_manage"),
        supabase.rpc("has_role", { _user_id: user.user.id, _role: "engenharia" }),
      ]);
      return Boolean(canManage) || Boolean(rh);
    },
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">Verificando acesso…</p>;
  if (!access) return <div className="border-y py-16 text-center"><h1 className="font-display text-2xl font-bold">Acesso restrito</h1><p className="mt-2 text-sm text-muted-foreground">O financeiro está disponível para administração, escritório e RH.</p></div>;

  return <div className="space-y-6">
    <header><p className="text-xs font-bold uppercase text-primary">Empresa</p><h1 className="font-display text-3xl font-bold">Financeiro</h1></header>
    <Tabs defaultValue={aba}>
      <TabsList><TabsTrigger value="contas">Contas a pagar</TabsTrigger><TabsTrigger value="centros">Centros de custo</TabsTrigger><TabsTrigger value="extrato">Extrato</TabsTrigger></TabsList>
      <TabsContent value="contas" className="mt-6 space-y-10"><Purchases /><ManualEntries /></TabsContent>
      <TabsContent value="centros" className="mt-6"><CostCenters initialCenter={centro} /></TabsContent>
      <TabsContent value="extrato" className="mt-6"><Statement /></TabsContent>
    </Tabs>
  </div>;
}
