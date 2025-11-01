import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProjectSelector } from '../components/ProjectSelector';
import { WorkModeSelector } from '../components/WorkModeSelector';
import { KnowledgeCanvas } from '../components/KnowledgeCanvas';
import { AIPanel } from '../components/AIPanel';
import { InsightRadar } from '../components/InsightRadar';
import { ExportPanel } from '../components/ExportPanel';
import type {
  Project,
  KnowledgeBlock,
  BlockRelationship,
  WorkMode,
  AIPersona,
} from '../types';

export function IDE() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [relationships, setRelationships] = useState<BlockRelationship[]>([]);
  const [workMode, setWorkMode] = useState<WorkMode>('exploration');
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      loadProjectData();
    }
  }, [currentProject]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
      if (data.length > 0 && !currentProject) {
        setCurrentProject(data[0]);
      }
    }
  };

  const loadProjectData = async () => {
    if (!currentProject) return;

    const [blocksRes, relsRes] = await Promise.all([
      supabase
        .from('knowledge_blocks')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('block_relationships')
        .select('*')
        .eq('project_id', currentProject.id),
    ]);

    if (!blocksRes.error && blocksRes.data) {
      setBlocks(blocksRes.data);
    }

    if (!relsRes.error && relsRes.data) {
      setRelationships(relsRes.data);
    }
  };

  const handleCreateProject = async (title: string, description: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        title,
        description,
      })
      .select()
      .single();

    if (!error && data) {
      setProjects([data, ...projects]);
      setCurrentProject(data);
    }
  };

  const handleCreateBlock = async (type: string, position: { x: number; y: number }) => {
    if (!user || !currentProject) return;

    const { data, error } = await supabase
      .from('knowledge_blocks')
      .insert({
        project_id: currentProject.id,
        creator_id: user.id,
        block_type: type,
        content: 'New block - click to edit',
        position,
      })
      .select()
      .single();

    if (!error && data) {
      setBlocks([...blocks, data]);
    }
  };

  const handleUpdateBlock = async (id: string, updates: Partial<KnowledgeBlock>) => {
    const block = blocks.find((b) => b.id === id);
    if (!block || !user) return;

    const newVersion = block.version + 1;

    await supabase.from('block_versions').insert({
      block_id: id,
      version: block.version,
      content: block.content,
      changed_by: user.id,
      change_summary: 'Updated content',
    });

    const { error } = await supabase
      .from('knowledge_blocks')
      .update({ ...updates, version: newVersion, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates, version: newVersion } : b)));
    }
  };

  const handleDeleteBlock = async (id: string) => {
    const { error } = await supabase.from('knowledge_blocks').delete().eq('id', id);

    if (!error) {
      setBlocks(blocks.filter((b) => b.id !== id));
      setRelationships(relationships.filter(
        (r) => r.source_block_id !== id && r.target_block_id !== id
      ));
    }
  };

  const handleCreateRelationship = async (
    sourceId: string,
    targetId: string,
    type: string
  ) => {
    if (!currentProject) return;

    const { data, error } = await supabase
      .from('block_relationships')
      .insert({
        project_id: currentProject.id,
        source_block_id: sourceId,
        target_block_id: targetId,
        relationship_type: type,
      })
      .select()
      .single();

    if (!error && data) {
      setRelationships([...relationships, data]);
    }
  };

  const handleAIInteraction = async (persona: AIPersona, prompt: string): Promise<string> => {
    if (!user || !currentProject) return 'Error: No project selected';

    const responses: Record<AIPersona, string> = {
      critic: `As a critic, I would challenge your premise by asking: What evidence supports this claim? Have you considered alternative explanations? Your argument could be strengthened by addressing potential counterarguments.`,
      editor: `From an editorial perspective, I suggest restructuring your argument for better flow. Consider: 1) Stronger opening statement, 2) Clear supporting points, 3) Logical progression, 4) Powerful conclusion.`,
      researcher: `Based on the context, you might want to explore these sources: Recent studies in this field show conflicting results. I recommend looking into meta-analyses and systematic reviews for more comprehensive evidence.`,
      synthesizer: `I see interesting patterns emerging: Your blocks reveal three main themes that could be connected. Consider how your hypothesis relates to your evidence, and how your questions might lead to new research directions.`,
    };

    await supabase.from('ai_interactions').insert({
      project_id: currentProject.id,
      user_id: user.id,
      persona,
      prompt,
      response: responses[persona],
    });

    return responses[persona];
  };

  const handleExport = async (format: string, content: string, audience: string) => {
    if (!user || !currentProject) return;

    await supabase.from('exports').insert({
      project_id: currentProject.id,
      creator_id: user.id,
      format,
      audience,
      content,
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title}.${format === 'markdown' ? 'md' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-slate-900">Knowledge IDE</h1>
          {currentProject && (
            <WorkModeSelector currentMode={workMode} onModeChange={setWorkMode} />
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showAIPanel
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            AI Panel
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ProjectSelector
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={setCurrentProject}
          onProjectCreate={handleCreateProject}
        />

        <div className="flex-1 flex flex-col">
          {currentProject ? (
            <KnowledgeCanvas
              blocks={blocks}
              relationships={relationships}
              onCreateBlock={handleCreateBlock}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
              onCreateRelationship={handleCreateRelationship}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select or create a project to get started
            </div>
          )}
        </div>

        {showAIPanel && currentProject && (
          <div className="w-96">
            <AIPanel projectId={currentProject.id} onInteraction={handleAIInteraction} />
          </div>
        )}
      </div>

      {currentProject && workMode === 'synthesis' && (
        <div className="fixed bottom-4 right-4 w-96 space-y-4 z-50">
          <InsightRadar blocks={blocks} />
        </div>
      )}

      {currentProject && workMode === 'composition' && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <ExportPanel
            projectTitle={currentProject.title}
            blocks={blocks}
            relationships={relationships}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
}
