import { useState } from 'react';
import { Download, FileText, Presentation, File } from 'lucide-react';
import type { KnowledgeBlock, BlockRelationship } from '../types';

interface ExportPanelProps {
  projectTitle: string;
  blocks: KnowledgeBlock[];
  relationships: BlockRelationship[];
  onExport: (format: string, content: string, audience: string) => void;
}

export function ExportPanel({ projectTitle, blocks, relationships, onExport }: ExportPanelProps) {
  const [format, setFormat] = useState<'markdown' | 'article' | 'presentation'>('markdown');
  const [audience, setAudience] = useState('');
  const [exporting, setExporting] = useState(false);

  const generateMarkdown = () => {
    let content = `# ${projectTitle}\n\n`;

    const blocksByType = blocks.reduce((acc, block) => {
      if (!acc[block.block_type]) {
        acc[block.block_type] = [];
      }
      acc[block.block_type].push(block);
      return acc;
    }, {} as Record<string, KnowledgeBlock[]>);

    Object.entries(blocksByType).forEach(([type, typeBlocks]) => {
      content += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      typeBlocks.forEach((block) => {
        content += `### ${block.content.split('\n')[0]}\n\n`;
        content += `${block.content}\n\n`;
        if (block.metadata.tags && block.metadata.tags.length > 0) {
          content += `*Tags: ${block.metadata.tags.join(', ')}*\n\n`;
        }
      });
    });

    return content;
  };

  const generateArticle = () => {
    let content = `# ${projectTitle}\n\n`;

    const argumentBlocks = blocks.filter(b => b.block_type === 'argument');
    const evidence = blocks.filter(b => b.block_type === 'evidence');

    content += `## Introduction\n\n`;
    content += `This article synthesizes key insights from ${blocks.length} knowledge blocks.\n\n`;

    if (argumentBlocks.length > 0) {
      content += `## Key Arguments\n\n`;
      argumentBlocks.forEach((arg, i) => {
        content += `${i + 1}. **${arg.content.split('\n')[0]}**\n\n`;
        content += `${arg.content}\n\n`;

        const supporting = relationships
          .filter(r => r.target_block_id === arg.id && r.relationship_type === 'supports')
          .map(r => blocks.find(b => b.id === r.source_block_id))
          .filter(Boolean);

        if (supporting.length > 0) {
          content += `*Supporting evidence:*\n`;
          supporting.forEach(ev => {
            content += `- ${ev!.content.substring(0, 100)}...\n`;
          });
          content += `\n`;
        }
      });
    }

    return content;
  };

  const generatePresentation = () => {
    let content = `# ${projectTitle}\n\n---\n\n`;

    blocks.forEach((block, i) => {
      content += `## Slide ${i + 1}: ${block.block_type}\n\n`;
      content += `${block.content}\n\n`;
      if (block.metadata.tags && block.metadata.tags.length > 0) {
        content += `*${block.metadata.tags.join(' • ')}*\n\n`;
      }
      content += `---\n\n`;
    });

    return content;
  };

  const handleExport = async () => {
    setExporting(true);

    let content = '';
    switch (format) {
      case 'markdown':
        content = generateMarkdown();
        break;
      case 'article':
        content = generateArticle();
        break;
      case 'presentation':
        content = generatePresentation();
        break;
    }

    await onExport(format, content, audience);
    setExporting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Download className="w-5 h-5" />
        Export Project
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('markdown')}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                format === 'markdown'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 mb-1" />
              <div className="text-sm font-medium">Markdown</div>
            </button>
            <button
              onClick={() => setFormat('article')}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                format === 'article'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <File className="w-5 h-5 mb-1" />
              <div className="text-sm font-medium">Article</div>
            </button>
            <button
              onClick={() => setFormat('presentation')}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                format === 'presentation'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Presentation className="w-5 h-5 mb-1" />
              <div className="text-sm font-medium">Slides</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Audience (Optional)
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Academic, General Public, Executive Summary"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || blocks.length === 0}
          className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Generating...' : 'Generate Export'}
        </button>

        <div className="text-xs text-slate-500 text-center">
          Exporting {blocks.length} blocks with {relationships.length} relationships
        </div>
      </div>
    </div>
  );
}
