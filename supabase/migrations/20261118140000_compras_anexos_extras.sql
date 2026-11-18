-- Mais de um anexo por compra: anexo_path continua sendo o principal; os demais ficam em anexos_extras.
ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS anexos_extras text[] NOT NULL DEFAULT '{}';
