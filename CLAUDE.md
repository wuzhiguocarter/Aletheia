# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Knowledge IDE - a visual knowledge management tool designed for researchers, analysts, and knowledge workers. The application transforms the knowledge creation process into an interactive, visual workspace that combines semantic blocks with AI-powered insights.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Environment Setup
The app requires Supabase environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Architecture

### Core Concepts

**Knowledge Blocks**: Semantic units representing arguments, evidence, quotes, hypotheses, data, or questions. Each block has:
- Type classification (BlockType)
- Content and metadata (tags, sources, confidence)
- Canvas position (x,y coordinates)
- Version history

**Block Relationships**: Logical connections between blocks:
- `supports`, `contradicts`, `causes`, `requires`, `elaborates`
- Strength rating (0-1)
- Relationship notes

**Work Modes**: Three distinct creation modes:
- **Exploration**: Research and idea generation
- **Synthesis**: Building logical structures and connections
- **Composition**: Final output generation and refinement

**AI Personas**: Specialized AI agents for different thinking styles:
- `critic`: Challenges arguments and identifies weaknesses
- `editor`: Improves structure and flow
- `researcher`: Provides evidence and sources
- `synthesizer`: Identifies patterns and connections

### Key Components Structure

```
src/
├── components/          # UI components
│   ├── KnowledgeCanvas.tsx    # Main workspace for visual knowledge editing
│   ├── KnowledgeBlock.tsx     # Individual block component
│   ├── AIPanel.tsx           # AI interaction panel
│   ├── InsightRadar.tsx      # Pattern detection and insights
│   └── ExportPanel.tsx       # Content export functionality
├── contexts/
│   └── AuthContext.tsx       # Supabase authentication state
├── pages/
│   └── IDE.tsx              # Main application interface
├── lib/
│   └── supabase.ts          # Database client and types
└── types/
    └── index.ts             # TypeScript type definitions
```

### Database Schema

The application uses Supabase with a relational structure:

- **profiles**: User authentication and preferences
- **projects**: Knowledge work containers with metadata
- **knowledge_blocks**: Core semantic content with versioning
- **block_relationships**: Logical connections between blocks
- **block_versions**: Version history for content tracking
- **ai_interactions**: AI conversation history and context
- **exports**: Generated content in various formats

All tables use Row Level Security (RLS) for multi-tenancy and data isolation.

### Data Flow Patterns

1. **Project Loading**: `IDE.tsx` → Supabase → Project selector → Canvas population
2. **Block Creation**: Canvas UI → Supabase insert → Local state update → Canvas refresh
3. **Version Control**: Block updates → Version history storage → Block version increment
4. **AI Interactions**: User prompt → AI persona logic → Response storage → UI update

### Component Communication

- State management primarily through React hooks in `IDE.tsx`
- Components receive data via props and callbacks for mutations
- Authentication context provides user state across the app
- Real-time updates through Supabase subscriptions (not yet implemented)

## Code Style and Conventions

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **React**: Functional components with hooks, no class components
- **Styling**: Tailwind CSS with consistent design system (slate color palette)
- **Database**: Supabase client with typed queries using Database interface
- **Icons**: Lucide React for consistent iconography

## Important Implementation Notes

- All database operations must respect RLS policies
- Canvas positioning uses absolute coordinates within a bounded workspace
- Block versioning tracks content changes with change summaries
- AI responses are currently mock implementations (responses[persona] in IDE.tsx:178-183)
- Export functionality generates downloadable files based on project content

## Testing and Quality

Run `npm run typecheck` before commits to ensure TypeScript compliance. The codebase follows React best practices with proper component lifecycle management and error handling patterns.