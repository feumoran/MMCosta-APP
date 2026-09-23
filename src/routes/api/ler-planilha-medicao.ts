import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { hasToolCall, streamText, tool } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { createGatewayFetch } from "@/lib/ai-gateway.server";

const requestSchema = z.object({
  arquivoPath: z.string().min(1),
  nomeArquivo: z.string().min(1),
  texto: z.string().nullable(),
  paginas: z.array(z.string().startsWith("data:image/")).max(30).default([]),
});

const rowSchema = z.object({
  obra_texto: z.string().nullable(),
  data: z.string().nullable(),
  servico: z.string(),
  categoria_perfuracao: z.enum(["solo", "rocha_alterada", "rocha"]).nullable(),
  quantidade: z.number().positive(),
  unidade: z.string(),
  valor_unitario: z.number().nonnegative().nullable(),
  valor_total: z.number().nonnegative().nullable(),
});

const outputSchema = z.object({
  total_declarado: z.number().nonnegative().nullable(),
  linhas: z.array(rowSchema),
});

const fail = (status: number, error: string) => Response.json({ error }, { status });

export const Route = createFileRoute("/api/ler-planilha-medicao")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization");
        if (!authorization?.startsWith("Bearer ")) {
          return fail(401, "Entre novamente para ler a planilha de medição.");
        }

        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const aiKey = process.env["LOVABLE_API_KEY"];
        if (!url || !key || !aiKey) {
          return fail(500, "A leitura por IA ainda não está configurada.");
        }

        const cloud = createClient<Database>(url, key, {
          global: { headers: { Authorization: authorization } },
          auth: { persistSession: false },
        });
        const { data: claims } = await cloud.auth.getClaims(authorization.slice(7));
        const userId = claims?.claims?.sub;
        if (!userId) return fail(401, "Sua sessão expirou. Entre novamente.");

        const parsed = requestSchema.safeParse(await request.json());
        if (!parsed.success) return fail(400, "O conteúdo enviado não é válido.");

        const { data: canManage } = await cloud.rpc("can_manage");
        if (!canManage) return fail(403, "Seu perfil não pode importar medições.");

        const input = parsed.data;
        if (!input.texto?.trim() && input.paginas.length === 0) {
          return fail(400, "O PDF não contém texto legível nem páginas para analisar.");
        }

        const run = createGatewayFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: aiKey,
          headers: {
            "Lovable-API-Key": aiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          fetch: run.fetch,
        });

        try {
          const result = streamText({
            model: lovable.responses("openai/gpt-6-astra"),
            maxRetries: 0,
            system:
              "Extraia uma medição brasileira sem inventar dados. Uma linha por serviço e obra. Preserve o texto original da obra ou centro de custo. Datas devem sair em aaaa-mm-dd quando legíveis. Converta vírgula decimal corretamente. Categoria de perfuração só pode ser solo, rocha_alterada ou rocha. Em tabelas com grupos DADOS CONTRATUAIS, QUANTIDADES MEDIDAS e VALORES MEDIDOS, extraia exclusivamente as colunas ATUAL de QUANTIDADES MEDIDAS e ATUAL de VALORES MEDIDOS. Inclua toda linha de serviço cujo VALOR ATUAL seja preenchido e maior que zero, mantendo descrição, quantidade atual, unidade, preço unitário contratual e valor atual da mesma linha visual. Nunca use saldo, acumulado, anterior ou total contratual como linha. Antes de responder, some os valores atuais extraídos e confira contra o TOTAL DOS SERVIÇOS na coluna ATUAL; revise linhas omitidas ou deslocadas até reconciliar a soma, aceitando diferença máxima de R$ 0,02. Chame registrar_medicao exatamente uma vez.",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: input.texto?.trim()
                      ? `Texto extraído do PDF ${input.nomeArquivo}:\n${input.texto}`
                      : `Extraia as linhas da planilha de medição ${input.nomeArquivo} mostrada nas páginas.`,
                  },
                  ...input.paginas.map((pagina) => ({ type: "image" as const, image: new URL(pagina) })),
                ],
              },
            ],
            tools: {
              registrar_medicao: tool({
                description: "Registra as linhas estruturadas da medição importada.",
                inputSchema: outputSchema,
              }),
            },
            toolChoice: { type: "tool", toolName: "registrar_medicao" },
            stopWhen: hasToolCall("registrar_medicao"),
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });
          const raw = (await result.toolCalls).find(
            (call) => call.toolName === "registrar_medicao",
          )?.input;
          const checked = outputSchema.safeParse(raw);
          if (!checked.success) {
            return fail(422, "A leitura terminou, mas algumas linhas precisam ser preenchidas manualmente.");
          }
          const extractedTotal = checked.data.linhas.reduce((sum, line) => sum + (line.valor_total ?? line.quantidade * (line.valor_unitario ?? 0)), 0);
          if (checked.data.total_declarado !== null && Math.abs(extractedTotal - checked.data.total_declarado) > 0.02) {
            return fail(422, `A soma das linhas (${extractedTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}) não confere com o total do documento (${checked.data.total_declarado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Nenhum registro foi criado; tente ler novamente ou revise manualmente.`);
          }
          return Response.json({ extracao: checked.data, runId: run.getRunId() });
        } catch (error) {
          const status =
            typeof error === "object" && error && "statusCode" in error
              ? Number(error.statusCode)
              : 500;
          const message = error instanceof Error ? error.message : "Não foi possível ler o PDF.";
          if (status === 429) {
            return fail(429, "Muitas leituras ao mesmo tempo. Aguarde um pouco e tente novamente.");
          }
          if (status === 402) return fail(402, message);
          if (status === 403) return fail(403, message);
          return fail(status >= 400 && status < 600 ? status : 500, message);
        }
      },
    },
  },
});