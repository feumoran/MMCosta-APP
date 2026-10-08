-- Férias controladas por data limite; campos antigos preservados por compatibilidade.
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ferias_limite date;
COMMENT ON COLUMN public.funcionarios.ferias_inicio IS 'DEPRECATED: replaced by ferias_limite';
COMMENT ON COLUMN public.funcionarios.ferias_fim IS 'DEPRECATED: replaced by ferias_limite';