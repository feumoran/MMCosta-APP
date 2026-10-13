-- Preserve RH reads, INSERT-based calculated generation and existing deletion flows.
-- Engineering must not directly change stored daily cost totals or allocation keys.
ALTER POLICY funcionario_custos_update ON public.funcionario_custos_diarios
  USING (public.can_manage())
  WITH CHECK (public.can_manage());
COMMENT ON POLICY funcionario_custos_update ON public.funcionario_custos_diarios IS
  'Direct cost updates are restricted to admin/escritorio; engineering uses the server-derived INSERT-only cost generation RPC.';