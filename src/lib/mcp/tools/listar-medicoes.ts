import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_medicoes",
  title: "Consultar medições de uma obra",
  description: "Consulta até 100 medições não excluídas de uma obra permitida, com número, período, origem e status, sem valores ou arquivos privados.",
  inputSchema: {
    obra_id: z.string().uuid().describe("Identificador da obra retornado por listar_obras."),
    limite: z.number().int().min(1).max(100).default(50).describe("Quantidade máxima de medições a retornar."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ obra_id, limite }, ctx) => {
    const cloud = await supabaseForUser(ctx);
    const { data: obra, error: workError } = await cloud.from("obras").select("id,nome").eq("id", obra_id).eq("ativo", true).abortSignal(ctx.signal).maybeSingle();
    if (workError || !obra) throw new ToolError("Obra não encontrada ou acesso indisponível.");
    const { data, error } = await cloud.from("medicoes").select("id,numero,status,origem,data_inicio,data_fim")
      .eq("obra_id", obra_id).is("deleted_at", null).order("numero", { ascending: false }).order("id").limit(limite).abortSignal(ctx.signal);
    if (error) throw new ToolError("Não foi possível consultar as medições.");
    const medicoes = (data ?? []).map(row => ({ id: row.id, numero: row.numero, status: row.status, origem: row.origem, inicio: row.data_inicio, fim: row.data_fim }));
    const result = { obra: { id: obra.id, nome: obra.nome }, medicoes };
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
  },
});
