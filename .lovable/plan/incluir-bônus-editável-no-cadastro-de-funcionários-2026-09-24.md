# Incluir bônus editável no cadastro de funcionários

## Cadastro e visualização
- Adicionar o campo monetário opcional **Bônus** no cadastro e na edição do funcionário, com valor inicial de R$ 0,00.
- Manter o bônus editável tanto no formulário principal quanto em **Cadastro e custo** dentro do funcionário.
- Exibir o bônus na tabela geral, junto de Salário, Salário com encargos e provisões e Diária estimada.
- Validar o valor como número não negativo e usar a formatação brasileira.

## Regra de cálculo
- Calcular encargos e provisões somente sobre o salário: INSS 12% + FGTS 8% + férias 11,11% + 13º 8,33%.
- Somar o bônus depois desses encargos:
  - **Total mensal = salário + encargos e provisões + bônus**
  - **Diária estimada = total mensal ÷ dias úteis do mês**
- Atualizar a prévia da diária imediatamente enquanto salário ou bônus forem editados.

## Banco e centros de custo
- Acrescentar o bônus mensal à remuneração com padrão zero, preservando os registros existentes.
- Atualizar a geração dos custos diários para usar o total com bônus, refletindo corretamente o valor agrupado como equipe no centro de custo.
- Manter as permissões atuais: valores financeiros visíveis e editáveis somente por administrador e escritório.

## Validação
- Cadastrar um funcionário de teste com salário e bônus, confirmar os totais e a diária na lista e no detalhe.
- Editar o bônus e confirmar que os custos são recalculados.
- Validar Funcionários e Centros de custo em tela ampla e celular, sem erros, e remover o registro de teste ao final.
