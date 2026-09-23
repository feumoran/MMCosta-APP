CREATE TYPE public.tipo_medicao_servico AS ENUM ('periodica', 'etapa_fechada');
CREATE TYPE public.categoria_perfuracao AS ENUM ('solo', 'rocha_alterada', 'rocha');

CREATE TABLE public.servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  unidade text NOT NULL,
  eh_perfuracao boolean NOT NULL DEFAULT false,
  tipo_medicao public.tipo_medicao_servico NOT NULL DEFAULT 'periodica',
  palavras_chave text[] NOT NULL DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos TO authenticated;
GRANT ALL ON public.servicos TO service_role;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY servicos_read ON public.servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY servicos_insert ON public.servicos FOR INSERT TO authenticated WITH CHECK (public.can_manage());
CREATE POLICY servicos_update ON public.servicos FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY servicos_delete ON public.servicos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.precos_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id uuid NOT NULL REFERENCES public.servicos(id),
  obra_id uuid REFERENCES public.obras(id),
  categoria public.categoria_perfuracao,
  preco numeric(14,2) NOT NULL CHECK (preco >= 0),
  vigencia_inicio date NOT NULL,
  vigencia_fim date,
  eh_exemplo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.precos_servico TO authenticated;
GRANT ALL ON public.precos_servico TO service_role;
ALTER TABLE public.precos_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY precos_read ON public.precos_servico FOR SELECT TO authenticated USING (true);
CREATE POLICY precos_insert ON public.precos_servico FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY precos_update ON public.precos_servico FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY precos_delete ON public.precos_servico FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX precos_servico_busca_idx ON public.precos_servico(servico_id, obra_id, categoria, vigencia_inicio, vigencia_fim);
CREATE TRIGGER set_servicos_updated BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_precos_servico_updated BEFORE UPDATE ON public.precos_servico FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.buscar_preco(_servico uuid, _obra uuid, _categoria public.categoria_perfuracao, _data date)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _perfuracao boolean; _preco numeric;
BEGIN
  SELECT eh_perfuracao INTO _perfuracao FROM public.servicos WHERE id = _servico AND ativo;
  IF _perfuracao IS NULL THEN RETURN NULL; END IF;
  IF _perfuracao AND _categoria IS NULL THEN RAISE EXCEPTION 'Categoria é obrigatória para serviço de perfuração'; END IF;
  SELECT p.preco INTO _preco FROM public.precos_servico p
  WHERE p.servico_id = _servico
    AND (NOT _perfuracao OR p.categoria = _categoria)
    AND p.vigencia_inicio <= _data AND (p.vigencia_fim IS NULL OR p.vigencia_fim >= _data)
    AND (p.obra_id = _obra OR p.obra_id IS NULL)
  ORDER BY (p.obra_id = _obra) DESC, p.vigencia_inicio DESC, p.created_at DESC LIMIT 1;
  RETURN _preco;
END $$;
REVOKE ALL ON FUNCTION public.buscar_preco(uuid,uuid,public.categoria_perfuracao,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buscar_preco(uuid,uuid,public.categoria_perfuracao,date) TO authenticated;

CREATE OR REPLACE FUNCTION public.audit_precos_servico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN
  INSERT INTO public.audit_log(user_id,tabela,registro_id,acao,dados_antes,dados_depois)
  VALUES(auth.uid(),'precos_servico',COALESCE(NEW.id,OLD.id),TG_OP,
    CASE WHEN TG_OP IN('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_precos_servico() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_precos_servico() TO service_role;
CREATE TRIGGER audit_precos_servico AFTER INSERT OR UPDATE OR DELETE ON public.precos_servico FOR EACH ROW EXECUTE FUNCTION public.audit_precos_servico();

INSERT INTO public.servicos (id,nome,unidade,eh_perfuracao,tipo_medicao,palavras_chave) VALUES
('60000000-0000-0000-0000-000000000001','Perfuração','m',true,'periodica',ARRAY['perfuração','metro perfurado','solo','rocha']),
('60000000-0000-0000-0000-000000000002','Calda de cimento','L',false,'periodica',ARRAY['calda','cimento']),
('60000000-0000-0000-0000-000000000003','Aço','kg',false,'periodica',ARRAY['aço','armadura']),
('60000000-0000-0000-0000-000000000004','Argamassa','sc',false,'periodica',ARRAY['argamassa','saco']),
('60000000-0000-0000-0000-000000000005','Concreto','m³',false,'periodica',ARRAY['concreto']);

INSERT INTO public.precos_servico (servico_id,categoria,preco,vigencia_inicio,eh_exemplo) VALUES
('60000000-0000-0000-0000-000000000001','solo',140.00,'2026-01-01',true),
('60000000-0000-0000-0000-000000000001','rocha_alterada',210.00,'2026-01-01',true),
('60000000-0000-0000-0000-000000000001','rocha',290.00,'2026-01-01',true),
('60000000-0000-0000-0000-000000000002',NULL,1.35,'2026-01-01',true),
('60000000-0000-0000-0000-000000000003',NULL,22.00,'2026-01-01',true),
('60000000-0000-0000-0000-000000000004',NULL,38.00,'2026-01-01',true),
('60000000-0000-0000-0000-000000000005',NULL,980.00,'2026-01-01',true);