-- Fase 2 — Reestrutura o boletim para os três formulários de papel reais da MMcosta
-- (Estaca Raiz, Injeção/Tirante, Concreto Projetado), substituindo o modelo genérico.

CREATE TYPE public.boletim_tipo AS ENUM ('estaca_raiz','injecao_tirante','concreto_projetado');
CREATE TYPE public.boletim_item_origem AS ENUM ('trecho_perfuracao','injecao_estaca','injecao_tirante','material_concreto');

-- Cabeçalho comum: adapta a tabela genérica existente para o novo modelo.
ALTER TABLE public.boletins ADD COLUMN tipo public.boletim_tipo;
UPDATE public.boletins SET tipo='estaca_raiz' WHERE tipo IS NULL;
ALTER TABLE public.boletins ALTER COLUMN tipo SET NOT NULL;
ALTER TABLE public.boletins ADD COLUMN contratante text;
ALTER TABLE public.boletins ADD COLUMN local text;
ALTER TABLE public.boletins ADD COLUMN encarregado text;
ALTER TABLE public.boletins ADD COLUMN revisado_por uuid;
ALTER TABLE public.boletins RENAME COLUMN confirmado_em TO revisado_em;
ALTER TABLE public.boletins DROP COLUMN IF EXISTS horas_trabalhadas;
ALTER TABLE public.boletins DROP COLUMN IF EXISTS horas_paradas;
ALTER TABLE public.boletins DROP COLUMN IF EXISTS motivo_parada;
ALTER TABLE public.boletins DROP COLUMN IF EXISTS equipamento_texto;
ALTER TABLE public.boletins DROP COLUMN IF EXISTS equipe_texto;
ALTER TABLE public.boletins ALTER COLUMN equipamento_id DROP NOT NULL;
ALTER TABLE public.boletins ALTER COLUMN equipe_id DROP NOT NULL;

ALTER TABLE public.boletim_itens ADD COLUMN origem public.boletim_item_origem;

-- Boletim de Estaca Raiz -------------------------------------------------
CREATE TABLE public.boletim_estaca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_id uuid NOT NULL UNIQUE REFERENCES public.boletins(id) ON DELETE CASCADE,
  apoio_encontro text,
  bloco text,
  estaca text,
  diametro_mm numeric(8,2),
  carga text,
  comprimento_projeto_m numeric(8,2),
  perfuracao_data_inicio date,
  perfuracao_data_termino date,
  perfuracao_hora_inicio time,
  perfuracao_hora_termino time,
  revestimento_pol_mm text,
  trecho_revestido_m numeric(8,2),
  trecho_nao_revestido_m numeric(8,2),
  inclinada_graus numeric(6,2),
  lavagem_agua boolean NOT NULL DEFAULT false,
  lavagem_polimero boolean NOT NULL DEFAULT false,
  lavagem_ar_comprimido boolean NOT NULL DEFAULT false,
  camisa_perdida_pol text,
  injecao_data_inicio date,
  injecao_data_termino date,
  injecao_hora_inicio time,
  injecao_hora_termino time,
  injecao_cimento_sc numeric(10,2),
  injecao_areia_l numeric(10,2),
  armacao_longitudinal_diametro_cm text,
  armacao_longitudinal_comprimento_m numeric(8,2),
  armacao_transversal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_estaca TO authenticated;
