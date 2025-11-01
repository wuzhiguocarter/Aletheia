import { useState } from 'react';
import { Send, Brain, Target, Search, Sparkles, X } from 'lucide-react';
import type { AIPersona } from '../types';

interface AIPanelProps {
  projectId: string;
  onInteraction: (persona: AIPersona, prompt: string) => Promise<string>;
}

const personas = [
  {
    id: 'critic' as AIPersona,
    name: 'Critic',
    icon: Target,
    color: 'bg-red-50 text-red-600 border-red-200',
    description: 'Challenge arguments and find logical gaps',
  },
  {
    id: 'editor' as AIPersona,
    name: 'Editor',
    icon: Brain,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    description: 'Improve structure and coherence',
  },
  {
    id: 'researcher' as AIPersona,
    name: 'Researcher',
    icon: Search,
    color: 'bg-green-50 text-green-600 border-green-200',
    description: 'Provide evidence and citations',
  },
  {
    id: 'synthesizer' as AIPersona,
    name: 'Synthesizer',
    icon: Sparkles,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    description: 'Connect ideas and reveal patterns',
  },
];

export function AIPanel({ projectId, onInteraction }: AIPanelProps) {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ persona: AIPersona; prompt: string; response: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersona || !prompt.trim()) return;

    setLoading(true);
    try {
      const result = await onInteraction(selectedPersona, prompt);
      setResponse(result);
      setHistory([{ persona: selectedPersona, prompt, response: result }, ...history]);
      setPrompt('');
    } catch (error) {
      setResponse('Error: Could not get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Collaboration
        </h2>
        <p className="text-sm text-slate-600 mt-1">Choose a thinking partner</p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-200">
        {personas.map((persona) => {
          const Icon = persona.icon;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              className={`p-3 border-2 rounded-lg transition-all text-left ${
                selectedPersona === persona.id
                  ? persona.color + ' ring-2 ring-offset-2 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <div className="font-medium text-sm">{persona.name}</div>
              <div className="text-xs opacity-70 mt-1">{persona.description}</div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {response && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                {personas.find((p) => p.id === selectedPersona)?.name}
              </span>
              <button
                onClick={() => setResponse('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{response}</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">History</h3>
            {history.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-medium text-slate-600 mb-1">
                  {personas.find((p) => p.id === item.persona)?.name}
                </div>
                <div className="text-xs text-slate-500 mb-2">{item.prompt}</div>
                <div className="text-sm text-slate-700">{item.response}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        {!selectedPersona && (
          <div className="text-sm text-slate-500 text-center py-2">
            Select a persona to start collaborating
          </div>
        )}
        {selectedPersona && (
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your AI partner..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
