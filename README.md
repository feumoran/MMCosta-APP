# MMcosta Flow

Sistema de gestão (ERP enxuto) da MMcosta Engenharia — Fundações & Geotecnia, uma empreiteira especializada de São Paulo que executa perfuração, estaca raiz, tirantes injetados, drenos, solo grampeado, cortina atirantada e concreto projetado em obras de terceiros. O sistema elimina a transcrição manual de boletins de papel, gera a medição mensal para o cliente, controla o caixa de cada obra e distribui automaticamente comprovantes de despesa para o centro de custo correto.

== 2. Contexto de negócio (importante para as decisões) ==
A MMcosta fatura por produção medida (metros perfurados, metros de estaca, kg de aço, litros de calda, sacos de cimento, m³ de concreto projetado), em contratos de preço unitário (PU) com o cliente (construtora/GC/consórcio). Alguns itens são faturados por etapa fechada (ex.: mobilização) e outros por medição periódica mensal — os dois tipos convivem no mesmo contrato.
O preço da perfuração depende do material perfurado: solo, rocha alterada e rocha (rocha sã) têm preços por metro diferentes, e esses preços variam de contrato para contrato. Isso é central: todo item de perfuração precisa carregar a sua categoria.
Opera com 2 obras em média, no máximo 4 simultâneas. É uma empresa só (single-tenant): não precisa de multiempresa nem de otimizações de escala. Prioridade é fluxo correto e simples.
O boletim de produção continua em papel: o operador preenche no canteiro, fotografa e manda pelo WhatsApp; o escritório sobe a foto no sistema. Não é um app para o operador digitar.
Funcionários de campo recebem caixa (adiantamento) e prestam contas com um PDF de comprovantes; cada item desse PDF tem um C.C./OBRA em texto livre que precisa ser roteado para o centro de custo certo. Nem todo item é de obra (existem centros como "Depósito/Manutenção" e "Escritório").
Sem integração contábil/fiscal (NF-e) por enquanto — decisão da MMcosta. Não construir emissão de nota.
Toda a interface em português do Brasil, moeda R$ (formato R$ 1.234,56), datas dd/mm/aaaa, números com vírgula decimal.

== 3. Usuários e permissões ==
Login por e-mail e senha (Lovable Cloud Auth). Papéis guardados em tabela própria user_roles (nunca no perfil nem no front-end), verificados por função has_role() nas políticas RLS:
- admin (diretoria): tudo, inclusive usuários, tabela de preços e exclusões.
- escritorio (financeiro/medição): cadastros, boletins, medições, importações, comprovantes, lançamentos e documentos. Não gerencia usuários.
- engenharia (engenheiro de obra): vê as obras, sobe boletins e documentos, não vê nem edita valores financeiros de caixa.
- leitura: só visualiza painéis.
O primeiro usuário cadastrado vira admin automaticamente.

== 4. Stack e padrões técnicos ==
React + TypeScript + Vite + Tailwind + shadcn/ui (padrão da Lovable). React Query para dados. Recharts para a curva S.
Lovable Cloud (Postgres com RLS em todas as tabelas, Auth, Storage com buckets privados e URLs assinadas, Edge Functions).
Lovable AI (Gemini multimodal) chamado somente dentro de Edge Functions — nunca expor chave no front-end. Saída sempre em JSON estruturado via tool calling / schema, validada com zod antes de voltar para a tela. Tratar erros 429 (limite) e 402 (créditos) com mensagem amigável.
Leitura de planilhas no navegador com a biblioteca xlsx (SheetJS) via npm. Para PDFs digitais, extrair o texto com pdfjs-dist e mandar o texto para a IA (mais barato e preciso); para fotos e PDFs escaneados, mandar a imagem/página.
Exportação de planilhas com xlsx (gerar .xlsx de verdade) e também .csv com BOM UTF-8 e separador ; (abre certo no Excel brasileiro).
Valores monetários como numeric(14,2) no banco; quantidades numeric(14,3). Nunca usar float para dinheiro.
Trilha de auditoria: tabela audit_log (quem, quando, tabela, id, ação, antes/depois) alimentada por trigger nas tabelas de lançamentos, medições, boletins e preços.
Exclusões de registros financeiros sempre com diálogo de confirmação; preferir exclusão lógica (deleted_at) em lançamentos e medições.
Layout responsivo: o escritório usa no computador, mas o upload de boletim/comprovante precisa funcionar bem no celular.

