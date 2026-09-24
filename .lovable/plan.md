# Visibilidade dos centros de custo

## Entrega
- Criar uma página protegida “Centros de custo” acessível pelo menu principal.
- Listar centros de obra e administrativos, com busca e filtro por tipo.
- Ao selecionar um centro, mostrar recebimentos, pagamentos e saldo, além do histórico de lançamentos ordenado por data.
- Exibir categoria, descrição, obra relacionada, valor e data; manter os valores no formato brasileiro.
- Adicionar acesso direto “Ver movimentação” na aba de Centros de custo em Cadastros.
- Preservar as permissões atuais: somente quem já pode consultar dados financeiros verá os lançamentos.

## Validação
- Conferir centros ligados a obras e os centros administrativos “Depósito/Manutenção” e “Escritório/Administrativo”.
- Conferir totais e lista de lançamentos, estados vazio, carregamento e erro.
- Verificar a página em computador e celular e confirmar compilação sem erros.

## Detalhes técnicos
- A página consultará `centros_custo`, `lancamentos`, `categorias_lancamento` e `obras` pelo acesso autenticado existente, respeitando RLS.
- Nenhuma tabela, regra financeira ou lançamento será alterado.
