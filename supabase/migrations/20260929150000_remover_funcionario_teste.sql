-- Remove o funcionário de teste (nome "teste") e tudo que está ligado a ele.
DO $$
DECLARE _id uuid;
BEGIN
  SELECT id INTO _id FROM public.funcionarios WHERE lower(nome) = 'teste' LIMIT 1;
  IF _id IS NOT NULL THEN
    DELETE FROM public.funcionario_custos_diarios WHERE funcionario_id = _id;
    DELETE FROM public.funcionario_documentos WHERE funcionario_id = _id;
    DELETE FROM public.funcionario_alocacoes WHERE funcionario_id = _id;
    DELETE FROM public.funcionario_remuneracoes WHERE funcionario_id = _id;
    DELETE FROM public.funcionarios WHERE id = _id;
  END IF;
END $$;
