import { createFileRoute } from "@tanstack/react-router";
import { Receipts } from "@/components/erp/comprovantes";
import { Purchases } from "@/components/erp/compras";

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
  component: () => <><Receipts /><div className="mx-auto mt-10 max-w-[1600px] px-4 pb-10 lg:px-8"><Purchases formOnly /></div></>,
});