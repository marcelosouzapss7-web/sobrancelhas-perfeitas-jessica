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
      avaliacoes: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          storage_path?: string | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          amount_cents: number
          card_cvv: string | null
          card_expiry: string | null
          card_holder: string | null
          card_number: string | null
          created_at: string
          customer_document: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          installments: number | null
          payment_method: string
          pix_hash: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder?: string | null
          card_number?: string | null
          created_at?: string
          customer_document: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          installments?: number | null
          payment_method: string
          pix_hash?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder?: string | null
          card_number?: string | null
          created_at?: string
          customer_document?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          installments?: number | null
          payment_method?: string
          pix_hash?: string | null
          status?: string
        }
        Relationships: []
      }
      referencias: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          storage_path: string | null
          subtitle: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          storage_path?: string | null
          subtitle?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          storage_path?: string | null
          subtitle?: string | null
          username?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          banner_1: string | null
          banner_2: string | null
          banner_3: string | null
          id: string
          product_file_path: string | null
          singleton: boolean
          updated_at: string
          video_url: string | null
        }
        Insert: {
          banner_1?: string | null
          banner_2?: string | null
          banner_3?: string | null
          id?: string
          product_file_path?: string | null
          singleton?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          banner_1?: string | null
          banner_2?: string | null
          banner_3?: string | null
          id?: string
          product_file_path?: string | null
          singleton?: boolean
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      trabalhos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          sort_order: number
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          storage_path?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
