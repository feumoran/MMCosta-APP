import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { hasToolCall, streamText, tool } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { createGatewayFetch } from "@/lib/ai-gateway.server";

const requestSchema = z.object({
  nomeArquivo: z.string().min(1),
  texto: z.string().nullable(),
  paginas: z.array(z.string().startsWith("data:image/")).max(30).default([]),
});

const titleSchema = z.object({
  beneficiario: z.string(),
  descricao: z.string().nullable(),
  valor: z.number().positive(),
  vencimento: z.string().nullable(),
  linha_digitavel: z.string().nullable(),
  documento: z.string().nullable(),
});
const outputSchema = z.object({ titulos: z.array(titleSchema) });

const fail = (status: number, error: string) => Response.json({ error }, { status });

export const Route = createFileRoute("/api/ler-dda")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization");
        if (!authorization?.startsWith("Bearer ")) return fail(401, "Entre novamente para ler o DDA.");

        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const aiKey = process.env["LOVABLE_API_KEY"];
        if (!url || !key || !aiKey) return fail(500, "A leitura por IA ainda não está configurada.");

        const cloud = createClient<Database>(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
        const { data: claims } = await cloud.auth.getClaims(authorization.slice(7));
        const userId = claims?.claims?.sub;
        if (!userId) return fail(401, "Sua sessão expirou. Entre novamente.");

        const parsed = requestSchema.safeParse(await request.json());
        if (!parsed.success) return fail(400, "O conteúdo enviado não é válido.");

        const [{ data: canManage }, { data: isRh }] = await Promise.all([
          cloud.rpc("can_manage"),
          cloud.rpc("has_role", { _user_id: userId, _role: "engenharia" }),
        ]);
        if (!canManage && !isRh) return fail(403, "Seu perfil não pode importar DDA.");

        const input = parsed.data;
        if (!input.texto?.trim() && input.paginas.length === 0) return fail(400, "O PDF não contém texto legível nem páginas para analisar.");

        const run = createGatewayFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: aiKey,
          headers: { "Lovable-API-Key": aiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: run.fetch,
        });

        try {
          const result = streamText({
            model: lovable.responses("openai/gpt-6-astra"),
            maxRetries: 0,
            system:
              "Extraia os títulos de uma lista de DDA (Débito Direto Autorizado) de banco brasileiro, sem inventar dados. Um item por título/boleto. Para cada um devolva: beneficiário (quem recebe o pagamento, nome do cedente/favorecido), descrição se houver, valor do título em número (converta vírgula decimal), vencimento em aaaa-mm-dd quando legível, linha digitável ou código de barras (somente dígitos) e número do documento/nosso número se houver. Ignore totais, saldos, cabeçalhos e rodapés. Não repita o mesmo título. Chame registrar_dda exatamente uma vez.",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: input.texto?.trim()
                      ? `Texto extraído do PDF ${input.nomeArquivo}:\n${input.texto}`
                      : `Extraia os títulos do DDA mostrado nas páginas do arquivo ${input.nomeArquivo}.`,
                  },
                  ...input.paginas.map((pagina) => ({ type: "image" as const, image: new URL(pagina) })),
                ],
              },
            ],
            tools: { registrar_dda: tool({ description: "Registra os títulos de DDA extraídos.", inputSchema: outputSchema }) },
            toolChoice: { type: "tool", toolName: "registrar_dda" },
            stopWhen: hasToolCall("registrar_dda"),
            providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
          });
          const raw = (await result.toolCalls).find((call) => call.toolName === "registrar_dda")?.input;
          const checked = outputSchema.safeParse(raw);
          if (!checked.success) return fail(422, "A leitura terminou, mas os títulos não puderam ser validados. Tente de novo ou use planilha.");
          return Response.json({ extracao: checked.data, runId: run.getRunId() });
        } catch (error) {
          const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 500;
          const message = error instanceof Error ? error.message : "Não foi possível ler o PDF.";
          if (status === 429) return fail(429, "Muitas leituras ao mesmo tempo. Aguarde um pouco e tente novamente.");
          return fail(status >= 400 && status < 600 ? status : 500, message);
        }
      },
    },
  },
});
