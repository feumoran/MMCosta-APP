-- Funcionário sem alocação não gera custo de diária. A função gerar_custos_funcionarios
-- já exige alocação, mas registros gerados antes dessa regra (ex.: direcionados
-- automaticamente ao Depósito) continuavam aparecendo nos centros de custo.
-- Remove os custos diários que não têm alocação ativa (obra ou centro) na própria data.
DELETE FROM public.funcionario_custos_diarios fc
WHERE NOT EXISTS (
  SELECT 1
  FROM public.funcionario_alocacoes a
  WHERE a.funcionario_id = fc.funcionario_id
    AND a.data_inicio < fc.data
    AND (a.data_fim IS NULL OR a.data_fim >= fc.data)
    AND (a.centro_custo_id IS NOT NULL OR EXISTS (SELECT 1 FROM public.centros_custo cc WHERE cc.obra_id = a.obra_id))
);
