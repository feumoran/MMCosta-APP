# ERP MMcosta Engenharia

## Objetivo
Construir o sistema interno em português para transformar boletins e comprovantes enviados pelo escritório em medições, lançamentos e painéis confiáveis por obra, com revisão humana obrigatória.

## Entrega proposta

### 1. Fundação segura
- Ativar login por e-mail e senha e criar a entrada protegida do sistema.
- Criar a estrutura completa de dados, papéis separados, regras de acesso e primeiro usuário administrador.
- Criar os quatro espaços privados de arquivos e downloads temporários.
- Registrar alterações de boletins, medições, preços e lançamentos na auditoria.
- Carregar os clientes, obras, centros, equipamentos, equipes, marcos, medições, despesas, categorias e preços de exemplo informados.

### 2. Estrutura de uso
- Barra superior com marca, obra ativa, data e alternância claro/escuro.
- Menu completo, mantendo a obra na URL para links compartilháveis.
- Telas separadas para visão geral, obra, boletins, medições, importação, comprovantes, documentos e cadastros.
- Permissões visíveis e efetivas para diretoria, escritório, engenharia e leitura.

### 3. Painéis e caixa
- Indicadores de faturado, recebido, pago, saldo, a receber, avanço físico, financeiro e prazo.
- Status Em dia, Atenção, Atrasado ou Concluída conforme as faixas definidas.
- Curva S semanal planejada e realizada, com alternativa automática quando faltarem pontos planejados.
- Aviso da obra Morro do Sabão sobre as medições 1–2 sem valor informado.
- Lançamentos por centro de custo, proteção contra exclusão acidental e valores ocultos para engenharia.

### 4. Boletins e medições
- Upload móvel de foto/PDF, leitura assistida, confiança por campo e correção manual.
- Separação obrigatória de solo, rocha alterada e rocha para perfuração.
- Confirmação do boletim antes de gerar dados definitivos.
- Geração de medição por período, agrupamento, busca de preço vigente e bloqueio de faturamento duplicado.
- Fluxo rascunho → emitida → aprovada → recebida, com itens sem preço destacados.

### 5. Importações e comprovantes
- Leitura no navegador de XLSX/XLS/CSV e preparação de PDFs digitais ou escaneados.
- Mapeamento de colunas revisável, distribuição por obra e exportação XLSX/CSV brasileiro.
- Extração de prestação de contas, conferência do total, classificação determinística e sugestão assistida.
- Casamento por aliases, nomes e palavras; aprendizado ao corrigir centro de custo.
- Possíveis duplicidades desmarcadas e itens não identificados bloqueados até revisão.

### 6. Cadastros e documentos
- Clientes, obras, equipamentos, equipes, serviços, preços, centros de custo e usuários.
- Aviso persistente enquanto existirem preços marcados como exemplo.
- Documentos privados por obra, com categorias e download temporário.

## Validação
- Conferir totais iniciais, inclusive R$ 895.674,63 faturados no Morro do Sabão.
- Testar cada papel de usuário e confirmar que engenharia não recebe valores financeiros.
- Testar o fluxo completo de um boletim e de uma prestação de contas, sempre com revisão antes da gravação.
- Verificar telas em computador e celular, modo escuro, formatos brasileiros e ausência de sobreposição.
- Verificar regras de segurança, arquivos privados, erros de execução e compilação.

## Detalhes técnicos
- O projeto usa a base TanStack Start atual; novas rotinas internas serão funções protegidas do servidor.
- Valores serão `numeric(14,2)` e quantidades `numeric(14,3)`, com exclusão lógica nos registros financeiros.
- A leitura assistida usará Lovable AI apenas no servidor, saída estruturada validada e mensagens específicas para limite ou créditos.
- A implementação será dividida em etapas internas, mas a navegação e o modelo já nascerão preparados para todos os módulos listados.
