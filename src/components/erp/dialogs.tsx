import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DialogField = { name: string; label: string; type?: "text" | "date" | "money"; defaultValue?: string; required?: boolean; placeholder?: string };
export type DialogRequest = {
  title: string;
  description?: string;
  details?: { label: string; value: string }[];
  fields?: DialogField[];
  confirmLabel?: string;
  destructive?: boolean;
};
type Pending = DialogRequest & { resolve: (value: Record<string, string> | null) => void };

let listener: ((request: Pending) => void) | null = null;

/** Abre o modal e devolve os valores dos campos (ou null se cancelado). */
export function askFields(request: DialogRequest): Promise<Record<string, string> | null> {
  return new Promise((resolve) => {
    if (!listener) { resolve(null); return; }
    listener({ ...request, resolve });
  });
}

/** Substitui window.confirm: devolve true quando o usuário confirma. */
export async function askConfirm(request: DialogRequest): Promise<boolean> {
  return (await askFields({ confirmLabel: "Confirmar", ...request })) !== null;
}

/** "08/10/2026", "08-10-2026" ou "2026-10-08" → "2026-10-08" (null se inválida). */
export function parseDateInput(text: string): string | null {
  const value = text.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  return match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : null;
}

/** "1.234,56" ou "1234.56" → número (NaN se inválido). */
export function parseMoneyInput(text: string): number {
  const value = text.trim();
  return Number(value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value);
}

export function DialogHost() {
  const [current, setCurrent] = useState<Pending | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    listener = (request) => {
      setValues(Object.fromEntries((request.fields ?? []).map((field) => [field.name, field.defaultValue ?? ""])));
      setError("");
      setCurrent(request);
    };
    return () => { listener = null; };
  }, []);
  const close = (result: Record<string, string> | null) => { current?.resolve(result); setCurrent(null); };
  const submit = () => {
    if (!current) return;
    for (const field of current.fields ?? []) {
      const value = (values[field.name] ?? "").trim();
      if (field.required && !value) { setError(`Preencha: ${field.label}.`); return; }
      if (field.type === "date" && value && !parseDateInput(value)) { setError(`${field.label}: use dd-mm-aaaa.`); return; }
      if (field.type === "money" && value && !Number.isFinite(parseMoneyInput(value))) { setError(`${field.label}: valor inválido.`); return; }
    }
    close(values);
  };
  return <Dialog open={Boolean(current)} onOpenChange={(open) => { if (!open) close(null); }}>
    <DialogContent className="max-w-md">
      {current && <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-4">
        <DialogHeader><DialogTitle>{current.title}</DialogTitle>{current.description && <DialogDescription>{current.description}</DialogDescription>}</DialogHeader>
        {current.details && current.details.length > 0 && <dl className="space-y-1 rounded-md bg-muted p-3 text-sm">{current.details.map((item) => <div key={item.label} className="flex justify-between gap-4"><dt className="text-muted-foreground">{item.label}</dt><dd className="text-right font-medium">{item.value}</dd></div>)}</dl>}
        {(current.fields ?? []).map((field, index) => <label key={field.name} className="block space-y-1 text-xs font-medium text-muted-foreground">{field.label}
          <Input autoFocus={index === 0} className="font-normal text-foreground" inputMode={field.type === "money" ? "decimal" : undefined} placeholder={field.placeholder ?? (field.type === "date" ? "dd-mm-aaaa" : undefined)} value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
        </label>)}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => close(null)}>Cancelar</Button><Button type="submit" variant={current.destructive ? "destructive" : "default"}>{current.confirmLabel ?? "Confirmar"}</Button></DialogFooter>
      </form>}
    </DialogContent>
  </Dialog>;
}
