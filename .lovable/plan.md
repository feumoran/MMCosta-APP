# Simplificar preços, limpar comprovantes e ajustar funcionários

## Serviços e Preços
- Transformar a área em uma tabela prática de **produto, unidade e valor**, removendo da tela o cadastro e a exibição de palavras-chave.
- Manter os três valores necessários para perfuração: Solo, Rocha alterada e Rocha.
- Exibir ação clara de editar em cada preço e abrir o valor atual no formulário para alteração.
- Permitir salvar o novo valor, mantendo as regras atuais de preço padrão, preço por obra e vigência nos bastidores.
- Validar valor positivo e informar sucesso ou erro em português.

## Comprovantes
- Fazer uma limpeza definitiva de todos os comprovantes já importados.
- Excluir somente os lançamentos vinculados a importações de comprovantes, sem atingir medições ou lançamentos manuais.
- Remover também o histórico dessas importações e seus arquivos privados.
- Preservar categorias, centros de custo e apelidos aprendidos, pois são cadastros reutilizáveis.
- Confirmar após a limpeza que não restaram comprovantes nem lançamentos associados.

## Funcionários
- Adicionar o campo obrigatório **Cargo** ao cadastro e à edição.
- Remover **Observações** do formulário e da visualização.
- Ocultar os campos de encargos e aplicar automaticamente: INSS 12%, FGTS 8%, férias 11,11% e 13º 8,33%.
- Atualizar os funcionários existentes para esses percentuais e recalcular seus custos diários já gerados.
- Garantir que o INSS de 12% participe do custo mensal e da diária estimada.
- Organizar a tabela geral nas colunas: **Nome, Cargo, Alocação, Diária estimada e Status**, mantendo as ações de editar, ativar/desativar e excluir.
- Manter salário e data de admissão editáveis; a diária continuará calculada automaticamente pelos encargos e dias úteis.

## Segurança e validação
- Restringir alterações financeiras e a limpeza definitiva aos papéis já autorizados, com a limpeza executada de forma controlada.
- Atualizar a estrutura de dados e os tipos usados pela aplicação para o novo campo Cargo.
- Conferir as três áreas em computador e celular, validar edição de preço, cálculo de funcionário e ausência dos comprovantes removidos.
- Executar a verificação de segurança e confirmar que a aplicação termina sem erros.
