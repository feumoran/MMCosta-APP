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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "escritorio" | "engenharia" | "leitura"
      categoria_perfuracao: "solo" | "rocha_alterada" | "rocha"
      centro_custo_tipo: "obra" | "administrativo"
      lancamento_tipo: "recebimento" | "pagamento"
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
      categoria_perfuracao: ["solo", "rocha_alterada", "rocha"],
      centro_custo_tipo: ["obra", "administrativo"],
      lancamento_tipo: ["recebimento", "pagamento"],
      obra_status: ["em_andamento", "concluida", "suspensa"],
      tipo_medicao_servico: ["periodica", "etapa_fechada"],
    },
  },
} as const
