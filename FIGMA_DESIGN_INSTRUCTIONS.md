# Beads Viewer - Figma Design Instructions

## Overview

Design a local web application for viewing and managing "beads" (task files from [beads](https://github.com/steveyegge/beads/)). The app opens a project directory, parses bead files, and displays tasks in kanban and tree views.

## FigJam Diagram

The application structure and user flow diagram is available here:
https://www.figma.com/online-whiteboard/create-diagram/52e8cd55-e1fd-4536-bca4-768ade7551c8?utm_source=other&utm_content=edit_in_figjam&oai_id=&request_id=ee4f812c-48d3-4119-a0a7-1c393184e118

## User Flow

1. **Open Directory** - User selects a project directory containing bead files
2. **Parse Beads** - App reads and parses bead task files from the directory
3. **Main View** - User lands on the main view with navigation to kanban or tree view
4. **Interact with Tasks** - User clicks a task card to open detail UI for editing
5. **Save Changes** - Edits are saved back to the bead file on disk, view refreshes

## Pages / Views to Design

### 1. Directory Selection

- A landing screen or top-level control for choosing a project directory
- Should show the currently open directory path
- Option to switch directories

### 2. Kanban Board View

- Columns representing task states: **TODO**, **IN_PROGRESS**, **DONE**
- Each column displays task cards belonging to that state
- Column headers should show the task count for that state
- Cards should be draggable between columns to update state
- Compact card layout showing:
  - Task title
  - Description preview (first 1-2 lines)
  - Tags/labels as colored chips
  - State indicator (color-coded)

### 3. Tree View

- Hierarchical display of tasks showing parent/child relationships
- Expand/collapse controls for tree nodes
- Indentation and visual nesting to indicate hierarchy
- Each node displays a compact task summary (title, state, tags)
- Clicking a node opens the task card detail

### 4. Task Card Detail (Modal or Side Panel)

- Full editable view of a single task
- Fields:
  - **Title** - editable text input
  - **Description** - editable multiline text area
  - **State** - dropdown or toggle (TODO / IN_PROGRESS / DONE)
  - **Tags** - add/remove tag chips
  - **Metadata** - any additional bead-specific fields
- Save and Cancel action buttons
- Visual distinction between view mode and edit mode

### 5. Filter Controls

Shared filter bar across both kanban and tree views:

- **State filter** - toggle buttons for TODO, IN_PROGRESS, DONE (multi-select)
- **Tag filter** - dropdown or chip selector to filter by tags
- **Search** - text input for filtering tasks by title or description
- **Clear filters** button

## Component Inventory

Design these as reusable components in Figma:

| Component | Description |
|---|---|
| **TaskCard** | Compact card for kanban columns and tree nodes |
| **TaskDetailPanel** | Full detail/edit view for a task |
| **KanbanColumn** | Column container with header and card list |
| **TreeNode** | Expandable/collapsible tree item |
| **FilterBar** | Horizontal bar with state, tag, and search filters |
| **TagChip** | Small colored label for tags |
| **StateIndicator** | Color-coded badge for task state |
| **DirectoryPicker** | Directory path display with browse action |
| **ViewSwitcher** | Toggle between Kanban and Tree views |

## Design Considerations

- **Responsive layout**: Should work well at typical desktop widths (1200px+)
- **Color coding**: Use consistent colors for task states across all views
  - TODO: neutral/gray
  - IN_PROGRESS: blue/active
  - DONE: green/success
- **Typography**: Clear hierarchy between task titles, descriptions, and metadata
- **Density**: Kanban cards should be compact enough to show many tasks per column
- **Drag affordance**: Kanban cards should visually suggest they are draggable
- **Empty states**: Design empty states for columns with no tasks and initial directory selection
- **Dark/light mode**: Consider supporting both themes

## Workflow After Design

Once designs are finalized in Figma:

1. Share the Figma URL (e.g., `figma.com/design/...`) with Claude Code
2. Claude Code will fetch the design context via the Figma MCP integration
3. Code will be generated adapted to the project's tech stack
4. Iterate on implementation with design feedback
