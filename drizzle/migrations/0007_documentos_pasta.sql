ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS pasta text NOT NULL DEFAULT 'empresa';

ALTER TABLE public.documentos
  DROP CONSTRAINT IF EXISTS documentos_pasta_check;

ALTER TABLE public.documentos
  ADD CONSTRAINT documentos_pasta_check
  CHECK (pasta IN ('empresa', 'projetos', 'funcionarios'));