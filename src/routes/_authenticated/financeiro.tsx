import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Purchases } from "@/components/erp/compras";
import { ManualEntries } from "@/components/erp/lancamento-manual";
import { Statement } from "@/components/erp/extrato";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [
    { title: "Financeiro | MMcosta Engenharia" },
    { name: "description", content: "Compras a pagar, lançamentos manuais e extrato consolidado da MMcosta Engenharia." },
    { property: "og:title", content: "Financeiro | MMcosta Engenharia" },
    { property: "og:description", content: "Compras a pagar, lançamentos manuais e extrato consolidado." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FinancePage,
});

function FinancePage() {
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
    <Tabs defaultValue="compras">
      <TabsList><TabsTrigger value="compras">Compras a pagar</TabsTrigger><TabsTrigger value="manual">Lançamentos manuais</TabsTrigger><TabsTrigger value="extrato">Extrato</TabsTrigger></TabsList>
      <TabsContent value="compras" className="mt-6"><Purchases /></TabsContent>
      <TabsContent value="manual" className="mt-6"><ManualEntries /></TabsContent>
      <TabsContent value="extrato" className="mt-6"><Statement /></TabsContent>
    </Tabs>
  </div>;
}
