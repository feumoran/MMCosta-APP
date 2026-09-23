# Comprovantes, documentos e revisão geral

## Objetivo
Concluir as áreas de comprovantes e documentos, aplicar as permissões por papel e entregar a auditoria administrativa sem alterar os fluxos já funcionais.

## Implementação
1. **Comprovantes (caixa)**
   - Envio privado de PDF, imagem, XLSX ou CSV, mantendo o original.
   - Leitura de PDFs com texto no navegador; imagens e páginas escaneadas seguem para análise multimodal no servidor.
   - Extração estruturada de funcionário, caixa, total e itens; erros e limites de uso aparecem em português.
   - Importação de planilhas com confirmação de colunas.
   - Casamento determinístico de centro de custo por apelido, nome e referências de obra/cliente.
   - Classificação por descrição antes do motivo, incluindo as exceções de manutenção e alojamento informadas.
   - Prévia editável com conferência de totais, duplicidades, itens pendentes e resumo por centro.
   - Distribuição de pagamentos, aprendizado de apelidos, histórico, detalhe e download do original.
   - Busca textual, filtros por período e status e ordenação na tabela de comprovantes.
   - Valores de caixa ocultos para Engenharia e acesso de escrita restrito a Admin/Escritório.

2. **Documentos da obra**
   - Envio múltiplo de qualquer tipo, categoria e progresso por arquivo.
   - Lista com busca, filtro, tipo/extensão, tamanho, data e autor.
   - Download por endereço temporário e pré-visualização de imagens/PDFs.
   - Engenharia pode enviar e baixar; Leitura apenas baixa; remoção somente Admin/Escritório.

3. **Cadastros e auditoria**
   - Total gasto nos centros administrativos.
   - Tela “Registro de alterações” somente para Admin, com filtros por tabela, usuário e período.
   - Link administrativo condicionado ao papel.

4. **Segurança e qualidade**
   - Revisar e corrigir regras de acesso do banco e dos arquivos privados; manter IA e chaves somente no servidor.
   - Estados vazios, carregamento, erros em português e confirmações nas novas áreas.
   - Padronizar moeda, datas e números tabulares nas telas alteradas.
   - Conferir tema escuro e telas móveis de Boletim, Comprovantes e Painel.
   - Executar verificação de segurança, compilação e testes de navegação/permissão possíveis com as contas disponíveis.

## Validação do arquivo real
Quando `CX_BOY_21082026_16092026 (COMPROVANTES.pdf)` estiver anexado, validar: 32 itens, R$ 1.351,33 total, distribuição 30/R$ 1.287,33 para Morro do Sabão, R$ 58,00 para Depósito/Manutenção e R$ 6,00 para Escritório/Administrativo.
