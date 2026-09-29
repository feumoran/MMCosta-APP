-- A diária gerada em funcionario_custos_diarios não incluía o bônus (só salário +
-- encargos), diferente do que a tela de Funcionários já mostrava. Corrige a função
-- e recalcula os registros já gerados.

CREATE OR REPLACE FUNCTION public.gerar_custos_funcionarios(_data_inicio date DEFAULT CURRENT_DATE, _data_fim date DEFAULT CURRENT_DATE)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _inseridos integer;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT (public.can_manage() OR public.has_role(auth.uid(),'engenharia')) THEN
    RAISE EXCEPTION 'Sem permissão para gerar custos de funcionários';
  END IF;
  IF _data_fim < _data_inicio OR _data_fim > CURRENT_DATE THEN
    RAISE EXCEPTION 'Período inválido para geração de custos';
  END IF;
  IF (_data_fim - _data_inicio) > 366 THEN
    RAISE EXCEPTION 'O período máximo por geração é de 367 dias';
  END IF;

  INSERT INTO public.funcionario_custos_diarios(
    funcionario_id, remuneracao_id, alocacao_id, centro_custo_id, obra_id,
    data, dias_uteis_mes, custo_mensal, valor_diaria, created_by
  )
  SELECT
    f.id,
    r.id,
    a.id,
    COALESCE(cc_obra.id, a.centro_custo_id),
    a.obra_id,
    dia::date,
    public.dias_uteis_no_mes(dia::date),
    round((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0) + r.bonus_mensal)::numeric, 2),
    round(((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0) + r.bonus_mensal) / public.dias_uteis_no_mes(dia::date))::numeric, 2),
    auth.uid()
  FROM generate_series(_data_inicio, _data_fim, interval '1 day') dia
  JOIN public.funcionarios f ON f.ativo AND f.data_admissao < dia::date AND (f.data_desligamento IS NULL OR f.data_desligamento >= dia::date)
  JOIN LATERAL (
    SELECT rr.* FROM public.funcionario_remuneracoes rr
    WHERE rr.funcionario_id=f.id AND rr.vigencia_inicio<=dia::date AND (rr.vigencia_fim IS NULL OR rr.vigencia_fim>=dia::date)
    ORDER BY rr.vigencia_inicio DESC LIMIT 1
  ) r ON true
  LEFT JOIN LATERAL (
    SELECT aa.* FROM public.funcionario_alocacoes aa
    WHERE aa.funcionario_id=f.id AND aa.data_inicio<dia::date AND (aa.data_fim IS NULL OR aa.data_fim>=dia::date)
    ORDER BY aa.data_inicio DESC, aa.created_at DESC LIMIT 1
  ) a ON true
  LEFT JOIN public.centros_custo cc_obra ON cc_obra.obra_id=a.obra_id
  WHERE COALESCE(cc_obra.id, a.centro_custo_id) IS NOT NULL
  ON CONFLICT (funcionario_id,data) DO NOTHING;
  GET DIAGNOSTICS _inseridos = ROW_COUNT;
  RETURN _inseridos;
END $$;
REVOKE ALL ON FUNCTION public.gerar_custos_funcionarios(date,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gerar_custos_funcionarios(date,date) TO authenticated, service_role;

-- Recalcula os registros já existentes, usando a remuneração vigente em cada um.
UPDATE public.funcionario_custos_diarios fc
SET
  custo_mensal = round((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0) + r.bonus_mensal)::numeric, 2),
  valor_diaria = round(((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0) + r.bonus_mensal) / GREATEST(fc.dias_uteis_mes,1))::numeric, 2),
  updated_at = now()
FROM public.funcionario_remuneracoes r
WHERE fc.remuneracao_id = r.id;
