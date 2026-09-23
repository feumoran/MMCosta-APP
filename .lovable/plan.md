# Validar medição real e tornar Comprovantes uma seção geral

## Resultado
- Importar o PDF real de medição do cliente, conferir obra, linhas e total antes da gravação.
- Confirmar que a medição importada aparece no Comparativo da obra correta.
- Mover Comprovantes para fora de Obras, permitindo tratar compras de múltiplos locais na mesma tela.

## Implementação
- Testar o fluxo completo do PDF autenticado e corrigir somente problemas encontrados na leitura, validação ou comparação.
- Não duplicar a medição 5 já existente: se o arquivo representar um registro já cadastrado, preservar os dados e validar o comparativo de forma segura.
- Criar a página geral `/comprovantes`, atualizar o menu principal e remover o atalho dependente de uma obra.
- Adaptar a tela para não exigir uma obra previamente selecionada; cada comprovante continuará sendo associado ao centro de custo/obra identificado em suas próprias linhas.
- Manter o endereço antigo da obra redirecionando para a nova página, evitando links quebrados.

## Verificação
- Validar obra identificada, quantidade de linhas úteis e total atual de R$ 328.713,73 no PDF.
- Conferir o Comparativo do Morro do Sabão após a importação ou pareamento seguro.
- Testar a página geral de Comprovantes e o redirecionamento antigo em desktop e celular.
