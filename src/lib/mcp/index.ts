import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listarObras from "./tools/listar-obras";
import listarMedicoes from "./tools/listar-medicoes";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";
export default defineMcp({
  name: "mmcosta-flow",
  title: "MMcosta Flow",
  version: "0.1.0",
  instructions: "Consultas somente de leitura do MMcosta Flow em português. Respeite as permissões da conta. Consulte obras antes de suas medições. Resultados são limitados e não incluem valores financeiros, credenciais ou arquivos privados. Não é possível alterar ou excluir dados por estas ferramentas.",
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: "authenticated", requireOAuthClientClaim: true }),
  tools: [listarObras, listarMedicoes],
});
