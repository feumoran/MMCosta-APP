-- Permite origem 'comprovante' em compras: ao distribuir um comprovante (caixa),
-- cria uma conta a pagar consolidada representando o reembolso devido ao
-- funcionário, sem mexer nos lançamentos por centro de custo já gerados
-- (esses continuam item a item, cada um no centro certo).
ALTER TABLE public.compras DROP CONSTRAINT IF EXISTS compras_origem_check;
ALTER TABLE public.compras ADD CONSTRAINT compras_origem_check CHECK (origem IN ('manual','dda','comprovante'));
