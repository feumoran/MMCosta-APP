-- Aba Financeiro: compras a pagar (com aprovação), pagamento e importação de DDA.

CREATE TYPE public.compra_status AS ENUM ('pendente','aprovada','rejeitada','paga','cancelada');
ALTER TYPE public.importacao_tipo ADD VALUE IF NOT EXISTS 'dda';

CREATE TABLE public.compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor text NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL REFERENCES public.categorias_lancamento(id),
  valor numeric(14,2) NOT NULL CHECK (valor > 0),
  vencimento date NOT NULL,
  centro_custo_id uuid NOT NULL REFERENCES public.centros_custo(id),
  obra_id uuid REFERENCES public.obras(id),
  status public.compra_status NOT NULL DEFAULT 'pendente',
  origem text NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual','dda')),
  linha_digitavel text,
  numero_documento text,
  anexo_path text,
  hash_arquivo text,
  importacao_id uuid REFERENCES public.importacoes(id),
  lancamento_id uuid REFERENCES public.lancamentos(id),
  aprovada_por uuid,
  aprovada_em timestamptz,
  data_pagamento date,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compras TO authenticated;
GRANT ALL ON public.compras TO service_role;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY compras_read ON public.compras FOR SELECT TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia') OR public.has_role(auth.uid(),'leitura'));

CREATE POLICY compras_insert ON public.compras FOR INSERT TO authenticated
  WITH CHECK ((public.can_manage() OR public.has_role(auth.uid(),'engenharia')) AND created_by = auth.uid() AND status = 'pendente');

-- Quem lança pode editar/cancelar enquanto está pendente; só admin muda o status
-- para aprovada/rejeitada (e a função marcar_compra_paga cuida de "paga").
CREATE POLICY compras_update ON public.compras FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (status = 'pendente' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (status = 'pendente' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia'))));

CREATE POLICY compras_delete ON public.compras FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER set_compras_updated BEFORE UPDATE ON public.compras FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX compras_status_vencimento_idx ON public.compras(status, vencimento);
CREATE INDEX compras_hash_idx ON public.compras(hash_arquivo) WHERE hash_arquivo IS NOT NULL;

CREATE OR REPLACE FUNCTION public.audit_compras()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN
  INSERT INTO public.audit_log(user_id,tabela,registro_id,acao,dados_antes,dados_depois)
  VALUES(auth.uid(),'compras',COALESCE(NEW.id,OLD.id),TG_OP,
    CASE WHEN TG_OP IN('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN('INSERT','UPDATE') THEN to_jsonb(NEW) END);
  RETURN COALESCE(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_compras() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_compras() TO service_role;
CREATE TRIGGER audit_compras AFTER INSERT OR UPDATE OR DELETE ON public.compras FOR EACH ROW EXECUTE FUNCTION public.audit_compras();

-- Aprovar / rejeitar: RPCs simples que só um admin consegue chamar com sucesso
-- (a policy de UPDATE já bloqueia não-admins de mudar o status, isto só dá uma
-- mensagem de erro melhor do que a genérica de RLS).
CREATE OR REPLACE FUNCTION public.aprovar_compra(_compra uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Só administradores podem aprovar compras.';
  END IF;
  UPDATE public.compras SET status='aprovada', aprovada_por=auth.uid(), aprovada_em=now()
  WHERE id=_compra AND status='pendente';
  IF NOT FOUND THEN RAISE EXCEPTION 'Compra não encontrada ou não está pendente.'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.aprovar_compra(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_compra(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.rejeitar_compra(_compra uuid, _motivo text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Só administradores podem rejeitar compras.';
  END IF;
  UPDATE public.compras SET status='rejeitada', observacoes=COALESCE(_motivo, observacoes)
  WHERE id=_compra AND status='pendente';
  IF NOT FOUND THEN RAISE EXCEPTION 'Compra não encontrada ou não está pendente.'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.rejeitar_compra(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rejeitar_compra(uuid,text) TO authenticated, service_role;

-- Marcar como paga: cria o lançamento de verdade (o que já alimenta Painel da
-- obra e Centros de custo, sem precisar mudar nada lá) e fecha a compra.
CREATE OR REPLACE FUNCTION public.marcar_compra_paga(_compra uuid, _data date, _valor numeric DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _row public.compras;
  _lancamento uuid;
  _valor_final numeric;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Só administradores podem marcar uma compra como paga.';
  END IF;
  SELECT * INTO _row FROM public.compras WHERE id=_compra AND status='aprovada' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Compra não encontrada ou não está aprovada.'; END IF;
  _valor_final := COALESCE(_valor, _row.valor);
  INSERT INTO public.lancamentos(centro_custo_id, obra_id, data, tipo, categoria, descricao, valor, comprovante_numero, anexo_path, created_by)
  VALUES (_row.centro_custo_id, _row.obra_id, _data, 'pagamento', _row.categoria,
    _row.fornecedor || ' — ' || _row.descricao, _valor_final, _row.numero_documento, _row.anexo_path, auth.uid())
  RETURNING id INTO _lancamento;
  UPDATE public.compras SET status='paga', lancamento_id=_lancamento, data_pagamento=_data WHERE id=_compra;
  RETURN _lancamento;
END $$;
REVOKE ALL ON FUNCTION public.marcar_compra_paga(uuid,date,numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.marcar_compra_paga(uuid,date,numeric) TO authenticated, service_role;

-- Bucket para anexos das compras (boleto/nota fiscal).
INSERT INTO storage.buckets (id, name, public) VALUES ('compras','compras',false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY compras_storage_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='compras' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia') OR public.has_role(auth.uid(),'leitura')));
CREATE POLICY compras_storage_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='compras' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
CREATE POLICY compras_storage_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='compras' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')))
  WITH CHECK (bucket_id='compras' AND (public.can_manage() OR public.has_role(auth.uid(),'engenharia')));
CREATE POLICY compras_storage_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='compras' AND public.has_role(auth.uid(),'admin'));
