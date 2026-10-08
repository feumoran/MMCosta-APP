-- Compras sem NF/cupom fiscal precisam de justificativa.
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS justificativa text;
