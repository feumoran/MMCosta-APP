ALTER TABLE public.funcionarios ALTER COLUMN cargo DROP DEFAULT;
ALTER TABLE public.funcionario_remuneracoes ALTER COLUMN inss_percentual SET DEFAULT 12;
ALTER TABLE public.funcionario_remuneracoes ALTER COLUMN fgts_percentual SET DEFAULT 8;
ALTER TABLE public.funcionario_remuneracoes ALTER COLUMN ferias_percentual SET DEFAULT 11.11;
ALTER TABLE public.funcionario_remuneracoes ALTER COLUMN decimo_terceiro_percentual SET DEFAULT 8.33;