-- Novas categorias em Documentos da obra: FGTS, GPS - DARF único e Holerite assinado.
ALTER TYPE public.documento_categoria ADD VALUE IF NOT EXISTS 'fgts';
ALTER TYPE public.documento_categoria ADD VALUE IF NOT EXISTS 'gps_darf';
ALTER TYPE public.documento_categoria ADD VALUE IF NOT EXISTS 'holerite_assinado';
