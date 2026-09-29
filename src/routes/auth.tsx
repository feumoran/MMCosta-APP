import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, HardHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoAsset from "@/assets/mmcosta-logo.png.asset.json";
export const Route=createFileRoute("/auth")({head:()=>({meta:[{title:"Entrar | MMcosta Engenharia"},{name:"description",content:"Acesso ao sistema de gestão da MMcosta Engenharia."},{property:"og:title",content:"MMcosta Engenharia"},{property:"og:description",content:"Sistema de gestão de obras, produção e caixa."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:Auth});
function Auth(){const nav=useNavigate(),router=useRouter();const [mode,setMode]=useState<"entrar"|"criar"|"definir-senha">("entrar"),[nome,setNome]=useState(""),[email,setEmail]=useState(""),[senha,setSenha]=useState(""),[confirmar,setConfirmar]=useState(""),[showPassword,setShowPassword]=useState(false),[erro,setErro]=useState(""),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[checking,setChecking]=useState(true);

 useEffect(()=>{
  const hash=window.location.hash;
  const isInviteLink=/type=invite|type=recovery/.test(hash)||/type=invite|type=recovery/.test(window.location.search);
  if(!isInviteLink){setChecking(false);return}
  const {data:sub}=supabase.auth.onAuthStateChange((event,session)=>{
   if((event==="PASSWORD_RECOVERY"||event==="SIGNED_IN")&&session){
    setEmail(session.user.email??"");
    setNome(String(session.user.user_metadata?.["nome"]??""));
    setMode("definir-senha");
    setChecking(false);
   }
  });
  const timeout=setTimeout(()=>setChecking(false),4000);
  return ()=>{sub.subscription.unsubscribe();clearTimeout(timeout)};
 },[]);

 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setErro("");const fallback=email.split("@")[0]??"Usuário";try{
  if(mode==="definir-senha"){
   if(senha.length<8){setErro("A senha deve ter pelo menos 8 caracteres.");setBusy(false);return}
   if(senha!==confirmar){setErro("As senhas não coincidem.");setBusy(false);return}
   const {data:updated,error}=await supabase.auth.updateUser({password:senha});
   if(error){setErro(error.message);setBusy(false);return}
   if(updated.user){await supabase.from("profiles").upsert({id:updated.user.id,nome:nome||fallback,email:updated.user.email??email});await supabase.rpc("claim_first_admin")}
   window.history.replaceState(null,"",window.location.pathname);
   await router.invalidate();await nav({to:"/visao-geral",replace:true});
  }else if(mode==="criar"){const {data,error}=await supabase.auth.signUp({email,password:senha,options:{emailRedirectTo:window.location.origin+"/auth",data:{nome}}});if(error){setErro(error.message)}else{if(data.user){await supabase.from("profiles").upsert({id:data.user.id,nome:nome||fallback,email});if(data.session)await supabase.rpc("claim_first_admin");}setSent(true)}}else{const {data,error}=await supabase.auth.signInWithPassword({email,password:senha});if(error){setErro("E-mail ou senha incorretos.");return}if(data.user){await supabase.from("profiles").upsert({id:data.user.id,nome:data.user.user_metadata["nome"]||fallback,email});await supabase.rpc("claim_first_admin");await router.invalidate();await nav({to:"/visao-geral",replace:true})}}
 }catch{setErro("Não foi possível concluir a entrada. Tente novamente.")}finally{setBusy(false)}}

 if(checking)return <main className="grid min-h-screen place-items-center"><p className="text-sm text-muted-foreground">Verificando convite…</p></main>;

 return <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]"><section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between"><img src={logoAsset.url} alt="MMcosta Engenharia" className="h-16 w-fit brightness-0 invert"/><div className="max-w-xl"><HardHat className="mb-8 size-12 text-primary"/><h1 className="font-display text-5xl font-bold leading-tight">Obra medida.<br/>Caixa sob controle.</h1><p className="mt-5 max-w-md text-lg opacity-65">Produção, avanço e despesas organizados por obra, sem perder o vínculo com o canteiro.</p></div><p className="font-mono text-xs opacity-40">São Paulo · Brasil</p></section><section className="flex items-center justify-center p-6"><div className="w-full max-w-sm"><img src={logoAsset.url} alt="MMcosta Engenharia" className="mb-10 h-16 w-auto lg:hidden"/><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Acesso interno</p><h2 className="font-display text-3xl font-bold">{mode==="definir-senha"?"Defina sua senha":mode==="entrar"?"Entre no sistema":"Crie seu acesso"}</h2><p className="mt-2 text-sm text-muted-foreground">{mode==="definir-senha"?`Você foi convidado com o e-mail ${email}. Escolha uma senha para acessar.`:"Use seu e-mail profissional e sua senha."}</p>{sent?<div className="mt-8 rounded-xl border border-good/30 bg-good/10 p-5 text-sm">Confira seu e-mail para confirmar o cadastro antes de entrar.</div>:<form onSubmit={submit} className="mt-8 space-y-4">{mode==="criar"&&<Input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome completo" required/>}{mode!=="definir-senha"&&<Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/>}<div className="relative"><Input type={showPassword?"text":"password"} value={senha} onChange={e=>setSenha(e.target.value)} placeholder={mode==="definir-senha"?"Nova senha (mín. 8)":"Senha"} minLength={mode==="definir-senha"?8:6} required className="pr-11"/><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" aria-label={showPassword?"Ocultar senha":"Mostrar senha"} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff/>:<Eye/>}</Button></div>{mode==="definir-senha"&&<Input type={showPassword?"text":"password"} value={confirmar} onChange={e=>setConfirmar(e.target.value)} placeholder="Confirmar senha" minLength={8} required/>}{erro&&<p className="text-sm text-destructive">{erro}</p>}<Button className="w-full" disabled={busy}>{busy?"Aguarde...":mode==="definir-senha"?"Salvar senha e entrar":mode==="entrar"?"Entrar":"Criar acesso"}<ArrowRight/></Button></form>}{mode!=="definir-senha"&&<Button variant="link" className="mt-6 px-0" onClick={()=>{setMode(mode==="entrar"?"criar":"entrar");setSent(false)}}>{mode==="entrar"?"Primeiro acesso? Criar conta":"Já possui acesso? Entrar"}</Button>}</div></section></main>}
