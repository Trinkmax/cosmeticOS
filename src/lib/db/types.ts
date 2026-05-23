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
      appointment_professional_blocks: {
        Row: {
          appointment_id: string
          id: string
          professional_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range: unknown
        }
        Insert: {
          appointment_id: string
          id?: string
          professional_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range: unknown
        }
        Update: {
          appointment_id?: string
          id?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id?: string
          time_range?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "appointment_professional_blocks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_professional_blocks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_professional_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_professionals: {
        Row: {
          appointment_id: string
          is_primary: boolean
          professional_id: string
        }
        Insert: {
          appointment_id: string
          is_primary?: boolean
          professional_id: string
        }
        Update: {
          appointment_id?: string
          is_primary?: boolean
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_professionals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_professionals_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_professionals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_room_blocks: {
        Row: {
          appointment_id: string
          id: string
          location_id: string
          room_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range: unknown
        }
        Insert: {
          appointment_id: string
          id?: string
          location_id: string
          room_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range: unknown
        }
        Update: {
          appointment_id?: string
          id?: string
          location_id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id?: string
          time_range?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "appointment_room_blocks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_room_blocks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_room_blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_rooms: {
        Row: {
          appointment_id: string
          room_id: string
        }
        Insert: {
          appointment_id: string
          room_id: string
        }
        Update: {
          appointment_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_rooms_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_rooms_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          duration_minutes_snapshot: number
          id: string
          price_cents_snapshot: number
          professional_id: string | null
          redeemed_from_package_id: string | null
          service_id: string
          sort_order: number
        }
        Insert: {
          appointment_id: string
          duration_minutes_snapshot: number
          id?: string
          price_cents_snapshot?: number
          professional_id?: string | null
          redeemed_from_package_id?: string | null
          service_id: string
          sort_order?: number
        }
        Update: {
          appointment_id?: string
          duration_minutes_snapshot?: number
          id?: string
          price_cents_snapshot?: number
          professional_id?: string | null
          redeemed_from_package_id?: string | null
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_redeemed_from_package_fkey"
            columns: ["redeemed_from_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_status_history: {
        Row: {
          appointment_id: string
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["appointment_status"] | null
          id: string
          reason: string | null
          tenant_id: string
          to_status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          appointment_id: string
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["appointment_status"] | null
          id?: string
          reason?: string | null
          tenant_id: string
          to_status: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          appointment_id?: string
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["appointment_status"] | null
          id?: string
          reason?: string | null
          tenant_id?: string
          to_status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string | null
          completed_at: string | null
          confirmation_sent_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          ends_at: string
          id: string
          internal_notes: string | null
          location_id: string
          notes: string | null
          reminder_24h_sent_at: string | null
          reminder_2h_sent_at: string | null
          review_request_sent_at: string | null
          source: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range: unknown
          total_cents: number
          updated_at: string
          walk_in_name: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          completed_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          ends_at: string
          id?: string
          internal_notes?: string | null
          location_id: string
          notes?: string | null
          reminder_24h_sent_at?: string | null
          reminder_2h_sent_at?: string | null
          review_request_sent_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id: string
          time_range?: unknown
          total_cents?: number
          updated_at?: string
          walk_in_name?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          completed_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          ends_at?: string
          id?: string
          internal_notes?: string | null
          location_id?: string
          notes?: string | null
          reminder_24h_sent_at?: string | null
          reminder_2h_sent_at?: string | null
          review_request_sent_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          tenant_id?: string
          time_range?: unknown
          total_cents?: number
          updated_at?: string
          walk_in_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          at: string
          before: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip: unknown
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip?: unknown
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip?: unknown
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_accounts: {
        Row: {
          created_at: string
          currency: string
          external_account_id: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["cash_account_kind"]
          location_id: string | null
          name: string
          notes: string | null
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          external_account_id?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["cash_account_kind"]
          location_id?: string | null
          name: string
          notes?: string | null
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          external_account_id?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["cash_account_kind"]
          location_id?: string | null
          name?: string
          notes?: string | null
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_accounts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          account_id: string
          amount_cents: number
          cash_session_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          direction: Database["public"]["Enums"]["movement_direction"]
          id: string
          kind: Database["public"]["Enums"]["movement_kind"]
          location_id: string
          occurred_at: string
          payment_id: string | null
          reverses_movement_id: string | null
          tenant_id: string
          transfer_id: string | null
        }
        Insert: {
          account_id: string
          amount_cents: number
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          direction: Database["public"]["Enums"]["movement_direction"]
          id?: string
          kind: Database["public"]["Enums"]["movement_kind"]
          location_id: string
          occurred_at?: string
          payment_id?: string | null
          reverses_movement_id?: string | null
          tenant_id: string
          transfer_id?: string | null
        }
        Update: {
          account_id?: string
          amount_cents?: number
          cash_session_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["movement_direction"]
          id?: string
          kind?: Database["public"]["Enums"]["movement_kind"]
          location_id?: string
          occurred_at?: string
          payment_id?: string | null
          reverses_movement_id?: string | null
          tenant_id?: string
          transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_reverses_movement_id_fkey"
            columns: ["reverses_movement_id"]
            isOneToOne: false
            referencedRelation: "cash_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "cash_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_notes: string | null
          counted_totals: Json
          created_at: string
          difference_totals: Json
          expected_totals: Json
          id: string
          location_id: string
          opened_at: string
          opened_by: string | null
          opening_notes: string | null
          status: Database["public"]["Enums"]["cash_session_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_notes?: string | null
          counted_totals?: Json
          created_at?: string
          difference_totals?: Json
          expected_totals?: Json
          id?: string
          location_id: string
          opened_at?: string
          opened_by?: string | null
          opening_notes?: string | null
          status?: Database["public"]["Enums"]["cash_session_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_notes?: string | null
          counted_totals?: Json
          created_at?: string
          difference_totals?: Json
          expected_totals?: Json
          id?: string
          location_id?: string
          opened_at?: string
          opened_by?: string | null
          opening_notes?: string | null
          status?: Database["public"]["Enums"]["cash_session_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transfers: {
        Row: {
          amount_cents: number
          created_at: string
          created_by: string | null
          currency: string
          from_account_id: string
          id: string
          notes: string | null
          occurred_at: string
          tenant_id: string
          to_account_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          created_by?: string | null
          currency?: string
          from_account_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          tenant_id: string
          to_account_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          from_account_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          tenant_id?: string
          to_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transfers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      client_addresses: {
        Row: {
          address: string
          city: string | null
          client_id: string
          country: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          postal_code: string | null
          province: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          client_id: string
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          client_id?: string
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_files: {
        Row: {
          appointment_id: string | null
          caption: string | null
          client_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["client_file_kind"]
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          tenant_id: string
          uploaded_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          caption?: string | null
          client_id: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["client_file_kind"]
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          tenant_id: string
          uploaded_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          caption?: string | null
          client_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["client_file_kind"]
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          tenant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_files_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_files_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_health_info: {
        Row: {
          allergies: string | null
          client_id: string
          conditions: Json
          contraindications: string | null
          has_critical_alerts: boolean
          medications: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allergies?: string | null
          client_id: string
          conditions?: Json
          contraindications?: string | null
          has_critical_alerts?: boolean
          medications?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allergies?: string | null
          client_id?: string
          conditions?: Json
          contraindications?: string | null
          has_critical_alerts?: boolean
          medications?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_health_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_health_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
        ]
      }
      client_notes: {
        Row: {
          author_id: string | null
          body: string
          client_id: string
          created_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          client_id: string
          created_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_package_balances: {
        Row: {
          client_package_id: string
          service_id: string
          sessions_remaining: number | null
          sessions_total: number
          sessions_used: number
        }
        Insert: {
          client_package_id: string
          service_id: string
          sessions_remaining?: number | null
          sessions_total: number
          sessions_used?: number
        }
        Update: {
          client_package_id?: string
          service_id?: string
          sessions_remaining?: number | null
          sessions_total?: number
          sessions_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_package_balances_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_balances_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_package_redemptions: {
        Row: {
          appointment_id: string | null
          client_package_id: string
          id: string
          redeemed_at: string
          redeemed_by: string | null
          reversed_at: string | null
          reversed_by: string | null
          reverses_redemption_id: string | null
          service_id: string
          sessions_used: number
          tenant_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_package_id: string
          id?: string
          redeemed_at?: string
          redeemed_by?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          reverses_redemption_id?: string | null
          service_id: string
          sessions_used?: number
          tenant_id: string
        }
        Update: {
          appointment_id?: string | null
          client_package_id?: string
          id?: string
          redeemed_at?: string
          redeemed_by?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          reverses_redemption_id?: string | null
          service_id?: string
          sessions_used?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_package_redemptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_redemptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_redemptions_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_redemptions_reverses_redemption_id_fkey"
            columns: ["reverses_redemption_id"]
            isOneToOne: false
            referencedRelation: "client_package_redemptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_redemptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_package_redemptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_packages: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          expires_at: string | null
          id: string
          notes: string | null
          package_id: string
          purchased_at: string
          status: Database["public"]["Enums"]["client_package_status"]
          tenant_id: string
          total_paid_cents: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          package_id: string
          purchased_at?: string
          status?: Database["public"]["Enums"]["client_package_status"]
          tenant_id: string
          total_paid_cents?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          package_id?: string
          purchased_at?: string
          status?: Database["public"]["Enums"]["client_package_status"]
          tenant_id?: string
          total_paid_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string | null
          created_at: string
          created_by: string | null
          created_via: string | null
          cuit: string | null
          dni: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["client_gender"] | null
          id: string
          is_active: boolean
          notes: string | null
          phone_e164: string | null
          source: Database["public"]["Enums"]["client_source"] | null
          tags: string[]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          created_via?: string | null
          cuit?: string | null
          dni?: string | null
          email?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["client_gender"] | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone_e164?: string | null
          source?: Database["public"]["Enums"]["client_source"] | null
          tags?: string[]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          created_via?: string | null
          cuit?: string | null
          dni?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["client_gender"] | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone_e164?: string | null
          source?: Database["public"]["Enums"]["client_source"] | null
          tags?: string[]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_calculations: {
        Row: {
          appointment_id: string | null
          appointment_service_id: string | null
          base_cents: number
          calculated_at: string
          commission_cents: number
          currency: string
          id: string
          notes: string | null
          payment_id: string | null
          payment_item_id: string | null
          payout_id: string | null
          professional_id: string
          rule_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
        }
        Insert: {
          appointment_id?: string | null
          appointment_service_id?: string | null
          base_cents: number
          calculated_at?: string
          commission_cents: number
          currency?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_item_id?: string | null
          payout_id?: string | null
          professional_id: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id: string
        }
        Update: {
          appointment_id?: string | null
          appointment_service_id?: string | null
          base_cents?: number
          calculated_at?: string
          commission_cents?: number
          currency?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_item_id?: string | null
          payout_id?: string | null
          professional_id?: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_calculations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_appointment_service_id_fkey"
            columns: ["appointment_service_id"]
            isOneToOne: false
            referencedRelation: "appointment_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_payment_item_id_fkey"
            columns: ["payment_item_id"]
            isOneToOne: false
            referencedRelation: "payment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_payout_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "commission_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_payouts: {
        Row: {
          account_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          pdf_storage_path: string | null
          period_end: string
          period_start: string
          professional_id: string
          status: Database["public"]["Enums"]["commission_payout_status"]
          tenant_id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          pdf_storage_path?: string | null
          period_end: string
          period_start: string
          professional_id: string
          status?: Database["public"]["Enums"]["commission_payout_status"]
          tenant_id: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          pdf_storage_path?: string | null
          period_end?: string
          period_start?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["commission_payout_status"]
          tenant_id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_payouts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_payouts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_payouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          applies_to: Database["public"]["Enums"]["commission_applies_to"]
          category_id: string | null
          created_at: string
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          product_id: string | null
          professional_id: string | null
          rule_type: Database["public"]["Enums"]["commission_rule_type"]
          service_id: string | null
          tenant_id: string
          updated_at: string
          value_bps_or_cents: number
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["commission_applies_to"]
          category_id?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          product_id?: string | null
          professional_id?: string | null
          rule_type: Database["public"]["Enums"]["commission_rule_type"]
          service_id?: string | null
          tenant_id: string
          updated_at?: string
          value_bps_or_cents: number
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["commission_applies_to"]
          category_id?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          product_id?: string | null
          professional_id?: string | null
          rule_type?: Database["public"]["Enums"]["commission_rule_type"]
          service_id?: string | null
          tenant_id?: string
          updated_at?: string
          value_bps_or_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_templates: {
        Row: {
          applies_to_category_ids: string[]
          applies_to_service_ids: string[]
          body_markdown: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
          version: number
        }
        Insert: {
          applies_to_category_ids?: string[]
          applies_to_service_ids?: string[]
          body_markdown: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          applies_to_category_ids?: string[]
          applies_to_service_ids?: string[]
          body_markdown?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "consent_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          appointment_id: string | null
          body_hash: string
          body_snapshot: string
          client_id: string
          created_by: string | null
          id: string
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          signature_storage_path: string
          signed_at: string
          signed_ip: unknown
          signed_location_id: string | null
          signed_user_agent: string | null
          status: Database["public"]["Enums"]["consent_status"]
          template_id: string
          template_version: number
          tenant_id: string
        }
        Insert: {
          appointment_id?: string | null
          body_hash: string
          body_snapshot: string
          client_id: string
          created_by?: string | null
          id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature_storage_path: string
          signed_at?: string
          signed_ip?: unknown
          signed_location_id?: string | null
          signed_user_agent?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          template_id: string
          template_version: number
          tenant_id: string
        }
        Update: {
          appointment_id?: string | null
          body_hash?: string
          body_snapshot?: string
          client_id?: string
          created_by?: string | null
          id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          signature_storage_path?: string
          signed_at?: string
          signed_ip?: unknown
          signed_location_id?: string | null
          signed_user_agent?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          template_id?: string
          template_version?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "consents_signed_location_id_fkey"
            columns: ["signed_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "consent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          account_id: string | null
          amount_cents: number
          category: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          location_id: string | null
          movement_id: string | null
          occurred_at: string
          receipt_storage_path: string | null
          tenant_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          location_id?: string | null
          movement_id?: string | null
          occurred_at?: string
          receipt_storage_path?: string | null
          tenant_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          location_id?: string | null
          movement_id?: string | null
          occurred_at?: string
          receipt_storage_path?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "cash_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          cost_cents: number | null
          created_at: string
          currency: string
          id: string
          is_active: boolean
          min_stock: number
          name: string
          stock_quantity: number
          tenant_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          min_stock?: number
          name: string
          stock_quantity?: number
          tenant_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          min_stock?: number
          name?: string
          stock_quantity?: number
          tenant_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          opening_hours: Json
          phone_e164: string | null
          postal_code: string | null
          province: string | null
          slug: string
          tenant_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          opening_hours?: Json
          phone_e164?: string | null
          postal_code?: string | null
          province?: string | null
          slug: string
          tenant_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          opening_hours?: Json
          phone_e164?: string | null
          postal_code?: string | null
          province?: string | null
          slug?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_locations: {
        Row: {
          location_id: string
          member_id: string
        }
        Insert: {
          location_id: string
          member_id: string
        }
        Update: {
          location_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_locations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          accepted_at: string | null
          created_at: string
          disabled_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          invited_email: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      package_services: {
        Row: {
          package_id: string
          service_id: string
          sessions_included: number
        }
        Insert: {
          package_id: string
          service_id: string
          sessions_included: number
        }
        Update: {
          package_id?: string
          service_id?: string
          sessions_included?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_services_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          color: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          sort_order: number
          tenant_id: string
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          sort_order?: number
          tenant_id: string
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_items: {
        Row: {
          client_package_id: string | null
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          payment_id: string
          product_id: string | null
          quantity: number
          service_id: string | null
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          client_package_id?: string | null
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["payment_kind"]
          payment_id: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          client_package_id?: string | null
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          payment_id?: string
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_items_client_package_id_fkey"
            columns: ["client_package_id"]
            isOneToOne: false
            referencedRelation: "client_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_id: string | null
          amount_cents: number
          appointment_id: string | null
          cash_session_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          external_reference: string | null
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          location_id: string
          notes: string | null
          occurred_at: string
          reverses_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          appointment_id?: string | null
          cash_session_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          external_reference?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          location_id: string
          notes?: string | null
          occurred_at?: string
          reverses_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          appointment_id?: string | null
          cash_session_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          external_reference?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          location_id?: string
          notes?: string | null
          occurred_at?: string
          reverses_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "cash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reverses_payment_id_fkey"
            columns: ["reverses_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          cost_cents: number | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          min_stock: number
          name: string
          price_cents: number
          sku: string | null
          stock_quantity: number
          stock_tracked: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock?: number
          name: string
          price_cents?: number
          sku?: string | null
          stock_quantity?: number
          stock_tracked?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_stock?: number
          name?: string
          price_cents?: number
          sku?: string | null
          stock_quantity?: number
          stock_tracked?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_locations: {
        Row: {
          location_id: string
          professional_id: string
        }
        Insert: {
          location_id: string
          professional_id: string
        }
        Update: {
          location_id?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_locations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_schedule_exceptions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          kind: Database["public"]["Enums"]["schedule_exception_kind"]
          location_id: string | null
          professional_id: string
          reason: string | null
          starts_at: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          kind: Database["public"]["Enums"]["schedule_exception_kind"]
          location_id?: string | null
          professional_id: string
          reason?: string | null
          starts_at: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["schedule_exception_kind"]
          location_id?: string | null
          professional_id?: string
          reason?: string | null
          starts_at?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_schedule_exceptions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_schedule_exceptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_schedule_exceptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_schedules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          location_id: string | null
          professional_id: string
          start_time: string
          tenant_id: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          location_id?: string | null
          professional_id: string
          start_time: string
          tenant_id: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          location_id?: string | null
          professional_id?: string
          start_time?: string
          tenant_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_schedules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_schedules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_services: {
        Row: {
          duration_minutes_override: number | null
          price_cents_override: number | null
          professional_id: string
          service_id: string
        }
        Insert: {
          duration_minutes_override?: number | null
          price_cents_override?: number | null
          professional_id: string
          service_id: string
        }
        Update: {
          duration_minutes_override?: number | null
          price_cents_override?: number | null
          professional_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          avatar_url: string | null
          bio: string | null
          color: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          member_id: string | null
          online_bookable: boolean
          phone_e164: string | null
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          color?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          is_active?: boolean
          member_id?: string | null
          online_bookable?: boolean
          phone_e164?: string | null
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          color?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          member_id?: string | null
          online_bookable?: boolean
          phone_e164?: string | null
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string | null
          phone_e164: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string | null
          phone_e164?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string | null
          phone_e164?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_cases: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          review_id: string
          status: Database["public"]["Enums"]["review_case_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id: string
          status?: Database["public"]["Enums"]["review_case_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string
          status?: Database["public"]["Enums"]["review_case_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_cases_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          appointment_id: string
          channel: Database["public"]["Enums"]["review_channel"]
          client_id: string
          id: string
          opened_at: string | null
          responded_at: string | null
          review_id: string | null
          sent_at: string
          tenant_id: string
          token: string
        }
        Insert: {
          appointment_id: string
          channel: Database["public"]["Enums"]["review_channel"]
          client_id: string
          id?: string
          opened_at?: string | null
          responded_at?: string | null
          review_id?: string | null
          sent_at?: string
          tenant_id: string
          token: string
        }
        Update: {
          appointment_id?: string
          channel?: Database["public"]["Enums"]["review_channel"]
          client_id?: string
          id?: string
          opened_at?: string | null
          responded_at?: string | null
          review_id?: string | null
          sent_at?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "review_requests_review_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          comment: string | null
          created_at: string
          google_review_url: string | null
          id: string
          internal_reason: string | null
          is_public: boolean
          rating: number
          request_id: string | null
          source: Database["public"]["Enums"]["review_channel"]
          status: Database["public"]["Enums"]["review_status"]
          tenant_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string
          google_review_url?: string | null
          id?: string
          internal_reason?: string | null
          is_public?: boolean
          rating: number
          request_id?: string | null
          source: Database["public"]["Enums"]["review_channel"]
          status?: Database["public"]["Enums"]["review_status"]
          tenant_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string
          google_review_url?: string | null
          id?: string
          internal_reason?: string | null
          is_public?: boolean
          rating?: number
          request_id?: string | null
          source?: Database["public"]["Enums"]["review_channel"]
          status?: Database["public"]["Enums"]["review_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_daily_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string
          name: string
          sort_order: number
          suitable_for_category_ids: string[]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id: string
          name: string
          sort_order?: number
          suitable_for_category_ids?: string[]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string
          name?: string
          sort_order?: number
          suitable_for_category_ids?: string[]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_inventory_usage: {
        Row: {
          inventory_item_id: string
          quantity_per_session: number
          service_id: string
        }
        Insert: {
          inventory_item_id: string
          quantity_per_session: number
          service_id: string
        }
        Update: {
          inventory_item_id?: string
          quantity_per_session?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_inventory_usage_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_inventory_usage_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_location_overrides: {
        Row: {
          created_at: string
          is_available: boolean
          location_id: string
          price_cents: number | null
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_available?: boolean
          location_id: string
          price_cents?: number | null
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_available?: boolean
          location_id?: string
          price_cents?: number | null
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_location_overrides_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_location_overrides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          category_id: string | null
          color: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          online_bookable: boolean
          price_cents: number
          requires_consent: boolean
          requires_room: boolean
          sort_order: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          category_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          online_bookable?: boolean
          price_cents?: number
          requires_consent?: boolean
          requires_room?: boolean
          sort_order?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          category_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          online_bookable?: boolean
          price_cents?: number
          requires_consent?: boolean
          requires_room?: boolean
          sort_order?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          appointment_buffer_minutes: number
          booking_link_enabled: boolean
          branding: Json
          created_at: string
          default_appointment_duration_minutes: number
          features: Json
          google_review_url: string | null
          reminder_offsets: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          appointment_buffer_minutes?: number
          booking_link_enabled?: boolean
          branding?: Json
          created_at?: string
          default_appointment_duration_minutes?: number
          features?: Json
          google_review_url?: string | null
          reminder_offsets?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          appointment_buffer_minutes?: number
          booking_link_enabled?: boolean
          branding?: Json
          created_at?: string
          default_appointment_duration_minutes?: number
          features?: Json
          google_review_url?: string | null
          reminder_offsets?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          country: string
          created_at: string
          currency: string
          id: string
          legal_name: string | null
          name: string
          owner_user_id: string | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          tax_id: string | null
          timezone: string
          trial_ends_at: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          currency?: string
          id?: string
          legal_name?: string | null
          name: string
          owner_user_id?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tax_id?: string | null
          timezone?: string
          trial_ends_at?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          id?: string
          legal_name?: string | null
          name?: string
          owner_user_id?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tax_id?: string | null
          timezone?: string
          trial_ends_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_automations: {
        Row: {
          created_at: string
          custom_body: string | null
          id: string
          is_active: boolean
          offset_minutes: number | null
          session_id: string | null
          template_id: string | null
          tenant_id: string
          trigger: Database["public"]["Enums"]["whatsapp_automation_trigger"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_body?: string | null
          id?: string
          is_active?: boolean
          offset_minutes?: number | null
          session_id?: string | null
          template_id?: string | null
          tenant_id: string
          trigger: Database["public"]["Enums"]["whatsapp_automation_trigger"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_body?: string | null
          id?: string
          is_active?: boolean
          offset_minutes?: number | null
          session_id?: string | null
          template_id?: string | null
          tenant_id?: string
          trigger?: Database["public"]["Enums"]["whatsapp_automation_trigger"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_campaigns: {
        Row: {
          audience_filter: Json
          created_at: string
          created_by: string | null
          delivered_count: number
          failed_count: number
          finished_at: string | null
          id: string
          name: string
          read_count: number
          scheduled_at: string | null
          sent_count: number
          session_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["whatsapp_campaign_status"]
          template_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          audience_filter?: Json
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          failed_count?: number
          finished_at?: string | null
          id?: string
          name: string
          read_count?: number
          scheduled_at?: string | null
          sent_count?: number
          session_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_campaign_status"]
          template_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          audience_filter?: Json
          created_at?: string
          created_by?: string | null
          delivered_count?: number
          failed_count?: number
          finished_at?: string | null
          id?: string
          name?: string
          read_count?: number
          scheduled_at?: string | null
          sent_count?: number
          session_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_campaign_status"]
          template_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_campaigns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_chats: {
        Row: {
          assigned_to_member_id: string | null
          client_id: string | null
          contact_avatar_url: string | null
          contact_name: string | null
          contact_phone_e164: string
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          metadata: Json
          session_id: string
          snoozed_until: string | null
          status: Database["public"]["Enums"]["whatsapp_chat_status"]
          tags: string[]
          tenant_id: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to_member_id?: string | null
          client_id?: string | null
          contact_avatar_url?: string | null
          contact_name?: string | null
          contact_phone_e164: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          session_id: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["whatsapp_chat_status"]
          tags?: string[]
          tenant_id: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to_member_id?: string | null
          client_id?: string | null
          contact_avatar_url?: string | null
          contact_name?: string | null
          contact_phone_e164?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json
          session_id?: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["whatsapp_chat_status"]
          tags?: string[]
          tenant_id?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_chats_assigned_to_member_id_fkey"
            columns: ["assigned_to_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "whatsapp_chats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_chats_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          chat_id: string
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["whatsapp_message_direction"]
          error_text: string | null
          external_id: string | null
          id: string
          is_automated: boolean
          kind: Database["public"]["Enums"]["whatsapp_message_kind"]
          media_caption: string | null
          media_mime: string | null
          media_storage_path: string | null
          media_url: string | null
          payload: Json | null
          read_at: string | null
          received_at: string | null
          reply_to_message_id: string | null
          sent_at: string | null
          sent_by_member_id: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["whatsapp_message_status"]
          template_name: string | null
          template_variables: Json | null
          tenant_id: string
        }
        Insert: {
          body?: string | null
          chat_id: string
          created_at?: string
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["whatsapp_message_direction"]
          error_text?: string | null
          external_id?: string | null
          id?: string
          is_automated?: boolean
          kind?: Database["public"]["Enums"]["whatsapp_message_kind"]
          media_caption?: string | null
          media_mime?: string | null
          media_storage_path?: string | null
          media_url?: string | null
          payload?: Json | null
          read_at?: string | null
          received_at?: string | null
          reply_to_message_id?: string | null
          sent_at?: string | null
          sent_by_member_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_name?: string | null
          template_variables?: Json | null
          tenant_id: string
        }
        Update: {
          body?: string | null
          chat_id?: string
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["whatsapp_message_direction"]
          error_text?: string | null
          external_id?: string | null
          id?: string
          is_automated?: boolean
          kind?: Database["public"]["Enums"]["whatsapp_message_kind"]
          media_caption?: string | null
          media_mime?: string | null
          media_storage_path?: string | null
          media_url?: string | null
          payload?: Json | null
          read_at?: string | null
          received_at?: string | null
          reply_to_message_id?: string | null
          sent_at?: string | null
          sent_by_member_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          template_name?: string | null
          template_variables?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_sent_by_member_id_fkey"
            columns: ["sent_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          access_token_encrypted: string | null
          baileys_auth_state: Json | null
          business_account_id: string | null
          created_at: string
          created_by: string | null
          display_name: string
          display_phone_e164: string | null
          id: string
          is_active: boolean
          last_error: string | null
          last_qr_at: string | null
          last_qr_payload: string | null
          last_seen_at: string | null
          location_id: string | null
          phone_number_id: string | null
          provider: Database["public"]["Enums"]["whatsapp_provider"]
          status: Database["public"]["Enums"]["whatsapp_session_status"]
          tenant_id: string
          updated_at: string
          webhook_verify_token: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          baileys_auth_state?: Json | null
          business_account_id?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          display_phone_e164?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_qr_at?: string | null
          last_qr_payload?: string | null
          last_seen_at?: string | null
          location_id?: string | null
          phone_number_id?: string | null
          provider: Database["public"]["Enums"]["whatsapp_provider"]
          status?: Database["public"]["Enums"]["whatsapp_session_status"]
          tenant_id: string
          updated_at?: string
          webhook_verify_token?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          baileys_auth_state?: Json | null
          business_account_id?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          display_phone_e164?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_qr_at?: string | null
          last_qr_payload?: string | null
          last_seen_at?: string | null
          location_id?: string | null
          phone_number_id?: string | null
          provider?: Database["public"]["Enums"]["whatsapp_provider"]
          status?: Database["public"]["Enums"]["whatsapp_session_status"]
          tenant_id?: string
          updated_at?: string
          webhook_verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body: string
          buttons: Json | null
          category: Database["public"]["Enums"]["whatsapp_template_category"]
          created_at: string
          created_by: string | null
          footer: string | null
          header: Json | null
          id: string
          language: string
          meta_id: string | null
          name: string
          session_id: string | null
          status: Database["public"]["Enums"]["whatsapp_template_status"]
          status_reason: string | null
          tenant_id: string
          updated_at: string
          variables: Json
        }
        Insert: {
          body: string
          buttons?: Json | null
          category?: Database["public"]["Enums"]["whatsapp_template_category"]
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header?: Json | null
          id?: string
          language?: string
          meta_id?: string | null
          name: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_template_status"]
          status_reason?: string | null
          tenant_id: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          body?: string
          buttons?: Json | null
          category?: Database["public"]["Enums"]["whatsapp_template_category"]
          created_at?: string
          created_by?: string | null
          footer?: string | null
          header?: Json | null
          id?: string
          language?: string
          meta_id?: string | null
          name?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_template_status"]
          status_reason?: string | null
          tenant_id?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_webhook_events: {
        Row: {
          error_text: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["whatsapp_provider"]
          received_at: string
          session_id: string | null
          tenant_id: string | null
        }
        Insert: {
          error_text?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["whatsapp_provider"]
          received_at?: string
          session_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          error_text?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["whatsapp_provider"]
          received_at?: string
          session_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_client_stats: {
        Row: {
          active_packages: number | null
          client_id: string | null
          completed_appointments: number | null
          last_visit_at: string | null
          no_show_count: number | null
          tenant_id: string | null
          total_spent_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cron_jobs: {
        Row: {
          active: boolean | null
          command: string | null
          jobid: number | null
          jobname: string | null
          last_run: string | null
          last_status: string | null
          schedule: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          jobid?: number | null
          jobname?: string | null
          last_run?: never
          last_status?: never
          schedule?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          jobid?: number | null
          jobname?: string | null
          last_run?: never
          last_status?: never
          schedule?: string | null
        }
        Relationships: []
      }
      v_daily_agenda: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          currency: string | null
          display_name: string | null
          ends_at: string | null
          id: string | null
          location_id: string | null
          notes: string | null
          professionals: Json | null
          rooms: Json | null
          services: Json | null
          source: Database["public"]["Enums"]["appointment_source"] | null
          starts_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string | null
          total_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_client_stats"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_appointment: {
        Args: {
          _client_id?: string
          _ends_at: string
          _location_id: string
          _notes?: string
          _professional_ids?: string[]
          _room_ids?: string[]
          _service_ids?: string[]
          _source?: Database["public"]["Enums"]["appointment_source"]
          _starts_at: string
          _status?: Database["public"]["Enums"]["appointment_status"]
          _walk_in_name?: string
        }
        Returns: string
      }
      create_tenant: {
        Args: {
          _country?: string
          _currency?: string
          _location_address?: string
          _location_name?: string
          _location_phone?: string
          _name: string
          _slug: string
          _timezone?: string
        }
        Returns: Json
      }
      current_location_id: { Args: never; Returns: string }
      current_tenant_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_dashboard_kpis: {
        Args: { _from?: string; _to?: string }
        Returns: Json
      }
      has_tenant_role: {
        Args: {
          _roles: Database["public"]["Enums"]["member_role"][]
          _tenant_id: string
        }
        Returns: boolean
      }
      is_location_accessible: {
        Args: { _location_id: string }
        Returns: boolean
      }
      is_professional_free: {
        Args: {
          _ends_at: string
          _exclude_appointment_id?: string
          _professional_id: string
          _starts_at: string
        }
        Returns: boolean
      }
      is_room_free: {
        Args: {
          _ends_at: string
          _exclude_appointment_id?: string
          _room_id: string
          _starts_at: string
        }
        Returns: boolean
      }
      is_tenant_admin: { Args: { _tenant_id: string }; Returns: boolean }
      is_tenant_member: { Args: { _tenant_id: string }; Returns: boolean }
      public_create_booking: {
        Args: {
          _email: string
          _full_name: string
          _location_id: string
          _phone_e164: string
          _professional_id: string
          _service_ids: string[]
          _starts_at: string
          _tenant_slug: string
        }
        Returns: Json
      }
      public_get_availability: {
        Args: {
          _date: string
          _duration_minutes: number
          _professional_id: string
          _tenant_slug: string
        }
        Returns: Json
      }
      public_get_booking_info: { Args: { _slug: string }; Returns: Json }
      search_clients: {
        Args: { _limit?: number; _q: string }
        Returns: {
          email: string
          full_name: string
          id: string
          phone_e164: string
          similarity: number
        }[]
      }
      switch_location: { Args: { _location_id: string }; Returns: undefined }
      switch_tenant: {
        Args: { _location_id?: string; _tenant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      appointment_source:
        | "panel"
        | "public_link"
        | "whatsapp"
        | "walk_in"
        | "import"
        | "api"
      appointment_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      cash_account_kind:
        | "cash"
        | "mercadopago"
        | "modo"
        | "bank"
        | "card"
        | "crypto"
        | "other"
      cash_session_status: "open" | "closed"
      client_file_kind: "before" | "after" | "document" | "consent" | "other"
      client_gender: "female" | "male" | "non_binary" | "undisclosed"
      client_package_status:
        | "active"
        | "expired"
        | "consumed"
        | "refunded"
        | "cancelled"
      client_source:
        | "walk_in"
        | "whatsapp"
        | "public_link"
        | "referral"
        | "instagram"
        | "other"
      commission_applies_to: "service" | "product" | "package" | "all"
      commission_payout_status: "draft" | "approved" | "paid" | "cancelled"
      commission_rule_type: "percent" | "fixed"
      commission_status: "pending" | "approved" | "paid" | "cancelled"
      consent_status: "signed" | "revoked"
      member_role: "owner" | "admin" | "reception" | "professional" | "advisor"
      member_status: "active" | "invited" | "disabled"
      movement_direction: "in" | "out"
      movement_kind:
        | "payment"
        | "refund"
        | "expense"
        | "transfer_in"
        | "transfer_out"
        | "adjustment"
        | "opening_balance"
        | "tip"
      payment_kind:
        | "service"
        | "product"
        | "package"
        | "tip"
        | "refund"
        | "expense"
        | "other"
      payment_status:
        | "pending"
        | "completed"
        | "refunded"
        | "cancelled"
        | "failed"
      review_case_status: "open" | "in_progress" | "resolved" | "discarded"
      review_channel: "whatsapp" | "email" | "public_link"
      review_status:
        | "pending"
        | "public_redirect"
        | "internal"
        | "escalated"
        | "resolved"
      schedule_exception_kind: "time_off" | "extra_shift" | "custom_hours"
      tenant_plan: "trial" | "starter" | "pro" | "studio" | "chain"
      tenant_status: "active" | "suspended" | "cancelled"
      whatsapp_automation_trigger:
        | "appointment_reminder_24h"
        | "appointment_reminder_2h"
        | "appointment_confirmation"
        | "review_request"
        | "birthday"
        | "package_expiring"
        | "first_visit_followup"
        | "win_back"
        | "custom"
      whatsapp_campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "cancelled"
        | "failed"
      whatsapp_chat_status: "open" | "closed" | "snoozed" | "spam"
      whatsapp_message_direction: "in" | "out"
      whatsapp_message_kind:
        | "text"
        | "image"
        | "audio"
        | "video"
        | "document"
        | "sticker"
        | "location"
        | "contact"
        | "template"
        | "button_reply"
        | "list_reply"
        | "interactive"
        | "system"
      whatsapp_message_status:
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "received"
      whatsapp_provider: "baileys" | "meta"
      whatsapp_session_status:
        | "disconnected"
        | "connecting"
        | "qr_required"
        | "connected"
        | "logged_out"
        | "banned"
        | "error"
      whatsapp_template_category: "marketing" | "utility" | "authentication"
      whatsapp_template_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "paused"
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
      appointment_source: [
        "panel",
        "public_link",
        "whatsapp",
        "walk_in",
        "import",
        "api",
      ],
      appointment_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      cash_account_kind: [
        "cash",
        "mercadopago",
        "modo",
        "bank",
        "card",
        "crypto",
        "other",
      ],
      cash_session_status: ["open", "closed"],
      client_file_kind: ["before", "after", "document", "consent", "other"],
      client_gender: ["female", "male", "non_binary", "undisclosed"],
      client_package_status: [
        "active",
        "expired",
        "consumed",
        "refunded",
        "cancelled",
      ],
      client_source: [
        "walk_in",
        "whatsapp",
        "public_link",
        "referral",
        "instagram",
        "other",
      ],
      commission_applies_to: ["service", "product", "package", "all"],
      commission_payout_status: ["draft", "approved", "paid", "cancelled"],
      commission_rule_type: ["percent", "fixed"],
      commission_status: ["pending", "approved", "paid", "cancelled"],
      consent_status: ["signed", "revoked"],
      member_role: ["owner", "admin", "reception", "professional", "advisor"],
      member_status: ["active", "invited", "disabled"],
      movement_direction: ["in", "out"],
      movement_kind: [
        "payment",
        "refund",
        "expense",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "opening_balance",
        "tip",
      ],
      payment_kind: [
        "service",
        "product",
        "package",
        "tip",
        "refund",
        "expense",
        "other",
      ],
      payment_status: [
        "pending",
        "completed",
        "refunded",
        "cancelled",
        "failed",
      ],
      review_case_status: ["open", "in_progress", "resolved", "discarded"],
      review_channel: ["whatsapp", "email", "public_link"],
      review_status: [
        "pending",
        "public_redirect",
        "internal",
        "escalated",
        "resolved",
      ],
      schedule_exception_kind: ["time_off", "extra_shift", "custom_hours"],
      tenant_plan: ["trial", "starter", "pro", "studio", "chain"],
      tenant_status: ["active", "suspended", "cancelled"],
      whatsapp_automation_trigger: [
        "appointment_reminder_24h",
        "appointment_reminder_2h",
        "appointment_confirmation",
        "review_request",
        "birthday",
        "package_expiring",
        "first_visit_followup",
        "win_back",
        "custom",
      ],
      whatsapp_campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "cancelled",
        "failed",
      ],
      whatsapp_chat_status: ["open", "closed", "snoozed", "spam"],
      whatsapp_message_direction: ["in", "out"],
      whatsapp_message_kind: [
        "text",
        "image",
        "audio",
        "video",
        "document",
        "sticker",
        "location",
        "contact",
        "template",
        "button_reply",
        "list_reply",
        "interactive",
        "system",
      ],
      whatsapp_message_status: [
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
        "received",
      ],
      whatsapp_provider: ["baileys", "meta"],
      whatsapp_session_status: [
        "disconnected",
        "connecting",
        "qr_required",
        "connected",
        "logged_out",
        "banned",
        "error",
      ],
      whatsapp_template_category: ["marketing", "utility", "authentication"],
      whatsapp_template_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "paused",
      ],
    },
  },
} as const
