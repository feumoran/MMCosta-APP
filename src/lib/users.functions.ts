import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const input=z.object({email:z.string().email(),nome:z.string().min(2),role:z.enum(["admin","escritorio","engenharia","leitura"])});
export const inviteUser=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data)=>input.parse(data)).handler(async({data,context})=>{
 const {data:isAdmin}=await context.supabase.rpc("has_role",{_user_id:context.userId,_role:"admin"});
 if(!isAdmin)throw new Error("Apenas administradores podem convidar usuários.");
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const origin=process.env['APP_URL']??"https://id-preview--97084409-3515-4a7a-8384-a1cb048ff520.lovable.app";
 const {data:invited,error}=await supabaseAdmin.auth.admin.inviteUserByEmail(data.email,{redirectTo:`${origin}/auth`,data:{nome:data.nome}});if(error)throw error;if(!invited.user)throw new Error("Não foi possível criar o convite.");
 await supabaseAdmin.from("profiles").upsert({id:invited.user.id,nome:data.nome,email:data.email,created_by:context.userId});
 await supabaseAdmin.from("user_roles").upsert({user_id:invited.user.id,role:data.role,created_by:context.userId},{onConflict:"user_id,role"});return{ok:true};
});
