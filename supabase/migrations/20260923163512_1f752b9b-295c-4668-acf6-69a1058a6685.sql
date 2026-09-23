CREATE OR REPLACE FUNCTION public.buscar_preco(_servico uuid, _obra uuid, _categoria public.categoria_perfuracao, _data date)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public
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
REVOKE ALL ON FUNCTION public.buscar_preco(uuid,uuid,public.categoria_perfuracao,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buscar_preco(uuid,uuid,public.categoria_perfuracao,date) TO authenticated;