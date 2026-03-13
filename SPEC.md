# Beads Viewer - Application Spec

## Overview

A local Next.js web application for viewing and managing beads tasks. Users browse to a project directory containing a `.beads/` folder, and the app reads issues from the Dolt database via the `bd` CLI, displaying them in kanban and tree views with full editing support.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | User requirement; SSR not needed but API routes are |
| Language | TypeScript | Type safety for complex data model |
| UI Components | shadcn/ui (Radix + Tailwind) | Matches Figma Make wireframes exactly |
| Styling | Tailwind CSS v4 | Matches wireframes |
| Drag & Drop | react-dnd + HTML5 backend | Used in wireframes for kanban |
| Icons | lucide-react | Used in wireframes |
| Toasts | sonner | Used in wireframes |
| State Management | React state + context | Sufficient for single-user local app |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (Next.js React Client)             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ KanbanView│ │ TreeView │ │TaskDetail   │ │
│  │          │ │          │ │Dialog       │ │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│       └─────────────┴──────────────┘        │
│                     │                        │
│              React Context (BeadsProvider)    │
└─────────────────────┬───────────────────────┘
                      │ fetch()
┌─────────────────────┴───────────────────────┐
│  Next.js API Routes (/api/beads/*)           │
│  - GET  /api/beads?dir=...     (list issues) │
│  - GET  /api/beads/:id?dir=... (get issue)   │
│  - PUT  /api/beads/:id         (update issue)│
│  - POST /api/directory/validate              │
└─────────────────────┬───────────────────────┘
                      │ child_process.execFile
┌─────────────────────┴───────────────────────┐
│  bd CLI (beads)                              │
│  - bd list --json --dir <path>               │
│  - bd show <id> --json --dir <path>          │
│  - bd edit <id> --field=value --dir <path>   │
│  - bd close/reopen <id> --dir <path>         │
└──────────────────────────────────────────────┘
```

### Why `bd` CLI instead of direct Dolt access?

- Beads uses a Dolt database (`.beads/beads.db`) — not a simple file format
- The `bd` CLI is the supported interface; all commands accept `--json` for machine-readable output
- Avoids importing Dolt as a dependency or reverse-engineering the schema
- The CLI handles validation, defaults, and business logic

---

## Data Model

### Bead Issue (from `bd` CLI `--json` output)

The full beads data model is extensive. We map the relevant fields to our UI:

```typescript
// What bd list --json returns (subset we care about)
interface BeadIssue {
  id: string;               // e.g. "bd-a1b2" or "bd-a1b2.1"
  title: string;
  description: string;
  status: BeadStatus;
  priority: number;          // 0-4 (P0=critical, P4=lowest)
  issue_type: string;        // bug, feature, task, epic, chore, etc.
  labels: string[];
  assignee: string;
  owner: string;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  dependencies: BeadDependency[];
  estimated_minutes: number | null;
  external_ref: string | null;
  metadata: Record<string, unknown>;
}

type BeadStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "deferred"
  | "closed"
  | "pinned"
  | "hooked";

interface BeadDependency {
  target_id: string;
  type: string;  // blocks, parent-child, etc.
}
```

### UI Task Model (adapted for views)

```typescript
// Internal UI model, mapped from BeadIssue
interface Task {
  id: string;
  title: string;
  description: string;
  status: BeadStatus;
  priority: number;
  issueType: string;
  labels: string[];
  assignee: string;
  children: Task[];          // built from parent-child dependencies
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  estimatedMinutes: number | null;
  raw: BeadIssue;            // preserve full data for editing
}
```

### Status-to-Kanban Column Mapping

The wireframes show 3 columns (TODO, IN_PROGRESS, DONE). Beads has richer statuses. Mapping:

| Kanban Column | Beads Statuses |
|---------------|----------------|
| **Open** | `open` |
| **In Progress** | `in_progress` |
| **Blocked** | `blocked` |
| **Deferred** | `deferred` |
| **Closed** | `closed` |

Each beads status gets its own column. This is more useful than the 3-column simplification since beads supports `blocked` and `deferred` as first-class states.

### Tree Hierarchy

Beads supports hierarchical IDs: `bd-a3f8` (parent) -> `bd-a3f8.1` (child) -> `bd-a3f8.1.1` (grandchild). Additionally, `parent-child` dependency links express hierarchy. The tree view is built by:

1. Parsing hierarchical IDs to infer parent-child
2. Using `parent-child` dependency links
3. Top-level issues (no parent) become root nodes

---

## Pages & Components

### Route Structure

```
app/
├── page.tsx                    # Main app (single-page with views)
├── layout.tsx                  # Root layout with providers
├── api/
│   ├── beads/
│   │   ├── route.ts            # GET (list)
│   │   └── [id]/
│   │       └── route.ts        # GET (show), PUT (update)
│   └── directory/
│       └── validate/
│           └── route.ts        # POST (check if dir has .beads/)
```

### Component Tree

```
Layout
└── BeadsProvider (context: tasks, filters, directory, loading)
    └── Page
        ├── DirectoryPicker
        │   └── Path display + Browse button
        ├── Header
        │   ├── "Beads Viewer" title
        │   └── ViewSwitcher (kanban | tree toggle)
        ├── FilterBar
        │   ├── Search input
        │   ├── Status filter toggles
        │   ├── Label/tag filter badges
        │   ├── Priority filter
        │   ├── Type filter (bug/feature/task/etc)
        │   └── Clear filters button
        ├── KanbanView (when selected)
        │   ├── KanbanColumn (one per active status)
        │   │   ├── Column header (status name + count)
        │   │   └── DraggableTaskCard[]
        │   │       └── TaskCard
        │   │           ├── Title
        │   │           ├── Description preview
        │   │           ├── StateIndicator
        │   │           ├── Priority badge
        │   │           └── TagChip[]
        │   └── (drop zones for drag-and-drop status changes)
        ├── TreeView (when selected)
        │   └── TreeNode (recursive)
        │       ├── Expand/collapse chevron
        │       ├── Title
        │       ├── StateIndicator
        │       ├── TagChip[]
        │       └── TreeNode[] (children)
        └── TaskDetailDialog (modal)
            ├── Title input
            ├── Description textarea
            ├── Status select
            ├── Priority select
            ├── Type select
            ├── Labels (add/remove chips)
            ├── Assignee input
            ├── Due date picker
            ├── Metadata display
            └── Save / Cancel buttons
```

### Component Details

#### DirectoryPicker
- Shows current directory path with folder icon
- "Browse" button that accepts a path via text input (browser can't access native file picker for directories on the server side)
- Alternative: text input field where user types/pastes the absolute path
- Validates that `.beads/beads.db` exists at the path via API call
- Persists last-used directory in localStorage

#### FilterBar
Extended beyond wireframes to support full beads model:
- **Search**: text input filtering title/description
- **Status toggles**: one button per beads status (open, in_progress, blocked, deferred, closed), multi-select
- **Label badges**: clickable badges for each label found in current dataset
- **Priority filter**: dropdown (P0-P4 or All)
- **Type filter**: dropdown (bug, feature, task, epic, chore, or All)
- **Clear filters**: resets all

#### KanbanView
- One column per status (5 columns: open, in_progress, blocked, deferred, closed)
- Columns can be collapsed/hidden via filter
- Drag-and-drop cards between columns to change status (calls `bd edit <id> --status=<new>`)
- Flattened view (no hierarchy) — all tasks including children shown

#### TreeView
- Hierarchical based on bead ID structure and parent-child deps
- Expand/collapse per node
- Click to open TaskDetailDialog
- Shows inline: title, status badge, priority, first 2 labels

#### TaskCard
- Compact card showing: title, 2-line description preview, status indicator, priority badge, label chips
- Drag handle affordance (grip dots icon)
- Click opens TaskDetailDialog

#### TaskDetailDialog
- Modal dialog (shadcn Dialog)
- All editable fields from the beads model
- Save calls `bd edit <id> --title="..." --description="..." --status=... --labels=...`
- Cancel discards changes
- Shows bead ID, created/updated timestamps as read-only

#### StateIndicator
- Color-coded badge per status:
  - open: gray
  - in_progress: blue
  - blocked: red
  - deferred: yellow/amber
  - closed: green
  - pinned: purple
  - hooked: indigo

#### TagChip
- Colored badge for labels
- Removable (X button) in edit mode
- Known label colors: bug=red, feature=blue, enhancement=purple, etc.
- Unknown labels get neutral gray

---

## API Routes

### `GET /api/beads?dir=<path>`
Runs `bd list --json --dir <path>`. Returns array of BeadIssue objects.

### `GET /api/beads/[id]?dir=<path>`
Runs `bd show <id> --json --dir <path>`. Returns single BeadIssue.

### `PUT /api/beads/[id]`
Body: `{ dir: string, updates: Partial<BeadIssue> }`
Runs `bd edit <id> --field=value --dir <path>` for each changed field.
For status changes to "closed", runs `bd close <id>`.
For status changes from "closed", runs `bd reopen <id>`.

### `POST /api/directory/validate`
Body: `{ path: string }`
Checks if `<path>/.beads/beads.db` exists. Returns `{ valid: boolean, error?: string }`.

---

## Build Plan (Subagent Strategy)

The build should be broken into these phases, each suitable for a subagent:

### Phase 1: Project Scaffolding
- `npx create-next-app` with TypeScript, Tailwind, App Router
- Install dependencies: shadcn/ui, react-dnd, lucide-react, sonner
- Set up shadcn/ui components needed (card, badge, button, input, textarea, select, dialog, label, scroll-area, separator, tabs, tooltip)

### Phase 2: API Layer
- Implement `bd` CLI wrapper utility (`lib/bd.ts`) — executes bd commands, parses JSON output
- Implement all API routes
- Directory validation endpoint
- Error handling for missing `bd` CLI, invalid directories, command failures

### Phase 3: Data Layer & State
- BeadsProvider context with state management
- Task model types and mapping from BeadIssue
- Tree-building logic (hierarchical ID parsing + parent-child deps)
- Filter/search logic

### Phase 4: Core UI Components
- All shared components: StateIndicator, TagChip, DirectoryPicker, ViewSwitcher, FilterBar
- TaskCard component
- TaskDetailDialog (edit modal)

### Phase 5: Views
- KanbanView with KanbanColumn and drag-and-drop
- TreeView with TreeNode (recursive)
- Empty states
- Loading states

### Phase 6: Integration & Polish
- Wire everything together in the main page
- localStorage for last directory
- Auto-refresh on save
- Dark/light mode support via next-themes
- Error toasts

---

## Key Differences from Figma Make Wireframes

1. **Next.js instead of Vite** — user requirement; enables API routes for bd CLI access
2. **Richer status model** — 5+ kanban columns instead of 3 (TODO/IN_PROGRESS/DONE), matching actual beads statuses
3. **Priority & type fields** — beads has these; wireframes didn't show them but they should be displayed and editable
4. **Directory input via text field** — browser security prevents server-side native directory picker; user types the path
5. **Backend integration** — wireframes used mock data; we shell out to `bd` CLI for real data
6. **Hierarchical IDs** — tree view leverages beads' native `bd-xxx.1.2` ID hierarchy, not just mock parent-child

---

## Prerequisites

- `bd` CLI installed and on PATH (`go install github.com/steveyegge/beads/cmd/bd@latest`)
- At least one project directory with `bd init` already run (`.beads/` folder exists)
- Node.js 18+
