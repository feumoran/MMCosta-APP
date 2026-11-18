-- Tipo de pagamento informado ao lançar a compra (PIX, boleto, transferência, cartão, dinheiro...).
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS tipo_pagamento text;

-- Mais de um anexo por compra: anexo_path continua sendo o principal; os demais ficam em anexos_extras.
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS anexos_extras text[] NOT NULL DEFAULT '{}';

-- Quem lançou a compra pode excluí-la enquanto ela estiver pendente (digitou errado, anexo errado, valor errado).
-- Administração continua podendo excluir qualquer uma.
DROP POLICY IF EXISTS compras_delete ON public.compras;
CREATE POLICY compras_delete ON public.compras FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR (status = 'pendente' AND origem <> 'comprovante' AND created_by = auth.uid()
        AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')))
  );

-- Anexos do bucket compras: o autor pode remover o próprio arquivo (pasta = id do usuário).
DROP POLICY IF EXISTS compras_storage_delete_own ON storage.objects;
CREATE POLICY compras_storage_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='compras' AND (storage.foldername(name))[1] = auth.uid()::text
         AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
