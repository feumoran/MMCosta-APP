# Reorganização de Obras e Comparativo de Medições

## Resultado
- A Visão geral será a página inicial do sistema e o logo sempre voltará para ela.
- O espaço hoje ocupado pelos botões de obras no cabeçalho passará a ter uma aba **Obras**.
- A página Obras reunirá os botões/cartões de cada obra e dará acesso ao respectivo painel.
- **Importar medição** deixará de ser uma seção principal e ficará dentro de **Medições** como a medição recebida do cliente.
- A tela Medições terá um comparativo entre a medição interna da MMcosta e a medição importada do cliente.

## Interface
1. Simplificar o cabeçalho, mantendo logo, data, tema, saída e navegação principal.
2. Criar a rota `/obras` com as obras ativas, seus dados essenciais e acesso ao painel de cada uma.
3. Atualizar os links para usar `/visao-geral` como início e `/obras` como seletor de obra.
4. Organizar Medições em abas:
   - **Nossa medição**: geração por boletins e histórico atual.
   - **Medição do cliente**: importação, revisão e histórico já existentes.
   - **Comparativo**: pares de medições da obra, detalhamento por serviço/categoria e diferenças de quantidade e valor.

## Regras do comparativo
- Comparar apenas registros da obra aberta.
- Separar a origem interna (`boletins` ou `manual`) da origem do cliente (`planilha_importada`).
- Sugerir o par pelo período mais próximo, permitindo selecionar manualmente cada medição.
- Consolidar itens por serviço, categoria e unidade.
- Mostrar valor e quantidade de cada lado, diferença absoluta e percentual.
- Destacar concordâncias, divergências e itens presentes em apenas um lado.
- Não alterar valores, status ou lançamentos a partir do comparativo.

## Detalhes técnicos
- Reutilizar as tabelas `medicoes`, `medicao_itens`, `importacoes` e os controles existentes.
- Manter as permissões atuais: importação somente para Administração/Escritório; leitura conforme as políticas existentes.
- Remover o link principal antigo de importação sem apagar a rota existente, preservando links salvos.
- Adicionar metadados próprios à nova página Obras e validar navegação, telas vazias, celular, modo escuro e sessão autenticada.