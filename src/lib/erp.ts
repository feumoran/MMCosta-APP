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
  if (status === "concluida") return { label: "Concluída", tone: "good" as const };
  const elapsed=Math.max(0,Math.min(100,(daysBetween(start,new Date().toISOString().slice(0,10))/daysBetween(start,end))*100));
  const delta=physical-elapsed;
  if(delta>=-5) return {label:"Em dia",tone:"good" as const};
  if(delta>=-15) return {label:"Atenção",tone:"warn" as const};
  return {label:"Atrasado",tone:"danger" as const};
}
export function buildCurve(start:string,end:string,marks:{data:string;percentual_fisico:number;percentual_financeiro:number}[]){
  const total=daysBetween(start,end), today=new Date().toISOString().slice(0,10), points=[] as {data:string;semana:string;planejadoFisico:number;planejadoFinanceiro:number;realizadoFisico:number;realizadoFinanceiro:number}[];
  const base={data:start,percentual_fisico:0,percentual_financeiro:0};
  const sorted=[base,...marks].sort((a,b)=>a.data.localeCompare(b.data));
  for(let d=0;d<=total;d+=7){const dt=new Date(`${start}T12:00:00`);dt.setDate(dt.getDate()+d);const iso=dt.toISOString().slice(0,10);if(iso>today&&iso>end) break;const t=d/total;let prev=base;let next=sorted.find(m=>m.data>=iso)??sorted.at(-1)??base;for(const m of sorted)if(m.data<=iso)prev=m;const span=Math.max(1,daysBetween(prev.data,next.data)),part=Math.max(0,Math.min(1,daysBetween(prev.data,iso)/span));points.push({data:dateBR(iso),semana:`S${Math.floor(d/7)+1}`,planejadoFisico:smoothstep(t)*100,planejadoFinanceiro:smoothstep(Math.max(0,t-7/total))*100,realizadoFisico:iso>(sorted.at(-1)?.data??start)?NaN:prev.percentual_fisico+(next.percentual_fisico-prev.percentual_fisico)*part,realizadoFinanceiro:iso>(sorted.at(-1)?.data??start)?NaN:prev.percentual_financeiro+(next.percentual_financeiro-prev.percentual_financeiro)*part});}
  return points;
}
