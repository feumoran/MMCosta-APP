CREATE OR REPLACE FUNCTION public.desfazer_importacao_medicao(_importacao uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  IF NOT public.can_manage() THEN
    RAISE EXCEPTION 'Sem permissão para desfazer importações';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.importacoes
    WHERE id = _importacao
      AND tipo = 'medicao'
      AND status = 'concluida'
  ) THEN
    RAISE EXCEPTION 'A importação não está concluída ou não é de medição';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.medicoes
    WHERE importacao_id = _importacao
      AND (status = 'recebida' OR recebida_em IS NOT NULL OR valor_recebido IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'Não é possível desfazer: há medição recebida vinculada a esta importação';
  END IF;

  UPDATE public.medicoes
  SET status = 'cancelada', deleted_at = now()
  WHERE importacao_id = _importacao
    AND deleted_at IS NULL;
  GET DIAGNOSTICS _count = ROW_COUNT;

  UPDATE public.importacoes
  SET status = 'descartada',
      resumo = resumo || jsonb_build_object(
        'desfeita_em', now(),
        'desfeita_por', auth.uid(),
        'medicoes_canceladas', _count
      )
  WHERE id = _importacao;

  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.desfazer_importacao_medicao(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.desfazer_importacao_medicao(uuid) TO authenticated, service_role;