CREATE TYPE public.boletim_status AS ENUM ('pendente', 'lido_ia', 'confirmado');

CREATE TABLE public.boletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id),
  data date NOT NULL,
  status public.boletim_status NOT NULL DEFAULT 'pendente',
  arquivo_path text NOT NULL,
  arquivo_tipo text NOT NULL,
  equipamento_id uuid REFERENCES public.equipamentos(id),
  equipamento_texto text,
  equipe_id uuid REFERENCES public.equipes(id),
  equipe_texto text,
  horas_trabalhadas numeric(8,2),
  horas_paradas numeric(8,2),
  motivo_parada text,
  observacoes text,
  extracao_ia jsonb,
  confianca_ia jsonb,
  confirmado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletins TO authenticated;
GRANT ALL ON public.boletins TO service_role;
ALTER TABLE public.boletins ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletins_read ON public.boletins FOR SELECT TO authenticated USING (true);
CREATE POLICY boletins_insert ON public.boletins FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletins_update ON public.boletins FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletins_delete ON public.boletins FOR DELETE TO authenticated USING (public.can_manage());

CREATE TABLE public.boletim_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_id uuid NOT NULL REFERENCES public.boletins(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES public.servicos(id),
  descricao text NOT NULL,
  categoria_perfuracao public.categoria_perfuracao,
  quantidade numeric(14,3) NOT NULL CHECK (quantidade > 0),
  unidade text NOT NULL,
  confianca jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_itens TO authenticated;
GRANT ALL ON public.boletim_itens TO service_role;
ALTER TABLE public.boletim_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_itens_read ON public.boletim_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_itens_insert ON public.boletim_itens FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_itens_update ON public.boletim_itens FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_itens_delete ON public.boletim_itens FOR DELETE TO authenticated USING (public.can_manage());

CREATE INDEX boletins_obra_data_idx ON public.boletins(obra_id, data DESC);
CREATE INDEX boletim_itens_boletim_idx ON public.boletim_itens(boletim_id);
CREATE TRIGGER set_boletins_updated BEFORE UPDATE ON public.boletins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_boletim_itens_updated BEFORE UPDATE ON public.boletim_itens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.audit_boletins()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN
  INSERT INTO public.audit_log(user_id,tabela,registro_id,acao,dados_antes,dados_depois)
  VALUES(auth.uid(),TG_TABLE_NAME,COALESCE(NEW.id,OLD.id),TG_OP,
    CASE WHEN TG_OP IN('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_boletins() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_boletins() TO service_role;
CREATE TRIGGER audit_boletins AFTER INSERT OR UPDATE OR DELETE ON public.boletins FOR EACH ROW EXECUTE FUNCTION public.audit_boletins();

CREATE POLICY boletins_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'boletins');
CREATE POLICY boletins_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'boletins' AND public.can_field());
CREATE POLICY boletins_storage_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'boletins' AND public.can_field()) WITH CHECK (bucket_id = 'boletins' AND public.can_field());
CREATE POLICY boletins_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'boletins' AND public.can_manage());