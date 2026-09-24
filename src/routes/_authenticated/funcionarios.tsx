import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Employees } from "@/components/erp/funcionarios";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/funcionarios")({
  head: () => ({
    meta: [
      { title: "Funcionários | MMcosta Engenharia" },
      { name: "description", content: "Cadastro, remuneração, alocação e documentação dos funcionários." },
      { property: "og:title", content: "Funcionários | MMcosta Engenharia" },
      { property: "og:description", content: "Cadastro, remuneração, alocação e documentação dos funcionários." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { data: access, isLoading } = useQuery({
    queryKey: ["employees-access"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { admin: false, canManage: false };
      const [{ data: admin }, { data: canManage }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.user.id, _role: "admin" }),
        supabase.rpc("can_manage"),
      ]);
      return { admin: Boolean(admin), canManage: Boolean(canManage) };
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando funcionários…</p>;
  return <Employees canManage={Boolean(access?.canManage)} canAdmin={Boolean(access?.admin)} />;
}