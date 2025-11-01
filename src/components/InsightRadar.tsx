import { useState, useEffect } from 'react';
import { Radar, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import type { KnowledgeBlock } from '../types';

interface InsightRadarProps {
  blocks: KnowledgeBlock[];
}

interface Insight {
  type: 'pattern' | 'gap' | 'contradiction' | 'opportunity';
  title: string;
  description: string;
  relatedBlocks: string[];
}

export function InsightRadar({ blocks }: InsightRadarProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blocks.length > 0) {
      analyzeBlocks();
    }
  }, [blocks]);

  const analyzeBlocks = () => {
    setLoading(true);
    setTimeout(() => {
      const newInsights: Insight[] = [];

      const blocksByType = blocks.reduce((acc, block) => {
        acc[block.block_type] = (acc[block.block_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      if ((blocksByType.argument || 0) > (blocksByType.evidence || 0) * 2) {
        newInsights.push({
          type: 'gap',
          title: 'Evidence Gap Detected',
          description: 'You have many arguments but limited supporting evidence. Consider adding more data or citations.',
          relatedBlocks: blocks.filter(b => b.block_type === 'argument').map(b => b.id),
        });
      }

      if (blocksByType.question && blocksByType.question > 3) {
        newInsights.push({
          type: 'opportunity',
          title: 'Research Opportunities',
          description: `You have ${blocksByType.question} unanswered questions. These could drive your next research phase.`,
          relatedBlocks: blocks.filter(b => b.block_type === 'question').map(b => b.id),
        });
      }

      const tags = blocks.flatMap(b => b.metadata.tags || []);
      const tagCounts = tags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (topTags.length > 0) {
        newInsights.push({
          type: 'pattern',
          title: 'Emerging Themes',
          description: `Key themes: ${topTags.map(([tag]) => tag).join(', ')}. Consider exploring these connections further.`,
          relatedBlocks: [],
        });
      }

      if (blocks.length > 10) {
        newInsights.push({
          type: 'opportunity',
          title: 'Ready for Synthesis',
          description: 'You have accumulated significant knowledge. Consider switching to Synthesis mode to connect ideas.',
          relatedBlocks: [],
        });
      }

      setInsights(newInsights);
      setLoading(false);
    }, 500);
  };

  const insightIcons = {
    pattern: TrendingUp,
    gap: AlertCircle,
    contradiction: AlertCircle,
    opportunity: Lightbulb,
  };

  const insightColors = {
    pattern: 'bg-blue-50 border-blue-200 text-blue-700',
    gap: 'bg-amber-50 border-amber-200 text-amber-700',
    contradiction: 'bg-red-50 border-red-200 text-red-700',
    opportunity: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Radar className="w-5 h-5" />
          Insight Radar
        </h3>
        <button
          onClick={analyzeBlocks}
          disabled={loading}
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          {blocks.length === 0
            ? 'Add blocks to discover insights'
            : 'No insights detected yet. Keep building your knowledge graph.'}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = insightIcons[insight.type];
            const colorClass = insightColors[insight.type];

            return (
              <div
                key={i}
                className={`p-3 rounded-lg border-2 ${colorClass}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm mb-1">{insight.title}</div>
                    <div className="text-xs opacity-90">{insight.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
