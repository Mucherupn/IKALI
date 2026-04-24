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
          customer_name: string;
          customer_phone: string;
          service_category_id: string;
          provider_id: string | null;
          location: string;
          preferred_date: string | null;
          preferred_time: string | null;
          description: string | null;
          urgency: string | null;
          status: string;
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
          customer_name: string;
          customer_phone: string;
          service_category_id: string;
          provider_id?: string | null;
          location: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          description?: string | null;
          urgency?: string | null;
          status?: string;
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
          customer_name?: string;
          customer_phone?: string;
          service_category_id?: string;
          provider_id?: string | null;
          location?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          description?: string | null;
          urgency?: string | null;
          status?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          payment_reference?: string | null;
          payment_phone?: string | null;
          payment_type?: string | null;
          paid_at?: string | null;
          created_at?: string;
        }
      >;
      reviews: TableDef<
        {
          id: string;
          provider_id: string;
          customer_name: string;
          rating: number;
          comment: string | null;
          created_at: string;
        },
        {
          id?: string;
          provider_id: string;
          customer_name: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          provider_id?: string;
          customer_name?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
