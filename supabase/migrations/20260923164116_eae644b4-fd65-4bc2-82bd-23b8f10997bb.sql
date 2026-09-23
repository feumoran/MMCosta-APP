DO $$ BEGIN
  CREATE TYPE public.medicao_origem AS ENUM ('boletins','planilha_importada','manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.medicao_status AS ENUM ('rascunho','emitida','aprovada_cliente','recebida','cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.importacao_tipo AS ENUM ('medicao','comprovantes');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.importacao_status AS ENUM ('processando','concluida','parcial','descartada','erro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.documento_categoria AS ENUM ('contrato','projeto_prancha','art_rrt','laudo_tecnico','nota_fiscal','outros');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.importacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.importacao_tipo NOT NULL,
  arquivo_path text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tipo text NOT NULL,
  status public.importacao_status NOT NULL DEFAULT 'processando',
  linhas_total integer NOT NULL DEFAULT 0 CHECK (linhas_total >= 0),
  valor_total numeric(14,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  entidades_envolvidas jsonb NOT NULL DEFAULT '[]'::jsonb,
  resumo jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.importacoes TO authenticated;
GRANT ALL ON public.importacoes TO service_role;
ALTER TABLE public.importacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "importacoes_read" ON public.importacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "importacoes_insert" ON public.importacoes FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY "importacoes_update" ON public.importacoes FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY "importacoes_delete" ON public.importacoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_importacoes_updated BEFORE UPDATE ON public.importacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.medicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id),
  numero integer NOT NULL CHECK (numero > 0),
  data_inicio date,
  data_fim date,
  origem public.medicao_origem NOT NULL,
  status public.medicao_status NOT NULL DEFAULT 'rascunho',
  valor_total numeric(14,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  acumulado_anterior numeric(14,2) NOT NULL DEFAULT 0 CHECK (acumulado_anterior >= 0),
  importacao_id uuid REFERENCES public.importacoes(id),
  recebida_em date,
  valor_recebido numeric(14,2) CHECK (valor_recebido IS NULL OR valor_recebido >= 0),
  observacoes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  UNIQUE (obra_id, numero),
  CHECK (data_inicio IS NULL OR data_fim IS NULL OR data_fim >= data_inicio)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicoes TO authenticated;
GRANT ALL ON public.medicoes TO service_role;
ALTER TABLE public.medicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicoes_read" ON public.medicoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "medicoes_insert" ON public.medicoes FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY "medicoes_update" ON public.medicoes FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY "medicoes_delete" ON public.medicoes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_medicoes_updated BEFORE UPDATE ON public.medicoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.medicao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicao_id uuid NOT NULL REFERENCES public.medicoes(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.servicos(id),
  descricao text NOT NULL,
  categoria_perfuracao public.categoria_perfuracao,
  quantidade numeric(14,3) NOT NULL CHECK (quantidade > 0),
  unidade text NOT NULL,
  preco_encontrado numeric(14,4) NOT NULL CHECK (preco_encontrado >= 0),
  valor_total numeric(14,2) NOT NULL CHECK (valor_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicao_itens TO authenticated;
GRANT ALL ON public.medicao_itens TO service_role;
ALTER TABLE public.medicao_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicao_itens_read" ON public.medicao_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "medicao_itens_insert" ON public.medicao_itens FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY "medicao_itens_update" ON public.medicao_itens FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY "medicao_itens_delete" ON public.medicao_itens FOR DELETE TO authenticated USING (public.can_manage());
CREATE TRIGGER set_medicao_itens_updated BEFORE UPDATE ON public.medicao_itens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.medicao_boletins (
  medicao_id uuid NOT NULL REFERENCES public.medicoes(id) ON DELETE CASCADE,
  boletim_id uuid NOT NULL REFERENCES public.boletins(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  PRIMARY KEY (medicao_id, boletim_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicao_boletins TO authenticated;
GRANT ALL ON public.medicao_boletins TO service_role;
ALTER TABLE public.medicao_boletins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicao_boletins_read" ON public.medicao_boletins FOR SELECT TO authenticated USING (true);
CREATE POLICY "medicao_boletins_insert" ON public.medicao_boletins FOR INSERT TO authenticated WITH CHECK (public.can_manage() AND created_by = auth.uid());
CREATE POLICY "medicao_boletins_update" ON public.medicao_boletins FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY "medicao_boletins_delete" ON public.medicao_boletins FOR DELETE TO authenticated USING (public.can_manage());
CREATE UNIQUE INDEX medicao_boletim_ativo_unico ON public.medicao_boletins(boletim_id);

CREATE TABLE public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id),
  categoria public.documento_categoria NOT NULL,
  arquivo_path text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tipo text NOT NULL,
  tamanho_bytes bigint NOT NULL CHECK (tamanho_bytes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documentos_read" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "documentos_insert" ON public.documentos FOR INSERT TO authenticated WITH CHECK (public.can_field() AND created_by = auth.uid());
CREATE POLICY "documentos_update" ON public.documentos FOR UPDATE TO authenticated USING (public.can_manage()) WITH CHECK (public.can_manage());
CREATE POLICY "documentos_delete" ON public.documentos FOR DELETE TO authenticated USING (public.can_manage());
CREATE TRIGGER set_documentos_updated BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.audit_medicoes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN INSERT INTO public.audit_log(user_id,tabela,registro_id,acao,dados_antes,dados_depois)
VALUES(auth.uid(),'medicoes',COALESCE(NEW.id,OLD.id),TG_OP,CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END); RETURN COALESCE(NEW,OLD); END $$;
REVOKE ALL ON FUNCTION public.audit_medicoes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_medicoes() TO service_role;
CREATE TRIGGER audit_medicoes AFTER INSERT OR UPDATE OR DELETE ON public.medicoes FOR EACH ROW EXECUTE FUNCTION public.audit_medicoes();

CREATE OR REPLACE FUNCTION public.proximo_numero_medicao(_obra uuid) RETURNS integer LANGUAGE sql SECURITY INVOKER STABLE SET search_path=public AS $$
  SELECT COALESCE(MAX(numero),0)+1 FROM public.medicoes WHERE obra_id=_obra
$$;
REVOKE ALL ON FUNCTION public.proximo_numero_medicao(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.proximo_numero_medicao(uuid) TO authenticated, service_role;

CREATE POLICY "importacoes_storage_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='importacoes');
CREATE POLICY "importacoes_storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='importacoes' AND public.can_manage());
CREATE POLICY "importacoes_storage_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='importacoes' AND public.can_manage()) WITH CHECK (bucket_id='importacoes' AND public.can_manage());
CREATE POLICY "importacoes_storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='importacoes' AND public.can_manage());
CREATE POLICY "comprovantes_storage_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='comprovantes' AND public.can_manage());
CREATE POLICY "comprovantes_storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='comprovantes' AND public.can_manage());
CREATE POLICY "comprovantes_storage_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='comprovantes' AND public.can_manage()) WITH CHECK (bucket_id='comprovantes' AND public.can_manage());
CREATE POLICY "comprovantes_storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='comprovantes' AND public.can_manage());
CREATE POLICY "documentos_storage_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='documentos');
CREATE POLICY "documentos_storage_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='documentos' AND public.can_field());
CREATE POLICY "documentos_storage_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='documentos' AND public.can_manage());

WITH seed(numero,valor,lancamento_id,recebida_em) AS (VALUES
 (3,227240.00::numeric,'d4650010-7837-4214-970c-1339c2639cd1'::uuid,'2026-06-24'::date),
 (4,339720.90::numeric,'dc8acaf2-c80e-4a08-aa71-8f609c7be3e3'::uuid,'2026-07-28'::date),
 (5,328713.73::numeric,'60b6fab6-4352-4824-8f4a-1cc4c4bdc58c'::uuid,'2026-08-21'::date)
), inserted AS (
 INSERT INTO public.medicoes(obra_id,numero,origem,status,valor_total,recebida_em,valor_recebido,observacoes)
 SELECT '20000000-0000-0000-0000-000000000001'::uuid,numero,'manual','recebida',valor,recebida_em,valor,'Medição real anterior — itens serão detalhados em etapa posterior.' FROM seed
 ON CONFLICT (obra_id,numero) DO UPDATE SET status='recebida',valor_total=EXCLUDED.valor_total,recebida_em=EXCLUDED.recebida_em,valor_recebido=EXCLUDED.valor_recebido
 RETURNING id,numero
)
UPDATE public.lancamentos l SET medicao_id=i.id FROM inserted i, seed s WHERE s.numero=i.numero AND l.id=s.lancamento_id;
