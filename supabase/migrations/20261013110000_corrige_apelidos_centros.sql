-- Corrige apelidos de centro de custo aprendidos de forma errada nos comprovantes.
-- "morro do sabao fbs" deve apontar para o centro Morro do Sabão (e não Canal Rochedale).
UPDATE public.cc_aliases a
SET centro_custo_id = c.id
FROM (
  SELECT id FROM public.centros_custo
  WHERE lower(nome) LIKE 'morro do sab%'
  ORDER BY ativo DESC, created_at
  LIMIT 1
) c
WHERE a.texto_normalizado = 'morro do sabao fbs';

-- "alojamento" não deve apontar automaticamente para Depósito/Manutenção.
DELETE FROM public.cc_aliases
WHERE texto_normalizado = 'alojamento'
  AND centro_custo_id IN (
    SELECT id FROM public.centros_custo WHERE lower(nome) LIKE '%dep%sito%' OR lower(nome) LIKE '%manuten%'
  );
