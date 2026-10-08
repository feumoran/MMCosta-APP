-- Férias do funcionário passam a ser controladas por uma data limite (substitui o período início/fim).
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ferias_limite date;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS ferias_inicio;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS ferias_fim;
