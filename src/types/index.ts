export type BlockType = 'argument' | 'evidence' | 'quote' | 'hypothesis' | 'data' | 'question';

export type RelationshipType = 'supports' | 'contradicts' | 'causes' | 'requires' | 'elaborates';

export type WorkMode = 'exploration' | 'synthesis' | 'composition';

export type AIPersona = 'critic' | 'editor' | 'researcher' | 'synthesizer';

export interface KnowledgeBlock {
  id: string;
  project_id: string;
  creator_id: string;
  block_type: BlockType;
  content: string;
  metadata: {
    tags?: string[];
    sources?: string[];
    confidence?: number;
  };
  position: { x: number; y: number };
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BlockRelationship {
  id: string;
  project_id: string;
  source_block_id: string;
  target_block_id: string;
  relationship_type: RelationshipType;
  strength: number;
  notes: string;
  created_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  metadata: {
    tags?: string[];
    category?: string;
  };
  created_at: string;
  updated_at: string;
}
