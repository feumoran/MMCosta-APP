-- Ajusta permissões: RH (papel "engenharia") passa a gerenciar funcionários por completo
-- (inclusive salário/bônus) e a operar Comprovantes como o escritório; o escritório
-- deixa de poder editar salário/bônus (mantém leitura e o restante do cadastro).

-- Funcionários (cadastro base) — inclui RH.
DROP POLICY IF EXISTS funcionarios_insert ON public.funcionarios;
CREATE POLICY funcionarios_insert ON public.funcionarios FOR INSERT TO authenticated
  WITH CHECK ((public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid());
DROP POLICY IF EXISTS funcionarios_update ON public.funcionarios;
CREATE POLICY funcionarios_update ON public.funcionarios FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Remuneração — só admin e RH (escritório perde o acesso de escrita; leitura muda também).
DROP POLICY IF EXISTS funcionario_remuneracoes_read ON public.funcionario_remuneracoes;
CREATE POLICY funcionario_remuneracoes_read ON public.funcionario_remuneracoes FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_remuneracoes_insert ON public.funcionario_remuneracoes;
CREATE POLICY funcionario_remuneracoes_insert ON public.funcionario_remuneracoes FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid());
DROP POLICY IF EXISTS funcionario_remuneracoes_update ON public.funcionario_remuneracoes;
CREATE POLICY funcionario_remuneracoes_update ON public.funcionario_remuneracoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'engenharia'));

-- Alocação de funcionários — inclui RH.
DROP POLICY IF EXISTS funcionario_alocacoes_insert ON public.funcionario_alocacoes;
CREATE POLICY funcionario_alocacoes_insert ON public.funcionario_alocacoes FOR INSERT TO authenticated
  WITH CHECK ((public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid());
DROP POLICY IF EXISTS funcionario_alocacoes_update ON public.funcionario_alocacoes;
CREATE POLICY funcionario_alocacoes_update ON public.funcionario_alocacoes FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_alocacoes_delete ON public.funcionario_alocacoes;
CREATE POLICY funcionario_alocacoes_delete ON public.funcionario_alocacoes FOR DELETE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Documentos de funcionários — inclui RH (leitura e escrita).
DROP POLICY IF EXISTS funcionario_documentos_read ON public.funcionario_documentos;
CREATE POLICY funcionario_documentos_read ON public.funcionario_documentos FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_documentos_insert ON public.funcionario_documentos;
CREATE POLICY funcionario_documentos_insert ON public.funcionario_documentos FOR INSERT TO authenticated
  WITH CHECK ((public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid());
DROP POLICY IF EXISTS funcionario_documentos_update ON public.funcionario_documentos;
CREATE POLICY funcionario_documentos_update ON public.funcionario_documentos FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_documentos_delete ON public.funcionario_documentos;
CREATE POLICY funcionario_documentos_delete ON public.funcionario_documentos FOR DELETE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Custos diários gerados automaticamente — leitura/escrita para RH também.
DROP POLICY IF EXISTS funcionario_custos_read ON public.funcionario_custos_diarios;
CREATE POLICY funcionario_custos_read ON public.funcionario_custos_diarios FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_custos_insert ON public.funcionario_custos_diarios;
CREATE POLICY funcionario_custos_insert ON public.funcionario_custos_diarios FOR INSERT TO authenticated
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS funcionario_custos_update ON public.funcionario_custos_diarios;
CREATE POLICY funcionario_custos_update ON public.funcionario_custos_diarios FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Função que recalcula custos diários — libera para RH também (mesma lógica original, só muda a permissão).
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
    COALESCE(cc_obra.id, a.centro_custo_id, deposito.id),
    a.obra_id,
    dia::date,
    public.dias_uteis_no_mes(dia::date),
    round((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0))::numeric, 2),
    round((r.salario_mensal * (1 + (r.inss_percentual + r.fgts_percentual + r.ferias_percentual + r.decimo_terceiro_percentual) / 100.0) / public.dias_uteis_no_mes(dia::date))::numeric, 2),
    auth.uid()
  FROM generate_series(_data_inicio, _data_fim, interval '1 day') dia
  JOIN public.funcionarios f ON f.ativo AND f.data_admissao <= dia::date AND (f.data_desligamento IS NULL OR f.data_desligamento >= dia::date)
  JOIN LATERAL (
    SELECT rr.* FROM public.funcionario_remuneracoes rr
    WHERE rr.funcionario_id=f.id AND rr.vigencia_inicio<=dia::date AND (rr.vigencia_fim IS NULL OR rr.vigencia_fim>=dia::date)
    ORDER BY rr.vigencia_inicio DESC LIMIT 1
  ) r ON true
  LEFT JOIN LATERAL (
    SELECT aa.* FROM public.funcionario_alocacoes aa
    WHERE aa.funcionario_id=f.id AND aa.data_inicio<=dia::date AND (aa.data_fim IS NULL OR aa.data_fim>=dia::date)
    ORDER BY aa.data_inicio DESC, aa.created_at DESC LIMIT 1
  ) a ON true
  LEFT JOIN public.centros_custo cc_obra ON cc_obra.obra_id=a.obra_id
  JOIN LATERAL (
    SELECT cc.id FROM public.centros_custo cc
    WHERE cc.tipo='administrativo' AND cc.ativo AND (lower(cc.nome) LIKE 'depósito%' OR lower(cc.nome) LIKE 'deposito%')
    ORDER BY CASE WHEN cc.nome='Depósito/Manutenção' THEN 0 ELSE 1 END, cc.created_at
    LIMIT 1
  ) deposito ON true
  WHERE COALESCE(cc_obra.id, a.centro_custo_id, deposito.id) IS NOT NULL
  ON CONFLICT (funcionario_id,data) DO NOTHING;
  GET DIAGNOSTICS _inseridos = ROW_COUNT;
  RETURN _inseridos;
END $$;
REVOKE ALL ON FUNCTION public.gerar_custos_funcionarios(date,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gerar_custos_funcionarios(date,date) TO authenticated, service_role;

-- Documentos de funcionários (storage) — inclui RH.
DROP POLICY IF EXISTS funcionarios_documentos_storage_read ON storage.objects;
CREATE POLICY funcionarios_documentos_storage_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='funcionarios-documentos' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
DROP POLICY IF EXISTS funcionarios_documentos_storage_insert ON storage.objects;
CREATE POLICY funcionarios_documentos_storage_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='funcionarios-documentos' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND (storage.foldername(name))[1] IS NOT NULL);
DROP POLICY IF EXISTS funcionarios_documentos_storage_update ON storage.objects;
CREATE POLICY funcionarios_documentos_storage_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='funcionarios-documentos' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')))
  WITH CHECK (bucket_id='funcionarios-documentos' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
DROP POLICY IF EXISTS funcionarios_documentos_storage_delete ON storage.objects;
CREATE POLICY funcionarios_documentos_storage_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='funcionarios-documentos' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));

