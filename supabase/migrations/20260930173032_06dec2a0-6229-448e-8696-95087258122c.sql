-- Adiciona hash do conteúdo do arquivo para detectar uploads duplicados
-- (mesmo conteúdo enviado de novo, mesmo com nome diferente).
ALTER TABLE public.boletins ADD COLUMN IF NOT EXISTS hash_arquivo text;
ALTER TABLE public.importacoes ADD COLUMN IF NOT EXISTS hash_arquivo text;
ALTER TABLE public.documentos ADD COLUMN IF NOT EXISTS hash_arquivo text;
ALTER TABLE public.funcionario_documentos ADD COLUMN IF NOT EXISTS hash_arquivo text;

CREATE INDEX IF NOT EXISTS boletins_hash_idx ON public.boletins(obra_id, hash_arquivo) WHERE hash_arquivo IS NOT NULL;
CREATE INDEX IF NOT EXISTS importacoes_hash_idx ON public.importacoes(tipo, hash_arquivo) WHERE hash_arquivo IS NOT NULL;
CREATE INDEX IF NOT EXISTS documentos_hash_idx ON public.documentos(obra_id, hash_arquivo) WHERE hash_arquivo IS NOT NULL;
CREATE INDEX IF NOT EXISTS funcionario_documentos_hash_idx ON public.funcionario_documentos(funcionario_id, hash_arquivo) WHERE hash_arquivo IS NOT NULL;