== 5. Identidade visual (manter a do protótipo) ==
Marca no topo: MMCOSTA (fonte Archivo 800, espaçamento leve) com o subtítulo FUNDAÇÕES & GEOTECNIA (pequeno, maiúsculas, cinza).
Fontes (Google Fonts): Archivo para títulos, IBM Plex Sans para texto, IBM Plex Mono para números, datas e valores (com tabular-nums).
Cores (modo claro): fundo #f5f4f0 com uma grade muito sutil de 28px, superfícies #ffffff, texto #12151a, texto secundário #54534f, texto apagado #8a8781, acento azul #2a78d6 (hover #184f95), bom #0ca30c, atenção #c98500, crítico #d03b3b, entrada de dinheiro #0ca30c, saída #c53a3a, série planejada #a7a49b, série realizada #2a78d6.
Modo escuro completo: fundo #101214, superfície #191c1f, texto #f4f3f0, acento #4a90e8. Respeitar a preferência do sistema, com botão para alternar.
Cartões com borda fina e cantos de 12–14px, sombra suave. Seletor de obras no topo em formato de "pílulas" (a obra ativa fica azul), com botão "+ Nova obra".
Selos pequenos arredondados: "auto" (identificado automaticamente), "revisar" (precisa de atenção), "Arquivado", "Planilha", "Comprovantes".
Tom de linguagem direto e profissional, sem jargão de TI para o usuário final.

== 6. Navegação ==
Barra superior: marca à esquerda, seletor de obra (pílulas) no meio, data de hoje à direita. Abaixo, abas/menu:
Visão geral (todas as obras) · Painel da obra · Boletim (foto + IA) · Medições · Importar planilha de medição · Comprovantes (caixa) · Documentos da obra · Cadastros (clientes, obras, equipamentos, equipes, serviços e preços, centros de custo, usuários)
A obra selecionada fica guardada na URL (ex.: /obras/:id/painel) para poder compartilhar link.

