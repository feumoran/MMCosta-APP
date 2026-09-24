ALTER TABLE public.funcionarios
ADD COLUMN cargo text NOT NULL DEFAULT 'Não informado';

ALTER TABLE public.funcionarios
ADD CONSTRAINT funcionarios_cargo_preenchido CHECK (length(btrim(cargo)) > 0);