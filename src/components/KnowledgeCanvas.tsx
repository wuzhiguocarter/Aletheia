import { useState, useRef, useEffect } from 'react';
import { Plus, Link2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { KnowledgeBlock } from './KnowledgeBlock';
import type { KnowledgeBlock as KnowledgeBlockType, BlockRelationship } from '../types';

interface KnowledgeCanvasProps {
  blocks: KnowledgeBlockType[];
  relationships: BlockRelationship[];
  onCreateBlock: (type: string, position: { x: number; y: number }) => void;
  onUpdateBlock: (id: string, updates: Partial<KnowledgeBlockType>) => void;
  onDeleteBlock: (id: string) => void;
  onCreateRelationship: (sourceId: string, targetId: string, type: string) => void;
}

export function KnowledgeCanvas({
  blocks,
  relationships,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  onCreateRelationship,
}: KnowledgeCanvasProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const blockTypes = [
    { type: 'argument', label: 'Argument', icon: '📝' },
    { type: 'evidence', label: 'Evidence', icon: '📚' },
    { type: 'quote', label: 'Quote', icon: '💬' },
    { type: 'hypothesis', label: 'Hypothesis', icon: '💡' },
    { type: 'data', label: 'Data', icon: '📊' },
    { type: 'question', label: 'Question', icon: '❓' },
  ];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        });
        setShowBlockMenu(true);
      }
    }
  };

  const handleCreateBlock = (type: string) => {
    onCreateBlock(type, menuPosition);
    setShowBlockMenu(false);
  };

  const handleConnect = (blockId: string) => {
    if (!isConnecting) {
      setIsConnecting(true);
      setConnectingFrom(blockId);
    } else if (connectingFrom && connectingFrom !== blockId) {
      onCreateRelationship(connectingFrom, blockId, 'supports');
      setIsConnecting(false);
      setConnectingFrom(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            setIsConnecting(!isConnecting);
            if (isConnecting) setConnectingFrom(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isConnecting
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-2" />
          {isConnecting ? 'Cancel Connection' : 'Connect Blocks'}
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-2 text-sm font-medium text-slate-600">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {relationships.map((rel) => {
              const source = blocks.find((b) => b.id === rel.source_block_id);
              const target = blocks.find((b) => b.id === rel.target_block_id);
              if (!source || !target) return null;

              const x1 = source.position.x + 160;
              const y1 = source.position.y + 80;
              const x2 = target.position.x + 160;
              const y2 = target.position.y + 80;

              return (
                <g key={rel.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray={rel.relationship_type === 'contradicts' ? '5,5' : '0'}
                  />
                  <circle cx={x2} cy={y2} r="4" fill="#94a3b8" />
                </g>
              );
            })}
          </svg>

          {blocks.map((block) => (
            <div
              key={block.id}
              className="absolute"
              style={{
                left: block.position.x,
                top: block.position.y,
                zIndex: 10,
              }}
            >
              <KnowledgeBlock
                block={block}
                onUpdate={onUpdateBlock}
                onDelete={onDeleteBlock}
                onConnect={handleConnect}
                isConnecting={isConnecting}
              />
            </div>
          ))}
        </div>
      </div>

      {showBlockMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowBlockMenu(false)}
          />
          <div
            className="absolute z-40 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 min-w-[200px]"
            style={{
              left: menuPosition.x * zoom + pan.x,
              top: menuPosition.y * zoom + pan.y,
            }}
          >
            <div className="text-xs font-medium text-slate-500 px-3 py-2">Create Block</div>
            {blockTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleCreateBlock(type)}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