== 7. Modelo de dados (Postgres / Lovable Cloud) ==
Todas as tabelas com id uuid, created_at, updated_at, created_by, RLS ligada.
- profiles: id (= auth.users.id), nome, e-mail.
- user_roles: user_id, role (admin | escritorio | engenharia | leitura).
- clientes: nome, cnpj (opcional), contato, observações.
- obras: nome, cliente_id, tipo_obra (texto: ex. "Estaca raiz + tirantes injetados + drenos"), numero_contrato, valor_contrato, data_inicio, data_fim_prevista, status (em_andamento | concluida | suspensa), observações. Uma obra tem automaticamente um centro de custo do tipo obra.
- centros_custo: nome, tipo (obra | administrativo), obra_id (quando tipo obra), ativo. Criar já com os centros administrativos "Depósito/Manutenção" e "Escritório/Administrativo".
- cc_aliases: centro_custo_id, texto_normalizado (ex.: morrodosabaofbs). O sistema aprende apelidos: quando o usuário corrige manualmente o centro de custo de um texto livre, grava o alias para acertar sozinho da próxima vez.
- equipamentos: codigo (ex.: PRF004), descricao (ex.: "Perfuratriz MC180"), tipo, ativo. obra_equipamentos: obra_id, equipamento_id, data_entrada, data_saida.
- equipes: nome (ex.: "Equipe Perfuração — Elvis Gondim"), ativo. obra_equipes: obra_id, equipe_id.
- servicos (catálogo): nome (ex.: "Estaca raiz D=31cm", "Perf. dreno e tirante D=114,30mm (HX)", "Calda de cimento para injeção", "Aço protendido (Dywidag)", "Injeção de cimento — argamassa", "Concreto projetado", "Mobilização"), unidade (m, un, L, kg, sc, m³, vb), eh_perfuracao (boolean), tipo_medicao (periodica | etapa_fechada), palavras_chave (texto, para casar descrições livres).
- precos_servico: servico_id, obra_id (nulo = preço padrão da empresa), categoria_perfuracao (solo | rocha_alterada | rocha | nulo), valor_unitario, vigencia_inicio, vigencia_fim. Regra de busca: preço da obra na data > preço padrão na data. Para serviço de perfuração, a categoria é obrigatória na busca.
- boletins: obra_id, data_boletim, equipamento_id, equipe_id, horas_trabalhadas, horas_paradas, motivo_parada, observacoes, status (pendente → lido_ia → confirmado), arquivo_path (storage), arquivo_tipo, extracao_ia (jsonb bruto), confianca_ia (jsonb), revisado_por, revisado_em.
- boletim_itens: boletim_id, servico_id (opcional), descricao (texto como veio do papel), categoria_perfuracao (solo | rocha_alterada | rocha | nulo), quantidade, unidade.
- medicoes: obra_id, numero (sequencial por obra: 1, 2, 3…), periodo_inicio, periodo_fim, origem (boletins | planilha_importada | manual), status (rascunho → emitida → aprovada_cliente → recebida, ou cancelada), valor_total, data_emissao, data_recebimento, arquivo_importado_id (opcional), observações.
- medicao_itens: medicao_id, servico_id (opcional), descricao, categoria_perfuracao, quantidade, unidade, valor_unitario, valor_total, preco_encontrado (boolean — falso quando não havia preço cadastrado e o usuário precisa preencher).
- categorias_lancamento (seed, editável pelo admin): medicao Medição recebida · adiantamento Adiantamento · mao_de_obra Mão de obra · combustivel Combustível · material Material · aluguel_equip Aluguel de equipamento · mobilizacao Mobilização/transporte · alojamento Alojamento · alimentacao Alimentação · epi EPI/Segurança · manutencao_veiculo Manutenção de veículo/equipamento · administrativo Administrativo/Escritório · deslocamento Pedágio/deslocamento · outros Outros. Cada categoria tem o tipo permitido (recebimento, pagamento ou ambos).
- lancamentos: centro_custo_id, obra_id (derivado do centro, pode ser nulo em centro administrativo), data, tipo (recebimento | pagamento), categoria, descricao, valor (sempre positivo; o tipo define o sinal), medicao_id (opcional), importacao_id (opcional), comprovante_numero (opcional), funcionario (opcional), anexo_path (opcional), deleted_at.
- importacoes: tipo (planilha_medicao | comprovantes_caixa | boletim_pdf), arquivo_path, arquivo_nome, funcionario (comprovantes), numero_caixa (ex.: 21082026_16092026), total_documento, total_importado, itens_total, itens_importados, itens_ignorados, resumo (jsonb), status (em_revisao | concluida | descartada).
- documentos: obra_id, categoria (contrato | projeto | art_rrt | laudo | nota_fiscal | outros), nome_arquivo, arquivo_path, tamanho, mime, observacao.
- curva_planejada (opcional): obra_id, data, percentual_fisico_planejado, percentual_financeiro_planejado — se não houver, o sistema gera uma curva S automática.
- marcos_avanco (opcional): obra_id, data, percentual_fisico, percentual_financeiro — pontos reais informados manualmente (ex.: das medições assinadas).
- audit_log: user_id, tabela, registro_id, acao, dados_antes, dados_depois, criado_em.
Buckets de storage privados: boletins, importacoes, comprovantes, documentos. Caminho sempre começando pelo id da obra ou da importação. Download sempre por URL assinada de curta duração.

