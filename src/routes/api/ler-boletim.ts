import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { hasToolCall, streamText, tool } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { createGatewayFetch } from "@/lib/ai-gateway.server";

const requestSchema = z.object({
  obraId: z.string().uuid(), arquivoPath: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/heic", "image/heif", "application/pdf"]),
  tipo: z.enum(["estaca_raiz", "injecao_tirante", "concreto_projetado"]),
});
const conf = z.number().min(0).max(1);
const cat = z.enum(["solo", "rocha_alterada", "rocha"]).nullable();
const header = { contratante: z.string().nullable(), local: z.string().nullable(), data_boletim: z.string().nullable(), encarregado: z.string().nullable(), observacoes: z.string().nullable() };

const estacaSchema = z.object({
  ...header,
  apoio_encontro: z.string().nullable(), bloco: z.string().nullable(), estaca: z.string().nullable(),
  diametro_mm: z.number().nullable(), carga: z.string().nullable(), comprimento_projeto_m: z.number().nullable(),
  perfuracao_data_inicio: z.string().nullable(), perfuracao_data_termino: z.string().nullable(), perfuracao_hora_inicio: z.string().nullable(), perfuracao_hora_termino: z.string().nullable(),
  revestimento_pol_mm: z.string().nullable(), trecho_revestido_m: z.number().nullable(), trecho_nao_revestido_m: z.number().nullable(), inclinada_graus: z.number().nullable(),
  lavagem_agua: z.boolean().nullable(), lavagem_polimero: z.boolean().nullable(), lavagem_ar_comprimido: z.boolean().nullable(), camisa_perdida_pol: z.string().nullable(),
  injecao_data_inicio: z.string().nullable(), injecao_data_termino: z.string().nullable(), injecao_hora_inicio: z.string().nullable(), injecao_hora_termino: z.string().nullable(),
  injecao_cimento_sc: z.number().nullable(), injecao_areia_l: z.number().nullable(),
  armacao_longitudinal_diametro_cm: z.string().nullable(), armacao_longitudinal_comprimento_m: z.number().nullable(), armacao_transversal: z.string().nullable(),
  trechos: z.array(z.object({ profundidade_de_m: z.number(), profundidade_a_m: z.number(), classificacao_solo: z.string().nullable(), categoria_perfuracao: cat, diametro_mm: z.number().nullable(), confianca: conf })),
  confianca: z.record(z.string(), conf),
});
const tiranteSchema = z.object({
  ...header,
  perfuracao_data: z.string().nullable(), perfuracao_hora_inicio: z.string().nullable(), perfuracao_hora_termino: z.string().nullable(),
  inclinacao_p_baixo_graus: z.number().nullable(), perfuracao_profundidade_m: z.number().nullable(), perfuracao_terreno: z.string().nullable(), perfuracao_categoria: cat, perfuracao_observacoes: z.string().nullable(),
  tirante_data_instalacao: z.string().nullable(), tirante_armacao: z.string().nullable(), tirante_comprimento_m: z.number().nullable(), tirante_trecho_livre_m: z.number().nullable(), tirante_trecho_ancorado_m: z.number().nullable(), tirante_numero_manchetes: z.number().nullable(), tirante_observacoes: z.string().nullable(),
  bainha_data: z.string().nullable(), bainha_hora_inicio: z.string().nullable(), bainha_hora_termino: z.string().nullable(), bainha_traco_ac: z.string().nullable(), bainha_pressao_kg_cm: z.number().nullable(), bainha_duracao_min: z.number().nullable(), bainha_cimento_kg: z.number().nullable(), bainha_observacoes: z.string().nullable(),
  fases: z.array(z.object({ fase_numero: z.number().min(1).max(3), dia: z.string().nullable(), hora: z.string().nullable(), leituras: z.array(z.object({ manchete: z.string().nullable(), pressao_abertura_kg_cm: z.number().nullable(), pressao_injecao_kg_cm: z.number().nullable(), cimento_kg: z.number().nullable(), traco_ac: z.string().nullable() })) })),
  confianca: z.record(z.string(), conf),
});
const concretoSchema = z.object({
  ...header,
  itens: z.array(z.object({ data: z.string().nullable(), material_aplicado: z.string(), unidade: z.string(), quantidade: z.number(), numero_nf: z.string().nullable(), confianca: conf })),
  confianca: z.record(z.string(), conf),
});
const schemas = { estaca_raiz: estacaSchema, injecao_tirante: tiranteSchema, concreto_projetado: concretoSchema } as const;
const prompts = {
  estaca_raiz: "Leia o 'Boletim de Estaca Raiz' da MMcosta Engenharia. Extraia o cabeçalho (contratante, local, data, encarregado), o bloco 'Estaca' (apoio/encontro, bloco, estaca, diâmetro, carga, comprimento de projeto), a tabela 'Profundidade (De/A) · Classificação do solo · Diâmetro' — uma linha por trecho —, os dados de Perfuração (datas/horas, revestimento, trechos revestido/não revestido, inclinação, lavagem água/polímero/ar comprimido, camisa perdida), os dados de Injeção (datas/horas, cimento em sacos, areia em litros) e de Armação (diâmetro e comprimento longitudinal, armação transversal).",
  injecao_tirante: "Leia o 'Boletim de Injeção' (tirante) da MMcosta Engenharia. Extraia o cabeçalho, a Perfuração (data, horas, inclinação para baixo, profundidade, terreno como texto livre, observações), o Tirante (data de instalação, armação como texto livre, comprimento, trecho livre, trecho ancorado, número de manchetes, observações), a Bainha (data, horas, traço A/C, pressão kg/cm², duração em min, cimento em kg, observações) e até 3 Fases de Injeção, cada uma com dia, hora e a grade de leituras por manchete (do fundo para a superfície: pressão de abertura, pressão de injeção, cimento em kg, traço A/C).",
  concreto_projetado: "Leia o 'Boletim de Concreto Projetado' da MMcosta Engenharia. Extraia o cabeçalho e a tabela 'Data · Material Aplicado · Unid. · Quantidade · Nº NF' — uma linha por material lançado (concreto, fibra de aço, acelerador de pega etc., cada um com sua unidade e quantidade).",
} as const;
const domain = "Siglas do papel: 'RCH ALT' = rocha alterada; 'RCH SA', 'rocha sã' ou só 'rocha' = rocha; 'solo' = solo. Números usam vírgula decimal no papel, mas devolva-os como number. Datas no papel são dd/mm/aaaa; devolva sempre como aaaa-mm-dd. Nunca invente valores ilegíveis: use nulo e confiança baixa. Você deve chamar registrar_boletim uma única vez.";

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
  if (!parsed.success) return errorResponse(400, "Arquivo, obra ou tipo de boletim inválidos.");
  const { arquivoPath, mimeType, tipo } = parsed.data;
  const { data: file, error: fileError } = await supabase.storage.from("boletins").download(arquivoPath);
  if (fileError || !file) return errorResponse(404, "Não foi possível abrir o arquivo original.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = ""; for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const base64 = btoa(binary);
  const media = mimeType === "application/pdf"
    ? { type: "file" as const, data: base64, mediaType: "application/pdf" as const, filename: arquivoPath.split("/").pop() ?? "boletim.pdf" }
    : { type: "image" as const, image: `data:${mimeType};base64,${base64}` };
  const gatewayFetch = createGatewayFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
  const lovable = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: aiKey, headers: { "Lovable-API-Key": aiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }, fetch: gatewayFetch.fetch });
  const schema = schemas[tipo];
  try {
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"), maxRetries: 0,
      system: `${prompts[tipo]} ${domain}`,
      messages: [{ role: "user", content: [{ type: "text", text: "Extraia o boletim anexado conforme as instruções." }, media] }],
      tools: { registrar_boletim: tool({ description: "Entrega a leitura estruturada e as confianças do boletim.", inputSchema: schema }) },
      toolChoice: { type: "tool", toolName: "registrar_boletim" }, stopWhen: hasToolCall("registrar_boletim"),
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const calls = await result.toolCalls;
    const raw = calls.find(call => call.toolName === "registrar_boletim")?.input;
    const checked = schema.safeParse(raw);
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
