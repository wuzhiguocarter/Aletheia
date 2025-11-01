import { useState } from 'react';
import { History, Clock, User } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  content: string;
  change_summary: string;
  changed_by: string;
  created_at: string;
}

interface VersionHistoryProps {
  blockId: string;
  versions: Version[];
  onRestore: (versionId: string) => void;
}

export function VersionHistory({ blockId, versions, onRestore }: VersionHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          <span className="font-bold text-slate-900">Version History</span>
          <span className="text-sm text-slate-500">({versions.length})</span>
        </div>
        <div className="text-sm text-slate-600">
          {expanded ? 'Hide' : 'Show'}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-900">v{version.version}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onRestore(version.id)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Restore
                </button>
              </div>

              {version.change_summary && (
                <div className="text-sm text-slate-600 mb-2 italic">
                  {version.change_summary}
                </div>
              )}

              <div className="text-sm text-slate-700 p-2 bg-white rounded border border-slate-100">
                {version.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