== 8. Regras de negócio ==
Painel da obra:
- Faturado (medido) = soma das medições com status emitida, aprovada_cliente ou recebida.
- Recebido = soma dos lançamentos de recebimento. Pago = soma dos lançamentos de pagamento. Saldo da obra = recebido − pago. A receber = faturado − recebido.
- % financeiro realizado = faturado acumulado ÷ valor do contrato.
- % físico realizado = último marco informado; se não houver marcos, usar o % financeiro como aproximação (em contrato PU os dois andam juntos).
- Prazo decorrido = dias desde o início ÷ duração total, limitado entre 0% e 100%.
- Status: Em dia se físico ≥ prazo − 5 p.p.; Atenção se entre −5 e −15 p.p.; Atrasado se abaixo de −15 p.p.; Concluída se status da obra for concluída.
- Curva S planejada: se não houver curva cadastrada, gerar semanalmente de início a fim com a função suave s(t) = t³(6t² − 15t + 10); a curva financeira planejada é a mesma deslocada uma semana. Curva realizada: pontos semanais interpolando linearmente entre marcos reais (ou medições acumuladas) a partir de 0% no início.

Boletim → medição:
- Todo item de perfuração tem uma categoria obrigatória: solo, rocha alterada ou rocha. Siglas do papel: "RCH ALT" = rocha alterada; "RCH SA", "rocha sã" ou só "rocha" = rocha; "solo" = solo.
- Uma linha do papel que mistura categorias (ex.: "E-6, 4,0m solo + 6,0m rocha") vira dois itens: 4,0 m solo e 6,0 m rocha.
- Gerar medição do período = somar os itens dos boletins confirmados da obra entre as datas escolhidas, agrupando por (serviço/descrição + categoria + unidade), e aplicar o preço vigente em precos_servico para cada grupo (perfuração sempre pelo preço da sua categoria). Itens sem preço aparecem destacados para preencher antes de emitir.
- Um boletim já usado numa medição emitida fica marcado e não entra de novo numa próxima medição (evitar faturar duas vezes). Avisar se o período escolhido tiver boletins já medidos.

Importação de planilha de medição:
- Aceita .xlsx, .xls, .csv e PDF. Cada linha pode ser de uma obra diferente.
- Reconhecer colunas por sinônimos, ignorando acento/maiúscula/espaço: Obra/centro de custo (obra, empreendimento, canteiro, contrato, centro de custo); Data (data, dt, período, mês, data medição); Serviço (serviço, atividade, descrição, item, serviço executado); Quantidade (quantidade, qtd, qtde, quant, quantidade medida); Unidade (unidade, unid, un, u.medida); Valor unitário (valor unitário, vl unit, preço unitário, unitário); Valor total (valor total, valor, total, vl total, valor medido, atual). Em planilhas com colunas Anterior/Atual/Acumulado, usar Atual.
- Mostrar o mapeamento para o usuário confirmar/corrigir antes de seguir.
- Se valor total vier vazio, calcular quantidade × unitário.
- Cada linha é casada com uma obra (regra de casamento abaixo); linhas sem obra identificada ficam marcadas "revisar" e caem na obra selecionada, mas o usuário pode trocar ou ignorar.
- Distribuir = criar uma medição (origem planilha_importada) por obra envolvida, com os itens, e registrar a importação.

