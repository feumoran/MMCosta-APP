export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          acao: string
          criado_em: string
          dados_antes: Json | null
          dados_depois: Json | null
          id: string
          registro_id: string
          tabela: string
          user_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          registro_id: string
          tabela: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          registro_id?: string
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      boletim_itens: {
        Row: {
          boletim_id: string
          categoria_perfuracao:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          confianca: Json | null
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          origem: Database["public"]["Enums"]["boletim_item_origem"] | null
          quantidade: number
          servico_id: string | null
          unidade: string
          updated_at: string
        }
        Insert: {
          boletim_id: string
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          confianca?: Json | null
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          origem?: Database["public"]["Enums"]["boletim_item_origem"] | null
          quantidade: number
          servico_id?: string | null
          unidade: string
          updated_at?: string
        }
        Update: {
          boletim_id?: string
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          confianca?: Json | null
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          origem?: Database["public"]["Enums"]["boletim_item_origem"] | null
          quantidade?: number
          servico_id?: string | null
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_itens_boletim_id_fkey"
            columns: ["boletim_id"]
            isOneToOne: false
            referencedRelation: "boletins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletim_itens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      boletins: {
        Row: {
          arquivo_path: string
          arquivo_tipo: string
          confianca_ia: Json | null
          contratante: string | null
          created_at: string
          created_by: string | null
          data: string
          encarregado: string | null
          equipamento_id: string | null
          equipe_id: string | null
          extracao_ia: Json | null
          id: string
          local: string | null
          obra_id: string
          observacoes: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: Database["public"]["Enums"]["boletim_status"]
          tipo: Database["public"]["Enums"]["boletim_tipo"]
          updated_at: string
        }
        Insert: {
          arquivo_path: string
          arquivo_tipo: string
          confianca_ia?: Json | null
          contratante?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          encarregado?: string | null
          equipamento_id?: string | null
          equipe_id?: string | null
          extracao_ia?: Json | null
          id?: string
          local?: string | null
          obra_id: string
          observacoes?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["boletim_status"]
          tipo: Database["public"]["Enums"]["boletim_tipo"]
          updated_at?: string
        }
        Update: {
          arquivo_path?: string
          arquivo_tipo?: string
          confianca_ia?: Json | null
          contratante?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          encarregado?: string | null
          equipamento_id?: string | null
          equipe_id?: string | null
          extracao_ia?: Json | null
          id?: string
          local?: string | null
          obra_id?: string
          observacoes?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["boletim_status"]
          tipo?: Database["public"]["Enums"]["boletim_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletins_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletins_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletins_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      boletim_estaca: {
        Row: {
          apoio_encontro: string | null
          armacao_longitudinal_comprimento_m: number | null
          armacao_longitudinal_diametro_cm: string | null
          armacao_transversal: string | null
          bloco: string | null
          boletim_id: string
          camisa_perdida_pol: string | null
          carga: string | null
          comprimento_projeto_m: number | null
          created_at: string
          created_by: string | null
          diametro_mm: number | null
          estaca: string | null
          id: string
          inclinada_graus: number | null
          injecao_areia_l: number | null
          injecao_cimento_sc: number | null
          injecao_data_inicio: string | null
          injecao_data_termino: string | null
          injecao_hora_inicio: string | null
          injecao_hora_termino: string | null
          lavagem_agua: boolean
          lavagem_ar_comprimido: boolean
          lavagem_polimero: boolean
          perfuracao_data_inicio: string | null
          perfuracao_data_termino: string | null
          perfuracao_hora_inicio: string | null
          perfuracao_hora_termino: string | null
          revestimento_pol_mm: string | null
          trecho_nao_revestido_m: number | null
          trecho_revestido_m: number | null
          updated_at: string
        }
        Insert: {
          apoio_encontro?: string | null
          armacao_longitudinal_comprimento_m?: number | null
          armacao_longitudinal_diametro_cm?: string | null
          armacao_transversal?: string | null
          bloco?: string | null
          boletim_id: string
          camisa_perdida_pol?: string | null
          carga?: string | null
          comprimento_projeto_m?: number | null
          created_at?: string
          created_by?: string | null
          diametro_mm?: number | null
          estaca?: string | null
          id?: string
          inclinada_graus?: number | null
          injecao_areia_l?: number | null
          injecao_cimento_sc?: number | null
          injecao_data_inicio?: string | null
          injecao_data_termino?: string | null
          injecao_hora_inicio?: string | null
          injecao_hora_termino?: string | null
          lavagem_agua?: boolean
          lavagem_ar_comprimido?: boolean
          lavagem_polimero?: boolean
          perfuracao_data_inicio?: string | null
          perfuracao_data_termino?: string | null
          perfuracao_hora_inicio?: string | null
          perfuracao_hora_termino?: string | null
          revestimento_pol_mm?: string | null
          trecho_nao_revestido_m?: number | null
          trecho_revestido_m?: number | null
          updated_at?: string
        }
        Update: {
          apoio_encontro?: string | null
          armacao_longitudinal_comprimento_m?: number | null
          armacao_longitudinal_diametro_cm?: string | null
          armacao_transversal?: string | null
          bloco?: string | null
          boletim_id?: string
          camisa_perdida_pol?: string | null
          carga?: string | null
          comprimento_projeto_m?: number | null
          created_at?: string
          created_by?: string | null
          diametro_mm?: number | null
          estaca?: string | null
          id?: string
          inclinada_graus?: number | null
          injecao_areia_l?: number | null
          injecao_cimento_sc?: number | null
          injecao_data_inicio?: string | null
          injecao_data_termino?: string | null
          injecao_hora_inicio?: string | null
          injecao_hora_termino?: string | null
          lavagem_agua?: boolean
          lavagem_ar_comprimido?: boolean
          lavagem_polimero?: boolean
          perfuracao_data_inicio?: string | null
          perfuracao_data_termino?: string | null
          perfuracao_hora_inicio?: string | null
          perfuracao_hora_termino?: string | null
          revestimento_pol_mm?: string | null
          trecho_nao_revestido_m?: number | null
          trecho_revestido_m?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_estaca_boletim_id_fkey"
            columns: ["boletim_id"]
            isOneToOne: true
            referencedRelation: "boletins"
            referencedColumns: ["id"]
          },
        ]
      }
      boletim_estaca_trecho: {
        Row: {
          boletim_estaca_id: string
          categoria_perfuracao:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          classificacao_solo: string | null
          created_at: string
          created_by: string | null
          diametro_mm: number | null
          id: string
          ordem: number
          profundidade_a_m: number
          profundidade_de_m: number
          updated_at: string
        }
        Insert: {
          boletim_estaca_id: string
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          classificacao_solo?: string | null
          created_at?: string
          created_by?: string | null
          diametro_mm?: number | null
          id?: string
          ordem?: number
          profundidade_a_m: number
          profundidade_de_m: number
          updated_at?: string
        }
        Update: {
          boletim_estaca_id?: string
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          classificacao_solo?: string | null
          created_at?: string
          created_by?: string | null
          diametro_mm?: number | null
          id?: string
          ordem?: number
          profundidade_a_m?: number
          profundidade_de_m?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_estaca_trecho_boletim_estaca_id_fkey"
            columns: ["boletim_estaca_id"]
            isOneToOne: false
            referencedRelation: "boletim_estaca"
            referencedColumns: ["id"]
          },
        ]
      }
      boletim_tirante: {
        Row: {
          bainha_cimento_kg: number | null
          bainha_data: string | null
          bainha_duracao_min: number | null
          bainha_hora_inicio: string | null
          bainha_hora_termino: string | null
          bainha_observacoes: string | null
          bainha_pressao_kg_cm: number | null
          bainha_traco_ac: string | null
          boletim_id: string
          created_at: string
          created_by: string | null
          id: string
          inclinacao_p_baixo_graus: number | null
          perfuracao_categoria:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          perfuracao_data: string | null
          perfuracao_hora_inicio: string | null
          perfuracao_hora_termino: string | null
          perfuracao_observacoes: string | null
          perfuracao_profundidade_m: number | null
          perfuracao_terreno: string | null
          tirante_armacao: string | null
          tirante_comprimento_m: number | null
          tirante_data_instalacao: string | null
          tirante_numero_manchetes: number | null
          tirante_observacoes: string | null
          tirante_trecho_ancorado_m: number | null
          tirante_trecho_livre_m: number | null
          updated_at: string
        }
        Insert: {
          bainha_cimento_kg?: number | null
          bainha_data?: string | null
          bainha_duracao_min?: number | null
          bainha_hora_inicio?: string | null
          bainha_hora_termino?: string | null
          bainha_observacoes?: string | null
          bainha_pressao_kg_cm?: number | null
          bainha_traco_ac?: string | null
          boletim_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          inclinacao_p_baixo_graus?: number | null
          perfuracao_categoria?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          perfuracao_data?: string | null
          perfuracao_hora_inicio?: string | null
          perfuracao_hora_termino?: string | null
          perfuracao_observacoes?: string | null
          perfuracao_profundidade_m?: number | null
          perfuracao_terreno?: string | null
          tirante_armacao?: string | null
          tirante_comprimento_m?: number | null
          tirante_data_instalacao?: string | null
          tirante_numero_manchetes?: number | null
          tirante_observacoes?: string | null
          tirante_trecho_ancorado_m?: number | null
          tirante_trecho_livre_m?: number | null
          updated_at?: string
        }
        Update: {
          bainha_cimento_kg?: number | null
          bainha_data?: string | null
          bainha_duracao_min?: number | null
          bainha_hora_inicio?: string | null
          bainha_hora_termino?: string | null
          bainha_observacoes?: string | null
          bainha_pressao_kg_cm?: number | null
          bainha_traco_ac?: string | null
          boletim_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          inclinacao_p_baixo_graus?: number | null
          perfuracao_categoria?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          perfuracao_data?: string | null
          perfuracao_hora_inicio?: string | null
          perfuracao_hora_termino?: string | null
          perfuracao_observacoes?: string | null
          perfuracao_profundidade_m?: number | null
          perfuracao_terreno?: string | null
          tirante_armacao?: string | null
          tirante_comprimento_m?: number | null
          tirante_data_instalacao?: string | null
          tirante_numero_manchetes?: number | null
          tirante_observacoes?: string | null
          tirante_trecho_ancorado_m?: number | null
          tirante_trecho_livre_m?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_tirante_boletim_id_fkey"
            columns: ["boletim_id"]
            isOneToOne: true
            referencedRelation: "boletins"
            referencedColumns: ["id"]
          },
        ]
      }
      boletim_tirante_fase: {
        Row: {
          boletim_tirante_id: string
          created_at: string
          created_by: string | null
          dia: string | null
          fase_numero: number
          hora: string | null
          id: string
          leituras_manchete: Json
          updated_at: string
        }
        Insert: {
          boletim_tirante_id: string
          created_at?: string
          created_by?: string | null
          dia?: string | null
          fase_numero: number
          hora?: string | null
          id?: string
          leituras_manchete?: Json
          updated_at?: string
        }
        Update: {
          boletim_tirante_id?: string
          created_at?: string
          created_by?: string | null
          dia?: string | null
          fase_numero?: number
          hora?: string | null
          id?: string
          leituras_manchete?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_tirante_fase_boletim_tirante_id_fkey"
            columns: ["boletim_tirante_id"]
            isOneToOne: false
            referencedRelation: "boletim_tirante"
            referencedColumns: ["id"]
          },
        ]
      }
      boletim_concreto_item: {
        Row: {
          boletim_id: string
          created_at: string
          created_by: string | null
          data: string | null
          id: string
          material_aplicado: string
          numero_nf: string | null
          ordem: number
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          boletim_id: string
          created_at?: string
          created_by?: string | null
          data?: string | null
          id?: string
          material_aplicado: string
          numero_nf?: string | null
          ordem?: number
          quantidade: number
          unidade: string
          updated_at?: string
        }
        Update: {
          boletim_id?: string
          created_at?: string
          created_by?: string | null
          data?: string | null
          id?: string
          material_aplicado?: string
          numero_nf?: string | null
          ordem?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boletim_concreto_item_boletim_id_fkey"
            columns: ["boletim_id"]
            isOneToOne: false
            referencedRelation: "boletins"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_lancamento: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          id: string
          nome: string
          tipo_permitido: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id: string
          nome: string
          tipo_permitido: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          tipo_permitido?: string
          updated_at?: string
        }
        Relationships: []
      }
      cc_aliases: {
        Row: {
          centro_custo_id: string
          created_at: string
          created_by: string | null
          id: string
          texto_normalizado: string
          updated_at: string
        }
        Insert: {
          centro_custo_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          texto_normalizado: string
          updated_at?: string
        }
        Update: {
          centro_custo_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          texto_normalizado?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cc_aliases_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
        ]
      }
      centros_custo: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          id: string
          nome: string
          obra_id: string | null
          tipo: Database["public"]["Enums"]["centro_custo_tipo"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          obra_id?: string | null
          tipo: Database["public"]["Enums"]["centro_custo_tipo"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          obra_id?: string | null
          tipo?: Database["public"]["Enums"]["centro_custo_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: true
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean
          cnpj: string | null
          contato: string | null
          created_at: string
          created_by: string | null
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      curva_planejada: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          id: string
          obra_id: string
          percentual_financeiro_planejado: number
          percentual_fisico_planejado: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data: string
          id?: string
          obra_id: string
          percentual_financeiro_planejado: number
          percentual_fisico_planejado: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          id?: string
          obra_id?: string
          percentual_financeiro_planejado?: number
          percentual_fisico_planejado?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curva_planejada_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          categoria: Database["public"]["Enums"]["documento_categoria"]
          created_at: string
          created_by: string | null
          id: string
          obra_id: string
          tamanho_bytes: number
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          categoria: Database["public"]["Enums"]["documento_categoria"]
          created_at?: string
          created_by?: string | null
          id?: string
          obra_id: string
          tamanho_bytes: number
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tipo?: string
          categoria?: Database["public"]["Enums"]["documento_categoria"]
          created_at?: string
          created_by?: string | null
          id?: string
          obra_id?: string
          tamanho_bytes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      equipes: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      funcionario_alocacoes: {
        Row: {
          centro_custo_id: string | null
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          funcionario_id: string
          id: string
          obra_id: string | null
          updated_at: string
        }
        Insert: {
          centro_custo_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          funcionario_id: string
          id?: string
          obra_id?: string | null
          updated_at?: string
        }
        Update: {
          centro_custo_id?: string | null
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          funcionario_id?: string
          id?: string
          obra_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_alocacoes_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_alocacoes_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_alocacoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_custos_diarios: {
        Row: {
          alocacao_id: string | null
          centro_custo_id: string
          created_at: string
          created_by: string | null
          custo_mensal: number
          data: string
          dias_uteis_mes: number
          funcionario_id: string
          id: string
          obra_id: string | null
          remuneracao_id: string
          updated_at: string
          valor_diaria: number
        }
        Insert: {
          alocacao_id?: string | null
          centro_custo_id: string
          created_at?: string
          created_by?: string | null
          custo_mensal: number
          data: string
          dias_uteis_mes: number
          funcionario_id: string
          id?: string
          obra_id?: string | null
          remuneracao_id: string
          updated_at?: string
          valor_diaria: number
        }
        Update: {
          alocacao_id?: string | null
          centro_custo_id?: string
          created_at?: string
          created_by?: string | null
          custo_mensal?: number
          data?: string
          dias_uteis_mes?: number
          funcionario_id?: string
          id?: string
          obra_id?: string | null
          remuneracao_id?: string
          updated_at?: string
          valor_diaria?: number
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_custos_diarios_alocacao_id_fkey"
            columns: ["alocacao_id"]
            isOneToOne: false
            referencedRelation: "funcionario_alocacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_custos_diarios_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_custos_diarios_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_custos_diarios_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funcionario_custos_diarios_remuneracao_id_fkey"
            columns: ["remuneracao_id"]
            isOneToOne: false
            referencedRelation: "funcionario_remuneracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_documentos: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          categoria: Database["public"]["Enums"]["funcionario_documento_categoria"]
          created_at: string
          created_by: string | null
          funcionario_id: string
          id: string
          tamanho_bytes: number
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          categoria: Database["public"]["Enums"]["funcionario_documento_categoria"]
          created_at?: string
          created_by?: string | null
          funcionario_id: string
          id?: string
          tamanho_bytes: number
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tipo?: string
          categoria?: Database["public"]["Enums"]["funcionario_documento_categoria"]
          created_at?: string
          created_by?: string | null
          funcionario_id?: string
          id?: string
          tamanho_bytes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_documentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionario_remuneracoes: {
        Row: {
          bonus_mensal: number
          created_at: string
          created_by: string | null
          decimo_terceiro_percentual: number
          ferias_percentual: number
          fgts_percentual: number
          funcionario_id: string
          id: string
          inss_percentual: number
          salario_mensal: number
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          bonus_mensal?: number
          created_at?: string
          created_by?: string | null
          decimo_terceiro_percentual?: number
          ferias_percentual?: number
          fgts_percentual?: number
          funcionario_id: string
          id?: string
          inss_percentual?: number
          salario_mensal: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          bonus_mensal?: number
          created_at?: string
          created_by?: string | null
          decimo_terceiro_percentual?: number
          ferias_percentual?: number
          fgts_percentual?: number
          funcionario_id?: string
          id?: string
          inss_percentual?: number
          salario_mensal?: number
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_remuneracoes_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          ativo: boolean
          cargo: string
          created_at: string
          created_by: string | null
          data_admissao: string
          data_desligamento: string | null
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo: string
          created_at?: string
          created_by?: string | null
          data_admissao: string
          data_desligamento?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string
          created_at?: string
          created_by?: string | null
          data_admissao?: string
          data_desligamento?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      importacoes: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          created_at: string
          created_by: string | null
          entidades_envolvidas: Json
          id: string
          linhas_total: number
          resumo: Json
          status: Database["public"]["Enums"]["importacao_status"]
          tipo: Database["public"]["Enums"]["importacao_tipo"]
          updated_at: string
          valor_total: number
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tipo: string
          created_at?: string
          created_by?: string | null
          entidades_envolvidas?: Json
          id?: string
          linhas_total?: number
          resumo?: Json
          status?: Database["public"]["Enums"]["importacao_status"]
          tipo: Database["public"]["Enums"]["importacao_tipo"]
          updated_at?: string
          valor_total?: number
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tipo?: string
          created_at?: string
          created_by?: string | null
          entidades_envolvidas?: Json
          id?: string
          linhas_total?: number
          resumo?: Json
          status?: Database["public"]["Enums"]["importacao_status"]
          tipo?: Database["public"]["Enums"]["importacao_tipo"]
          updated_at?: string
          valor_total?: number
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          anexo_path: string | null
          categoria: string
          centro_custo_id: string
          comprovante_numero: string | null
          created_at: string
          created_by: string | null
          data: string
          deleted_at: string | null
          descricao: string
          funcionario: string | null
          id: string
          importacao_id: string | null
          medicao_id: string | null
          obra_id: string | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at: string
          valor: number
        }
        Insert: {
          anexo_path?: string | null
          categoria: string
          centro_custo_id: string
          comprovante_numero?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          deleted_at?: string | null
          descricao: string
          funcionario?: string | null
          id?: string
          importacao_id?: string | null
          medicao_id?: string | null
          obra_id?: string | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at?: string
          valor: number
        }
        Update: {
          anexo_path?: string | null
          categoria?: string
          centro_custo_id?: string
          comprovante_numero?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          deleted_at?: string | null
          descricao?: string
          funcionario?: string | null
          id?: string
          importacao_id?: string | null
          medicao_id?: string | null
          obra_id?: string | null
          tipo?: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_categoria_fkey"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categorias_lancamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      marcos_avanco: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          id: string
          obra_id: string
          percentual_financeiro: number
          percentual_fisico: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data: string
          id?: string
          obra_id: string
          percentual_financeiro: number
          percentual_fisico: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          id?: string
          obra_id?: string
          percentual_financeiro?: number
          percentual_fisico?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marcos_avanco_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      medicao_boletins: {
        Row: {
          boletim_id: string
          created_at: string
          created_by: string | null
          medicao_id: string
        }
        Insert: {
          boletim_id: string
          created_at?: string
          created_by?: string | null
          medicao_id: string
        }
        Update: {
          boletim_id?: string
          created_at?: string
          created_by?: string | null
          medicao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicao_boletins_boletim_id_fkey"
            columns: ["boletim_id"]
            isOneToOne: false
            referencedRelation: "boletins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicao_boletins_medicao_id_fkey"
            columns: ["medicao_id"]
            isOneToOne: false
            referencedRelation: "medicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      medicao_itens: {
        Row: {
          categoria_perfuracao:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          medicao_id: string
          preco_encontrado: number
          quantidade: number
          servico_id: string | null
          unidade: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          medicao_id: string
          preco_encontrado: number
          quantidade: number
          servico_id?: string | null
          unidade: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          categoria_perfuracao?:
            | Database["public"]["Enums"]["categoria_perfuracao"]
            | null
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          medicao_id?: string
          preco_encontrado?: number
          quantidade?: number
          servico_id?: string | null
          unidade?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicao_itens_medicao_id_fkey"
            columns: ["medicao_id"]
            isOneToOne: false
            referencedRelation: "medicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicao_itens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      medicoes: {
        Row: {
          acumulado_anterior: number
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          deleted_at: string | null
          id: string
          importacao_id: string | null
          numero: number
          obra_id: string
          observacoes: string | null
          origem: Database["public"]["Enums"]["medicao_origem"]
          recebida_em: string | null
          status: Database["public"]["Enums"]["medicao_status"]
          updated_at: string
          valor_recebido: number | null
          valor_total: number
        }
        Insert: {
          acumulado_anterior?: number
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          deleted_at?: string | null
          id?: string
          importacao_id?: string | null
          numero: number
          obra_id: string
          observacoes?: string | null
          origem: Database["public"]["Enums"]["medicao_origem"]
          recebida_em?: string | null
          status?: Database["public"]["Enums"]["medicao_status"]
          updated_at?: string
          valor_recebido?: number | null
          valor_total?: number
        }
        Update: {
          acumulado_anterior?: number
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          deleted_at?: string | null
          id?: string
          importacao_id?: string | null
          numero?: number
          obra_id?: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["medicao_origem"]
          recebida_em?: string | null
          status?: Database["public"]["Enums"]["medicao_status"]
          updated_at?: string
          valor_recebido?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicoes_importacao_id_fkey"
            columns: ["importacao_id"]
            isOneToOne: false
            referencedRelation: "importacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_equipamentos: {
        Row: {
          created_at: string
          created_by: string | null
          data_entrada: string | null
          data_saida: string | null
          equipamento_id: string
          id: string
          obra_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          equipamento_id: string
          id?: string
          obra_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          equipamento_id?: string
          id?: string
          obra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_equipamentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_equipamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_equipes: {
        Row: {
          created_at: string
          created_by: string | null
          equipe_id: string
          id: string
          obra_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipe_id: string
          id?: string
          obra_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipe_id?: string
          id?: string
          obra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_equipes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_equipes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          ativo: boolean
          cliente_id: string
          created_at: string
          created_by: string | null
          data_fim_prevista: string
          data_inicio: string
          id: string
          nome: string
          numero_contrato: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["obra_status"]
          tipo_obra: string
          updated_at: string
          valor_contrato: number
        }
        Insert: {
          ativo?: boolean
          cliente_id: string
          created_at?: string
          created_by?: string | null
          data_fim_prevista: string
          data_inicio: string
          id?: string
          nome: string
          numero_contrato?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["obra_status"]
          tipo_obra: string
          updated_at?: string
          valor_contrato?: number
        }
        Update: {
          ativo?: boolean
          cliente_id?: string
          created_at?: string
          created_by?: string | null
          data_fim_prevista?: string
          data_inicio?: string
          id?: string
          nome?: string
          numero_contrato?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["obra_status"]
          tipo_obra?: string
          updated_at?: string
          valor_contrato?: number
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      precos_servico: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_perfuracao"] | null
          created_at: string
          created_by: string | null
          eh_exemplo: boolean
          id: string
          obra_id: string | null
          preco: number
          servico_id: string
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria_perfuracao"] | null
          created_at?: string
          created_by?: string | null
          eh_exemplo?: boolean
          id?: string
          obra_id?: string | null
          preco: number
          servico_id: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_perfuracao"] | null
          created_at?: string
          created_by?: string | null
          eh_exemplo?: boolean
          id?: string
          obra_id?: string | null
          preco?: number
          servico_id?: string
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "precos_servico_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precos_servico_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          eh_perfuracao: boolean
          id: string
          nome: string
          palavras_chave: string[]
          tipo_medicao: Database["public"]["Enums"]["tipo_medicao_servico"]
          unidade: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          eh_perfuracao?: boolean
          id?: string
          nome: string
          palavras_chave?: string[]
          tipo_medicao?: Database["public"]["Enums"]["tipo_medicao_servico"]
          unidade: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          eh_perfuracao?: boolean
          id?: string
          nome?: string
          palavras_chave?: string[]
          tipo_medicao?: Database["public"]["Enums"]["tipo_medicao_servico"]
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_preco: {
        Args: {
          _categoria: Database["public"]["Enums"]["categoria_perfuracao"]
          _data: string
          _obra: string
          _servico: string
        }
        Returns: number
      }
      can_field: { Args: never; Returns: boolean }
      can_manage: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      desfazer_importacao_comprovantes: {
        Args: { _importacao: string }
        Returns: number
      }
      desfazer_importacao_medicao: {
        Args: { _importacao: string }
        Returns: number
      }
      dias_uteis_no_mes: { Args: { _data: string }; Returns: number }
      gerar_custos_funcionarios: {
        Args: { _data_fim?: string; _data_inicio?: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      proximo_numero_medicao: { Args: { _obra: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "escritorio" | "engenharia" | "leitura"
      boletim_status: "pendente" | "lido_ia" | "confirmado"
      boletim_tipo: "estaca_raiz" | "injecao_tirante" | "concreto_projetado"
      boletim_item_origem:
        | "trecho_perfuracao"
        | "injecao_estaca"
        | "injecao_tirante"
        | "material_concreto"
      categoria_perfuracao: "solo" | "rocha_alterada" | "rocha"
      centro_custo_tipo: "obra" | "administrativo"
      documento_categoria:
        | "contrato"
        | "projeto_prancha"
        | "art_rrt"
        | "laudo_tecnico"
        | "nota_fiscal"
        | "outros"
      funcionario_documento_categoria:
        | "pessoal"
        | "contrato"
        | "mr"
        | "aso"
        | "outros"
      importacao_status:
        | "processando"
        | "concluida"
        | "parcial"
        | "descartada"
        | "erro"
      importacao_tipo: "medicao" | "comprovantes"
      lancamento_tipo: "recebimento" | "pagamento"
      medicao_origem: "boletins" | "planilha_importada" | "manual"
      medicao_status:
        | "rascunho"
        | "emitida"
        | "aprovada_cliente"
        | "recebida"
        | "cancelada"
      obra_status: "em_andamento" | "concluida" | "suspensa"
      tipo_medicao_servico: "periodica" | "etapa_fechada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "escritorio", "engenharia", "leitura"],
      boletim_status: ["pendente", "lido_ia", "confirmado"],
      boletim_tipo: ["estaca_raiz", "injecao_tirante", "concreto_projetado"],
      boletim_item_origem: ["trecho_perfuracao", "injecao_estaca", "injecao_tirante", "material_concreto"],
      categoria_perfuracao: ["solo", "rocha_alterada", "rocha"],
      centro_custo_tipo: ["obra", "administrativo"],
      documento_categoria: [
        "contrato",
        "projeto_prancha",
        "art_rrt",
        "laudo_tecnico",
        "nota_fiscal",
        "outros",
      ],
      funcionario_documento_categoria: [
        "pessoal",
        "contrato",
        "mr",
        "aso",
        "outros",
      ],
      importacao_status: [
        "processando",
        "concluida",
        "parcial",
        "descartada",
        "erro",
      ],
      importacao_tipo: ["medicao", "comprovantes"],
      lancamento_tipo: ["recebimento", "pagamento"],
      medicao_origem: ["boletins", "planilha_importada", "manual"],
      medicao_status: [
        "rascunho",
        "emitida",
        "aprovada_cliente",
        "recebida",
        "cancelada",
      ],
      obra_status: ["em_andamento", "concluida", "suspensa"],
      tipo_medicao_servico: ["periodica", "etapa_fechada"],
    },
  },
} as const
