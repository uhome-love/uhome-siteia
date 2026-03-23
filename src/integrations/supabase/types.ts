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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          corretor_ref_id: string | null
          corretor_ref_slug: string | null
          created_at: string | null
          data_visita: string | null
          horario: string | null
          id: string
          imovel_id: string | null
          imovel_slug: string | null
          imovel_titulo: string | null
          nome: string
          origem_ref: string | null
          status: string | null
          telefone: string
        }
        Insert: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          data_visita?: string | null
          horario?: string | null
          id?: string
          imovel_id?: string | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          nome: string
          origem_ref?: string | null
          status?: string | null
          telefone: string
        }
        Update: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          data_visita?: string | null
          horario?: string | null
          id?: string
          imovel_id?: string | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          nome?: string
          origem_ref?: string | null
          status?: string | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_corretor_ref_id_fkey"
            columns: ["corretor_ref_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buscas_salvas: {
        Row: {
          ativa: boolean
          created_at: string
          descricao_humana: string | null
          email: string
          filters: Json
          id: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao_humana?: string | null
          email: string
          filters?: Json
          id?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao_humana?: string | null
          email?: string
          filters?: Json
          id?: string
        }
        Relationships: []
      }
      captacao_imoveis: {
        Row: {
          area: number | null
          atribuido_a: string | null
          bairro: string | null
          corretor_ref_id: string | null
          corretor_ref_slug: string | null
          created_at: string | null
          dados_imovel: Json | null
          id: string
          mensagem: string | null
          nome: string
          origem: string | null
          origem_ref: string | null
          quartos: number | null
          status: string | null
          telefone: string
          tipo_imovel: string | null
          utm_campaign: string | null
          utm_source: string | null
          valor_pretendido: string | null
        }
        Insert: {
          area?: number | null
          atribuido_a?: string | null
          bairro?: string | null
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          dados_imovel?: Json | null
          id?: string
          mensagem?: string | null
          nome: string
          origem?: string | null
          origem_ref?: string | null
          quartos?: number | null
          status?: string | null
          telefone: string
          tipo_imovel?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
          valor_pretendido?: string | null
        }
        Update: {
          area?: number | null
          atribuido_a?: string | null
          bairro?: string | null
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          dados_imovel?: Json | null
          id?: string
          mensagem?: string | null
          nome?: string
          origem?: string | null
          origem_ref?: string | null
          quartos?: number | null
          status?: string | null
          telefone?: string
          tipo_imovel?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
          valor_pretendido?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "captacao_imoveis_corretor_ref_id_fkey"
            columns: ["corretor_ref_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      condominio_descricoes: {
        Row: {
          condominio_nome: string
          created_at: string
          descricao: string
          id: string
          updated_at: string | null
        }
        Insert: {
          condominio_nome: string
          created_at?: string
          descricao: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          condominio_nome?: string
          created_at?: string
          descricao?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      corretor_visitas: {
        Row: {
          corretor_id: string | null
          corretor_slug: string | null
          created_at: string | null
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          corretor_id?: string | null
          corretor_slug?: string | null
          created_at?: string | null
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          corretor_id?: string | null
          corretor_slug?: string | null
          created_at?: string | null
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corretor_visitas_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostico_log: {
        Row: {
          avisos: number
          created_at: string
          erros: number
          id: string
          ok: number
          origem: string
          resultados: Json
          total_testes: number
        }
        Insert: {
          avisos?: number
          created_at?: string
          erros?: number
          id?: string
          ok?: number
          origem?: string
          resultados?: Json
          total_testes?: number
        }
        Update: {
          avisos?: number
          created_at?: string
          erros?: number
          id?: string
          ok?: number
          origem?: string
          resultados?: Json
          total_testes?: number
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          user_id?: string
        }
        Relationships: []
      }
      imoveis: {
        Row: {
          andar: number | null
          area_total: number | null
          area_util: number | null
          bairro: string
          banheiros: number | null
          cep: string | null
          cidade: string | null
          condominio_id: string | null
          condominio_nome: string | null
          corretor_id: string | null
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          diferenciais: string[] | null
          endereco_completo: string | null
          finalidade: string
          foto_principal: string | null
          fotos: Json | null
          id: string
          jetimob_id: string | null
          jetimob_raw: Json | null
          latitude: number | null
          longitude: number | null
          origem: string | null
          preco: number
          preco_condominio: number | null
          preco_iptu: number | null
          publicado_em: string | null
          quartos: number | null
          slug: string
          status: string | null
          tipo: string
          titulo: string
          uf: string | null
          updated_at: string | null
          vagas: number | null
          video_url: string | null
        }
        Insert: {
          andar?: number | null
          area_total?: number | null
          area_util?: number | null
          bairro: string
          banheiros?: number | null
          cep?: string | null
          cidade?: string | null
          condominio_id?: string | null
          condominio_nome?: string | null
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          diferenciais?: string[] | null
          endereco_completo?: string | null
          finalidade: string
          foto_principal?: string | null
          fotos?: Json | null
          id?: string
          jetimob_id?: string | null
          jetimob_raw?: Json | null
          latitude?: number | null
          longitude?: number | null
          origem?: string | null
          preco: number
          preco_condominio?: number | null
          preco_iptu?: number | null
          publicado_em?: string | null
          quartos?: number | null
          slug: string
          status?: string | null
          tipo: string
          titulo: string
          uf?: string | null
          updated_at?: string | null
          vagas?: number | null
          video_url?: string | null
        }
        Update: {
          andar?: number | null
          area_total?: number | null
          area_util?: number | null
          bairro?: string
          banheiros?: number | null
          cep?: string | null
          cidade?: string | null
          condominio_id?: string | null
          condominio_nome?: string | null
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          diferenciais?: string[] | null
          endereco_completo?: string | null
          finalidade?: string
          foto_principal?: string | null
          fotos?: Json | null
          id?: string
          jetimob_id?: string | null
          jetimob_raw?: Json | null
          latitude?: number | null
          longitude?: number | null
          origem?: string | null
          preco?: number
          preco_condominio?: number | null
          preco_iptu?: number | null
          publicado_em?: string | null
          quartos?: number | null
          slug?: string
          status?: string | null
          tipo?: string
          titulo?: string
          uf?: string | null
          updated_at?: string | null
          vagas?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      imovel_views: {
        Row: {
          id: string
          imovel_id: string
          session_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          imovel_id: string
          session_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          imovel_id?: string
          session_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          created_at: string
          creci: string | null
          email: string | null
          foto_url: string | null
          id: string
          nome: string | null
          role: string | null
          sincronizado_em: string | null
          slug_ref: string | null
          telefone: string | null
          uhomesales_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          sincronizado_em?: string | null
          slug_ref?: string | null
          telefone?: string | null
          uhomesales_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          sincronizado_em?: string | null
          slug_ref?: string | null
          telefone?: string | null
          uhomesales_id?: string | null
        }
        Relationships: []
      }
      public_leads: {
        Row: {
          corretor_ref_id: string | null
          corretor_ref_slug: string | null
          created_at: string | null
          email: string | null
          id: string
          imovel_bairro: string | null
          imovel_id: string | null
          imovel_preco: number | null
          imovel_slug: string | null
          imovel_titulo: string | null
          nome: string
          origem_componente: string | null
          origem_pagina: string | null
          origem_ref: string | null
          session_id: string | null
          sincronizado_em: string | null
          status: string | null
          telefone: string
          tipo_interesse: string | null
          uhomesales_lead_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          imovel_bairro?: string | null
          imovel_id?: string | null
          imovel_preco?: number | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          nome: string
          origem_componente?: string | null
          origem_pagina?: string | null
          origem_ref?: string | null
          session_id?: string | null
          sincronizado_em?: string | null
          status?: string | null
          telefone: string
          tipo_interesse?: string | null
          uhomesales_lead_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          imovel_bairro?: string | null
          imovel_id?: string | null
          imovel_preco?: number | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          nome?: string
          origem_componente?: string | null
          origem_pagina?: string | null
          origem_ref?: string | null
          session_id?: string | null
          sincronizado_em?: string | null
          status?: string | null
          telefone?: string
          tipo_interesse?: string | null
          uhomesales_lead_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_leads_corretor_ref_id_fkey"
            columns: ["corretor_ref_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          created_at: string | null
          direcao: string
          erro: string | null
          id: string
          payload: Json | null
          sucesso: boolean | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          direcao: string
          erro?: string | null
          id?: string
          payload?: Json | null
          sucesso?: boolean | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          direcao?: string
          erro?: string | null
          id?: string
          payload?: Json | null
          sucesso?: boolean | null
          tipo?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_clicks: {
        Row: {
          corretor_ref_id: string | null
          corretor_ref_slug: string | null
          created_at: string | null
          id: string
          imovel_id: string | null
          imovel_slug: string | null
          imovel_titulo: string | null
          origem_pagina: string | null
          origem_ref: string | null
          session_id: string | null
        }
        Insert: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          id?: string
          imovel_id?: string | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          origem_pagina?: string | null
          origem_ref?: string | null
          session_id?: string | null
        }
        Update: {
          corretor_ref_id?: string | null
          corretor_ref_slug?: string | null
          created_at?: string | null
          id?: string
          imovel_id?: string | null
          imovel_slug?: string | null
          imovel_titulo?: string | null
          origem_pagina?: string | null
          origem_ref?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_clicks_corretor_ref_id_fkey"
            columns: ["corretor_ref_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bairros_disponiveis: {
        Args: never
        Returns: {
          bairro: string
          count: number
        }[]
      }
      get_map_pins: {
        Args: {
          lat_max?: number
          lat_min?: number
          lng_max?: number
          lng_min?: number
          p_area_max?: number
          p_area_min?: number
          p_bairro?: string
          p_bairros?: string[]
          p_banheiros?: number
          p_cidade?: string
          p_cidades?: string[]
          p_limite?: number
          p_preco_max?: number
          p_preco_min?: number
          p_quartos?: number
          p_tipo?: string
          p_vagas?: number
        }
        Returns: {
          area_total: number
          bairro: string
          id: string
          latitude: number
          longitude: number
          preco: number
          quartos: number
          slug: string
          tipo: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
