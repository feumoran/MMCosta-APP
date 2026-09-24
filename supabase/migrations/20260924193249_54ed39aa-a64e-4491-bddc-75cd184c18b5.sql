CREATE TYPE public.funcionario_documento_categoria AS ENUM ('pessoal','contrato','mr','aso','outros');

CREATE TABLE public.funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  data_admissao date NOT NULL,
  data_desligamento date,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  CHECK (data_desligamento IS NULL OR data_desligamento >= data_admissao)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionarios TO authenticated;
GRANT ALL ON public.funcionarios TO service_role;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY funcionarios_read ON public.funcionarios FOR SELECT TO authenticated USING (public.can_field() OR public.has_role(auth.uid(),'leitura'));
CREATE POLICY funcionarios_insert ON public.funcionarios FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY funcionarios_update ON public.funcionarios FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY funcionarios_delete ON public.funcionarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.funcionario_remuneracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  vigencia_inicio date NOT NULL,
  vigencia_fim date,
  salario_mensal numeric(14,2) NOT NULL CHECK (salario_mensal > 0),
  inss_percentual numeric(7,4) NOT NULL DEFAULT 0 CHECK (inss_percentual BETWEEN 0 AND 100),
  fgts_percentual numeric(7,4) NOT NULL DEFAULT 0 CHECK (fgts_percentual BETWEEN 0 AND 100),
  ferias_percentual numeric(7,4) NOT NULL DEFAULT 0 CHECK (ferias_percentual BETWEEN 0 AND 100),
  decimo_terceiro_percentual numeric(7,4) NOT NULL DEFAULT 0 CHECK (decimo_terceiro_percentual BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionario_remuneracoes TO authenticated;
GRANT ALL ON public.funcionario_remuneracoes TO service_role;
ALTER TABLE public.funcionario_remuneracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY funcionario_remuneracoes_read ON public.funcionario_remuneracoes FOR SELECT TO authenticated USING (public.can_manage());
CREATE POLICY funcionario_remuneracoes_insert ON public.funcionario_remuneracoes FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY funcionario_remuneracoes_update ON public.funcionario_remuneracoes FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY funcionario_remuneracoes_delete ON public.funcionario_remuneracoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX funcionario_remuneracao_inicio_unico ON public.funcionario_remuneracoes(funcionario_id, vigencia_inicio);

CREATE TABLE public.funcionario_alocacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  obra_id uuid REFERENCES public.obras(id),
  centro_custo_id uuid REFERENCES public.centros_custo(id),
  data_inicio date NOT NULL,
  data_fim date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  CHECK ((obra_id IS NOT NULL AND centro_custo_id IS NULL) OR (obra_id IS NULL AND centro_custo_id IS NOT NULL)),
  CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionario_alocacoes TO authenticated;
GRANT ALL ON public.funcionario_alocacoes TO service_role;
ALTER TABLE public.funcionario_alocacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY funcionario_alocacoes_read ON public.funcionario_alocacoes FOR SELECT TO authenticated USING (public.can_field() OR public.has_role(auth.uid(),'leitura'));
CREATE POLICY funcionario_alocacoes_insert ON public.funcionario_alocacoes FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY funcionario_alocacoes_update ON public.funcionario_alocacoes FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY funcionario_alocacoes_delete ON public.funcionario_alocacoes FOR DELETE TO authenticated USING (public.can_manage());
CREATE INDEX funcionario_alocacoes_periodo_idx ON public.funcionario_alocacoes(funcionario_id, data_inicio, data_fim);

CREATE TABLE public.funcionario_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  categoria public.funcionario_documento_categoria NOT NULL,
  arquivo_path text NOT NULL UNIQUE,
  arquivo_nome text NOT NULL,
  arquivo_tipo text NOT NULL,
  tamanho_bytes bigint NOT NULL CHECK (tamanho_bytes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionario_documentos TO authenticated;
GRANT ALL ON public.funcionario_documentos TO service_role;
ALTER TABLE public.funcionario_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY funcionario_documentos_read ON public.funcionario_documentos FOR SELECT TO authenticated USING (public.can_manage());
CREATE POLICY funcionario_documentos_insert ON public.funcionario_documentos FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY funcionario_documentos_update ON public.funcionario_documentos FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY funcionario_documentos_delete ON public.funcionario_documentos FOR DELETE TO authenticated USING (public.can_manage());

CREATE TABLE public.funcionario_custos_diarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL REFERENCES public.funcionarios(id),
  remuneracao_id uuid NOT NULL REFERENCES public.funcionario_remuneracoes(id),
  alocacao_id uuid REFERENCES public.funcionario_alocacoes(id),
  centro_custo_id uuid NOT NULL REFERENCES public.centros_custo(id),
  obra_id uuid REFERENCES public.obras(id),
  data date NOT NULL,
  dias_uteis_mes integer NOT NULL CHECK (dias_uteis_mes BETWEEN 1 AND 31),
  custo_mensal numeric(14,2) NOT NULL CHECK (custo_mensal > 0),
  valor_diaria numeric(14,2) NOT NULL CHECK (valor_diaria > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (funcionario_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionario_custos_diarios TO authenticated;
GRANT ALL ON public.funcionario_custos_diarios TO service_role;
ALTER TABLE public.funcionario_custos_diarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY funcionario_custos_read ON public.funcionario_custos_diarios FOR SELECT TO authenticated USING (public.can_manage());
CREATE POLICY funcionario_custos_insert ON public.funcionario_custos_diarios FOR INSERT TO authenticated WITH CHECK (public.can_manage());
CREATE POLICY funcionario_custos_update ON public.funcionario_custos_diarios FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY funcionario_custos_delete ON public.funcionario_custos_diarios FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX funcionario_custos_centro_data_idx ON public.funcionario_custos_diarios(centro_custo_id, data DESC);

CREATE TRIGGER set_funcionarios_updated BEFORE UPDATE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_funcionario_remuneracoes_updated BEFORE UPDATE ON public.funcionario_remuneracoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_funcionario_alocacoes_updated BEFORE UPDATE ON public.funcionario_alocacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_funcionario_documentos_updated BEFORE UPDATE ON public.funcionario_documentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_funcionario_custos_updated BEFORE UPDATE ON public.funcionario_custos_diarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.audit_funcionarios() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.audit_log(user_id,tabela,registro_id,acao,dados_antes,dados_depois)
  VALUES(auth.uid(),TG_TABLE_NAME,COALESCE(NEW.id,OLD.id),TG_OP,
    CASE WHEN TG_OP IN('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_funcionarios() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_funcionarios() TO service_role;
CREATE TRIGGER audit_funcionarios AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios FOR EACH ROW EXECUTE FUNCTION public.audit_funcionarios();
CREATE TRIGGER audit_funcionario_remuneracoes AFTER INSERT OR UPDATE OR DELETE ON public.funcionario_remuneracoes FOR EACH ROW EXECUTE FUNCTION public.audit_funcionarios();
CREATE TRIGGER audit_funcionario_alocacoes AFTER INSERT OR UPDATE OR DELETE ON public.funcionario_alocacoes FOR EACH ROW EXECUTE FUNCTION public.audit_funcionarios();
CREATE TRIGGER audit_funcionario_documentos AFTER INSERT OR UPDATE OR DELETE ON public.funcionario_documentos FOR EACH ROW EXECUTE FUNCTION public.audit_funcionarios();

CREATE OR REPLACE FUNCTION public.dias_uteis_no_mes(_data date) RETURNS integer
LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT count(*)::integer
  FROM generate_series(date_trunc('month', _data)::date, (date_trunc('month', _data) + interval '1 month - 1 day')::date, interval '1 day') dia
  WHERE extract(isodow FROM dia) BETWEEN 1 AND 5
$$;
REVOKE ALL ON FUNCTION public.dias_uteis_no_mes(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dias_uteis_no_mes(date) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.gerar_custos_funcionarios(_data_inicio date DEFAULT CURRENT_DATE, _data_fim date DEFAULT CURRENT_DATE)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _inseridos integer;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.can_manage() THEN
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

CREATE POLICY funcionarios_documentos_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='funcionarios-documentos' AND public.can_manage());
CREATE POLICY funcionarios_documentos_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='funcionarios-documentos' AND public.can_manage() AND (storage.foldername(name))[1] IS NOT NULL);
CREATE POLICY funcionarios_documentos_storage_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='funcionarios-documentos' AND public.can_manage()) WITH CHECK (bucket_id='funcionarios-documentos' AND public.can_manage());
CREATE POLICY funcionarios_documentos_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='funcionarios-documentos' AND public.can_manage());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name='pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='gerar-custos-funcionarios-diarios') THEN
      PERFORM cron.schedule('gerar-custos-funcionarios-diarios','10 0 * * *','SELECT public.gerar_custos_funcionarios(CURRENT_DATE,CURRENT_DATE)');
    END IF;
  END IF;
END $$;