Comprovantes de caixa (prestação de contas):
- Formato real de referência: cabeçalho "FLUXO DE CAIXA", "FUNCIONÁRIO: <nome>", "CX Nº <ddmmaaaa_ddmmaaaa>"; colunas ITEM · DATA · NF/COMPROVANTE · DESCRIÇÃO · MOTIVO · C.C / OBRA · VALOR; linha final TOTAL.
- A IA extrai todas as linhas. O sistema confere a soma dos itens contra o TOTAL do documento e mostra alerta se não bater.
- Cada item é roteado para um centro de custo pela coluna C.C./OBRA (regra de casamento abaixo). Itens de centros administrativos (Depósito/Manutenção, Escritório) nunca são forçados para uma obra. Itens sem centro identificado ficam "não identificado" e não são lançados até o usuário escolher.
- Categoria do lançamento: priorizar o conteúdo da descrição sobre o motivo, porque o motivo "DESLOC." cobre tanto combustível quanto pedágio. Ordem das regras: motivo "alojamento" → Alojamento; motivo "EPI" ou descrição com bota/capacete/luva/segurança → EPI; motivo "refeição" ou descrição almoço/jantar/lanche/café → Alimentação; descrição "pedágio" → Pedágio/deslocamento; descrição combustível/gasolina/diesel/etanol/abastecimento → Combustível; motivo "documentação" ou descrição impressão/cartório/xerox → Administrativo; motivo "manutenção" ou descrição pneu/óleo/mangueira/perfuratriz/peça/equipamento → Manutenção de veículo/equipamento; motivo "desloc." sem outra pista → Pedágio/deslocamento; resto → Outros. A IA pode sugerir, mas essa regra determinística é a padrão e o usuário sempre pode trocar.
- Detectar duplicidade: mesmo centro, data, valor e nº de comprovante já lançado → marcar "possível duplicado" e desmarcar por padrão.
- Distribuir = criar um lançamento de pagamento por item confirmado, com data, descrição (ex.: "Pedágio — Thiago Schinzari"), nº do comprovante, funcionário e vínculo com a importação e o arquivo original.

Regra de casamento de texto livre com obra/centro de custo (usada em planilha e comprovantes):
1. Alias aprendido (cc_aliases) com o texto normalizado → usa direto.
2. Texto normalizado (sem acento, minúsculo, só letras e números) igual, contido ou que contém o nome normalizado da obra/centro.
3. Sobreposição de palavras com 4+ letras contra nome da obra + nome do cliente + nome do centro; vence a maior pontuação (> 0).
4. Senão: "não identificado". Exemplo real: "MORRO DO SABÃO - FBS" casa com a obra "PM Osasco — Morro do Sabão" (palavra "sabao" no nome e "FBS" no cliente). "DEPÓSITO/MANUTENÇÃO" casa com o centro administrativo Depósito/Manutenção. "ESCRITÓRIO" casa com Escritório/Administrativo.

Leitura por IA (vale para boletim, planilha em PDF e comprovantes):
- A revisão humana nunca é opcional: a IA só pré-preenche; nada é gravado como definitivo sem o usuário clicar em confirmar.
- Guardar sempre o arquivo original e o JSON bruto da extração.
- Mostrar, campo a campo, quando a confiança da IA for baixa (selo "revisar").
- Se a leitura falhar, permitir preencher manualmente no mesmo formulário.

== 9. Dados reais iniciais (seed) ==
Criar estes registros na primeira carga (são dados reais da MMcosta):
- Clientes: "FBS Construção Civil e Pavimentação S.A."; "Consórcio CTF KBL Mooca e Osasco (via Kablan Engenharia) — obra SABESP".
- Obra 1 — PM Osasco — Morro do Sabão: Cliente FBS; tipo "Estaca raiz + tirantes injetados + drenos · contrato preço unitário 09.152.003/0001-15"; valor do contrato R$ 1.503.789,03; início 10/03/2026; término previsto 10/03/2027; em andamento.
  - Equipamentos: PRF001 · Perfuratriz CR10; PRF004 · Perfuratriz MC180; CENTIR001 · Central de injeção (tirante). Equipes: Equipe Perfuração; Equipe Injeção.
  - Marcos reais (físico / financeiro): 31/05/2026 36,67% / 44,24%; 30/06/2026 60,04% / 66,84%; 31/07/2026 82,65% / 88,69%.
  - Medições já recebidas (criar medição com status recebida e o lançamento de recebimento correspondente): Medição 3 — período até 31/05/2026, recebida em 24/06/2026, R$ 227.240,00; Medição 4 — período até 30/06/2026, recebida em 28/07/2026, R$ 339.720,90; Medição 5 — período até 31/07/2026, recebida em 21/08/2026, R$ 328.713,73.
  - Observação: as Medições 1 e 2 são anteriores ao sistema e não foram informadas. Por isso o indicador "Faturado" vai mostrar só as medições 3 a 5 (R$ 895.674,63), enquanto a curva S usa os marcos reais (88,69% financeiro em 31/07). Deixe um aviso na obra pedindo para cadastrar uma medição manual "Medições 1–2 (anteriores ao sistema)" quando o valor estiver disponível; não invente esse valor.
  - Pagamentos: 09/06/2026 Mobilização/transporte — Mobilização central de injeção (tirante) para Morro do Sabão — R$ 3.200,00; 02/07/2026 Combustível — Gerador quebrado, 2 paradas (02 e 03/07) — R$ 1.800,00; 07/07/2026 Manutenção de veículo/equipamento — Manutenção corretiva, cabeça d'água perfuratriz MC180 — R$ 1.400,00; 13/07/2026 Manutenção de veículo/equipamento — Mangueira da central de injeção CZM180 — R$ 950,00.
