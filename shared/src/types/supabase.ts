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
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          team_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          team_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: Database["public"]["Enums"]["currency_code"]
          created_at: string | null
          decimal_places: number | null
          is_active: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          code: Database["public"]["Enums"]["currency_code"]
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          code?: Database["public"]["Enums"]["currency_code"]
          created_at?: string | null
          decimal_places?: number | null
          is_active?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      grace_windows: {
        Row: {
          capability_key: string
          created_at: string | null
          expires_at: string
          grace_limit: number
          grace_period_days: number
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["grace_window_status"] | null
          team_id: string | null
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          capability_key: string
          created_at?: string | null
          expires_at: string
          grace_limit: number
          grace_period_days?: number
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["grace_window_status"] | null
          team_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          capability_key?: string
          created_at?: string | null
          expires_at?: string
          grace_limit?: number
          grace_period_days?: number
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["grace_window_status"] | null
          team_id?: string | null
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grace_windows_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          location: string
          resource: string
          row_version: number | null
          updated_at: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          location: string
          resource: string
          row_version?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          location?: string
          resource?: string
          row_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_capabilities: {
        Row: {
          capability_key: string
          capability_name: string
          capability_type: Database["public"]["Enums"]["capability_type"]
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          limit_value: number | null
          plan_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          capability_key: string
          capability_name: string
          capability_type: Database["public"]["Enums"]["capability_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          limit_value?: number | null
          plan_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          capability_key?: string
          capability_name?: string
          capability_type?: Database["public"]["Enums"]["capability_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          limit_value?: number | null
          plan_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_capabilities_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_change_history: {
        Row: {
          change_reason: string | null
          change_type: string
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          from_plan_id: string | null
          id: string
          team_id: string | null
          to_plan_id: string | null
        }
        Insert: {
          change_reason?: string | null
          change_type: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          from_plan_id?: string | null
          id?: string
          team_id?: string | null
          to_plan_id?: string | null
        }
        Update: {
          change_reason?: string | null
          change_type?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          from_plan_id?: string | null
          id?: string
          team_id?: string | null
          to_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_history_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_history_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_history_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          currency_code: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          planship_plan_id: string
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          status: Database["public"]["Enums"]["plan_status"] | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          planship_plan_id: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          planship_plan_id?: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["plan_status"] | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          row_version: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          row_version?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          row_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_i18n_preferences: {
        Row: {
          created_at: string | null
          currency_code: Database["public"]["Enums"]["currency_code"] | null
          date_format: Database["public"]["Enums"]["date_format"] | null
          number_format: string | null
          team_id: string
          time_format: Database["public"]["Enums"]["time_format"] | null
          timezone_id: string | null
          unit_family: Database["public"]["Enums"]["unit_family"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          date_format?: Database["public"]["Enums"]["date_format"] | null
          number_format?: string | null
          team_id: string
          time_format?: Database["public"]["Enums"]["time_format"] | null
          timezone_id?: string | null
          unit_family?: Database["public"]["Enums"]["unit_family"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          date_format?: Database["public"]["Enums"]["date_format"] | null
          number_format?: string | null
          team_id?: string
          time_format?: Database["public"]["Enums"]["time_format"] | null
          timezone_id?: string | null
          unit_family?: Database["public"]["Enums"]["unit_family"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_i18n_preferences_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_i18n_preferences_timezone_id_fkey"
            columns: ["timezone_id"]
            isOneToOne: false
            referencedRelation: "timezones"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          role_id: string
          row_version: number | null
          status: Database["public"]["Enums"]["member_status"] | null
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role_id: string
          row_version?: number | null
          status?: Database["public"]["Enums"]["member_status"] | null
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role_id?: string
          row_version?: number | null
          status?: Database["public"]["Enums"]["member_status"] | null
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_members_role_id"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          planship_subscription_id: string | null
          status: string | null
          team_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          planship_subscription_id?: string | null
          status?: string | null
          team_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          planship_subscription_id?: string | null
          status?: string | null
          team_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          base_currency_code: string | null
          created_at: string | null
          default_date_format: string | null
          default_time_format: string | null
          default_timezone: string | null
          default_unit_family: string | null
          id: string
          name: string
          row_version: number | null
          slug: string
          status: Database["public"]["Enums"]["team_status"] | null
          updated_at: string | null
        }
        Insert: {
          base_currency_code?: string | null
          created_at?: string | null
          default_date_format?: string | null
          default_time_format?: string | null
          default_timezone?: string | null
          default_unit_family?: string | null
          id?: string
          name: string
          row_version?: number | null
          slug: string
          status?: Database["public"]["Enums"]["team_status"] | null
          updated_at?: string | null
        }
        Update: {
          base_currency_code?: string | null
          created_at?: string | null
          default_date_format?: string | null
          default_time_format?: string | null
          default_timezone?: string | null
          default_unit_family?: string | null
          id?: string
          name?: string
          row_version?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["team_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timezones: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_dst: boolean | null
          name: string
          utc_offset: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dst?: boolean | null
          name: string
          utc_offset: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_dst?: boolean | null
          name?: string
          utc_offset?: string
        }
        Relationships: []
      }
      unit_families: {
        Row: {
          base_unit: string
          created_at: string | null
          family_type: Database["public"]["Enums"]["unit_family"]
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          base_unit: string
          created_at?: string | null
          family_type: Database["public"]["Enums"]["unit_family"]
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          base_unit?: string
          created_at?: string | null
          family_type?: Database["public"]["Enums"]["unit_family"]
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          conversion_factor: number
          created_at: string | null
          family_id: string | null
          id: string
          is_active: boolean | null
          is_base_unit: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          conversion_factor: number
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          is_base_unit?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          conversion_factor?: number
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          is_base_unit?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "unit_families"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          capability_key: string
          id: string
          metadata: Json | null
          recorded_at: string | null
          team_id: string | null
          usage_value: number
          window_end: string
          window_start: string
          window_type: Database["public"]["Enums"]["usage_window_type"]
        }
        Insert: {
          capability_key: string
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          team_id?: string | null
          usage_value?: number
          window_end: string
          window_start: string
          window_type: Database["public"]["Enums"]["usage_window_type"]
        }
        Update: {
          capability_key?: string
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          team_id?: string | null
          usage_value?: number
          window_end?: string
          window_start?: string
          window_type?: Database["public"]["Enums"]["usage_window_type"]
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_i18n_preferences: {
        Row: {
          created_at: string | null
          currency_code: Database["public"]["Enums"]["currency_code"] | null
          date_format: Database["public"]["Enums"]["date_format"] | null
          number_format: string | null
          time_format: Database["public"]["Enums"]["time_format"] | null
          timezone_id: string | null
          unit_family: Database["public"]["Enums"]["unit_family"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          date_format?: Database["public"]["Enums"]["date_format"] | null
          number_format?: string | null
          time_format?: Database["public"]["Enums"]["time_format"] | null
          timezone_id?: string | null
          unit_family?: Database["public"]["Enums"]["unit_family"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_code?: Database["public"]["Enums"]["currency_code"] | null
          date_format?: Database["public"]["Enums"]["date_format"] | null
          number_format?: string | null
          time_format?: Database["public"]["Enums"]["time_format"] | null
          timezone_id?: string | null
          unit_family?: Database["public"]["Enums"]["unit_family"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_i18n_preferences_timezone_id_fkey"
            columns: ["timezone_id"]
            isOneToOne: false
            referencedRelation: "timezones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_i18n_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          override_date_format: string | null
          override_time_format: string | null
          override_timezone: string | null
          override_unit_family: string | null
          row_version: number | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_login_at?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          override_date_format?: string | null
          override_time_format?: string | null
          override_timezone?: string | null
          override_unit_family?: string | null
          row_version?: number | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          override_date_format?: string | null
          override_time_format?: string | null
          override_timezone?: string | null
          override_unit_family?: string | null
          row_version?: number | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_capabilities: { Args: { team_uuid: string }; Returns: Json }
      get_team_plan: { Args: { team_uuid: string }; Returns: Json }
      get_team_usage: {
        Args: {
          capability_key: string
          team_uuid: string
          window_type: Database["public"]["Enums"]["usage_window_type"]
        }
        Returns: number
      }
      get_user_currency: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["currency_code"]
      }
      get_user_i18n_preferences: { Args: { user_uuid: string }; Returns: Json }
      get_user_unit_family: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["unit_family"]
      }
      team_has_capability: {
        Args: { capability_key: string; team_uuid: string }
        Returns: boolean
      }
      team_within_limits: {
        Args: {
          capability_key: string
          team_uuid: string
          window_type: Database["public"]["Enums"]["usage_window_type"]
        }
        Returns: boolean
      }
      user_belongs_to_team: { Args: { p_team_id: string }; Returns: boolean }
      user_has_permission: {
        Args: { p_action: string; p_location?: string; p_resource: string }
        Returns: boolean
      }
      user_is_super_admin: { Args: never; Returns: boolean }
      user_is_team_admin: { Args: { p_team_id: string }; Returns: boolean }
    }
    Enums: {
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "permission_change"
      capability_type: "boolean" | "numeric" | "metered"
      currency_code:
        | "USD"
        | "EUR"
        | "GBP"
        | "JPY"
        | "CAD"
        | "AUD"
        | "CHF"
        | "CNY"
        | "SEK"
        | "NZD"
        | "MXN"
        | "SGD"
        | "HKD"
        | "NOK"
        | "TRY"
        | "RUB"
        | "INR"
        | "BRL"
        | "ZAR"
        | "KRW"
      date_format:
        | "MM/DD/YYYY"
        | "DD/MM/YYYY"
        | "YYYY-MM-DD"
        | "DD-MM-YYYY"
        | "MM.DD.YYYY"
        | "DD.MM.YYYY"
        | "YYYY/MM/DD"
        | "DD/MM/YY"
      grace_window_status: "active" | "expired" | "used"
      member_status: "active" | "inactive" | "pending"
      plan_status: "active" | "inactive" | "archived"
      team_status: "active" | "inactive" | "suspended"
      time_format: "12h" | "24h"
      unit_family: "metric" | "imperial" | "custom"
      usage_window_type: "daily" | "weekly" | "monthly" | "yearly"
      user_status: "active" | "inactive" | "suspended"
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
      audit_action: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "permission_change",
      ],
      capability_type: ["boolean", "numeric", "metered"],
      currency_code: [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "CNY",
        "SEK",
        "NZD",
        "MXN",
        "SGD",
        "HKD",
        "NOK",
        "TRY",
        "RUB",
        "INR",
        "BRL",
        "ZAR",
        "KRW",
      ],
      date_format: [
        "MM/DD/YYYY",
        "DD/MM/YYYY",
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "MM.DD.YYYY",
        "DD.MM.YYYY",
        "YYYY/MM/DD",
        "DD/MM/YY",
      ],
      grace_window_status: ["active", "expired", "used"],
      member_status: ["active", "inactive", "pending"],
      plan_status: ["active", "inactive", "archived"],
      team_status: ["active", "inactive", "suspended"],
      time_format: ["12h", "24h"],
      unit_family: ["metric", "imperial", "custom"],
      usage_window_type: ["daily", "weekly", "monthly", "yearly"],
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
