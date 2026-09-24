# Funcionários, documentação e custo diário

## Entrega
- Substituir a aba **Equipes** por **Funcionários** em Cadastros e trocar a alocação de equipes nas obras pela alocação individual de funcionários.
- Manter os registros antigos de equipes apenas para preservar o histórico de boletins já gravados; novos cadastros e alocações usarão funcionários.
- Criar cadastro completo de funcionário com nome, data de admissão, salário mensal, percentuais editáveis de INSS, FGTS, provisão de férias e provisão de 13º salário, situação ativa/inativa e centro atual.
- Exibir o custo mensal estimado e a diária aproximada, com memória do cálculo.
- Permitir criar, editar, desativar e consultar cada funcionário, preservando seu histórico financeiro e de alocações.

## Cálculo e alocação
- Calcular o custo mensal estimado como salário + INSS + FGTS + provisão de férias + provisão de 13º, aplicando cada percentual informado sobre o salário.
- Calcular a diária dividindo esse custo mensal pela quantidade real de dias úteis do respectivo mês.
- Gerar um custo em **todos os dias corridos**, inclusive sábados, domingos e feriados, usando a diária calculada para aquele mês conforme solicitado.
- Permitir alocar o funcionário diretamente a uma obra ou a um centro de custo administrativo, com datas de início e fim para manter o histórico.
- Quando não houver alocação vigente, direcionar automaticamente o funcionário ao centro **Depósito/Manutenção**.
- Converter a obra escolhida em seu centro de custo correspondente e lançar o custo diário nesse centro.
- Agrupar esses pagamentos na categoria **Equipe**, com identificação do funcionário e da competência.
- Impedir duplicidade por funcionário e dia; mudanças de salário, percentuais ou alocação valerão pela vigência registrada e não reescreverão custos antigos já consolidados.

## Documentos do funcionário
- Adicionar, dentro de cada funcionário, a aba **Documentação**.
- Organizar arquivos nas categorias: documentos pessoais, contrato, MRs, ASOs e outros.
- Permitir envio múltiplo, consulta, pré-visualização, download e remoção com confirmação.
- Guardar os arquivos em espaço privado e fornecer acesso temporário somente a usuários autorizados.
- Mostrar nome do arquivo, categoria, data de envio e responsável pelo envio.

## Centros de custo
- Incluir os custos automáticos dos funcionários na página **Centros de custo**, junto às demais movimentações.
- Exibir um agrupamento **Equipe** com total do período e detalhamento por funcionário e dia.
- Permitir filtrar as movimentações por período e distinguir custos automáticos de lançamentos manuais.
- Manter os totais de pagamentos e saldo atualizados com esses custos.

## Segurança e consistência
- Restringir salário, encargos, documentos e custos a administração e escritório, seguindo o acesso financeiro atual.
- Manter engenharia sem acesso aos valores financeiros; quando necessário, poderá visualizar somente nome e alocação operacional.
- Aplicar as regras de acesso no banco de dados, não apenas na tela.
- Registrar alterações de cadastro, remuneração, alocação e documentos no histórico administrativo.
- Executar a geração diária de forma automática e repetível, sem criar lançamentos duplicados mesmo após falha ou nova execução.

## Detalhes técnicos
- Criar estruturas separadas para funcionários, histórico remuneratório, alocações, documentos e custos diários, com permissões e acessos explícitos.
- Criar armazenamento privado específico para documentos de funcionários.
- Usar uma rotina diária agendada no banco para materializar os custos até a data corrente; a rotina considerará admissão, desligamento/inativação, vigência salarial e vigência da alocação.
- Vincular cada custo diário ao funcionário e à alocação que o originaram para auditoria e consulta.
- Preservar as tabelas antigas de equipes e seus vínculos para não quebrar boletins históricos.

## Validação
- Cadastrar um funcionário e conferir salário, percentuais, custo mensal e diária em meses com quantidades diferentes de dias úteis.
- Testar alocação em obra, centro administrativo e retorno automático ao Depósito/Manutenção.
- Confirmar geração em dia útil e fim de semana, sem duplicidade após executar novamente a rotina.
- Alterar salário e alocação e verificar que cada período mantém o valor e o centro corretos.
- Enviar, visualizar, baixar e remover documentos em todas as categorias.
- Conferir os totais agrupados como Equipe nos centros de custo e testar as restrições por papel.
