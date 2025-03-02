export interface Database {
  public: {
    Tables: {
      logs: {
        Row: {
          id: string;
          created_at: string;
          server_id: string;
          event_type: string;
          category: string | null;
          type: string | null;
          player_id: string | null;
          player_name: string | null;
          details: any;
        };
        Insert: {
          id?: string;
          created_at?: string;
          server_id: string;
          event_type: string;
          category?: string | null;
          type?: string | null;
          player_id?: string | null;
          player_name?: string | null;
          details?: any;
        };
        Update: {
          id?: string;
          created_at?: string;
          server_id?: string;
          event_type?: string;
          category?: string | null;
          type?: string | null;
          player_id?: string | null;
          player_name?: string | null;
          details?: any;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: {
        [key: string]: string;
      };
    };
  };
}