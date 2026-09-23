DO $$
DECLARE
  v_user uuid := 'b2cf9aa9-bdff-4b88-9ed5-0b2835e827f1';
  v_import uuid := '16f912ff-d3ce-4d73-bfb7-2b6ce833b494';
  v_measurement uuid := gen_random_uuid();
  v_work uuid := '20000000-0000-0000-0000-000000000001';
  v_number integer;
BEGIN
  UPDATE public.importacoes
  SET status = 'descartada', updated_at = now()
  WHERE tipo = 'medicao' AND status = 'processando' AND id <> v_import;

  UPDATE public.importacoes
  SET arquivo_nome = '1195_MM_COSTA_ENGENHARIA_JUL.26_29_assinado.pdf',
      linhas_total = 8,
      valor_total = 328713.73,
      entidades_envolvidas = jsonb_build_array(v_work),
      status = 'concluida',
      updated_at = now()
  WHERE id = v_import AND status = 'processando';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'A importação selecionada não está disponível para conclusão';
  END IF;

  SELECT public.proximo_numero_medicao(v_work) INTO v_number;
  INSERT INTO public.medicoes (id, obra_id, numero, data_inicio, data_fim, origem, status, valor_total, acumulado_anterior, importacao_id, observacoes, created_by)
  VALUES (v_measurement, v_work, v_number, '2026-07-01', '2026-07-31', 'planilha_importada', 'emitida', 328713.73,
    (SELECT coalesce(sum(valor_total),0) FROM public.medicoes WHERE obra_id=v_work AND status <> 'cancelada' AND deleted_at IS NULL),
    v_import, 'Importada de 1195_MM_COSTA_ENGENHARIA_JUL.26_29_assinado.pdf; total declarado R$ 328.713,73; soma das linhas R$ 328.713,72; ajuste de arredondamento R$ 0,01.', v_user);

  INSERT INTO public.medicao_itens (medicao_id, servico_id, descricao, categoria_perfuracao, quantidade, unidade, preco_encontrado, valor_total, created_by)
  VALUES
    (v_measurement, NULL, 'PERF.P/DRENO E TIR. SOLO D=114,30MM(HX)', 'solo', 44.00, 'M', 128.00, 5632.00, v_user),
    (v_measurement, NULL, 'ACO P/CONCRETO PROTENDIDO TIPO DYWIDAG OU SIMILAR', NULL, 4608.98, 'KG', 4.65, 21431.73, v_user),
    (v_measurement, NULL, 'CALDA DE CIMENTO PARA INJEÇÃO - FORNECIMENTO, PREPARO E APLICAÇÃO', NULL, 20433.45, 'L', 0.37, 7560.37, v_user),
    (v_measurement, NULL, 'PERF.P/DRENO E TIR RCH ALT D=114,30MM(HX)', 'rocha_alterada', 323.20, 'M', 202.50, 65448.00, v_user),
    (v_measurement, NULL, 'PERF.P/DRENO E TIR RCH SA D=114,30MM(HX)', 'rocha', 60.87, 'M', 219.50, 13361.62, v_user),
    (v_measurement, NULL, 'ESTACA TIPO RAIZ, 400MM, COM PERFURAÇÃO EM SOLO - 130T', 'solo', 108.00, 'M', 398.00, 42984.00, v_user),
    (v_measurement, NULL, 'ESTACA TIPO RAIZ, 400MM, COM PERFURAÇÃO EM ROCHA ALTERADA - 130T', 'rocha_alterada', 144.00, 'M', 574.00, 82656.00, v_user),
    (v_measurement, NULL, 'ESTACA TIPO RAIZ, 400MM, COM PERFURAÇÃO EM ROCHA - 130T', 'rocha', 108.00, 'M', 830.00, 89640.00, v_user);

  UPDATE public.importacoes
  SET resumo = jsonb_build_object(
    'total_declarado', 328713.73,
    'soma_linhas', 328713.72,
    'ajuste_arredondamento', 0.01,
    'usuario', 'Usuário autenticado',
    'linhas_distribuidas', 8,
    'obras', jsonb_build_array('PM Osasco — Morro do Sabão'),
    'medicoes', jsonb_build_array(v_measurement),
    'validacao', 'Conferido contra as colunas ATUAL de QUANTIDADES MEDIDAS e VALORES MEDIDOS do PDF original'
  ), updated_at = now()
  WHERE id = v_import;
END $$;