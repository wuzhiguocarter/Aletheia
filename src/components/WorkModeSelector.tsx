import { Compass, GitBranch, FileEdit } from 'lucide-react';
import type { WorkMode } from '../types';

interface WorkModeSelectorProps {
  currentMode: WorkMode;
  onModeChange: (mode: WorkMode) => void;
}

const modes = [
  {
    id: 'exploration' as WorkMode,
    name: 'Exploration',
    icon: Compass,
    description: 'Discover and collect ideas',
    color: 'bg-blue-500',
  },
  {
    id: 'synthesis' as WorkMode,
    name: 'Synthesis',
    icon: GitBranch,
    description: 'Connect and structure concepts',
    color: 'bg-green-500',
  },
  {
    id: 'composition' as WorkMode,
    name: 'Composition',
    icon: FileEdit,
    description: 'Create final output',
    color: 'bg-purple-500',
  },
];

export function WorkModeSelector({ currentMode, onModeChange }: WorkModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <div className="text-sm font-medium">{mode.name}</div>
              {isActive && (
                <div className="text-xs opacity-80">{mode.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
