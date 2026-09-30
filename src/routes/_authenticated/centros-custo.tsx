import { createFileRoute, redirect } from "@tanstack/react-router";

// Centros de custo agora fica dentro de Financeiro (subaba). Mantém links antigos funcionando.
export const Route = createFileRoute("/_authenticated/centros-custo")({
  validateSearch: (search: Record<string, unknown>) => ({ centro: typeof search["centro"] === "string" ? search["centro"] : undefined }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/financeiro", search: { aba: "centros", centro: search.centro }, replace: true });
  },
});
