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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          email_account_id: string | null
          email_from: string | null
          email_subject: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          email_account_id?: string | null
          email_from?: string | null
          email_subject?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          email_account_id?: string | null
          email_from?: string | null
          email_subject?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_email_account_id_fkey"
            columns: ["email_account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_instruction_rules: {
        Row: {
          condition_text: string | null
          condition_type: string | null
          created_at: string
          id: string
          is_active: boolean
          parent_id: string | null
          priority: string
          rule_text: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          condition_text?: string | null
          condition_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id?: string | null
          priority?: string
          rule_text: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          condition_text?: string | null
          condition_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id?: string | null
          priority?: string
          rule_text?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_instruction_rules_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ai_instruction_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_instructions: {
        Row: {
          auto_reply_confidence_threshold: number | null
          auto_reply_enabled: boolean | null
          backup_email: string | null
          created_at: string
          do_not_rules: string[] | null
          do_rules: string[] | null
          email_footer: string | null
          escalate_unknown: boolean | null
          escalation_conditions: string[] | null
          greeting_response_enabled: boolean | null
          greeting_template: string | null
          id: string
          ignore_promotions: boolean | null
          ignore_spam: boolean | null
          logo_url: string | null
          reply_length: string
          signature: string | null
          sla_first_response_hours: number | null
          sla_resolution_hours: number | null
          system_prompt: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reply_confidence_threshold?: number | null
          auto_reply_enabled?: boolean | null
          backup_email?: string | null
          created_at?: string
          do_not_rules?: string[] | null
          do_rules?: string[] | null
          email_footer?: string | null
          escalate_unknown?: boolean | null
          escalation_conditions?: string[] | null
          greeting_response_enabled?: boolean | null
          greeting_template?: string | null
          id?: string
          ignore_promotions?: boolean | null
          ignore_spam?: boolean | null
          logo_url?: string | null
          reply_length?: string
          signature?: string | null
          sla_first_response_hours?: number | null
          sla_resolution_hours?: number | null
          system_prompt?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reply_confidence_threshold?: number | null
          auto_reply_enabled?: boolean | null
          backup_email?: string | null
          created_at?: string
          do_not_rules?: string[] | null
          do_rules?: string[] | null
          email_footer?: string | null
          escalate_unknown?: boolean | null
          escalation_conditions?: string[] | null
          greeting_response_enabled?: boolean | null
          greeting_template?: string | null
          id?: string
          ignore_promotions?: boolean | null
          ignore_spam?: boolean | null
          logo_url?: string | null
          reply_length?: string
          signature?: string | null
          sla_first_response_hours?: number | null
          sla_resolution_hours?: number | null
          system_prompt?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          email_address: string
          id: string
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          is_active: boolean | null
          provider: string
          refresh_token: string | null
          smtp_host: string | null
          smtp_port: number | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email_address: string
          id?: string
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          is_active?: boolean | null
          provider: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email_address?: string
          id?: string
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          is_active?: boolean | null
          provider?: string
          refresh_token?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body: string
          confidence_score: number | null
          created_at: string
          email_account_id: string | null
          external_email_id: string | null
          flag_reason: string | null
          from_address: string
          from_name: string | null
          id: string
          intent: string | null
          queued_at: string
          reviewed_at: string | null
          status: string
          subject: string
          suggested_reply: string | null
          thread_id: string | null
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          body: string
          confidence_score?: number | null
          created_at?: string
          email_account_id?: string | null
          external_email_id?: string | null
          flag_reason?: string | null
          from_address: string
          from_name?: string | null
          id?: string
          intent?: string | null
          queued_at?: string
          reviewed_at?: string | null
          status?: string
          subject: string
          suggested_reply?: string | null
          thread_id?: string | null
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          body?: string
          confidence_score?: number | null
          created_at?: string
          email_account_id?: string | null
          external_email_id?: string | null
          flag_reason?: string | null
          from_address?: string
          from_name?: string | null
          id?: string
          intent?: string | null
          queued_at?: string
          reviewed_at?: string | null
          status?: string
          subject?: string
          suggested_reply?: string | null
          thread_id?: string | null
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_email_account_id_fkey"
            columns: ["email_account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_queue_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          accent_color: string
          body: string
          category: string
          created_at: string
          font_family: string
          font_size: string
          footer_logo_url: string
          footer_text: string
          id: string
          name: string
          text_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          body: string
          category?: string
          created_at?: string
          font_family?: string
          font_size?: string
          footer_logo_url?: string
          footer_text?: string
          id?: string
          name: string
          text_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          body?: string
          category?: string
          created_at?: string
          font_family?: string
          font_size?: string
          footer_logo_url?: string
          footer_text?: string
          id?: string
          name?: string
          text_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string | null
          delivered: boolean | null
          event_type: string
          id: string
          payload_json: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered?: boolean | null
          event_type: string
          id?: string
          payload_json?: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered?: boolean | null
          event_type?: string
          id?: string
          payload_json?: Json
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config_json: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          user_id: string
        }
        Insert: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          user_id: string
        }
        Update: {
          config_json?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base_entries: {
        Row: {
          category: string
          content: string
          created_at: string
          extracted_text: string | null
          file_name: string | null
          file_type: string | null
          id: string
          storage_path: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          extracted_text?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          storage_path?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_questions_per_month: number
          created_at: string
          display_name: string
          email_accounts_limit: number
          emails_per_month: number
          id: string
          is_active: boolean
          kb_entries_limit: number
          name: string
          price_monthly: number
        }
        Insert: {
          ai_questions_per_month?: number
          created_at?: string
          display_name: string
          email_accounts_limit?: number
          emails_per_month?: number
          id?: string
          is_active?: boolean
          kb_entries_limit?: number
          name: string
          price_monthly?: number
        }
        Update: {
          ai_questions_per_month?: number
          created_at?: string
          display_name?: string
          email_accounts_limit?: number
          emails_per_month?: number
          id?: string
          is_active?: boolean
          kb_entries_limit?: number
          name?: string
          price_monthly?: number
        }
        Relationships: []
      }
      ticket_internal_notes: {
        Row: {
          created_at: string | null
          id: string
          note_text: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_text: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note_text?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_internal_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          customer_email: string
          escalation_flag: boolean | null
          id: string
          last_customer_reply_at: string | null
          priority: string
          sentiment_score: number | null
          sla_due_at: string | null
          status: string
          subject: string
          thread_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_email: string
          escalation_flag?: boolean | null
          id?: string
          last_customer_reply_at?: string | null
          priority?: string
          sentiment_score?: number | null
          sla_due_at?: string | null
          status?: string
          subject: string
          thread_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_email?: string
          escalation_flag?: boolean | null
          id?: string
          last_customer_reply_at?: string | null
          priority?: string
          sentiment_score?: number | null
          sla_due_at?: string | null
          status?: string
          subject?: string
          thread_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          ai_questions_asked: number
          created_at: string
          emails_processed: number
          id: string
          period_start: string
          user_id: string
        }
        Insert: {
          ai_questions_asked?: number
          created_at?: string
          emails_processed?: number
          id?: string
          period_start: string
          user_id: string
        }
        Update: {
          ai_questions_asked?: number
          created_at?: string
          emails_processed?: number
          id?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: { p_resource_type: string; p_user_id: string }
        Returns: boolean
      }
      increment_usage: {
        Args: { p_resource_type: string; p_user_id: string }
        Returns: undefined
      }
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
