export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      service_categories: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          created_at?: string;
        }
      >;
      providers: TableDef<
        {
          id: string;
          full_name: string;
          slug: string;
          phone: string;
          whatsapp: string;
          location: string;
          service_area: string | null;
          bio: string | null;
          profile_image_url: string | null;
          is_verified: boolean;
          rating: number;
          completed_jobs: number;
          years_experience: number;
          price_guide: string | null;
          availability_text: string | null;
          is_featured: boolean;
          commission_override: boolean;
          created_at: string;
        },
        {
          id?: string;
          full_name: string;
          slug: string;
          phone: string;
          whatsapp: string;
          location: string;
          service_area?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          is_verified?: boolean;
          rating?: number;
          completed_jobs?: number;
          years_experience?: number;
          price_guide?: string | null;
          availability_text?: string | null;
          is_featured?: boolean;
          commission_override?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          full_name?: string;
          slug?: string;
          phone?: string;
          whatsapp?: string;
          location?: string;
          service_area?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          is_verified?: boolean;
          rating?: number;
          completed_jobs?: number;
          years_experience?: number;
          price_guide?: string | null;
          availability_text?: string | null;
          is_featured?: boolean;
          commission_override?: boolean;
          created_at?: string;
        }
      >;
      provider_services: TableDef<
        {
          id: string;
          provider_id: string;
          service_category_id: string;
        },
        {
          id?: string;
          provider_id: string;
          service_category_id: string;
        },
        {
          id?: string;
          provider_id?: string;
          service_category_id?: string;
        }
      >;
      job_requests: TableDef<
        {
          id: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          service_category_id: string;
          provider_id: string | null;
          location: string;
          latitude: number | null;
          longitude: number | null;
          preferred_date: string | null;
          preferred_time: string | null;
          description: string | null;
          urgency: string | null;
          status: string;
          accepted_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          payment_status: string | null;
          payment_amount: number | null;
          payment_reference: string | null;
          payment_phone: string | null;
          payment_type: string | null;
          paid_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          service_category_id: string;
          provider_id?: string | null;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          description?: string | null;
          urgency?: string | null;
          status?: string;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          payment_reference?: string | null;
          payment_phone?: string | null;
          payment_type?: string | null;
          paid_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          service_category_id?: string;
          provider_id?: string | null;
          location?: string;
          latitude?: number | null;
          longitude?: number | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          description?: string | null;
          urgency?: string | null;
          status?: string;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          payment_reference?: string | null;
          payment_phone?: string | null;
          payment_type?: string | null;
          paid_at?: string | null;
          created_at?: string;
        }
      >;
      job_completions: TableDef<
        {
          id: string;
          job_request_id: string;
          provider_reported_amount: number | null;
          customer_reported_amount: number | null;
          final_amount_used: number | null;
          amount_difference: number | null;
          is_flagged: boolean;
          created_at: string;
        },
        {
          id?: string;
          job_request_id: string;
          provider_reported_amount?: number | null;
          customer_reported_amount?: number | null;
          final_amount_used?: number | null;
          amount_difference?: number | null;
          is_flagged?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          job_request_id?: string;
          provider_reported_amount?: number | null;
          customer_reported_amount?: number | null;
          final_amount_used?: number | null;
          amount_difference?: number | null;
          is_flagged?: boolean;
          created_at?: string;
        }
      >;
      provider_accounts: TableDef<
        {
          provider_id: string;
          commission_balance: number;
          credit_balance: number;
          jobs_allowed_before_payment: number;
          status: string;
          updated_at: string;
        },
        {
          provider_id: string;
          commission_balance?: number;
          credit_balance?: number;
          jobs_allowed_before_payment?: number;
          status?: string;
          updated_at?: string;
        },
        {
          provider_id?: string;
          commission_balance?: number;
          credit_balance?: number;
          jobs_allowed_before_payment?: number;
          status?: string;
          updated_at?: string;
        }
      >;
      provider_ledger: TableDef<
        {
          id: string;
          provider_id: string;
          job_request_id: string | null;
          type: Database['public']['Enums']['provider_ledger_type'];
          amount: number;
          balance_after: number;
          description: string | null;
          created_at: string;
        },
        {
          id?: string;
          provider_id: string;
          job_request_id?: string | null;
          type: Database['public']['Enums']['provider_ledger_type'];
          amount: number;
          balance_after: number;
          description?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          provider_id?: string;
          job_request_id?: string | null;
          type?: Database['public']['Enums']['provider_ledger_type'];
          amount?: number;
          balance_after?: number;
          description?: string | null;
          created_at?: string;
        }
      >;
      profiles: TableDef<
        {
          id: string;
          role: string | null;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          default_location: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          role?: string | null;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          default_location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          role?: string | null;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          default_location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      reviews: TableDef<
        {
          id: string;
          job_request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          reviewer_role: string;
          rating: number;
          comment: string | null;
          created_at: string;
        },
        {
          id?: string;
          job_request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          reviewer_role: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          job_request_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          reviewer_role?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      provider_ledger_type: 'commission_due' | 'payment_received' | 'adjustment' | 'credit_applied' | 'penalty';
    };
    CompositeTypes: Record<string, never>;
  };
};
