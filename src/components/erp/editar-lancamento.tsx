import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, dateBR } from "@/lib/erp";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EditableEntry = { id: string; data: string; descricao: string; valor: number; centro_custo_id: string; categoria?: string | null };
type Center = { id: string; nome: string; tipo: string; obra_id: string | null };

/** Corrige categoria e centro de custo de um lançamento já gravado. A alteração fica no Registro de alterações (auditoria). */
export function EditEntryDialog({ entry, centers, categories, onClose }: { entry: EditableEntry | null; centers: Center[]; categories: { id: string; nome: string }[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [center, setCenter] = useState("");
  const [category, setCategory] = useState("");
  useEffect(() => { setCenter(entry?.centro_custo_id ?? ""); setCategory(entry?.categoria ?? ""); }, [entry]);
  const save = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      const target = centers.find((c) => c.id === center);
      if (!target || !category) throw new Error("Escolha o centro de custo e a categoria.");
      const { error } = await supabase.from("lancamentos").update({ centro_custo_id: target.id, obra_id: target.obra_id, categoria: category } as never).eq("id", entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lançamento corrigido. A alteração fica registrada (quem e quando).");
      ["extrato", "cost-centers-details", "cost-centers", "obra", "overview"].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });
  return <Dialog open={Boolean(entry)} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-w-md">
      <DialogHeader><DialogTitle>Corrigir lançamento</DialogTitle><DialogDescription>Altere a categoria e/ou o centro de custo. Quem alterou e quando fica registrado.</DialogDescription></DialogHeader>
      {entry && <div className="space-y-3">
        <dl className="space-y-1 rounded-md bg-muted p-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Descrição</dt><dd className="text-right font-medium">{entry.descricao}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Data</dt><dd>{dateBR(entry.data)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Valor</dt><dd className="font-mono">{brl.format(entry.valor)}</dd></div></dl>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">Centro de custo<Select value={center} onValueChange={setCenter}><SelectTrigger><SelectValue placeholder="Centro de custo" /></SelectTrigger><SelectContent>{centers.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">Categoria<Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></label>
      </div>}
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Salvando…" : "Salvar correção"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
