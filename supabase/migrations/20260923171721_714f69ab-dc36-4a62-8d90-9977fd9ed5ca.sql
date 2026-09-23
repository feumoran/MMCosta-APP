DROP POLICY IF EXISTS clientes_read ON public.clientes;
CREATE POLICY clientes_read ON public.clientes FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS equipamentos_read ON public.equipamentos;
CREATE POLICY equipamentos_read ON public.equipamentos FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS boletins_read ON public.boletins;
CREATE POLICY boletins_read ON public.boletins FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS cat_read ON public.categorias_lancamento;
CREATE POLICY cat_read ON public.categorias_lancamento FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS documentos_read ON public.documentos;
CREATE POLICY documentos_read ON public.documentos FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS equipes_read ON public.equipes;
CREATE POLICY equipes_read ON public.equipes FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS servicos_read ON public.servicos;
CREATE POLICY servicos_read ON public.servicos FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS curva_read ON public.curva_planejada;
CREATE POLICY curva_read ON public.curva_planejada FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS obras_read ON public.obras;
CREATE POLICY obras_read ON public.obras FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS medicao_itens_read ON public.medicao_itens;
CREATE POLICY medicao_itens_read ON public.medicao_itens FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS alias_read ON public.cc_aliases;
CREATE POLICY alias_read ON public.cc_aliases FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS boletim_itens_read ON public.boletim_itens;
CREATE POLICY boletim_itens_read ON public.boletim_itens FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS cc_read ON public.centros_custo;
CREATE POLICY cc_read ON public.centros_custo FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS oeq_read ON public.obra_equipes;
CREATE POLICY oeq_read ON public.obra_equipes FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS marcos_read ON public.marcos_avanco;
CREATE POLICY marcos_read ON public.marcos_avanco FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS precos_read ON public.precos_servico;
CREATE POLICY precos_read ON public.precos_servico FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS medicoes_read ON public.medicoes;
CREATE POLICY medicoes_read ON public.medicoes FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS medicao_boletins_read ON public.medicao_boletins;
CREATE POLICY medicao_boletins_read ON public.medicao_boletins FOR SELECT TO authenticated
USING (public.can_manage() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS oe_read ON public.obra_equipamentos;
CREATE POLICY oe_read ON public.obra_equipamentos FOR SELECT TO authenticated
USING (public.can_field() OR public.has_role(auth.uid(), 'leitura'));

DROP POLICY IF EXISTS importacoes_storage_read ON storage.objects;
CREATE POLICY importacoes_storage_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'importacoes' AND public.can_manage());

DROP POLICY IF EXISTS boletins_storage_read ON storage.objects;
CREATE POLICY boletins_storage_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'boletins' AND public.can_field());