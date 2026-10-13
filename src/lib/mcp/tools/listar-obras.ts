import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_obras",
  title: "Consultar obras",
  description: "Lista até 100 obras ativas permitidas ao usuário, com identificação, status e datas, sem valores financeiros.",
  inputSchema: { limite: z.number().int().min(1).max(100).default(50).describe("Quantidade máxima de obras a retornar.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limite }, ctx) => {
    const cloud = await supabaseForUser(ctx);
    const { data, error } = await cloud.from("obras").select("id,nome,tipo_obra,status,data_inicio,data_fim_prevista")
      .eq("ativo", true).order("data_inicio", { ascending: false }).order("id").limit(limite).abortSignal(ctx.signal);
    if (error) throw new ToolError("Não foi possível consultar as obras.");
    const obras = (data ?? []).map(row => ({ id: row.id, nome: row.nome, tipo: row.tipo_obra, status: row.status, inicio: row.data_inicio, fim_previsto: row.data_fim_prevista }));
    return { content: [{ type: "text", text: JSON.stringify({ obras }) }], structuredContent: { obras } };
  },
});
