# Corrigir Curva S e conclusão automática da obra

## Resultado
- Exibir corretamente a Curva S do Mercadão, incluindo o marco final de 100% mesmo quando a duração não fecha semanas completas.
- Considerar a obra concluída quando o avanço físico chegar a 100%.

## Alterações
1. Ajustar a geração da curva para sempre incluir as datas dos marcos e a data final da obra, além dos pontos semanais.
2. Usar os dados planejados cadastrados quando existirem e manter a curva automática como alternativa.
3. Ao salvar um avanço físico de 100%, atualizar o status da obra para **Concluída**; ao reduzir um marco final anteriormente concluído, manter o status coerente com o último avanço.
4. Exibir o selo **Concluída** sempre que o avanço físico estiver em 100%, inclusive na Visão geral.

## Validação
- Conferir o Mercadão com seu marco de 20/05/2026 em 100% e a Curva S chegando ao ponto final.
- Confirmar o status concluído no painel e na Visão geral.
- Verificar compilação e ausência de erros na tela.
