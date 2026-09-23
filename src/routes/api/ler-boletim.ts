import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { hasToolCall, streamText, tool } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { createGatewayFetch } from "@/lib/ai-gateway.server";

const requestSchema = z.object({ obraId: z.string().uuid(), arquivoPath: z.string().min(1), mimeType: z.enum(["image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf"]) });
const confidence = z.number().min(0).max(1);
const outputSchema = z.object({
  data: z.string().nullable(), equipamento: z.string().nullable(), equipe: z.string().nullable(),
  itens: z.array(z.object({ descricao: z.string(), servico_sugerido: z.string().nullable(), categoria_perfuracao: z.enum(["solo", "rocha_alterada", "rocha"]).nullable(), quantidade: z.number(), unidade: z.string(), confianca: z.object({ descricao: confidence, servico_sugerido: confidence, categoria_perfuracao: confidence, quantidade: confidence, unidade: confidence }) })),
  horas_trabalhadas: z.number().nullable(), horas_paradas: z.number().nullable(), motivo_parada: z.string().nullable(), observacoes: z.string().nullable(),
  confianca: z.object({ data: confidence, equipamento: confidence, equipe: confidence, horas_trabalhadas: confidence, horas_paradas: confidence, motivo_parada: confidence, observacoes: confidence }),
});

function errorResponse(status: number, message: string) { return Response.json({ error: message }, { status }); }

export const Route = createFileRoute("/api/ler-boletim")({ server: { handlers: { POST: async ({ request }) => {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return errorResponse(401, "Entre novamente para ler o boletim.");
  const url = process.env["SUPABASE_URL"], key = process.env["SUPABASE_PUBLISHABLE_KEY"], aiKey = process.env["LOVABLE_API_KEY"];
  if (!url || !key || !aiKey) return errorResponse(500, "A leitura por IA ainda não está configurada.");
  const supabase = createClient<Database>(url, key, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: claims } = await supabase.auth.getClaims(auth.slice(7));
  if (!claims?.claims?.sub) return errorResponse(401, "Sua sessão expirou. Entre novamente.");
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse(400, "Arquivo ou obra inválidos.");
  const { obraId, arquivoPath, mimeType } = parsed.data;
  const [{ data: file, error: fileError }, { data: allocations }, { data: teamAllocations }, { data: services }] = await Promise.all([
    supabase.storage.from("boletins").download(arquivoPath),
    supabase.from("obra_equipamentos").select("equipamentos(id,codigo,descricao)").eq("obra_id", obraId),
    supabase.from("obra_equipes").select("equipes(id,nome)").eq("obra_id", obraId),
    supabase.from("servicos").select("id,nome,unidade,eh_perfuracao,palavras_chave").eq("ativo", true),
  ]);
  if (fileError || !file) return errorResponse(404, "Não foi possível abrir o arquivo original.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = ""; for (let i=0;i<bytes.length;i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
  const base64 = btoa(binary);
  const media = mimeType === "application/pdf"
    ? { type: "file" as const, data: base64, mediaType: "application/pdf" as const, filename: arquivoPath.split("/").pop() ?? "boletim.pdf" }
    : { type: "image" as const, image: `data:${mimeType};base64,${base64}` };
  const gatewayFetch = createGatewayFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
  const lovable = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: aiKey, headers: { "Lovable-API-Key": aiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }, fetch: gatewayFetch.fetch });
  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"), maxRetries: 0,
      system: "Leia boletins manuscritos de fundações e geotecnia. RCH ALT significa rocha alterada. RCH SA, rocha sã e rocha significam rocha. Solo significa solo. Toda perfuração deve ter categoria. Separe linhas mistas, como 4,0m solo + 6,0m rocha, em dois itens. Interprete vírgula como separador decimal. Nunca invente valores ilegíveis: use nulo e confiança baixa. Escolha equipamento, equipe e serviço das listas quando houver correspondência; caso contrário preserve o texto livre. Você deve chamar registrar_boletim uma única vez.",
      messages: [{ role: "user", content: [{ type: "text", text: `Equipamentos alocados: ${JSON.stringify(allocations ?? [])}\nEquipes alocadas: ${JSON.stringify(teamAllocations ?? [])}\nCatálogo de serviços: ${JSON.stringify(services ?? [])}\nExtraia o boletim anexado.` }, media] }],
      tools: { registrar_boletim: tool({ description: "Entrega a leitura estruturada e as confianças do boletim.", inputSchema: outputSchema }) },
      toolChoice: { type: "tool", toolName: "registrar_boletim" }, stopWhen: hasToolCall("registrar_boletim"),
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const calls = await result.toolCalls;
    const raw = calls.find(call => call.toolName === "registrar_boletim")?.input;
    const checked = outputSchema.safeParse(raw);
    if (!checked.success) return errorResponse(422, "A leitura terminou, mas alguns campos não puderam ser validados. Preencha manualmente.");
    return Response.json({ extracao: checked.data, runId: gatewayFetch.getRunId() });
  } catch (error) {
    const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 500;
    if (status === 429) return errorResponse(429, "Muitas leituras ao mesmo tempo. Aguarde um pouco e tente novamente.");
    if (status === 402) return errorResponse(402, "Os créditos de IA acabaram. O boletim pode ser preenchido manualmente.");
    const safe = error instanceof Error ? error.message : "Falha na leitura";
    return errorResponse(status >= 400 && status < 600 ? status : 500, safe);
  }
} } } });