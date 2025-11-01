/*
  # Knowledge IDE Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `preferences` (jsonb) - UI preferences, AI personas, etc.
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `projects`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `metadata` (jsonb) - tags, categories, custom fields
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `knowledge_blocks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `creator_id` (uuid, references profiles)
      - `block_type` (text) - argument, evidence, quote, hypothesis, data, question
      - `content` (text)
      - `metadata` (jsonb) - sources, tags, confidence level
      - `position` (jsonb) - x, y coordinates for canvas
      - `version` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `block_relationships`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `source_block_id` (uuid, references knowledge_blocks)
      - `target_block_id` (uuid, references knowledge_blocks)
      - `relationship_type` (text) - supports, contradicts, causes, requires, elaborates
      - `strength` (float) - 0-1 confidence
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `block_versions`
      - `id` (uuid, primary key)
      - `block_id` (uuid, references knowledge_blocks)
      - `version` (integer)
      - `content` (text)
      - `change_summary` (text)
      - `changed_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    
    - `ai_interactions`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles)
      - `persona` (text) - critic, editor, researcher, synthesizer
      - `prompt` (text)
      - `response` (text)
      - `context_blocks` (jsonb) - array of block IDs
      - `created_at` (timestamptz)
    
    - `exports`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `creator_id` (uuid, references profiles)
      - `format` (text) - markdown, pdf, presentation, article
      - `audience` (text)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data and shared projects
    - Profiles are readable by authenticated users, writable only by owner
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'argument',
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  position jsonb DEFAULT '{"x": 0, "y": 0}'::jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS block_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects ON DELETE CASCADE,
  source_block_id uuid NOT NULL REFERENCES knowledge_blocks ON DELETE CASCADE,
  target_block_id uuid NOT NULL REFERENCES knowledge_blocks ON DELETE CASCADE,
  relationship_type text NOT NULL,
  strength float DEFAULT 1.0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS block_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES knowledge_blocks ON DELETE CASCADE,
  version integer NOT NULL,
  content text NOT NULL,
  change_summary text DEFAULT '',
  changed_by uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  persona text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  context_blocks jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  format text NOT NULL,
  audience text DEFAULT '',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view blocks in own projects"
  ON knowledge_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = knowledge_blocks.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create blocks in own projects"
  ON knowledge_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = knowledge_blocks.project_id
      AND projects.owner_id = auth.uid()
    )
    AND auth.uid() = creator_id
  );

CREATE POLICY "Users can update blocks in own projects"
  ON knowledge_blocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = knowledge_blocks.project_id
      AND projects.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = knowledge_blocks.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete blocks in own projects"
  ON knowledge_blocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = knowledge_blocks.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view relationships in own projects"
  ON block_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = block_relationships.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create relationships in own projects"
  ON block_relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = block_relationships.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships in own projects"
  ON block_relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = block_relationships.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view block versions in own projects"
  ON block_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_blocks
      JOIN projects ON projects.id = knowledge_blocks.project_id
      WHERE knowledge_blocks.id = block_versions.block_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create block versions in own projects"
  ON block_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_blocks
      JOIN projects ON projects.id = knowledge_blocks.project_id
      WHERE knowledge_blocks.id = block_versions.block_id
      AND projects.owner_id = auth.uid()
    )
    AND auth.uid() = changed_by
  );

CREATE POLICY "Users can view own AI interactions"
  ON ai_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI interactions in own projects"
  ON ai_interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ai_interactions.project_id
      AND projects.owner_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can view exports from own projects"
  ON exports FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create exports from own projects"
  ON exports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = exports.project_id
      AND projects.owner_id = auth.uid()
    )
    AND auth.uid() = creator_id
  );

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_blocks_project ON knowledge_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_block_relationships_project ON block_relationships(project_id);
CREATE INDEX IF NOT EXISTS idx_block_relationships_source ON block_relationships(source_block_id);
CREATE INDEX IF NOT EXISTS idx_block_relationships_target ON block_relationships(target_block_id);
CREATE INDEX IF NOT EXISTS idx_block_versions_block ON block_versions(block_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_project ON ai_interactions(project_id);