-- Documentação do funcionário: "MRs" passa a "NRs" (mesmo valor, renomeado, preserva os
-- documentos já arquivados) e entra a categoria "Exame médico".
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'funcionario_documento_categoria' AND e.enumlabel = 'mr') THEN
    ALTER TYPE public.funcionario_documento_categoria RENAME VALUE 'mr' TO 'nr';
  END IF;
END $$;
ALTER TYPE public.funcionario_documento_categoria ADD VALUE IF NOT EXISTS 'exame_medico';

-- Férias do funcionário (período).
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ferias_inicio date;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ferias_fim date;
