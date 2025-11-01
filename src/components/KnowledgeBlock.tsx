import { useState } from 'react';
import {
  FileText,
  Quote,
  Database,
  HelpCircle,
  Lightbulb,
  BookOpen,
  GripVertical,
  MoreVertical,
  Trash2,
  Edit2,
  Clock
} from 'lucide-react';
import type { KnowledgeBlock as KnowledgeBlockType } from '../types';

interface KnowledgeBlockProps {
  block: KnowledgeBlockType;
  onUpdate: (id: string, updates: Partial<KnowledgeBlockType>) => void;
  onDelete: (id: string) => void;
  onConnect: (blockId: string) => void;
  isConnecting: boolean;
}

const blockIcons: Record<string, typeof FileText> = {
  argument: FileText,
  evidence: BookOpen,
  quote: Quote,
  hypothesis: Lightbulb,
  data: Database,
  question: HelpCircle,
};

const blockColors: Record<string, string> = {
  argument: 'bg-blue-50 border-blue-200 hover:border-blue-300',
  evidence: 'bg-green-50 border-green-200 hover:border-green-300',
  quote: 'bg-amber-50 border-amber-200 hover:border-amber-300',
  hypothesis: 'bg-purple-50 border-purple-200 hover:border-purple-300',
  data: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
  question: 'bg-rose-50 border-rose-200 hover:border-rose-300',
};

export function KnowledgeBlock({ block, onUpdate, onDelete, onConnect, isConnecting }: KnowledgeBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [showMenu, setShowMenu] = useState(false);

  const Icon = blockIcons[block.block_type] || FileText;
  const colorClass = blockColors[block.block_type] || blockColors.argument;

  const handleSave = () => {
    if (content.trim()) {
      onUpdate(block.id, { content: content.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      setContent(block.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`relative w-80 ${colorClass} border-2 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
        isConnecting ? 'ring-2 ring-slate-900 cursor-pointer' : ''
      }`}
      onClick={() => isConnecting && onConnect(block.id)}
    >
      <div className="flex items-start gap-3 p-4">
        <button className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-1">
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {block.block_type}
            </span>
            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              v{block.version}
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              rows={4}
              autoFocus
            />
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {block.content}
            </p>
          )}

          {block.metadata.tags && block.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {block.metadata.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/60 text-xs text-slate-600 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 min-w-[140px]">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(block.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
