-- funcionario_custos_diarios nunca teve política de DELETE: mesmo o admin não conseguia
-- excluir um funcionário pela tela, porque a exclusão dos custos diários gerados
-- automaticamente era bloqueada pelo RLS (e travava a exclusão do funcionário por FK).
DROP POLICY IF EXISTS funcionario_custos_delete ON public.funcionario_custos_diarios;
CREATE POLICY funcionario_custos_delete ON public.funcionario_custos_diarios FOR DELETE TO authenticated
  USING (public.can_manage() OR public.has_role(auth.uid(),'engenharia'));
