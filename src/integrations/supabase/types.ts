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
          atribuido_a: string | null
          bairro: string | null
          created_at: string | null
          id: string
          mensagem: string | null
          nome: string
          status: string | null
          telefone: string
          tipo_imovel: string | null
          utm_campaign: string | null
          utm_source: string | null
          valor_pretendido: string | null
        }
        Insert: {
          atribuido_a?: string | null
          bairro?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string | null
          nome: string
          status?: string | null
          telefone: string
          tipo_imovel?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
          valor_pretendido?: string | null
        }
        Update: {
          atribuido_a?: string | null
          bairro?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string | null
          nome?: string
          status?: string | null
          telefone?: string
          tipo_imovel?: string | null
          utm_campaign?: string | null
          utm_source?: string | null
          valor_pretendido?: string | null
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
          corretor_id: string | null
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          diferenciais: string[] | null
          endereco_completo: string | null
          finalidade: string
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
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          diferenciais?: string[] | null
          endereco_completo?: string | null
          finalidade: string
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
          corretor_id?: string | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          diferenciais?: string[] | null
          endereco_completo?: string | null
          finalidade?: string
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
      public_leads: {
        Row: {
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
          session_id: string | null
          status: string | null
          telefone: string
          tipo_interesse: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
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
          session_id?: string | null
          status?: string | null
          telefone: string
          tipo_interesse?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
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
          session_id?: string | null
          status?: string | null
          telefone?: string
          tipo_interesse?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
