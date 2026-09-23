import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MMcosta Engenharia | Gestão de obras" },
      {
        name: "description",
        content: "Sistema de gestão de obras, avanço e caixa da MMcosta Engenharia.",
      },
      { property: "og:title", content: "MMcosta Engenharia" },
      { property: "og:description", content: "Gestão de obras, avanço e caixa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeRedirect,
});

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/visao-geral", replace: true });
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Abrindo visão geral…</p>
    </main>
  );
}
