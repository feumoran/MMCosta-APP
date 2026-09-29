-- Apaga todos os lançamentos (fluxo de caixa) do centro administrativo "Depósito/Manutenção".
-- Não mexe no centro de custo em si, nem em lançamentos de outros centros/obras.
DELETE FROM public.lancamentos
WHERE centro_custo_id IN (
  SELECT id FROM public.centros_custo WHERE tipo = 'administrativo' AND nome = 'Depósito/Manutenção'
);