GRANT ALL ON public.boletim_estaca TO service_role;
ALTER TABLE public.boletim_estaca ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_estaca_read ON public.boletim_estaca FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_estaca_insert ON public.boletim_estaca FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_estaca_update ON public.boletim_estaca FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_estaca_delete ON public.boletim_estaca FOR DELETE TO authenticated USING (public.can_manage());
CREATE TRIGGER set_boletim_estaca_updated BEFORE UPDATE ON public.boletim_estaca FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.boletim_estaca_trecho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_estaca_id uuid NOT NULL REFERENCES public.boletim_estaca(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  profundidade_de_m numeric(8,2) NOT NULL,
  profundidade_a_m numeric(8,2) NOT NULL,
  classificacao_solo text,
  categoria_perfuracao public.categoria_perfuracao,
  diametro_mm numeric(8,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CHECK (profundidade_a_m > profundidade_de_m)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_estaca_trecho TO authenticated;
GRANT ALL ON public.boletim_estaca_trecho TO service_role;
ALTER TABLE public.boletim_estaca_trecho ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_estaca_trecho_read ON public.boletim_estaca_trecho FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_estaca_trecho_insert ON public.boletim_estaca_trecho FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_estaca_trecho_update ON public.boletim_estaca_trecho FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_estaca_trecho_delete ON public.boletim_estaca_trecho FOR DELETE TO authenticated USING (public.can_field());
CREATE TRIGGER set_boletim_estaca_trecho_updated BEFORE UPDATE ON public.boletim_estaca_trecho FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX boletim_estaca_trecho_idx ON public.boletim_estaca_trecho(boletim_estaca_id, ordem);

-- Boletim de Injeção (Tirante) --------------------------------------------
CREATE TABLE public.boletim_tirante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_id uuid NOT NULL UNIQUE REFERENCES public.boletins(id) ON DELETE CASCADE,
  perfuracao_data date,
  perfuracao_hora_inicio time,
  perfuracao_hora_termino time,
  inclinacao_p_baixo_graus numeric(6,2),
  perfuracao_profundidade_m numeric(8,2),
  perfuracao_terreno text,
  perfuracao_categoria public.categoria_perfuracao,
  perfuracao_observacoes text,
  tirante_data_instalacao date,
  tirante_armacao text,
  tirante_comprimento_m numeric(8,2),
  tirante_trecho_livre_m numeric(8,2),
  tirante_trecho_ancorado_m numeric(8,2),
  tirante_numero_manchetes integer,
  tirante_observacoes text,
  bainha_data date,
  bainha_hora_inicio time,
  bainha_hora_termino time,
  bainha_traco_ac text,
  bainha_pressao_kg_cm numeric(8,2),
  bainha_duracao_min numeric(8,2),
  bainha_cimento_kg numeric(10,2),
  bainha_observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_tirante TO authenticated;
GRANT ALL ON public.boletim_tirante TO service_role;
ALTER TABLE public.boletim_tirante ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_tirante_read ON public.boletim_tirante FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_tirante_insert ON public.boletim_tirante FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_tirante_update ON public.boletim_tirante FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_tirante_delete ON public.boletim_tirante FOR DELETE TO authenticated USING (public.can_manage());
CREATE TRIGGER set_boletim_tirante_updated BEFORE UPDATE ON public.boletim_tirante FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.boletim_tirante_fase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_tirante_id uuid NOT NULL REFERENCES public.boletim_tirante(id) ON DELETE CASCADE,
  fase_numero smallint NOT NULL CHECK (fase_numero BETWEEN 1 AND 3),
  dia date,
  hora time,
  leituras_manchete jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (boletim_tirante_id, fase_numero)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_tirante_fase TO authenticated;
GRANT ALL ON public.boletim_tirante_fase TO service_role;
ALTER TABLE public.boletim_tirante_fase ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_tirante_fase_read ON public.boletim_tirante_fase FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_tirante_fase_insert ON public.boletim_tirante_fase FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_tirante_fase_update ON public.boletim_tirante_fase FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_tirante_fase_delete ON public.boletim_tirante_fase FOR DELETE TO authenticated USING (public.can_field());
CREATE TRIGGER set_boletim_tirante_fase_updated BEFORE UPDATE ON public.boletim_tirante_fase FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Boletim de Concreto Projetado --------------------------------------------
CREATE TABLE public.boletim_concreto_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boletim_id uuid NOT NULL REFERENCES public.boletins(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  data date,
  material_aplicado text NOT NULL,
  unidade text NOT NULL,
  quantidade numeric(14,3) NOT NULL CHECK (quantidade > 0),
  numero_nf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boletim_concreto_item TO authenticated;
GRANT ALL ON public.boletim_concreto_item TO service_role;
ALTER TABLE public.boletim_concreto_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY boletim_concreto_item_read ON public.boletim_concreto_item FOR SELECT TO authenticated USING (true);
CREATE POLICY boletim_concreto_item_insert ON public.boletim_concreto_item FOR INSERT TO authenticated WITH CHECK (public.can_field());
CREATE POLICY boletim_concreto_item_update ON public.boletim_concreto_item FOR UPDATE TO authenticated USING (public.can_field()) WITH CHECK (public.can_field());
CREATE POLICY boletim_concreto_item_delete ON public.boletim_concreto_item FOR DELETE TO authenticated USING (public.can_field());
CREATE TRIGGER set_boletim_concreto_item_updated BEFORE UPDATE ON public.boletim_concreto_item FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX boletim_concreto_item_idx ON public.boletim_concreto_item(boletim_id, ordem);
