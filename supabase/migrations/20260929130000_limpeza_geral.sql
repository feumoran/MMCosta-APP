-- Limpeza geral solicitada: zera Funcionários, Fluxo de caixa (lançamentos e apelidos de
-- centro de custo), Boletins e Medições — em TODAS as obras. Não mexe em Obras, Clientes,
-- Centros de custo (a estrutura em si), Comprovantes/Importações de comprovantes,
-- Documentos nem Usuários. Ação destrutiva e sem confirmação adicional: foi pedida
-- explicitamente pelo usuário ("zerar geral").

-- Boletins e suas sub-tabelas (3 formulários) -------------------------------
DELETE FROM public.medicao_boletins;
DELETE FROM public.boletim_itens;
DELETE FROM public.boletim_tirante_fase;
DELETE FROM public.boletim_estaca_trecho;
DELETE FROM public.boletim_concreto_item;
DELETE FROM public.boletim_tirante;
DELETE FROM public.boletim_estaca;
DELETE FROM public.boletins;

-- Medições -------------------------------------------------------------------
DELETE FROM public.medicao_itens;
DELETE FROM public.medicoes;
DELETE FROM public.importacoes WHERE tipo = 'medicao';

-- Funcionários e tudo ligado a eles -------------------------------------------
DELETE FROM public.funcionario_custos_diarios;
DELETE FROM public.funcionario_documentos;
DELETE FROM public.funcionario_alocacoes;
DELETE FROM public.funcionario_remuneracoes;
DELETE FROM public.funcionarios;

-- Fluxo de caixa / centros de custo (mantém os centros, limpa o histórico) ---
DELETE FROM public.lancamentos;
DELETE FROM public.cc_aliases;
