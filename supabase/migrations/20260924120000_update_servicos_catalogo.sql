-- Ajusta o catálogo de serviços e preços ao novo modelo (3 formulários reais de boletim).
-- Mantém os serviços antigos desativados (preserva integridade referencial e histórico),
-- e cria o novo catálogo com os nomes usados pelos boletins de Estaca Raiz, Injeção (tirante)
-- e Concreto Projetado.

-- Desativa o catálogo antigo (não usado por nenhum boletim ainda) e fecha a vigência dos preços antigos.
UPDATE public.servicos SET ativo=false
WHERE id IN (
  '60000000-0000-0000-0000-000000000002', -- Calda de cimento
  '60000000-0000-0000-0000-000000000003', -- Aço
  '60000000-0000-0000-0000-000000000004', -- Argamassa
  '60000000-0000-0000-0000-000000000005'  -- Concreto (renomeado abaixo)
);

UPDATE public.precos_servico SET vigencia_fim=CURRENT_DATE - 1
WHERE servico_id IN (
  '60000000-0000-0000-0000-000000000002',
  '60000000-0000-0000-0000-000000000003',
  '60000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000005'
) AND vigencia_fim IS NULL;

-- Renomeia o serviço de perfuração genérico (mantém id e histórico — usado por Estaca Raiz e Injeção/tirante).
UPDATE public.servicos SET
  nome='Perfuração',
  palavras_chave=ARRAY['perfuração','metro perfurado','solo','rocha','rocha alterada','estaca','tirante','dreno']
WHERE id='60000000-0000-0000-0000-000000000001';

-- Novo catálogo de serviços derivados dos três formulários de boletim.
INSERT INTO public.servicos (id,nome,unidade,eh_perfuracao,tipo_medicao,palavras_chave) VALUES
('60000000-0000-0000-0000-000000000006','Injeção estaca raiz — cimento','sc',false,'periodica',ARRAY['injeção','cimento','estaca raiz','saco']),
('60000000-0000-0000-0000-000000000007','Injeção estaca raiz — areia','L',false,'periodica',ARRAY['injeção','areia','estaca raiz']),
('60000000-0000-0000-0000-000000000008','Injeção de tirante — cimento','kg',false,'periodica',ARRAY['injeção','tirante','cimento','bainha','manchete']),
('60000000-0000-0000-0000-000000000009','Concreto projetado','m³',false,'periodica',ARRAY['concreto projetado','concreto','via seca','via úmida']),
('60000000-0000-0000-0000-00000000000a','Fibra de aço','kg',false,'periodica',ARRAY['fibra de aço','fibra']),
('60000000-0000-0000-0000-00000000000b','Mobilização','vb',false,'etapa_fechada',ARRAY['mobilização','desmobilização','transporte','frete'])
ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, unidade=EXCLUDED.unidade, eh_perfuracao=EXCLUDED.eh_perfuracao, tipo_medicao=EXCLUDED.tipo_medicao, palavras_chave=EXCLUDED.palavras_chave, ativo=true;

-- Preços de exemplo do novo catálogo (seção 9 do Knowledge) — a tela deve avisar enquanto eh_exemplo=true.
INSERT INTO public.precos_servico (servico_id,categoria,preco,vigencia_inicio,eh_exemplo) VALUES
('60000000-0000-0000-0000-000000000006',NULL,32.00,CURRENT_DATE,true),
('60000000-0000-0000-0000-000000000007',NULL,0.45,CURRENT_DATE,true),
('60000000-0000-0000-0000-000000000008',NULL,4.80,CURRENT_DATE,true),
('60000000-0000-0000-0000-000000000009',NULL,980.00,CURRENT_DATE,true),
('60000000-0000-0000-0000-00000000000a',NULL,18.00,CURRENT_DATE,true);
