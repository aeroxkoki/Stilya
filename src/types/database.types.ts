export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          test_name: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          test_name: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          test_name?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      click_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "click_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      external_products: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category: string | null
          category_tags: string[] | null
          color_tags: string[] | null
          commission_rate: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          features_extracted: boolean | null
          gender: string | null
          genre_id: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_sale: boolean | null
          is_used: boolean | null
          last_synced: string | null
          metadata: Json | null
          original_price: number | null
          popularity_score: number | null
          price: number
          priority: number | null
          quality_score: number | null
          rating: number | null
          review_average: number | null
          review_count: number | null
          season_tags: string[] | null
          source: string | null
          source_brand: string | null
          style_tags: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          category_tags?: string[] | null
          color_tags?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features_extracted?: boolean | null
          gender?: string | null
          genre_id?: number | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          is_sale?: boolean | null
          is_used?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          original_price?: number | null
          popularity_score?: number | null
          price: number
          priority?: number | null
          quality_score?: number | null
          rating?: number | null
          review_average?: number | null
          review_count?: number | null
          season_tags?: string[] | null
          source?: string | null
          source_brand?: string | null
          style_tags?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          category_tags?: string[] | null
          color_tags?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features_extracted?: boolean | null
          gender?: string | null
          genre_id?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_sale?: boolean | null
          is_used?: boolean | null
          last_synced?: string | null
          metadata?: Json | null
          original_price?: number | null
          popularity_score?: number | null
          price?: number
          priority?: number | null
          quality_score?: number | null
          rating?: number | null
          review_average?: number | null
          review_count?: number | null
          season_tags?: string[] | null
          source?: string | null
          source_brand?: string | null
          style_tags?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          created_at: string
          details: Json | null
          executed_at: string
          id: string
          status: string
          task_name: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          executed_at: string
          id?: string
          status: string
          task_name: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          executed_at?: string
          id?: string
          status?: string
          task_name?: string
        }
        Relationships: []
      }
      product_features: {
        Row: {
          created_at: string | null
          extracted_at: string | null
          features: Json
          id: string
          model_version: string | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extracted_at?: string | null
          features: Json
          id?: string
          model_version?: string | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extracted_at?: string | null
          features?: Json
          id?: string
          model_version?: string | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      products_deprecated: {
        Row: {
          affiliate_url: string
          brand: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          price: number
          source: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affiliate_url: string
          brand: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          price: number
          source: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affiliate_url?: string
          brand?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          price?: number
          source?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          created_at: string | null
          email: string
          gender: string | null
          id: string
          style_preferences: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          email: string
          gender?: string | null
          id: string
          style_preferences?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          style_preferences?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendation_effectiveness: {
        Row: {
          click_through: boolean | null
          created_at: string | null
          id: string
          position: number
          product_id: string
          recommendation_type: string
          session_id: string | null
          swipe_result: string | null
          user_id: string
          was_swiped: boolean | null
        }
        Insert: {
          click_through?: boolean | null
          created_at?: string | null
          id?: string
          position: number
          product_id: string
          recommendation_type: string
          session_id?: string | null
          swipe_result?: string | null
          user_id: string
          was_swiped?: boolean | null
        }
        Update: {
          click_through?: boolean | null
          created_at?: string | null
          id?: string
          position?: number
          product_id?: string
          recommendation_type?: string
          session_id?: string | null
          swipe_result?: string | null
          user_id?: string
          was_swiped?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_effectiveness_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_effectiveness_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_effectiveness_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      swipe_pattern_analysis: {
        Row: {
          confidence_score: number | null
          detected_at: string | null
          expires_at: string | null
          id: string
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          detected_at?: string | null
          expires_at?: string | null
          id?: string
          pattern_data: Json
          pattern_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          detected_at?: string | null
          expires_at?: string | null
          id?: string
          pattern_data?: Json
          pattern_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_pattern_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string | null
          id: string
          is_instant_decision: boolean | null
          product_id: string
          result: string
          swipe_time_ms: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_instant_decision?: boolean | null
          product_id: string
          result: string
          swipe_time_ms?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_instant_decision?: boolean | null
          product_id?: string
          result?: string
          swipe_time_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_analysis: {
        Row: {
          avg_response_time_ms: number | null
          brand_loyalty: Json | null
          category_affinity: Json | null
          color_preferences: Json | null
          created_at: string | null
          id: string
          last_analyzed_at: string | null
          price_sensitivity: Json | null
          seasonal_preferences: Json | null
          style_patterns: Json | null
          total_swipes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_response_time_ms?: number | null
          brand_loyalty?: Json | null
          category_affinity?: Json | null
          color_preferences?: Json | null
          created_at?: string | null
          id?: string
          last_analyzed_at?: string | null
          price_sensitivity?: Json | null
          seasonal_preferences?: Json | null
          style_patterns?: Json | null
          total_swipes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_response_time_ms?: number | null
          brand_loyalty?: Json | null
          category_affinity?: Json | null
          color_preferences?: Json | null
          created_at?: string | null
          id?: string
          last_analyzed_at?: string | null
          price_sensitivity?: Json | null
          seasonal_preferences?: Json | null
          style_patterns?: Json | null
          total_swipes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preference_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_session_learning: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          response_time_ms: number | null
          result: string
          session_id: string
          session_position: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          response_time_ms?: number | null
          result: string
          session_id: string
          session_position: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          response_time_ms?: number | null
          result?: string
          session_id?: string
          session_position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_session_learning_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_session_learning_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "mv_product_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_session_learning_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age_group: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          style_preferences: string[] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id: string
          style_preferences?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          style_preferences?: string[] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      view_logs: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "view_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_deprecated"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_product_popularity: {
        Row: {
          approval_rate: number | null
          brand: string | null
          category: string | null
          click_count: number | null
          id: string | null
          no_count: number | null
          title: string | null
          unique_viewers: number | null
          yes_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_maintenance_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_duplicate_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          brand: string
          duplicate_count: number
        }[]
      }
      get_category_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          count: number
        }[]
      }
      get_filtered_product_count: {
        Args: {
          p_categories?: string[]
          p_min_price?: number
          p_max_price?: number
          p_tags?: string[]
          p_include_used?: boolean
        }
        Returns: number
      }
      get_tag_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          tag: string
          count: number
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
