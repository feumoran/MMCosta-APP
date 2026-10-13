import { createClient } from "@supabase/supabase-js";
import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

// Resolve configuration only during verified handler execution, never at import.
export async function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !token || !userId) throw new ToolError("Entre com uma conta autorizada.");
  const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
  let key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!key && process.env["SUPABASE_PUBLISHABLE_KEYS"]) {
    try {
      const keys: unknown = JSON.parse(process.env["SUPABASE_PUBLISHABLE_KEYS"] ?? "{}");
      if (keys && typeof keys === "object" && !Array.isArray(keys)) {
        key = Object.values(keys).find((value): value is string => typeof value === "string" && value.startsWith("sb_publishable_"));
      }
    } catch { /* Try the legacy configuration below. */ }
  }
  key ??= process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new ToolError("A conexão com o MMcosta Flow não está configurada.");
  const cloud = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const roles = await Promise.all((["admin", "escritorio", "engenharia", "leitura"] as const).map(role =>
    cloud.rpc("has_role", { _user_id: userId, _role: role }),
  ));
  if (roles.some(result => result.error)) throw new ToolError("Não foi possível verificar suas permissões.");
  if (!roles.some(result => result.data === true)) throw new ToolError("Sua conta não tem permissão para consultar o sistema.");
  return cloud;
}
