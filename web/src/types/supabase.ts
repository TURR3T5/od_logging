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
          discord_id: string | null;
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
          discord_id?: string | null;
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
          discord_id?: string | null;
          details?: any;
        };
      };

      rules: {
        Row: {
          id: string;
          badge: string;
          title: string;
          content: string;
          category: 'community' | 'roleplay';
          tags: string[];
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
          updated_by: string;
          version: number;
          order_index: number;
        };
        Insert: {
          id?: string;
          badge: string;
          title: string;
          content: string;
          category: 'community' | 'roleplay';
          tags?: string[];
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string;
          version?: number;
          order_index?: number;
        };
        Update: {
          id?: string;
          badge?: string;
          title?: string;
          content?: string;
          category?: 'community' | 'roleplay';
          tags?: string[];
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string;
          version?: number;
          order_index?: number;
        };
      };
      rule_changes: {
        Row: {
          id: string;
          rule_id: string;
          previous_content: string;
          new_content: string;
          previous_title: string;
          new_title: string;
          previous_tags: string[];
          new_tags: string[];
          previous_pinned: boolean;
          new_pinned: boolean;
          changed_at: string;
          changed_by: string;
          version: number;
          change_notes: string;
        };
        Insert: {
          id?: string;
          rule_id: string;
          previous_content: string;
          new_content: string;
          previous_title: string;
          new_title: string;
          previous_tags: string[];
          new_tags: string[];
          previous_pinned: boolean;
          new_pinned: boolean;
          changed_at?: string;
          changed_by: string;
          version: number;
          change_notes?: string;
        };
        Update: {
          id?: string;
          rule_id?: string;
          previous_content?: string;
          new_content?: string;
          previous_title?: string;
          new_title?: string;
          previous_tags?: string[];
          new_tags?: string[];
          previous_pinned?: boolean;
          new_pinned?: boolean;
          changed_at?: string;
          changed_by?: string;
          version?: number;
          change_notes?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: string | null;
          created_at: string;
          created_by: string | null;
          is_pinned: boolean;
          last_updated: string;
          updated_by: string | null;
          type: 'news' | 'event';
          category: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          is_pinned?: boolean;
          last_updated?: string;
          updated_by?: string | null;
          type: 'news' | 'event';
          category: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          is_pinned?: boolean;
          last_updated?: string;
          updated_by?: string | null;
          type?: 'news' | 'event';
          category?: string;
        };
      };
      
      news_metadata: {
        Row: {
          content_id: string;
          news_type: 'update' | 'announcement' | 'changelog';
        };
        Insert: {
          content_id: string;
          news_type: 'update' | 'announcement' | 'changelog';
        };
        Update: {
          content_id?: string;
          news_type?: 'update' | 'announcement' | 'changelog';
        };
      };
      
      event_metadata: {
        Row: {
          content_id: string;
          event_type: 'community' | 'official' | 'special';
          event_date: string;
          location: string | null;
          address: string | null;
        };
        Insert: {
          content_id: string;
          event_type: 'community' | 'official' | 'special';
          event_date: string;
          location?: string | null;
          address?: string | null;
        };
        Update: {
          content_id?: string;
          event_type?: 'community' | 'official' | 'special';
          event_date?: string;
          location?: string | null;
          address?: string | null;
        };
      };
      
      content_tags: {
        Row: {
          content_id: string;
          tag: string;
        };
        Insert: {
          content_id: string;
          tag: string;
        };
        Update: {
          content_id?: string;
          tag?: string;
        };
      };
      
      discord_roles: {
        Row: {
          id: string;
          name: string;
          permission_level: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          name: string;
          permission_level: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          permission_level?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      
      job_types: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          requirements: string[] | null;
          is_recruiting: boolean;
          color: string;
          members_count: number;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          requirements?: string[] | null;
          is_recruiting?: boolean;
          color?: string;
          members_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          requirements?: string[] | null;
          is_recruiting?: boolean;
          color?: string;
          members_count?: number;
        };
      };
      
      job_questions: {
        Row: {
          id: string;
          job_id: string;
          label: string;
          type: 'text' | 'textarea';
          required: boolean;
          order_index: number;
        };
        Insert: {
          id?: string;
          job_id: string;
          label: string;
          type: 'text' | 'textarea';
          required?: boolean;
          order_index: number;
        };
        Update: {
          id?: string;
          job_id?: string;
          label?: string;
          type?: 'text' | 'textarea';
          required?: boolean;
          order_index?: number;
        };
      };
      
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          user_id: string;
          username: string | null;
          discord_id: string | null;
          status: 'pending' | 'accepted' | 'rejected';
          submitted_at: string;
          updated_at: string | null;
          updated_by: string | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          user_id: string;
          username?: string | null;
          discord_id?: string | null;
          status?: 'pending' | 'accepted' | 'rejected';
          submitted_at?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          user_id?: string;
          username?: string | null;
          discord_id?: string | null;
          status?: 'pending' | 'accepted' | 'rejected';
          submitted_at?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          feedback?: string | null;
        };
      };
      
      application_answers: {
        Row: {
          application_id: string;
          question_id: string;
          answer: string | null;
        };
        Insert: {
          application_id: string;
          question_id: string;
          answer?: string | null;
        };
        Update: {
          application_id?: string;
          question_id?: string;
          answer?: string | null;
        };
      };
      permission_levels: {
        Row: {
          id: string;
          description: string | null;
          priority: number;
        };
        Insert: {
          id: string;
          description?: string | null;
          priority: number;
        };
        Update: {
          id?: string;
          description?: string | null;
          priority?: number;
        };
      };
      
      role_changes: {
        Row: {
          id: string;
          role_id: string;
          previous_level: string;
          new_level: string;
          previous_active: boolean;
          new_active: boolean;
          changed_at: string;
          changed_by: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          previous_level: string;
          new_level: string;
          previous_active: boolean;
          new_active: boolean;
          changed_at?: string;
          changed_by: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          previous_level?: string;
          new_level?: string;
          previous_active?: boolean;
          new_active?: boolean;
          changed_at?: string;
          changed_by?: string;
        };
      };
      
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          permission_level: string;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          permission_level: string;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          permission_level?: string;
          granted_at?: string;
          granted_by?: string | null;
        };
      };
    };
  };
}
