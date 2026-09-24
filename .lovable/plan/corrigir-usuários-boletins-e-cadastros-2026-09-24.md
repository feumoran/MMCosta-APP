# Corrigir usuários, boletins e cadastros

## Entrega
- Tornar o convite de usuário consistente: registrar perfil e papel mesmo quando o endereço já existir, validar cada gravação e mostrar confirmação ou erro claro na tela.
- Permitir editar o papel e remover usuários com segurança, mantendo a administração exclusiva para administradores.
- Remover as exigências de preenchimento completo na confirmação de boletins. Campos vazios serão arquivados como vazios; somente arquivo, tipo e uma data válida continuarão necessários para identificar o boletim.
- Completar as ações de incluir, editar e excluir/desativar nas abas de Cadastros, incluindo obras, serviços, preços, clientes, equipamentos, equipes, centros de custo, categorias e apelidos.
- Exibir mensagens de sucesso e falha em todas essas ações e atualizar as listas imediatamente.

## Segurança e consistência
- Manter as permissões atuais por papel e executar operações administrativas de usuários somente após validar o administrador no servidor.
- Usar confirmação antes de exclusões e informar quando um item não puder ser removido por possuir vínculos; nesse caso, continuará disponível a desativação.
- Não alterar medições, painel, comprovantes ou documentos.

## Validação
- Testar convite com usuário novo e endereço já existente, atualização de papel e remoção.
- Confirmar um boletim parcialmente preenchido e verificar seu histórico.
- Exercitar inclusão, edição, desativação/ativação e exclusão nos cadastros sem erros de tela.