- Obra 2 — Kablan — SABESP Biritiba Mirim (lado Mogi/Bertioga): Cliente Consórcio CTF KBL; tipo "Estaca raiz D=400mm, 96m · ART CT/1918 · perfuratriz hidráulica CR16"; valor R$ 135.000,00; início 27/08/2026; término previsto 27/09/2026.
  - Equipamentos: PRF002 · Perfuratriz CR16; MISER003 · Misturador argamassa (estaca raiz). Equipes: Equipe Perfuração — Elvis Gondim; Apoio de obra — Thiago Schinzari.
  - Marcos: 06/09/2026 62,5% / 62,5%; 09/09/2026 100% / 100%.
  - Pagamentos (todas as datas em 2026): 04/08 Manutenção equip. — Mangueiras e acessórios, manutenção CR16 (Embu Mangueiras) R$ 1.446,69; 07/08 Alojamento — Hospedagem da equipe, Hotel Mogi (4 pessoas, 13 diárias) R$ 3.350,75; 11/08 Mobilização — Frete, mobilização de equipamentos R$ 3.780,00; 18/08 EPI — Botas e protetor auricular (Railson e Miguel) R$ 185,90; 19/08 Aluguel de equipamento — Locação Saveiro 1.6 (2 períodos), deslocamento da equipe R$ 2.389,00; 20/08 Manutenção equip. — Kit reparo pistão da morça, CR16 R$ 175,00; 24/08 Alojamento — Hospedagem Hotel Mogi (4 pessoas, 15 diárias + cafés) R$ 4.106,25; 26/08 EPI — Capacetes, abafadores e protetores auriculares (4 conjuntos) R$ 1.022,00; 31/08 Alimentação — Refeições de equipe, fornecedor (17/07–06/08) R$ 2.143,00; 31/08 Manutenção equip. — Confecção do pistão da morça (torno), CR16 R$ 2.700,00; 05/09 Combustível — Combustível e pedágios da equipe (ago–set, agregado) R$ 4.850,00; 14/09 Mobilização — Frete, desmobilização de equipamentos (09/09) R$ 3.780,00.
- Centros administrativos: Depósito/Manutenção; Escritório/Administrativo.
- Tabela de preços padrão (VALORES DE EXEMPLO — substituir pelos reais): perfuração solo R$ 140,00/m; perfuração rocha alterada R$ 210,00/m; perfuração rocha R$ 290,00/m; calda de cimento para injeção R$ 1,35/L; aço protendido (Dywidag) R$ 22,00/kg; injeção de cimento — argamassa R$ 38,00/sc; concreto projetado R$ 980,00/m³. Mostrar um aviso discreto na tela de preços enquanto houver preço marcado como "exemplo".

== 10. Fora de escopo agora (não construir, mas não impedir no modelo) ==
Suprimentos (requisição → cotação → pedido → recebimento → estoque, no padrão SIECON), frotas/horímetro/manutenção preventiva, logística de mobilização entre obras, RH/apontamento de horas, qualidade/segurança (checklists NR), propostas comerciais, BI avançado, NF-e/contábil, app offline para campo.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://terra-fluxo-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97084409-3515-4a7a-8384-a1cb048ff520).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
