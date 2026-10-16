# Roadmap — ERP MMcosta

## Conferência do commit f5f91d0 e migrações — 13/10/2026
- [x] Confirmar main no commit f5f91d0; alterações 1–4 conferidas pelo histórico e hashes (férias preservadas por compatibilidade); limpeza 5 já executada e zero custos elegíveis; aplicar correção 6, ajustando o alvo para PM Osasco — Morro do Sabão. Somente o apelido incorreto de alojamento foi removido conforme arquivo 6; 28 custos, 16 funcionários e 2 alocações preservados
- [x] Regenerar tipos, recarregar cache, corrigir erros de TypeScript existentes e confirmar build OK; três testes de data/valor passaram

## Segurança das dependências — 13/10/2026
- [x] Atualizar dependências vulneráveis e verificar todas as resoluções no lockfile textual (source-map-js 1.2.2, seroval 1.6.9, js-yaml 4.3.2 e xlsx oficial 0.20.3)
- [x] Executar nova análise de dependências e confirmar compilação e leitura/exportação de planilhas (XLSX, XLS e CSV); distribuição oficial xlsx validada diretamente, pois o scanner não verifica tarballs

## Atualização de 13/10/2026
- [x] Conferir as quatro migrações de 08/10 já aplicadas e executar a limpeza 20261013100000 (212 custos sem alocação removidos)
- [x] Regenerar tipos, confirmar zero custos sem alocação restantes e verificar compilação sem erros

## Migrações de 08/10/2026
- [x] Aplicar 20261008100000, 20261008110000 e 20261008130000; adicionar ferias_limite de 20261008120000 preservando e depreciando as colunas antigas por compatibilidade; atualizar tipos e recarregar o cache do PostgREST

## Etapa 1 — fundação solicitada
- [x] Corrigir convites de usuários, boletins parciais e completar ações dos cadastros
- [x] Incorporar a importação do cliente dentro de Medições e criar o comparativo entre medição interna e recebida
- [x] Reorganizar o topo: Visão geral como início, logo voltando ao início e nova área Obras com os acessos por obra
- [ ] Cloud, autenticação por e-mail, primeiro administrador e gestão de usuários
- [ ] Tabelas desta etapa, segurança por papel, auditoria e centro de custo automático por obra
- [ ] Carga real inicial de clientes, obras, centros, equipamentos, equipes, marcos e caixa
- [ ] Layout responsivo, tema claro/escuro, seletor de obras e oito áreas com estados Em breve
- [ ] Cadastros de clientes, obras, equipamentos, equipes, centros, aliases e categorias
- [ ] Serviços, preços padrão/por obra, vigência, busca de preço e auditoria
- [ ] Boletim móvel com arquivo privado, leitura multimodal, revisão humana e arquivo histórico
- [ ] Medições por período, vínculo de boletins, preços, exportações, status, recebimento e atualização do painel
- [x] Importação de XLSX/XLS/CSV/PDF, mapeamento, identificação por linha, distribuição por obra e histórico
- [x] Validar a medição real de julho do Morro do Sabão no histórico e no comparativo (8 linhas, R$ 328.713,73)
- [x] Validar obrigatórios, formatos, valores inconsistentes e duplicidades; detalhar medições importadas e permitir desfazer com segurança por arquivo
- [ ] Comprovantes com IA, classificação determinística, distribuição por centro, duplicidade, histórico, busca textual, filtros por período/status e ordenação; validação do PDF real aguarda o arquivo
- [x] Documentos da obra com envio múltiplo, progresso, busca, filtros, pré-visualização e permissões por papel
- [x] Revisão de segurança, estados, formatação, celular, modo escuro e Registro de alterações
- [ ] Painel da obra com indicadores, progresso, curva S e fluxo de caixa completo
- [ ] Visão geral consolidada por obra ativa
- [ ] Verificação de cálculos, acessos, telas e segurança
- [x] Aplicar o logo enviado e sua paleta verde-grafite à identidade do sistema e ao ícone do navegador


- [x] Mover Comprovantes para uma seção geral fora das obras, mantendo compras de múltiplos locais.
- [x] Criar visão dos centros de custo de obra e administrativos, com totais e movimentações
- [x] Substituir Equipes por Funcionários, com remuneração, encargos, documentos, alocação e custo diário nos centros de custo
- [x] Reorganizar Comprovantes, Funcionários, Alterações e Serviços e preços
- [x] Simplificar produtos e valores, limpar comprovantes e ajustar cargo e encargos dos funcionários
- [x] Limpar medições, arquivos importados e todos os dados dos painéis, mantendo os cadastros das obras
- [x] Exibir salário, salário com encargos e diária na visão geral de Funcionários
- [x] Ocultar a aba Categorias em Cadastros
- [x] Incluir bônus mensal editável no total e no cálculo da diária dos funcionários
- [x] Aplicar as migrações de permissões do RH, remoção do funcionário teste e exclusão de custos; manter a limpeza geral pendente
- [x] Corrigir a Curva S para incluir marcos finais e concluir automaticamente obras com 100% de avanço
- [x] Validar migrações financeiras, atualizar tipos e eliminar o travamento de Centros de custo

## Integrações de agentes — 13/10/2026
- [x] Ativar acesso OAuth e consentimento com retorno ao login
- [x] Adicionar consultas MCP de obras e medições respeitando permissões
- [x] Adicionar leitura e abertura de obras no navegador; extrair catálogo e validar bloqueio anônimo e retorno ao login
- [ ] Confirmar consentimento completo e consultas com conta real — aguarda login do usuário no preview e republicação
