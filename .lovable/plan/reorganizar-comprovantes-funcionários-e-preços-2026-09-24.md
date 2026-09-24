# Reorganizar comprovantes, funcionários e preços

## Objetivo
Simplificar o menu e os cadastros, tornar os dados de funcionários diretamente editáveis e permitir que um administrador desfaça com segurança um comprovante lançado por engano.

## Alterações

### Comprovantes
- Adicionar no histórico a ação **Desfazer lançamento**, visível somente para administradores e protegida por confirmação.
- Ao confirmar, localizar exclusivamente os lançamentos vinculados àquela importação e marcá-los como excluídos, sem apagar outros registros.
- Marcar a importação como **Descartada**, registrar quem desfez, quando e quantos lançamentos foram retirados, e manter o arquivo original no histórico para conferência e auditoria.
- Impedir nova tentativa em comprovantes já desfeitos e atualizar imediatamente histórico, totais e centros de custo.
- Aplicar a autorização no banco, não apenas na tela, e aproveitar o registro de alterações já existente para auditar a retirada dos lançamentos.

### Funcionários no menu principal
- Criar a página própria **Funcionários** e adicioná-la ao menu principal.
- Remover Funcionários de dentro de Cadastros, preservando cadastro, alocação e documentação.
- Exibir no cadastro os campos: nome, data de admissão, salário, INSS, FGTS, provisão de férias e provisão de 13º.
- Permitir editar nome, admissão e todos os valores de remuneração no mesmo fluxo.
- Manter **Diária estimada** como valor automático e não editável, calculado pelo custo mensal total dividido pelos dias úteis do mês.
- Manter vigências salariais, recálculo de custos e permissões financeiras já existentes.

### Menu Alterações
- Retirar **Alterações** do menu principal.
- Manter a página e sua proteção administrativa disponíveis por acesso direto, sem reduzir a auditoria do sistema.

### Serviços e preços
- Remover da tela os campos e textos **Serviço comum/Perfuração** e **Periódica/Etapa fechada**.
- Preservar internamente a classificação necessária aos cálculos e às medições existentes.
- Manter, para perfuração, os três preços lado a lado: **Solo**, **Rocha alterada** e **Rocha**.
- Destacar o valor unitário e permitir editar diretamente cada preço, mantendo preço padrão, preço por obra e vigência.
- Não alterar a regra de busca de preço nem os registros existentes.

## Segurança e validação
- A operação de desfazer comprovante será atômica e exclusiva de administrador, validando o tipo e o estado da importação.
- Exclusão será lógica nos lançamentos para preservar histórico e auditoria.
- Valores de salário e percentuais serão validados antes de salvar; a diária será recalculada após alterações.
- Validar os fluxos com conta administrativa, incluindo o reflexo nos centros de custo, além das visualizações em computador e celular.

## Detalhes técnicos
- Criar uma função de banco específica para desfazer importações de comprovantes, com `SECURITY INVOKER`, verificação de papel administrativo e permissões apenas para usuários autenticados.
- Reutilizar o vínculo `lancamentos.importacao_id`, atualizar `deleted_at` nos lançamentos e gravar os metadados do desfazimento em `importacoes.resumo`.
- Criar a rota protegida `/funcionarios`, reutilizando o cadastro existente, e ajustar a navegação e os metadados da página.
