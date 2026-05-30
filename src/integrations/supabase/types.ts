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
      agents: {
        Row: {
          avg_days: number | null
          created_at: string
          email: string | null
          geo_point: unknown
          id: string
          latitude: number
          listing_type: string
          logo: string | null
          longitude: number
          name: string
          phone: string | null
          postcode: string | null
          price_achieved: string | null
          properties_sold: number | null
          rating: number | null
          review_score: number | null
          reviews: string[] | null
          stars: number | null
          strengths: string | null
          website: string | null
        }
        Insert: {
          avg_days?: number | null
          created_at?: string
          email?: string | null
          geo_point?: unknown
          id?: string
          latitude: number
          listing_type?: string
          logo?: string | null
          longitude: number
          name: string
          phone?: string | null
          postcode?: string | null
          price_achieved?: string | null
          properties_sold?: number | null
          rating?: number | null
          review_score?: number | null
          reviews?: string[] | null
          stars?: number | null
          strengths?: string | null
          website?: string | null
        }
        Update: {
          avg_days?: number | null
          created_at?: string
          email?: string | null
          geo_point?: unknown
          id?: string
          latitude?: number
          listing_type?: string
          logo?: string | null
          longitude?: number
          name?: string
          phone?: string | null
          postcode?: string | null
          price_achieved?: string | null
          properties_sold?: number | null
          rating?: number | null
          review_score?: number | null
          reviews?: string[] | null
          stars?: number | null
          strengths?: string | null
          website?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          conversation_title: string
          created_at: string
          id: string
          messages: Json
          related_property_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_title?: string
          created_at?: string
          id?: string
          messages?: Json
          related_property_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_title?: string
          created_at?: string
          id?: string
          messages?: Json
          related_property_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "saved_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_valuations: {
        Row: {
          address: string
          bathrooms: string | null
          bedrooms: string | null
          confidence: number | null
          created_at: string
          email: string
          id: string
          phone: string | null
          postcode: string | null
          property_type: string | null
          report_json: Json | null
          sqft: string | null
          status: string
          unique_features: string | null
          user_id: string | null
          valuation_high: number | null
          valuation_low: number | null
        }
        Insert: {
          address: string
          bathrooms?: string | null
          bedrooms?: string | null
          confidence?: number | null
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          postcode?: string | null
          property_type?: string | null
          report_json?: Json | null
          sqft?: string | null
          status?: string
          unique_features?: string | null
          user_id?: string | null
          valuation_high?: number | null
          valuation_low?: number | null
        }
        Update: {
          address?: string
          bathrooms?: string | null
          bedrooms?: string | null
          confidence?: number | null
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          postcode?: string | null
          property_type?: string | null
          report_json?: Json | null
          sqft?: string | null
          status?: string
          unique_features?: string | null
          user_id?: string | null
          valuation_high?: number | null
          valuation_low?: number | null
        }
        Relationships: []
      }
      aml_checks: {
        Row: {
          address: string
          created_at: string
          date_of_birth: string
          document_type: string | null
          full_name: string
          id: string
          listing_id: string | null
          notes: string | null
          postcode: string | null
          status: string
          verified_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          date_of_birth: string
          document_type?: string | null
          full_name: string
          id?: string
          listing_id?: string | null
          notes?: string | null
          postcode?: string | null
          status?: string
          verified_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          date_of_birth?: string
          document_type?: string | null
          full_name?: string
          id?: string
          listing_id?: string | null
          notes?: string | null
          postcode?: string | null
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aml_checks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aml_checks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "property_listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      area_insights_cache: {
        Row: {
          cache_key: string
          fetched_at: string
          id: string
          payload: Json
          postcode: string | null
        }
        Insert: {
          cache_key: string
          fetched_at?: string
          id?: string
          payload: Json
          postcode?: string | null
        }
        Update: {
          cache_key?: string
          fetched_at?: string
          id?: string
          payload?: Json
          postcode?: string | null
        }
        Relationships: []
      }
      audit_usage: {
        Row: {
          audit_count: number
          created_at: string
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_count?: number
          created_at?: string
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_count?: number
          created_at?: string
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      early_access_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string
          name: string | null
          redeemed: boolean
          redeemed_at: string | null
          role: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by: string
          name?: string | null
          redeemed?: boolean
          redeemed_at?: string | null
          role?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          name?: string | null
          redeemed?: boolean
          redeemed_at?: string | null
          role?: string
          token?: string
        }
        Relationships: []
      }
      early_access_requests: {
        Row: {
          access_code: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          reason: string | null
          status: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          reason?: string | null
          status?: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          id: string
          metadata: Json | null
          search_vector: unknown
          section_title: string | null
          source_document: string
        }
        Insert: {
          chunk_index?: number
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          search_vector?: unknown
          section_title?: string | null
          source_document: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          search_vector?: unknown
          section_title?: string | null
          source_document?: string
        }
        Relationships: []
      }
      landlord_contracts: {
        Row: {
          certificate_id: string | null
          created_at: string
          id: string
          landlord_ip: string | null
          landlord_signature: string | null
          pet_agreement: boolean | null
          prescribed_clauses: string
          property_id: string | null
          signed_by_landlord_at: string | null
          signed_by_tenant_at: string | null
          special_clauses: string
          status: string
          template_type: string
          tenant_email: string | null
          tenant_initials: string | null
          tenant_ip: string | null
          tenant_name: string | null
          tenant_signature: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          created_at?: string
          id?: string
          landlord_ip?: string | null
          landlord_signature?: string | null
          pet_agreement?: boolean | null
          prescribed_clauses?: string
          property_id?: string | null
          signed_by_landlord_at?: string | null
          signed_by_tenant_at?: string | null
          special_clauses?: string
          status?: string
          template_type?: string
          tenant_email?: string | null
          tenant_initials?: string | null
          tenant_ip?: string | null
          tenant_name?: string | null
          tenant_signature?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_id?: string | null
          created_at?: string
          id?: string
          landlord_ip?: string | null
          landlord_signature?: string | null
          pet_agreement?: boolean | null
          prescribed_clauses?: string
          property_id?: string | null
          signed_by_landlord_at?: string | null
          signed_by_tenant_at?: string | null
          special_clauses?: string
          status?: string
          template_type?: string
          tenant_email?: string | null
          tenant_initials?: string | null
          tenant_ip?: string | null
          tenant_name?: string | null
          tenant_signature?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "landlord_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_documents: {
        Row: {
          created_at: string
          document_type: string
          expires_at: string | null
          file_name: string
          file_url: string
          id: string
          property_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          expires_at?: string | null
          file_name: string
          file_url: string
          id?: string
          property_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "landlord_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_properties: {
        Row: {
          address: string
          ai_market_rent: number | null
          bedrooms: number | null
          compliance_status: string | null
          created_at: string
          current_rent: number | null
          decent_homes_compliant: boolean | null
          electrical_cert_expiry: string | null
          electrical_cert_valid: boolean | null
          epc_expiry: string | null
          epc_rating: string | null
          gas_cert_expiry: string | null
          gas_cert_valid: boolean | null
          humm_fair_value: number | null
          id: string
          last_rent_increase: string | null
          notes: string | null
          postcode: string | null
          property_type: string | null
          tenancy_end_date: string | null
          tenancy_start_date: string | null
          tenancy_type: string | null
          tenant_email: string | null
          tenant_name: string | null
          updated_at: string
          user_id: string
          written_statement_served: boolean | null
        }
        Insert: {
          address: string
          ai_market_rent?: number | null
          bedrooms?: number | null
          compliance_status?: string | null
          created_at?: string
          current_rent?: number | null
          decent_homes_compliant?: boolean | null
          electrical_cert_expiry?: string | null
          electrical_cert_valid?: boolean | null
          epc_expiry?: string | null
          epc_rating?: string | null
          gas_cert_expiry?: string | null
          gas_cert_valid?: boolean | null
          humm_fair_value?: number | null
          id?: string
          last_rent_increase?: string | null
          notes?: string | null
          postcode?: string | null
          property_type?: string | null
          tenancy_end_date?: string | null
          tenancy_start_date?: string | null
          tenancy_type?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          updated_at?: string
          user_id: string
          written_statement_served?: boolean | null
        }
        Update: {
          address?: string
          ai_market_rent?: number | null
          bedrooms?: number | null
          compliance_status?: string | null
          created_at?: string
          current_rent?: number | null
          decent_homes_compliant?: boolean | null
          electrical_cert_expiry?: string | null
          electrical_cert_valid?: boolean | null
          epc_expiry?: string | null
          epc_rating?: string | null
          gas_cert_expiry?: string | null
          gas_cert_valid?: boolean | null
          humm_fair_value?: number | null
          id?: string
          last_rent_increase?: string | null
          notes?: string | null
          postcode?: string | null
          property_type?: string | null
          tenancy_end_date?: string | null
          tenancy_start_date?: string | null
          tenancy_type?: string | null
          tenant_email?: string | null
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
          written_statement_served?: boolean | null
        }
        Relationships: []
      }
      mortgage_leads: {
        Row: {
          created_at: string
          deposit_amount: number | null
          dip_file_url: string | null
          email: string
          full_name: string | null
          has_dip: boolean | null
          id: string
          phone: string | null
          postcode: string | null
          property_address: string | null
          property_price: number | null
          status: string
          term_years: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit_amount?: number | null
          dip_file_url?: string | null
          email: string
          full_name?: string | null
          has_dip?: boolean | null
          id?: string
          phone?: string | null
          postcode?: string | null
          property_address?: string | null
          property_price?: number | null
          status?: string
          term_years?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number | null
          dip_file_url?: string | null
          email?: string
          full_name?: string | null
          has_dip?: boolean | null
          id?: string
          phone?: string | null
          postcode?: string | null
          property_address?: string | null
          property_price?: number | null
          status?: string
          term_years?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      negotiate_requests: {
        Row: {
          ai_actions_log: Json | null
          created_at: string
          display_name: string | null
          goal: string
          id: string
          notes: string | null
          package: string
          postcode: string | null
          property_address: string | null
          property_link: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_actions_log?: Json | null
          created_at?: string
          display_name?: string | null
          goal?: string
          id?: string
          notes?: string | null
          package?: string
          postcode?: string | null
          property_address?: string | null
          property_link: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_actions_log?: Json | null
          created_at?: string
          display_name?: string | null
          goal?: string
          id?: string
          notes?: string | null
          package?: string
          postcode?: string | null
          property_address?: string | null
          property_link?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      negotiation_conversations: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          created_at: string
          id: string
          postcode: string | null
          property_address: string
          property_url: string | null
          reply_to_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          postcode?: string | null
          property_address: string
          property_url?: string | null
          reply_to_id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          postcode?: string | null
          property_address?: string
          property_url?: string | null
          reply_to_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      negotiation_emails: {
        Row: {
          ai_drafted: boolean | null
          body: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          sender_email: string | null
          sender_name: string | null
          status: string
          subject: string | null
        }
        Insert: {
          ai_drafted?: boolean | null
          body: string
          conversation_id: string
          created_at?: string
          direction?: string
          id?: string
          sender_email?: string | null
          sender_name?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          ai_drafted?: boolean | null
          body?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          sender_email?: string | null
          sender_name?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_emails_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "negotiation_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_loop_threads: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          asking_price: number | null
          audit_id: string | null
          created_at: string
          currency: string | null
          current_offer: number | null
          fair_value: number | null
          id: string
          last_ai_summary: string | null
          property_address: string | null
          property_url: string | null
          sentiment: string | null
          status: string
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          asking_price?: number | null
          audit_id?: string | null
          created_at?: string
          currency?: string | null
          current_offer?: number | null
          fair_value?: number | null
          id?: string
          last_ai_summary?: string | null
          property_address?: string | null
          property_url?: string | null
          sentiment?: string | null
          status?: string
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          asking_price?: number | null
          audit_id?: string | null
          created_at?: string
          currency?: string | null
          current_offer?: number | null
          fair_value?: number | null
          id?: string
          last_ai_summary?: string | null
          property_address?: string | null
          property_url?: string | null
          sentiment?: string | null
          status?: string
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_loop_threads_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "saved_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_loop_turns: {
        Row: {
          ai_summary: string | null
          body: string
          channel: string
          created_at: string
          direction: string
          id: string
          recommended_offer: number | null
          sent_at: string | null
          sentiment: string | null
          suggested_replies: Json | null
          thread_id: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          body: string
          channel?: string
          created_at?: string
          direction: string
          id?: string
          recommended_offer?: number | null
          sent_at?: string | null
          sentiment?: string | null
          suggested_replies?: Json | null
          thread_id: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          recommended_offer?: number | null
          sent_at?: string | null
          sentiment?: string | null
          suggested_replies?: Json | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_loop_turns_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "negotiation_loop_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_messages: {
        Row: {
          agent_reply: string | null
          ai_draft_body: string | null
          ai_draft_subject: string | null
          ai_summary: string | null
          buyer_status: string | null
          counter_options: Json | null
          created_at: string
          id: string
          listing_type: string
          max_budget: number | null
          notes: string | null
          property_address: string
          property_price: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_reply?: string | null
          ai_draft_body?: string | null
          ai_draft_subject?: string | null
          ai_summary?: string | null
          buyer_status?: string | null
          counter_options?: Json | null
          created_at?: string
          id?: string
          listing_type?: string
          max_budget?: number | null
          notes?: string | null
          property_address: string
          property_price?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_reply?: string | null
          ai_draft_body?: string | null
          ai_draft_subject?: string | null
          ai_summary?: string | null
          buyer_status?: string | null
          counter_options?: Json | null
          created_at?: string
          id?: string
          listing_type?: string
          max_budget?: number | null
          notes?: string | null
          property_address?: string
          property_price?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          founder_status: string | null
          id: string
          interest: string | null
          name: string | null
          phone: string | null
          postcode: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          founder_status?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          founder_status?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      property_documents: {
        Row: {
          document_type: string
          file_name: string
          file_url: string
          id: string
          property_id: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          document_type?: string
          file_name: string
          file_url: string
          id?: string
          property_id?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          property_id?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "landlord_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_listings: {
        Row: {
          address: string
          ai_confidence: number | null
          ai_suggested_price: number | null
          aml_status: string | null
          asking_price: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          email: string | null
          enquiries_count: number
          id: string
          listing_copy: string | null
          listing_intent: string
          live_status: string
          market_rightmove: boolean | null
          market_social: boolean | null
          market_virtual_tour: boolean | null
          market_zoopla: boolean | null
          name: string | null
          offers_count: number
          phone: string | null
          photo_urls: string[] | null
          postcode: string | null
          property_type: string | null
          sqft: string | null
          status: string
          strategy: Json | null
          user_id: string | null
          valuation_ref: string | null
          viewings_count: number
        }
        Insert: {
          address: string
          ai_confidence?: number | null
          ai_suggested_price?: number | null
          aml_status?: string | null
          asking_price?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          enquiries_count?: number
          id?: string
          listing_copy?: string | null
          listing_intent?: string
          live_status?: string
          market_rightmove?: boolean | null
          market_social?: boolean | null
          market_virtual_tour?: boolean | null
          market_zoopla?: boolean | null
          name?: string | null
          offers_count?: number
          phone?: string | null
          photo_urls?: string[] | null
          postcode?: string | null
          property_type?: string | null
          sqft?: string | null
          status?: string
          strategy?: Json | null
          user_id?: string | null
          valuation_ref?: string | null
          viewings_count?: number
        }
        Update: {
          address?: string
          ai_confidence?: number | null
          ai_suggested_price?: number | null
          aml_status?: string | null
          asking_price?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          enquiries_count?: number
          id?: string
          listing_copy?: string | null
          listing_intent?: string
          live_status?: string
          market_rightmove?: boolean | null
          market_social?: boolean | null
          market_virtual_tour?: boolean | null
          market_zoopla?: boolean | null
          name?: string | null
          offers_count?: number
          phone?: string | null
          photo_urls?: string[] | null
          postcode?: string | null
          property_type?: string | null
          sqft?: string | null
          status?: string
          strategy?: Json | null
          user_id?: string | null
          valuation_ref?: string | null
          viewings_count?: number
        }
        Relationships: []
      }
      rent_collections: {
        Row: {
          arrears_amount: number
          bank_account_last4: string | null
          collection_day: number
          created_at: string
          end_date: string | null
          frequency: string
          id: string
          landlord_user_id: string
          listing_id: string | null
          monthly_rent: number
          next_payment_date: string | null
          payment_method: string
          property_address: string
          reference_id: string | null
          start_date: string
          status: string
          tenant_email: string
          tenant_name: string
          total_collected: number
          updated_at: string
        }
        Insert: {
          arrears_amount?: number
          bank_account_last4?: string | null
          collection_day?: number
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          landlord_user_id: string
          listing_id?: string | null
          monthly_rent: number
          next_payment_date?: string | null
          payment_method?: string
          property_address: string
          reference_id?: string | null
          start_date: string
          status?: string
          tenant_email: string
          tenant_name: string
          total_collected?: number
          updated_at?: string
        }
        Update: {
          arrears_amount?: number
          bank_account_last4?: string | null
          collection_day?: number
          created_at?: string
          end_date?: string | null
          frequency?: string
          id?: string
          landlord_user_id?: string
          listing_id?: string | null
          monthly_rent?: number
          next_payment_date?: string | null
          payment_method?: string
          property_address?: string
          reference_id?: string | null
          start_date?: string
          status?: string
          tenant_email?: string
          tenant_name?: string
          total_collected?: number
          updated_at?: string
        }
        Relationships: []
      }
      rent_payments: {
        Row: {
          amount: number
          chase_count: number | null
          collection_id: string
          created_at: string
          due_date: string
          id: string
          landlord_user_id: string
          last_chased_at: string | null
          late_days: number | null
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          status: string
        }
        Insert: {
          amount: number
          chase_count?: number | null
          collection_id: string
          created_at?: string
          due_date: string
          id?: string
          landlord_user_id: string
          last_chased_at?: string | null
          late_days?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          chase_count?: number | null
          collection_id?: string
          created_at?: string
          due_date?: string
          id?: string
          landlord_user_id?: string
          last_chased_at?: string | null
          late_days?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "rent_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      report_issues: {
        Row: {
          audit_id: string | null
          created_at: string
          field_name: string | null
          id: string
          status: string
          user_comment: string
          user_id: string
        }
        Insert: {
          audit_id?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          status?: string
          user_comment: string
          user_id: string
        }
        Update: {
          audit_id?: string | null
          created_at?: string
          field_name?: string | null
          id?: string
          status?: string
          user_comment?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_issues_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "saved_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_events: {
        Row: {
          created_at: string
          email: string | null
          event_type: string
          fair_value: number | null
          id: string
          metadata: Json | null
          property_address: string | null
          property_price: number | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_type: string
          fair_value?: number | null
          id?: string
          metadata?: Json | null
          property_address?: string | null
          property_price?: number | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_type?: string
          fair_value?: number | null
          id?: string
          metadata?: Json | null
          property_address?: string | null
          property_price?: number | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      revenue_followup_log: {
        Row: {
          email: string
          id: string
          related_event_id: string | null
          sent_at: string
          stage: string
        }
        Insert: {
          email: string
          id?: string
          related_event_id?: string | null
          sent_at?: string
          stage: string
        }
        Update: {
          email?: string
          id?: string
          related_event_id?: string | null
          sent_at?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_followup_log_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "revenue_events"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_audits: {
        Row: {
          address: string | null
          agent_email: string | null
          agent_name: string | null
          ai_score: number | null
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          currency: string | null
          description: string | null
          epc_rating: string | null
          floorplan: string | null
          humm_fair_value: number | null
          humm_fair_value_high: number | null
          id: string
          images: string[] | null
          intelligence_score: Json | null
          key_features: string[] | null
          listed_date: string | null
          opportunities: string[] | null
          postcode: string | null
          property_type: string | null
          property_url: string
          recent_sales: Json | null
          renovation_suggestions: Json | null
          rental_yield_estimate: number | null
          report_json: Json | null
          risks: string[] | null
          score_breakdown: Json | null
          scraped_at: string | null
          sqft: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          agent_email?: string | null
          agent_name?: string | null
          ai_score?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          epc_rating?: string | null
          floorplan?: string | null
          humm_fair_value?: number | null
          humm_fair_value_high?: number | null
          id?: string
          images?: string[] | null
          intelligence_score?: Json | null
          key_features?: string[] | null
          listed_date?: string | null
          opportunities?: string[] | null
          postcode?: string | null
          property_type?: string | null
          property_url: string
          recent_sales?: Json | null
          renovation_suggestions?: Json | null
          rental_yield_estimate?: number | null
          report_json?: Json | null
          risks?: string[] | null
          score_breakdown?: Json | null
          scraped_at?: string | null
          sqft?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          agent_email?: string | null
          agent_name?: string | null
          ai_score?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          epc_rating?: string | null
          floorplan?: string | null
          humm_fair_value?: number | null
          humm_fair_value_high?: number | null
          id?: string
          images?: string[] | null
          intelligence_score?: Json | null
          key_features?: string[] | null
          listed_date?: string | null
          opportunities?: string[] | null
          postcode?: string | null
          property_type?: string | null
          property_url?: string
          recent_sales?: Json | null
          renovation_suggestions?: Json | null
          rental_yield_estimate?: number | null
          report_json?: Json | null
          risks?: string[] | null
          score_breakdown?: Json | null
          scraped_at?: string | null
          sqft?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          bedrooms: number | null
          created_at: string
          id: string
          label: string | null
          listing_type: string
          max_price: number | null
          min_price: number | null
          postcode: string
          property_type: string | null
          radius_miles: number
          user_id: string
        }
        Insert: {
          bedrooms?: number | null
          created_at?: string
          id?: string
          label?: string | null
          listing_type?: string
          max_price?: number | null
          min_price?: number | null
          postcode: string
          property_type?: string | null
          radius_miles?: number
          user_id: string
        }
        Update: {
          bedrooms?: number | null
          created_at?: string
          id?: string
          label?: string | null
          listing_type?: string
          max_price?: number | null
          min_price?: number | null
          postcode?: string
          property_type?: string | null
          radius_miles?: number
          user_id?: string
        }
        Relationships: []
      }
      seller_offers: {
        Row: {
          ai_analysis: string | null
          ai_counter_amount: number | null
          ai_recommendation: string | null
          ai_response_draft: string | null
          buyer_name: string | null
          buyer_status: string | null
          created_at: string
          dip_confirmed: boolean | null
          id: string
          notes: string | null
          offer_amount: number
          proof_of_funds: boolean | null
          seller_plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_counter_amount?: number | null
          ai_recommendation?: string | null
          ai_response_draft?: string | null
          buyer_name?: string | null
          buyer_status?: string | null
          created_at?: string
          dip_confirmed?: boolean | null
          id?: string
          notes?: string | null
          offer_amount: number
          proof_of_funds?: boolean | null
          seller_plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          ai_counter_amount?: number | null
          ai_recommendation?: string | null
          ai_response_draft?: string | null
          buyer_name?: string | null
          buyer_status?: string | null
          created_at?: string
          dip_confirmed?: boolean | null
          id?: string
          notes?: string | null
          offer_amount?: number
          proof_of_funds?: boolean | null
          seller_plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_offers_seller_plan_id_fkey"
            columns: ["seller_plan_id"]
            isOneToOne: false
            referencedRelation: "seller_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_offers_log: {
        Row: {
          counter_amount: number | null
          created_at: string
          id: string
          notes: string | null
          offer_amount: number
          offer_date: string | null
          offered_by: string | null
          property_address: string
          status: string
          user_id: string
        }
        Insert: {
          counter_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          offer_amount: number
          offer_date?: string | null
          offered_by?: string | null
          property_address: string
          status?: string
          user_id: string
        }
        Update: {
          counter_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          offer_amount?: number
          offer_date?: string | null
          offered_by?: string | null
          property_address?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_plans: {
        Row: {
          address: string
          asking_price: number | null
          created_at: string
          id: string
          matched_agent_id: string | null
          plan_type: string
          postcode: string | null
          status: string
          updated_at: string
          user_id: string
          valuation_id: string | null
        }
        Insert: {
          address: string
          asking_price?: number | null
          created_at?: string
          id?: string
          matched_agent_id?: string | null
          plan_type?: string
          postcode?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valuation_id?: string | null
        }
        Update: {
          address?: string
          asking_price?: number | null
          created_at?: string
          id?: string
          matched_agent_id?: string | null
          plan_type?: string
          postcode?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valuation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_plans_matched_agent_id_fkey"
            columns: ["matched_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_plans_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "ai_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tenant_references: {
        Row: {
          address_history: Json | null
          affordability_ratio: number | null
          aml_flag: boolean | null
          annual_income: number | null
          applicant_dob: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          created_at: string
          credit_score: number | null
          employment_status: string | null
          fraud_flag: boolean | null
          id: string
          income_verified: boolean | null
          landlord_user_id: string
          listing_id: string | null
          positives: Json | null
          property_address: string | null
          proposed_rent: number | null
          recommendation: string | null
          red_flags: Json | null
          report_json: Json | null
          right_to_rent_status: string | null
          risk_score: number | null
          sanctions_flag: boolean | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          address_history?: Json | null
          affordability_ratio?: number | null
          aml_flag?: boolean | null
          annual_income?: number | null
          applicant_dob?: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          fraud_flag?: boolean | null
          id?: string
          income_verified?: boolean | null
          landlord_user_id: string
          listing_id?: string | null
          positives?: Json | null
          property_address?: string | null
          proposed_rent?: number | null
          recommendation?: string | null
          red_flags?: Json | null
          report_json?: Json | null
          right_to_rent_status?: string | null
          risk_score?: number | null
          sanctions_flag?: boolean | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          address_history?: Json | null
          affordability_ratio?: number | null
          aml_flag?: boolean | null
          annual_income?: number | null
          applicant_dob?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          fraud_flag?: boolean | null
          id?: string
          income_verified?: boolean | null
          landlord_user_id?: string
          listing_id?: string | null
          positives?: Json | null
          property_address?: string | null
          proposed_rent?: number | null
          recommendation?: string | null
          red_flags?: Json | null
          report_json?: Json | null
          right_to_rent_status?: string | null
          risk_score?: number | null
          sanctions_flag?: boolean | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_requests: {
        Row: {
          created_at: string
          deadline_at: string
          description: string
          id: string
          landlord_user_id: string
          property_id: string
          request_type: string
          responded_at: string | null
          response_notes: string | null
          status: string
          submitted_at: string
          tenant_email: string | null
          tenant_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline_at?: string
          description: string
          id?: string
          landlord_user_id: string
          property_id: string
          request_type?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          submitted_at?: string
          tenant_email?: string | null
          tenant_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline_at?: string
          description?: string
          id?: string
          landlord_user_id?: string
          property_id?: string
          request_type?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string
          submitted_at?: string
          tenant_email?: string | null
          tenant_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "landlord_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      uk_estate_agents: {
        Row: {
          address: string | null
          agent_name: string
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          scraped_at: string
          source_url: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          agent_name: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          scraped_at?: string
          source_url?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          agent_name?: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          scraped_at?: string
          source_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      viewing_bookings: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          created_at: string
          id: string
          notes: string | null
          property_address: string
          property_url: string | null
          status: string
          user_id: string
          viewing_date: string | null
          viewing_time: string | null
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_address: string
          property_url?: string | null
          status?: string
          user_id: string
          viewing_date?: string | null
          viewing_time?: string | null
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_address?: string
          property_url?: string | null
          status?: string
          user_id?: string
          viewing_date?: string | null
          viewing_time?: string | null
        }
        Relationships: []
      }
      viewing_requests: {
        Row: {
          availability: string[]
          buyer_email: string | null
          buyer_name: string | null
          buyer_position: string | null
          buyer_user_id: string
          created_at: string
          id: string
          message: string | null
          property_address: string
          proposed_time: string | null
          seller_plan_id: string
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string[]
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_position?: string | null
          buyer_user_id: string
          created_at?: string
          id?: string
          message?: string | null
          property_address: string
          proposed_time?: string | null
          seller_plan_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string[]
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_position?: string | null
          buyer_user_id?: string
          created_at?: string
          id?: string
          message?: string | null
          property_address?: string
          proposed_time?: string | null
          seller_plan_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_seller_plan_id_fkey"
            columns: ["seller_plan_id"]
            isOneToOne: false
            referencedRelation: "seller_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_slots: {
        Row: {
          buyer_email: string | null
          buyer_name: string | null
          created_at: string
          id: string
          notes: string | null
          seller_plan_id: string
          slot_end: string
          slot_start: string
          status: string
          user_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          seller_plan_id: string
          slot_end: string
          slot_start: string
          status?: string
          user_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          seller_plan_id?: string
          slot_end?: string
          slot_start?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_slots_seller_plan_id_fkey"
            columns: ["seller_plan_id"]
            isOneToOne: false
            referencedRelation: "seller_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          interests: string[]
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          interests?: string[]
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interests?: string[]
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      property_listings_public: {
        Row: {
          address: string | null
          ai_confidence: number | null
          ai_suggested_price: number | null
          asking_price: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          description: string | null
          id: string | null
          market_rightmove: boolean | null
          market_social: boolean | null
          market_virtual_tour: boolean | null
          market_zoopla: boolean | null
          photo_urls: string[] | null
          postcode: string | null
          property_type: string | null
          sqft: string | null
          status: string | null
          valuation_ref: string | null
        }
        Insert: {
          address?: string | null
          ai_confidence?: number | null
          ai_suggested_price?: number | null
          asking_price?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          market_rightmove?: boolean | null
          market_social?: boolean | null
          market_virtual_tour?: boolean | null
          market_zoopla?: boolean | null
          photo_urls?: string[] | null
          postcode?: string | null
          property_type?: string | null
          sqft?: string | null
          status?: string | null
          valuation_ref?: string | null
        }
        Update: {
          address?: string | null
          ai_confidence?: number | null
          ai_suggested_price?: number | null
          asking_price?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          market_rightmove?: boolean | null
          market_social?: boolean | null
          market_virtual_tour?: boolean | null
          market_zoopla?: boolean | null
          photo_urls?: string[] | null
          postcode?: string | null
          property_type?: string | null
          sqft?: string | null
          status?: string | null
          valuation_ref?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_user_email: { Args: never; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_agents_by_radius: {
        Args: {
          p_lat: number
          p_listing_type?: string
          p_lng: number
          p_radius_miles?: number
        }
        Returns: {
          avg_days: number
          distance_miles: number
          email: string
          id: string
          latitude: number
          logo: string
          longitude: number
          name: string
          phone: string
          postcode: string
          price_achieved: string
          properties_sold: number
          rating: number
          review_score: number
          reviews: string[]
          stars: number
          strengths: string
          website: string
        }[]
      }
      increment_audit_count: { Args: never; Returns: number }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_invite: {
        Args: { p_token: string }
        Returns: {
          email: string
          redeemed: boolean
          role: string
        }[]
      }
      search_knowledge: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          content: string
          id: string
          rank: number
          section_title: string
          source_document: string
        }[]
      }
      verify_access_code: {
        Args: { p_code: string }
        Returns: {
          email: string
        }[]
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
