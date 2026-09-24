CREATE OR REPLACE FUNCTION public.desfazer_importacao_comprovantes(_importacao uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_status public.importacao_status;
  v_tipo public.importacao_tipo;
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem desfazer comprovantes.';
  END IF;

  SELECT tipo, status
    INTO v_tipo, v_status
  FROM public.importacoes
  WHERE id = _importacao
  FOR UPDATE;

  IF NOT FOUND OR v_tipo <> 'comprovantes'::public.importacao_tipo THEN
    RAISE EXCEPTION 'Importação de comprovantes não encontrada.';
  END IF;

  IF v_status = 'descartada'::public.importacao_status THEN
    RAISE EXCEPTION 'Este comprovante já foi desfeito.';
  END IF;

  IF v_status NOT IN ('concluida'::public.importacao_status, 'parcial'::public.importacao_status) THEN
    RAISE EXCEPTION 'Somente comprovantes concluídos ou parciais podem ser desfeitos.';
  END IF;

  UPDATE public.lancamentos
  SET deleted_at = now(), updated_at = now()
  WHERE importacao_id = _importacao
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Nenhum lançamento ativo foi encontrado para este comprovante.';
  END IF;

  UPDATE public.importacoes
  SET status = 'descartada'::public.importacao_status,
      resumo = COALESCE(resumo, '{}'::jsonb) || jsonb_build_object(
        'desfeita_em', now(),
        'desfeita_por', auth.uid(),
        'lancamentos_desfeitos', v_count
      ),
      updated_at = now()
  WHERE id = _importacao;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.desfazer_importacao_comprovantes(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.desfazer_importacao_comprovantes(uuid) TO authenticated, service_role;