ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS tipo_pagamento text;
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS anexos_extras text[] NOT NULL DEFAULT '{}';
DROP POLICY IF EXISTS compras_delete ON public.compras;
CREATE POLICY compras_delete ON public.compras FOR DELETE TO authenticated
USING (
    public.has_role(auth.uid(),'admin')
OR (status = 'pendente' AND origem <> 'comprovante' AND created_by = auth.uid()
AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')))
  );
DROP POLICY IF EXISTS compras_storage_delete_own ON storage.objects;
CREATE POLICY compras_storage_delete_own ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='compras' AND (storage.foldername(name))[1] = auth.uid()::text
AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
NOTIFY pgrst, 'reload schema';