-- Comprovantes: RH passa a operar a tela inteira, como o escritório.
DROP POLICY IF EXISTS "comprovantes_storage_read" ON storage.objects;
CREATE POLICY "comprovantes_storage_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='comprovantes' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
DROP POLICY IF EXISTS "comprovantes_storage_insert" ON storage.objects;
CREATE POLICY "comprovantes_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='comprovantes' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
DROP POLICY IF EXISTS "comprovantes_storage_update" ON storage.objects;
CREATE POLICY "comprovantes_storage_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='comprovantes' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')))
  WITH CHECK (bucket_id='comprovantes' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
DROP POLICY IF EXISTS "comprovantes_storage_delete" ON storage.objects;
CREATE POLICY "comprovantes_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='comprovantes' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));

-- Importações (medição e comprovantes) — leitura e escrita também para RH.
DROP POLICY IF EXISTS "importacoes_read" ON public.importacoes;
CREATE POLICY "importacoes_read" ON public.importacoes FOR SELECT TO authenticated
  USING (tipo = 'medicao' OR public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS "importacoes_insert" ON public.importacoes;
CREATE POLICY "importacoes_insert" ON public.importacoes FOR INSERT TO authenticated
  WITH CHECK ((public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid());
DROP POLICY IF EXISTS "importacoes_update" ON public.importacoes;
CREATE POLICY "importacoes_update" ON public.importacoes FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Apelidos de centro de custo aprendidos ao corrigir comprovantes — RH também grava.
DROP POLICY IF EXISTS alias_insert ON public.cc_aliases;
CREATE POLICY alias_insert ON public.cc_aliases FOR INSERT TO authenticated
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
DROP POLICY IF EXISTS alias_update ON public.cc_aliases;
CREATE POLICY alias_update ON public.cc_aliases FOR UPDATE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));

-- Lançamentos: RH pode ler e criar (necessário para distribuir comprovantes).
-- Aviso: isso também libera o formulário de fluxo de caixa da obra para RH, que não distingue origem.
DROP POLICY IF EXISTS lancamentos_read ON public.lancamentos;
CREATE POLICY lancamentos_read ON public.lancamentos FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia') OR public.has_role(auth.uid(),'leitura'));
DROP POLICY IF EXISTS lancamentos_insert ON public.lancamentos;
CREATE POLICY lancamentos_insert ON public.lancamentos FOR INSERT TO authenticated
  WITH CHECK (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));