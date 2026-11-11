-- Documentos da obra passam a ser organizados em 3 pastas (empresa, projetos, funcionarios)
-- em vez de categorias. A coluna categoria é mantida (agora opcional) por compatibilidade.
ALTER TABLE public.documentos ADD COLUMN IF NOT EXISTS pasta text NOT NULL DEFAULT 'empresa';
UPDATE public.documentos SET pasta = CASE
  WHEN categoria = 'projeto_prancha' THEN 'projetos'
  WHEN categoria IN ('fgts','gps_darf','holerite_assinado') THEN 'funcionarios'
  ELSE 'empresa' END;
ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_pasta_check;
ALTER TABLE public.documentos ADD CONSTRAINT documentos_pasta_check CHECK (pasta IN ('empresa','projetos','funcionarios'));
ALTER TABLE public.documentos ALTER COLUMN categoria SET DEFAULT 'outros';
ALTER TABLE public.documentos ALTER COLUMN categoria DROP NOT NULL;
