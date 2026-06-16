export type UserRole = 'patient' | 'doctor' | 'medical_store' | 'diagnostics';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string | null;
          role: UserRole;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
      };
      doctor_profiles: {
        Row: {
          id: string;
          specialization: string;
          experience_years: number;
          qualification: string | null;
          hospital: string | null;
          location: string | null;
          consultation_fee: number;
          rating: number;
          total_reviews: number;
          available: boolean;
          about: string | null;
          available_slots: any[];
        };
        Insert: {
          id: string;
          specialization: string;
          experience_years?: number;
          qualification?: string | null;
          hospital?: string | null;
          location?: string | null;
          consultation_fee?: number;
          about?: string | null;
          available_slots?: any[];
        };
        Update: {
          specialization?: string;
          experience_years?: number;
          qualification?: string | null;
          hospital?: string | null;
          location?: string | null;
          consultation_fee?: number;
          available?: boolean;
          about?: string | null;
          available_slots?: any[];
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: 'video' | 'in-person';
          status: 'Upcoming' | 'Completed' | 'Cancelled';
          symptoms: string | null;
          notes: string | null;
          prescription: any | null;
          payment_amount: number | null;
          payment_status: 'pending' | 'paid' | 'refunded';
          payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type?: 'video' | 'in-person';
          symptoms?: string | null;
          payment_amount?: number | null;
          payment_id?: string | null;
        };
        Update: {
          status?: 'Upcoming' | 'Completed' | 'Cancelled';
          notes?: string | null;
          prescription?: any | null;
          payment_status?: 'pending' | 'paid' | 'refunded';
        };
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          manufacturer: string | null;
          category: string | null;
          price: number;
          discount_percentage: number;
          description: string | null;
          image_url: string | null;
          requires_prescription: boolean;
          in_stock: boolean;
          store_id: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          manufacturer?: string | null;
          category?: string | null;
          price: number;
          discount_percentage?: number;
          description?: string | null;
          image_url?: string | null;
          requires_prescription?: boolean;
          in_stock?: boolean;
          store_id?: string | null;
        };
        Update: {
          name?: string;
          price?: number;
          discount_percentage?: number;
          description?: string | null;
          in_stock?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          patient_id: string;
          store_id: string | null;
          status: string;
          total_amount: number;
          delivery_address: string | null;
          payment_status: 'pending' | 'paid' | 'refunded';
          payment_id: string | null;
          prescription_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          store_id?: string | null;
          total_amount: number;
          delivery_address?: string | null;
          payment_id?: string | null;
          prescription_url?: string | null;
        };
        Update: {
          status?: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          medicine_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          order_id: string;
          medicine_id: string;
          quantity: number;
          price: number;
        };
        Update: {
          quantity?: number;
        };
      };
      lab_tests: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          description: string | null;
          price: number;
          discount_percentage: number;
          preparation: string | null;
          report_time: string | null;
          home_collection: boolean;
          parameters: any[];
          diagnostics_center_id: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          category?: string | null;
          description?: string | null;
          price: number;
          discount_percentage?: number;
          preparation?: string | null;
          report_time?: string | null;
          home_collection?: boolean;
          parameters?: any[];
          diagnostics_center_id?: string | null;
        };
        Update: {
          name?: string;
          price?: number;
          discount_percentage?: number;
          home_collection?: boolean;
        };
      };
      lab_bookings: {
        Row: {
          id: string;
          patient_id: string;
          lab_test_id: string;
          diagnostics_center_id: string | null;
          date: string;
          time: string | null;
          status: string;
          collection_type: 'home' | 'center';
          collection_address: string | null;
          report_url: string | null;
          payment_amount: number | null;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          patient_id: string;
          lab_test_id: string;
          diagnostics_center_id?: string | null;
          date: string;
          time?: string | null;
          collection_type?: 'home' | 'center';
          collection_address?: string | null;
          payment_amount?: number | null;
        };
        Update: {
          status?: string;
          report_url?: string | null;
          payment_status?: 'pending' | 'paid' | 'refunded';
        };
      };
      medical_stores: {
        Row: {
          id: string;
          store_name: string;
          address: string | null;
          phone: string | null;
          license_number: string | null;
          rating: number;
          is_open: boolean;
          delivery_available: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          store_name: string;
          address?: string | null;
          phone?: string | null;
          license_number?: string | null;
        };
        Update: {
          store_name?: string;
          address?: string | null;
          is_open?: boolean;
          delivery_available?: boolean;
        };
      };
      health_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          discount_percentage: number;
          tests: any[];
          diagnostics_center_id: string | null;
          popular: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          price: number;
          discount_percentage?: number;
          tests?: any[];
          diagnostics_center_id?: string | null;
          popular?: boolean;
        };
        Update: {
          name?: string;
          price?: number;
          discount_percentage?: number;
          popular?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string | null;
          read: boolean;
          data: any | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          type?: string | null;
          data?: any | null;
        };
        Update: {
          read?: boolean;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          file_url: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          doctor_id?: string | null;
          file_url: string;
          notes?: string | null;
        };
        Update: {};
      };
    };
  };
}
