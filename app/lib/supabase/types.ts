export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          plan: "basico" | "pro" | null;
          plan_renewal: string | null;
          token_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          plan?: "basico" | "pro" | null;
          plan_renewal?: string | null;
          token_balance?: number;
        };
        Update: {
          name?: string;
          plan?: "basico" | "pro" | null;
          plan_renewal?: string | null;
          token_balance?: number;
        };
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
        };
        Update: {
          name?: string;
          description?: string;
          status?: string;
          progress?: number;
          addons?: string[];
          maintenance_plan?: string | null;
          delivered_at?: string | null;
        };
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
          balance: number;
        };
        Update: never;
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
      };
    };
  };
}
