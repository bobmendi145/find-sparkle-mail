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
      business_leads: {
        Row: {
          created_at: string
          emails: string[] | null
          id: string
          industry: string | null
          job_id: string
          location: string | null
          name: string
          raw_data: Json | null
          source: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          emails?: string[] | null
          id?: string
          industry?: string | null
          job_id: string
          location?: string | null
          name: string
          raw_data?: Json | null
          source?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          emails?: string[] | null
          id?: string
          industry?: string | null
          job_id?: string
          location?: string | null
          name?: string
          raw_data?: Json | null
          source?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_leads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "search_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          employee_count: number | null
          founded_year: number | null
          funding_stage: string | null
          funding_total: number | null
          growth_rate: number | null
          id: string
          industry: string[] | null
          location_hq_city: string | null
          location_hq_country: string | null
          location_hq_state: string | null
          name: string
          revenue_usd: number | null
          tech_stack: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          employee_count?: number | null
          founded_year?: number | null
          funding_stage?: string | null
          funding_total?: number | null
          growth_rate?: number | null
          id?: string
          industry?: string[] | null
          location_hq_city?: string | null
          location_hq_country?: string | null
          location_hq_state?: string | null
          name: string
          revenue_usd?: number | null
          tech_stack?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          employee_count?: number | null
          founded_year?: number | null
          funding_stage?: string | null
          funding_total?: number | null
          growth_rate?: number | null
          id?: string
          industry?: string[] | null
          location_hq_city?: string | null
          location_hq_country?: string | null
          location_hq_state?: string | null
          name?: string
          revenue_usd?: number | null
          tech_stack?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_connections: {
        Row: {
          api_key: string
          created_at: string
          id: string
          instance_url: string | null
          is_active: boolean
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      csv_imports: {
        Row: {
          created_at: string
          filename: string
          id: string
          processed_rows: number | null
          results_json: Json | null
          status: string | null
          total_rows: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          processed_rows?: number | null
          results_json?: Json | null
          status?: string | null
          total_rows?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          processed_rows?: number | null
          results_json?: Json | null
          status?: string | null
          total_rows?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_patterns: {
        Row: {
          discovered_at: string
          domain: string
          id: string
          pattern: string
        }
        Insert: {
          discovered_at?: string
          domain: string
          id?: string
          pattern: string
        }
        Update: {
          discovered_at?: string
          domain?: string
          id?: string
          pattern?: string
        }
        Relationships: []
      }
      email_provider_connections: {
        Row: {
          access_key_id: string
          created_at: string
          id: string
          is_active: boolean
          provider: string
          region: string
          secret_access_key: string
          sender_email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_key_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          region?: string
          secret_access_key: string
          sender_email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_key_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          region?: string
          secret_access_key?: string
          sender_email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_text: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_text?: string
          created_at?: string
          id?: string
          name: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_text?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          clicks: number
          created_at: string
          first_clicked_at: string | null
          first_opened_at: string | null
          id: string
          last_clicked_at: string | null
          last_opened_at: string | null
          message_id: string | null
          opens: number
          recipient: string
          sent_at: string
          subject: string
          tracking_id: string
          user_id: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_clicked_at?: string | null
          last_opened_at?: string | null
          message_id?: string | null
          opens?: number
          recipient: string
          sent_at?: string
          subject?: string
          tracking_id?: string
          user_id: string
        }
        Update: {
          clicks?: number
          created_at?: string
          first_clicked_at?: string | null
          first_opened_at?: string | null
          id?: string
          last_clicked_at?: string | null
          last_opened_at?: string | null
          message_id?: string | null
          opens?: number
          recipient?: string
          sent_at?: string
          subject?: string
          tracking_id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          tracking_id: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          tracking_id: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          tracking_id?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "email_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          email_confidence: number | null
          email_status: string | null
          first_name: string
          id: string
          keywords: string[] | null
          last_name: string
          linkedin_url: string | null
          location_city: string | null
          location_country: string | null
          seniority: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_confidence?: number | null
          email_status?: string | null
          first_name: string
          id?: string
          keywords?: string[] | null
          last_name: string
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          seniority?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_confidence?: number | null
          email_status?: string | null
          first_name?: string
          id?: string
          keywords?: string[] | null
          last_name?: string
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          seniority?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      people_leads: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          domain: string | null
          first_name: string | null
          full_name: string
          generated_emails: string[] | null
          id: string
          job_id: string
          last_name: string | null
          primary_email: string | null
          raw_data: Json | null
          role: string | null
          source_query: string | null
          source_url: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          first_name?: string | null
          full_name: string
          generated_emails?: string[] | null
          id?: string
          job_id: string
          last_name?: string | null
          primary_email?: string | null
          raw_data?: Json | null
          role?: string | null
          source_query?: string | null
          source_url?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          domain?: string | null
          first_name?: string | null
          full_name?: string
          generated_emails?: string[] | null
          id?: string
          job_id?: string
          last_name?: string | null
          primary_email?: string | null
          raw_data?: Json | null
          role?: string | null
          source_query?: string | null
          source_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_leads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "search_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          created_at: string
          filters_json: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters_json?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters_json?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          body_html: string
          created_at: string
          error_message: string | null
          id: string
          recipients: string[]
          send_at: string
          sent_count: number | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_html: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipients?: string[]
          send_at: string
          sent_count?: number | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_html?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipients?: string[]
          send_at?: string
          sent_count?: number | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          filters_json: Json
          id: string
          results_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filters_json?: Json
          id?: string
          results_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          filters_json?: Json
          id?: string
          results_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      search_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_json: Json
          results_count: number | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          results_count?: number | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_json?: Json
          results_count?: number | null
          status?: string
          type?: string
          user_id?: string
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
