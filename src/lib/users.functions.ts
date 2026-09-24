import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const roleSchema=z.enum(["admin","escritorio","engenharia","leitura"]);
const input=z.object({email:z.string().email(),nome:z.string().min(2),role:roleSchema});
const userInput=z.object({userId:z.string().uuid(),role:roleSchema});
const passwordInput=z.object({userId:z.string().uuid(),password:z.string().min(8,"A senha deve ter pelo menos 8 caracteres.").max(72)});
async function assertAdmin(context:{supabase:any;userId:string}){const {data,error}=await context.supabase.rpc("has_role",{_user_id:context.userId,_role:"admin"});if(error||!data)throw new Error("Apenas administradores podem gerenciar usuários.")}
export const inviteUser=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data)=>input.parse(data)).handler(async({data,context})=>{
 await assertAdmin(context);
 const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const origin=process.env['APP_URL']??"https://mmcosta-app.lovable.app";
 const email=data.email.trim().toLowerCase();
 let userId:string|undefined;
 const {data:invited,error:inviteError}=await supabaseAdmin.auth.admin.inviteUserByEmail(email,{redirectTo:`${origin}/auth`,data:{nome:data.nome}});
 if(invited.user)userId=invited.user.id;
 if(inviteError){const {data:list,error:listError}=await supabaseAdmin.auth.admin.listUsers({page:1,perPage:1000});if(listError)throw listError;userId=list.users.find(user=>user.email?.toLowerCase()===email)?.id;if(!userId)throw inviteError}
 if(!userId)throw new Error("Não foi possível registrar o convite.");
 const {error:profileError}=await supabaseAdmin.from("profiles").upsert({id:userId,nome:data.nome.trim(),email,created_by:context.userId});if(profileError)throw new Error(`O convite foi enviado, mas o usuário não foi registrado: ${profileError.message}`);
 const {error:deleteRoleError}=await supabaseAdmin.from("user_roles").delete().eq("user_id",userId);if(deleteRoleError)throw deleteRoleError;
 const {error:roleError}=await supabaseAdmin.from("user_roles").insert({user_id:userId,role:data.role,created_by:context.userId});if(roleError)throw new Error(`O usuário foi registrado, mas o papel não foi salvo: ${roleError.message}`);
 return{ok:true,userId,alreadyExisted:Boolean(inviteError)};
});

export const updateUserRole=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data)=>userInput.parse(data)).handler(async({data,context})=>{await assertAdmin(context);const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const {error:removeError}=await supabaseAdmin.from("user_roles").delete().eq("user_id",data.userId);if(removeError)throw removeError;const {error}=await supabaseAdmin.from("user_roles").insert({user_id:data.userId,role:data.role,created_by:context.userId});if(error)throw error;return{ok:true}});

export const updateUserPassword=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data)=>passwordInput.parse(data)).handler(async({data,context})=>{await assertAdmin(context);const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const {error}=await supabaseAdmin.auth.admin.updateUserById(data.userId,{password:data.password});if(error)throw new Error(`Não foi possível definir a nova senha: ${error.message}`);return{ok:true}});

export const removeUser=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((data)=>z.object({userId:z.string().uuid()}).parse(data)).handler(async({data,context})=>{await assertAdmin(context);if(data.userId===context.userId)throw new Error("Você não pode excluir seu próprio usuário.");const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const {error}=await supabaseAdmin.auth.admin.deleteUser(data.userId);if(error)throw error;const {error:roleError}=await supabaseAdmin.from("user_roles").delete().eq("user_id",data.userId);if(roleError)throw roleError;const {error:profileError}=await supabaseAdmin.from("profiles").delete().eq("id",data.userId);if(profileError)throw profileError;return{ok:true}});

export const listUsers=createServerFn({method:"GET"}).middleware([requireSupabaseAuth]).handler(async({context})=>{await assertAdmin(context);const {supabaseAdmin}=await import("@/integrations/supabase/client.server");const [{data:profiles,error},{data:roles,error:rolesError}]=await Promise.all([supabaseAdmin.from("profiles").select("id,nome,email").order("nome"),supabaseAdmin.from("user_roles").select("user_id,role")]);if(error)throw error;if(rolesError)throw rolesError;return (profiles??[]).map(profile=>({...profile,role:roles?.find(item=>item.user_id===profile.id)?.role??"leitura"}))});
