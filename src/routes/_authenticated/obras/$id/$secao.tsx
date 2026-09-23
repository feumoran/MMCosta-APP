import { createFileRoute, Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bulletin } from "@/components/erp/boletim";
import { Measurements } from "@/components/erp/medicoes";
import { Receipts } from "@/components/erp/comprovantes";
import { Documents } from "@/components/erp/documentos";
const names:Record<string,string>={boletim:"Boletim de produção",medicoes:"Medições",importar:"Importar medição",comprovantes:"Comprovantes",documentos:"Documentos"};
export const Route=createFileRoute("/_authenticated/obras/$id/$secao")({head:({params})=>{const n=names[params.secao]??"Área";return{meta:[{title:`${n} | MMcosta`},{name:"description",content:`${n} da obra na MMcosta Engenharia.`},{property:"og:title",content:`${n} | MMcosta`},{property:"og:description",content:`${n} da obra na MMcosta Engenharia.`},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}},component:Coming});
function Coming(){const {id,secao}=Route.useParams();if(secao==="boletim")return <Bulletin obraId={id}/>;if(secao==="medicoes")return <Measurements obraId={id}/>;if(secao==="comprovantes")return <Receipts obraId={id}/>;if(secao==="documentos")return <Documents obraId={id}/>;return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><div className="mb-5 grid size-16 place-items-center rounded-full bg-muted"><Construction className="size-7 text-primary"/></div><p className="text-xs font-bold uppercase tracking-widest text-primary">Próxima etapa</p><h1 className="mt-2 font-display text-3xl font-bold">{names[secao]??"Área"}</h1><p className="mt-3 max-w-md text-muted-foreground">Esta área está preparada na navegação e será construída na próxima etapa do sistema.</p><Button asChild variant="outline" className="mt-7"><Link to="/obras/$id/painel" params={{id}}>Voltar ao painel</Link></Button></div>}
