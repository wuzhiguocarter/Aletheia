import { useState } from 'react';
import { Plus, FolderOpen, Clock } from 'lucide-react';
import type { Project } from '../types';

interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (title: string, description: string) => void;
}

export function ProjectSelector({
  projects,
  currentProject,
  onProjectSelect,
  onProjectCreate,
}: ProjectSelectorProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onProjectCreate(title, description);
      setTitle('');
      setDescription('');
      setShowNewProject(false);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Projects
          </h2>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showNewProject && (
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No projects yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentProject?.id === project.id
                    ? 'bg-slate-900 text-white'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-medium text-sm mb-1">{project.title}</div>
                {project.description && (
                  <div
                    className={`text-xs mb-2 line-clamp-2 ${
                      currentProject?.id === project.id ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {project.description}
                  </div>
                )}
                <div
                  className={`flex items-center gap-1 text-xs ${
                    currentProject?.id === project.id ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
