export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          role: "cliente" | "admin";
          plan: "sem_plano" | "basico" | "pro";
          plan_renewal: string | null;
          token_balance: number;
          services: string[];
          contract_start: string | null;
          welcomed_at: string | null;
          onboarding_completed: boolean;
          onboarding_step: number;
          is_active: boolean;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          avatar_url: string | null;
          theme: "dark" | "light";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          role?: "cliente" | "admin";
          plan?: "sem_plano" | "basico" | "pro";
          plan_renewal?: string | null;
          token_balance?: number;
          services?: string[];
          contract_start?: string | null;
          is_active?: boolean;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light";
        };
        Update: {
          name?: string;
          email?: string | null;
          role?: "cliente" | "admin";
          plan?: "sem_plano" | "basico" | "pro";
          plan_renewal?: string | null;
          token_balance?: number;
          services?: string[];
          contract_start?: string | null;
          welcomed_at?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          is_active?: boolean;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light";
        };
        Relationships: [];
      };
      token_transactions: {
        Row: {
          id: string;
          client_id: string;
          description: string;
          type: "credit" | "debit";
          amount: number;
          balance: number;
          created_at: string;
        };
        Insert: {
          client_id: string;
          description: string;
          type: "credit" | "debit";
          amount: number;
          balance?: number;
        };
        Update: {
          id?: never; // tabela imutável — sem campos atualizáveis
        };
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          client_id: string;
          subject: string;
          category: string;
          status: "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
          priority: "baixa" | "media" | "alta";
          ticket_number: number;
          first_response_at: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          subject: string;
          category?: string;
          status?: "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
          priority?: "baixa" | "media" | "alta";
        };
        Update: {
          status?: "aberto" | "em_andamento" | "resolvido" | "fechado" | "reaberto";
          priority?: "baixa" | "media" | "alta";
          first_response_at?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          sender_role: "cliente" | "admin";
          body: string;
          attachments: string[];
          created_at: string;
        };
        Insert: {
          ticket_id: string;
          sender_id: string;
          sender_role: "cliente" | "admin";
          body: string;
          attachments?: string[];
        };
        Update: {
          id?: never; // tabela imutável
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          source: string;
          converted: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          message: string;
          source?: string;
          converted?: boolean;
        };
        Update: {
          converted?: boolean;
        };
        Relationships: [];
      };
      processed_webhook_events: {
        Row: {
          id: string;
          event_id: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          created_at?: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          admin_id: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      low_token_alerts: {
        Row: {
          id: string;
          client_id: string;
          token_balance: number;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string;
          token_balance: number;
          sent_at?: string | null;
        };
        Update: {
          sent_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      admin_mrr: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
