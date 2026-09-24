# Limpeza de medições e painéis, ajustes em Funcionários e Cadastros

## Resultado
- Manter os cadastros das três obras, seus clientes, contratos, datas e demais cadastros estruturais.
- Zerar todos os dados que alimentam os painéis das obras.
- Apagar integralmente medições internas e do cliente, inclusive histórico e arquivos importados.
- Ampliar a visão geral de Funcionários com salário, salário com encargos e diária estimada.
- Remover a aba **Categorias** da área Cadastros.

## Limpeza definitiva
1. Remover os vínculos entre medições e boletins e os itens de cada medição.
2. Remover todas as medições, inclusive registros já cancelados.
3. Remover os lançamentos financeiros vinculados às obras, incluindo recebimentos ligados às medições e lançamentos manuais dos painéis.
4. Remover os marcos de avanço e a curva planejada, zerando avanço físico, financeiro e Curva S.
5. Remover as importações do tipo medição e seus arquivos originais do armazenamento privado.
6. Preservar obras, clientes, contratos, centros de custo, funcionários, alocações, documentos, produtos, preços e dados administrativos não vinculados aos painéis das obras.
7. Executar a limpeza em ordem segura para não deixar registros órfãos e conferir que todas as contagens ficaram zeradas.

## Funcionários
- Na tabela geral, usar as colunas: **Nome**, **Cargo**, **Alocação**, **Salário**, **Salário com encargos e provisões**, **Diária estimada**, **Status** e **Ações**.
- Calcular o valor com encargos usando os percentuais fixos atuais: INSS 12%, FGTS 8%, férias 11,11% e 13º 8,33%.
- Calcular a diária estimada a partir do salário com encargos dividido pelos dias úteis do mês atual.
- Manter os valores financeiros visíveis apenas para Administração e Escritório, preservando a restrição atual para Engenharia.
- Exibir valores em reais e manter as ações atuais de edição, alocação e documentação.

## Cadastros
- Retirar **Categorias** da lista de abas e do conteúdo visível em Cadastros.
- Preservar as categorias existentes no banco, pois continuam sendo usadas internamente em lançamentos e históricos.
- Manter as demais abas e funcionalidades sem alteração.

## Validação
- Confirmar que Medições, Medição do cliente e Comparativo abrem vazios em todas as obras.
- Confirmar que os painéis mantêm o nome e os dados contratuais das obras, mas exibem avanço, faturado, recebido, pago, saldo, a receber e fluxo de caixa zerados.
- Confirmar que não restaram históricos nem arquivos de importações de medição.
- Conferir os três valores financeiros de cada funcionário em tela grande e celular, respeitando os acessos por papel.
- Confirmar que a aba Categorias não aparece e que as demais abas de Cadastros continuam funcionando.
