import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/mmcosta-logo.png.asset.json";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Autorizar integração | MMcosta Flow" },
    { name: "description", content: "Autorize ou recuse o acesso de um agente à sua conta MMcosta Flow." },
    { property: "og:title", content: "Autorizar integração | MMcosta Flow" },
    { property: "og:description", content: "Autorização segura de agentes para consultas no MMcosta Flow." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  validateSearch: (search: Record<string, unknown>) => ({ authorization_id: typeof search["authorization_id"] === "string" ? search["authorization_id"] : "" }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Solicitação de autorização ausente. Inicie a conexão novamente no agente.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Não foi possível verificar sua sessão. Tente novamente.");
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Solicitação de autorização ausente.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error || !data) throw new Error("Esta solicitação expirou ou não está disponível. Inicie a conexão novamente no agente.");
    if ("redirect_url" in data) throw redirect({ href: data.redirect_url });
    return data;
  },
  pendingComponent: () => <main className="grid min-h-screen place-items-center text-muted-foreground">Verificando autorização…</main>,
  errorComponent: ({ error }) => <main className="grid min-h-screen place-items-center bg-background p-6"><div className="max-w-md space-y-4"><h1 className="text-2xl font-bold">Não foi possível autorizar</h1><p role="alert" className="text-sm text-destructive">{error instanceof Error ? error.message : "Não foi possível verificar esta autorização."}</p><Button asChild variant="outline"><a href="/auth">Voltar ao acesso</a></Button></div></main>,
  component: Consent,
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const result = approve
        ? await supabase.auth.oauth.approveAuthorization(authorization_id, { skipBrowserRedirect: true })
        : await supabase.auth.oauth.denyAuthorization(authorization_id, { skipBrowserRedirect: true });
      if (result.error) throw new Error("Não foi possível registrar sua decisão. Tente novamente.");
      if (!result.data?.redirect_url) throw new Error("A autorização não retornou um destino. Inicie a conexão novamente.");
      window.location.assign(result.data.redirect_url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível concluir a autorização.");
      setBusy(false);
    }
  }
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12"><div className="w-full max-w-md space-y-6">
    <img src={logoAsset.url} alt="MMcosta Engenharia" className="h-16 w-auto dark:brightness-0 dark:invert" />
    <ShieldCheck className="size-8 text-primary" />
    <h1 className="font-display text-2xl font-bold">Conectar {details.client.name || "agente"}</h1>
    <p className="text-sm text-muted-foreground">Este agente poderá consultar obras e medições com as permissões da sua conta. Não poderá alterar dados nem acessar arquivos privados por estas ferramentas.</p>
    <p className="break-all border-y py-3 text-sm">Conta: {details.user.email}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex gap-3"><Button disabled={busy} onClick={() => void decide(true)}>{busy ? "Aguarde…" : "Autorizar"}</Button><Button variant="outline" disabled={busy} onClick={() => void decide(false)}>Recusar</Button></div>
  </div></main>;
}
