export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          preferences?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      knowledge_blocks: {
        Row: {
          id: string;
          project_id: string;
          creator_id: string;
          block_type: string;
          content: string;
          metadata: Record<string, unknown>;
          position: { x: number; y: number };
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          creator_id: string;
          block_type?: string;
          content: string;
          metadata?: Record<string, unknown>;
          position?: { x: number; y: number };
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          block_type?: string;
          content?: string;
          metadata?: Record<string, unknown>;
          position?: { x: number; y: number };
          version?: number;
          updated_at?: string;
        };
      };
      block_relationships: {
        Row: {
          id: string;
          project_id: string;
          source_block_id: string;
          target_block_id: string;
          relationship_type: string;
          strength: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_block_id: string;
          target_block_id: string;
          relationship_type: string;
          strength?: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          relationship_type?: string;
          strength?: number;
          notes?: string;
        };
      };
      block_versions: {
        Row: {
          id: string;
          block_id: string;
          version: number;
          content: string;
          change_summary: string;
          changed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          block_id: string;
          version: number;
          content: string;
          change_summary?: string;
          changed_by: string;
          created_at?: string;
        };
        Update: {
          change_summary?: string;
        };
      };
      ai_interactions: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          persona: string;
          prompt: string;
          response: string;
          context_blocks: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          persona: string;
          prompt: string;
          response: string;
          context_blocks?: string[];
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      exports: {
        Row: {
          id: string;
          project_id: string;
          creator_id: string;
          format: string;
          audience: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          creator_id: string;
          format: string;
          audience?: string;
          content: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
  };
}
