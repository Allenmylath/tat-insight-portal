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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          provider: string
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          provider: string
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          provider?: string
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          analysis_data: Json
          analysis_type: string | null
          confidence_score: number | null
          generated_at: string
          id: string
          inner_states: Json | null
          military_assessment: Json | null
          murray_needs: Json | null
          murray_presses: Json | null
          selection_recommendation: Json | null
          test_session_id: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          analysis_type?: string | null
          confidence_score?: number | null
          generated_at?: string
          id?: string
          inner_states?: Json | null
          military_assessment?: Json | null
          murray_needs?: Json | null
          murray_presses?: Json | null
          selection_recommendation?: Json | null
          test_session_id: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string | null
          confidence_score?: number | null
          generated_at?: string
          id?: string
          inner_states?: Json | null
          military_assessment?: Json | null
          murray_needs?: Json | null
          murray_presses?: Json | null
          selection_recommendation?: Json | null
          test_session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_test_session_id_fkey"
            columns: ["test_session_id"]
            isOneToOne: true
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          credits: number
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          credits?: number
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          balance_after: number
          created_at: string
          credits_change: number
          description: string | null
          id: string
          payment_metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          balance_after: number
          created_at?: string
          credits_change: number
          description?: string | null
          id?: string
          payment_metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits_change?: number
          description?: string | null
          id?: string
          payment_metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          description: string | null
          discount_amount: number | null
          discount_percentage: number
          for_regular_users_only: boolean
          id: string
          is_active: boolean
          max_uses: number | null
          title: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_amount?: number | null
          discount_percentage: number
          for_regular_users_only?: boolean
          id?: string
          is_active?: boolean
          max_uses?: number | null
          title: string
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number
          for_regular_users_only?: boolean
          id?: string
          is_active?: boolean
          max_uses?: number | null
          title?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      payment_callbacks: {
        Row: {
          callback_data: Json
          id: string
          merchant_order_id: string | null
          phonepe_order_id: string | null
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          callback_data: Json
          id?: string
          merchant_order_id?: string | null
          phonepe_order_id?: string | null
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          callback_data?: Json
          id?: string
          merchant_order_id?: string | null
          phonepe_order_id?: string | null
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
      phonepe_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          merchant_order_id: string
          phonepe_order_id: string | null
          purchase_id: string | null
          redirect_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          merchant_order_id: string
          phonepe_order_id?: string | null
          purchase_id?: string | null
          redirect_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          merchant_order_id?: string
          phonepe_order_id?: string | null
          purchase_id?: string | null
          redirect_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          callback_received_at: string | null
          credits_purchased: number
          currency: string
          id: string
          merchant_order_id: string | null
          package_name: string | null
          payment_method: string | null
          payment_reference: string | null
          phonepe_order_id: string | null
          phonepe_transaction_id: string | null
          purchased_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          callback_received_at?: string | null
          credits_purchased?: number
          currency?: string
          id?: string
          merchant_order_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          phonepe_order_id?: string | null
          phonepe_transaction_id?: string | null
          purchased_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          callback_received_at?: string | null
          credits_purchased?: number
          currency?: string
          id?: string
          merchant_order_id?: string | null
          package_name?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          phonepe_order_id?: string | null
          phonepe_transaction_id?: string | null
          purchased_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tattest: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          prompt_text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          prompt_text: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          prompt_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          session_duration_seconds: number | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          story_content: string | null
          tattest_id: string
          time_remaining: number | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          session_duration_seconds?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          story_content?: string | null
          tattest_id: string
          time_remaining?: number | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          session_duration_seconds?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          story_content?: string | null
          tattest_id?: string
          time_remaining?: number | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_tattest_id_fkey"
            columns: ["tattest_id"]
            isOneToOne: false
            referencedRelation: "tattest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_offers: {
        Row: {
          created_at: string
          id: string
          is_used: boolean
          offer_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_used?: boolean
          offer_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_used?: boolean
          offer_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clerk_id: string
          created_at: string
          credit_balance: number
          email: string
          id: string
          membership_expires_at: string | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          total_credits_purchased: number
          total_credits_spent: number
          updated_at: string
        }
        Insert: {
          clerk_id: string
          created_at?: string
          credit_balance?: number
          email: string
          id?: string
          membership_expires_at?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          total_credits_purchased?: number
          total_credits_spent?: number
          updated_at?: string
        }
        Update: {
          clerk_id?: string
          created_at?: string
          credit_balance?: number
          email?: string
          id?: string
          membership_expires_at?: string | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          total_credits_purchased?: number
          total_credits_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits_after_purchase: {
        Args: {
          p_credits_purchased: number
          p_payment_metadata?: Json
          p_purchase_id: string
          p_user_email?: string
          p_user_id: string
        }
        Returns: boolean
      }
      analyze_existing_completed_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_credits_for_test: {
        Args: {
          p_credits_needed?: number
          p_test_session_id: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      membership_type: "free" | "pro"
      session_status: "active" | "completed" | "abandoned" | "paused"
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
      membership_type: ["free", "pro"],
      session_status: ["active", "completed", "abandoned", "paused"],
    },
  },
} as const
