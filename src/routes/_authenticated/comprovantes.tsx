import { createFileRoute } from "@tanstack/react-router";
import { Receipts } from "@/components/erp/comprovantes";

export const Route = createFileRoute("/_authenticated/comprovantes")({
  head: () => ({
    meta: [
      { title: "Comprovantes | MMcosta Engenharia" },
      { name: "description", content: "Prestação de contas e distribuição de comprovantes por centro de custo." },
      { property: "og:title", content: "Comprovantes | MMcosta Engenharia" },
      { property: "og:description", content: "Prestação de contas e distribuição de comprovantes por centro de custo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Receipts,
});