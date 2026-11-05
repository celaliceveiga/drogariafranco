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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string
          district: string | null
          id: string
          is_default: boolean
          label: string | null
          number: string
          state: string
          street: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          number: string
          state: string
          street: string
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          number?: string
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          ends_at: string | null
          id: string
          image_desktop: string | null
          image_mobile: string | null
          link: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          active?: boolean
          ends_at?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          link?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean
          ends_at?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          link?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          cart_id: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          cart_id?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          ends_at: string | null
          first_purchase_only: boolean
          id: string
          kind: string
          min_order: number
          starts_at: string | null
          usage_limit: number | null
          used_count: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          ends_at?: string | null
          first_purchase_only?: boolean
          id?: string
          kind?: string
          min_order?: number
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          ends_at?: string | null
          first_purchase_only?: boolean
          id?: string
          kind?: string
          min_order?: number
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
          value?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json | null
          coupon_code: string | null
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_method: string
          discount: number
          id: string
          needs_prescription: boolean
          notes: string | null
          number: number
          payment_method: string
          shipping: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_method?: string
          discount?: number
          id?: string
          needs_prescription?: boolean
          notes?: string | null
          number?: number
          payment_method: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_method?: string
          discount?: number
          id?: string
          needs_prescription?: boolean
          notes?: string | null
          number?: number
          payment_method?: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          file_path: string
          id: string
          order_id: string | null
          reject_reason: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          order_id?: string | null
          reject_reason?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          order_id?: string | null
          reject_reason?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active_ingredient: string | null
          anvisa_registry: string | null
          brand: string | null
          composition: string | null
          concentration: string | null
          cost: number | null
          created_at: string
          description: string | null
          ean: string | null
          featured: boolean
          height_cm: number | null
          id: string
          indications: string | null
          is_generic: boolean
          is_sample: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          leaflet_url: string | null
          length_cm: number | null
          min_stock: number
          name: string
          presentation: string | null
          price: number
          promo_end: string | null
          promo_price: number | null
          promo_start: string | null
          sale_class: Database["public"]["Enums"]["sale_class"]
          search_text: string | null
          seo_description: string | null
          seo_title: string | null
          sku: string | null
          slug: string
          sold_count: number
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          tags: string[]
          updated_at: string
          usage: string | null
          warnings: string | null
          weight_g: number | null
          width_cm: number | null
        }
        Insert: {
          active_ingredient?: string | null
          anvisa_registry?: string | null
          brand?: string | null
          composition?: string | null
          concentration?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          ean?: string | null
          featured?: boolean
          height_cm?: number | null
          id?: string
          indications?: string | null
          is_generic?: boolean
          is_sample?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          leaflet_url?: string | null
          length_cm?: number | null
          min_stock?: number
          name: string
          presentation?: string | null
          price?: number
          promo_end?: string | null
          promo_price?: number | null
          promo_start?: string | null
          sale_class?: Database["public"]["Enums"]["sale_class"]
          search_text?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug: string
          sold_count?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tags?: string[]
          updated_at?: string
          usage?: string | null
          warnings?: string | null
          weight_g?: number | null
          width_cm?: number | null
        }
        Update: {
          active_ingredient?: string | null
          anvisa_registry?: string | null
          brand?: string | null
          composition?: string | null
          concentration?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          ean?: string | null
          featured?: boolean
          height_cm?: number | null
          id?: string
          indications?: string | null
          is_generic?: boolean
          is_sample?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          leaflet_url?: string | null
          length_cm?: number | null
          min_stock?: number
          name?: string
          presentation?: string | null
          price?: number
          promo_end?: string | null
          promo_price?: number | null
          promo_start?: string | null
          sale_class?: Database["public"]["Enums"]["sale_class"]
          search_text?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug?: string
          sold_count?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          tags?: string[]
          updated_at?: string
          usage?: string | null
          warnings?: string | null
          weight_g?: number | null
          width_cm?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          author_name: string | null
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          approved?: boolean
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          approved?: boolean
          author_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rules: {
        Row: {
          active: boolean
          cep_end: string | null
          cep_start: string | null
          days: number
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean
          cep_end?: string | null
          cep_start?: string | null
          days?: number
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean
          cep_end?: string | null
          cep_start?: string | null
          days?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      showcases: {
        Row: {
          active: boolean
          id: string
          product_ids: string[]
          rule: string
          rule_value: string | null
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          id?: string
          product_ids?: string[]
          rule?: string
          rule_value?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          id?: string
          product_ids?: string[]
          rule?: string
          rule_value?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          order_id: string | null
          product_id: string
          quantity: number
          reason: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string | null
          afe: string | null
          cnae: string | null
          cnpj: string | null
          crf: string | null
          email: string | null
          founded: string | null
          free_shipping_min: number
          hours: string | null
          id: number
          legal_name: string | null
          low_stock_threshold: number
          max_installments: number
          min_installment: number
          pay_on_delivery: boolean
          pharmacist: string | null
          phone: string | null
          pickup_address: string | null
          pickup_enabled: boolean
          pix_discount: number
          sanitary_license: string | null
          store_name: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          afe?: string | null
          cnae?: string | null
          cnpj?: string | null
          crf?: string | null
          email?: string | null
          founded?: string | null
          free_shipping_min?: number
          hours?: string | null
          id?: number
          legal_name?: string | null
          low_stock_threshold?: number
          max_installments?: number
          min_installment?: number
          pay_on_delivery?: boolean
          pharmacist?: string | null
          phone?: string | null
          pickup_address?: string | null
          pickup_enabled?: boolean
          pix_discount?: number
          sanitary_license?: string | null
          store_name?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          afe?: string | null
          cnae?: string | null
          cnpj?: string | null
          crf?: string | null
          email?: string | null
          founded?: string | null
          free_shipping_min?: number
          hours?: string | null
          id?: number
          legal_name?: string | null
          low_stock_threshold?: number
          max_installments?: number
          min_installment?: number
          pay_on_delivery?: boolean
          pharmacist?: string | null
          phone?: string | null
          pickup_address?: string | null
          pickup_enabled?: boolean
          pix_discount?: number
          sanitary_license?: string | null
          store_name?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_products: {
        Args: { lim?: number; q: string }
        Returns: {
          active_ingredient: string | null
          anvisa_registry: string | null
          brand: string | null
          composition: string | null
          concentration: string | null
          cost: number | null
          created_at: string
          description: string | null
          ean: string | null
          featured: boolean
          height_cm: number | null
          id: string
          indications: string | null
          is_generic: boolean
          is_sample: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          leaflet_url: string | null
          length_cm: number | null
          min_stock: number
          name: string
          presentation: string | null
          price: number
          promo_end: string | null
          promo_price: number | null
          promo_start: string | null
          sale_class: Database["public"]["Enums"]["sale_class"]
          search_text: string | null
          seo_description: string | null
          seo_title: string | null
          sku: string | null
          slug: string
          sold_count: number
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          tags: string[]
          updated_at: string
          usage: string | null
          warnings: string | null
          weight_g: number | null
          width_cm: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "recebido"
        | "aguardando_pagamento"
        | "pagamento_aprovado"
        | "receita_validada"
        | "em_separacao"
        | "enviado"
        | "pronto_retirada"
        | "entregue"
        | "cancelado"
      product_kind:
        | "medicamento"
        | "dermocosmetico"
        | "higiene"
        | "beleza"
        | "infantil"
        | "suplemento"
        | "outros"
      product_status: "ativo" | "rascunho" | "inativo"
      sale_class: "livre" | "receita" | "controlado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      order_status: [
        "recebido",
        "aguardando_pagamento",
        "pagamento_aprovado",
        "receita_validada",
        "em_separacao",
        "enviado",
        "pronto_retirada",
        "entregue",
        "cancelado",
      ],
      product_kind: [
        "medicamento",
        "dermocosmetico",
        "higiene",
        "beleza",
        "infantil",
        "suplemento",
        "outros",
      ],
      product_status: ["ativo", "rascunho", "inativo"],
      sale_class: ["livre", "receita", "controlado"],
    },
  },
} as const
