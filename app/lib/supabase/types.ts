export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: "cliente" | "admin";
          plan: "sem_plano" | "basico" | "pro";
          plan_renewal: string | null;
          token_balance: number;
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
          role?: "cliente" | "admin";
          plan?: "sem_plano" | "basico" | "pro";
          plan_renewal?: string | null;
          token_balance?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light";
        };
        Update: {
          name?: string;
          role?: "cliente" | "admin";
          plan?: "sem_plano" | "basico" | "pro";
          plan_renewal?: string | null;
          token_balance?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light";
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          description: string;
          status: "aguardando" | "em_desenvolvimento" | "revisao" | "entregue" | "manutencao";
          progress: number;
          addons: string[];
          maintenance_plan: "basico" | "pro" | null;
          started_at: string;
          delivered_at: string | null;
          preview_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          name: string;
          description?: string;
          status?: string;
          progress?: number;
          addons?: string[];
          maintenance_plan?: string | null;
          started_at?: string;
          delivered_at?: string | null;
          preview_url?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          status?: string;
          progress?: number;
          addons?: string[];
          maintenance_plan?: string | null;
          delivered_at?: string | null;
          preview_url?: string | null;
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
          project_id: string | null;
          subject: string;
          category: string;
          status: "aberto" | "em_andamento" | "resolvido" | "fechado";
          priority: "baixa" | "media" | "alta";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          project_id?: string | null;
          subject: string;
          category?: string;
          status?: "aberto" | "em_andamento" | "resolvido" | "fechado";
          priority?: "baixa" | "media" | "alta";
        };
        Update: {
          status?: "aberto" | "em_andamento" | "resolvido" | "fechado";
          priority?: "baixa" | "media" | "alta";
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
      project_events: {
        Row: {
          id: string;
          project_id: string | null;
          source: "github" | "vercel" | "fropty";
          event_type: string;
          title: string;
          body: string | null;
          url: string | null;
          actor: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          project_id?: string | null;
          source: "github" | "vercel" | "fropty";
          event_type: string;
          title: string;
          body?: string | null;
          url?: string | null;
          actor?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          id?: never;
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
