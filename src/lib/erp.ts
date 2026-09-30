export async function fileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}
export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const pct = (value: number) => `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
export const dateBR = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR").format(date);
};
export const daysBetween = (a: string, b: string) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
export function smoothstep(t: number) { const x=Math.max(0,Math.min(1,t)); return x*x*x*(6*x*x-15*x+10); }
export function obraHealth(status: string, start: string, end: string, physical: number) {
  if (status === "concluida" || physical >= 100) return { label: "Concluída", tone: "good" as const };
  const elapsed=Math.max(0,Math.min(100,(daysBetween(start,new Date().toISOString().slice(0,10))/daysBetween(start,end))*100));
  const delta=physical-elapsed;
  if(delta>=-5) return {label:"Em dia",tone:"good" as const};
  if(delta>=-15) return {label:"Atenção",tone:"warn" as const};
  return {label:"Atrasado",tone:"danger" as const};
}
type CurveMark={data:string;percentual_fisico:number;percentual_financeiro:number};
type PlannedMark={data:string;percentual_fisico_planejado:number;percentual_financeiro_planejado:number};
export function buildCurve(start:string,end:string,marks:CurveMark[],planned:PlannedMark[]=[]){
  const elapsedDays=(from:string,to:string)=>Math.max(0,Math.round((new Date(to).getTime()-new Date(from).getTime())/86400000));
  const total=daysBetween(start,end),actual=[{data:start,percentual_fisico:0,percentual_financeiro:0},...marks].sort((a,b)=>a.data.localeCompare(b.data));
  const plannedPoints=[{data:start,percentual_fisico_planejado:0,percentual_financeiro_planejado:0},...planned].sort((a,b)=>a.data.localeCompare(b.data));
  const dates=new Set<string>([start,end,...marks.map(mark=>mark.data),...planned.map(mark=>mark.data)]);
  for(let d=0;d<=total;d+=7){const date=new Date(`${start}T12:00:00`);date.setDate(date.getDate()+d);dates.add(date.toISOString().slice(0,10))}
  const interpolate=(date:string,points:{data:string;physical:number;financial:number}[])=>{let previous=points[0]??{data:start,physical:0,financial:0};const next=points.find(point=>point.data>=date)??points.at(-1)??previous;for(const point of points)if(point.data<=date)previous=point;const span=Math.max(1,elapsedDays(previous.data,next.data)),part=previous.data===next.data?0:Math.max(0,Math.min(1,elapsedDays(previous.data,date)/span));return{physical:previous.physical+(next.physical-previous.physical)*part,financial:previous.financial+(next.financial-previous.financial)*part}}
  const actualValues=actual.map(mark=>({data:mark.data,physical:Number(mark.percentual_fisico),financial:Number(mark.percentual_financeiro)})),plannedValues=plannedPoints.map(mark=>({data:mark.data,physical:Number(mark.percentual_fisico_planejado),financial:Number(mark.percentual_financeiro_planejado)})),lastActual=actual.at(-1)?.data??start;
  return [...dates].filter(date=>date>=start&&date<=end).sort().map((iso,index)=>{const t=elapsedDays(start,iso)/total,realized=interpolate(iso,actualValues),customPlan=planned.length?interpolate(iso,plannedValues):null;return{data:dateBR(iso),semana:`S${index+1}`,planejadoFisico:customPlan?.physical??smoothstep(t)*100,planejadoFinanceiro:customPlan?.financial??smoothstep(Math.max(0,t-7/total))*100,realizadoFisico:iso>lastActual?NaN:realized.physical,realizadoFinanceiro:iso>lastActual?NaN:realized.financial}});
}
