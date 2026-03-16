export type BeadStatus = "open" | "in_progress" | "blocked" | "deferred" | "closed" | "pinned" | "hooked";

// Matches the actual JSON output from `bd list --json` and `bd show --json`
export interface BeadIssue {
  id: string;
  title: string;
  description: string;
  status: BeadStatus;
  priority: number;
  issue_type: string;
  owner: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  // These appear in list output
  dependency_count?: number;
  dependent_count?: number;
  comment_count?: number;
  // These may appear in show output or some issues
  labels?: string[];
  assignee?: string;
  due_at?: string | null;
  closed_at?: string | null;
  close_reason?: string | null;
  estimated_minutes?: number | null;
  external_ref?: string | null;
  notes?: string;
  design?: string;
  acceptance_criteria?: string;
  metadata?: Record<string, unknown>;
  dependencies?: BeadDependency[];
}

export interface BeadDependency {
  issue_id: string;
  depends_on_id: string;
  type: string;
  created_at?: string;
  created_by?: string;
  metadata?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: BeadStatus;
  priority: number;
  issueType: string;
  labels: string[];
  assignee: string;
  owner: string;
  children: Task[];
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  estimatedMinutes: number | null;
  notes: string;
  raw: BeadIssue;
}

export const BEAD_STATUSES: { value: BeadStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "gray" },
  { value: "in_progress", label: "In Progress", color: "blue" },
  { value: "blocked", label: "Blocked", color: "red" },
  { value: "deferred", label: "Deferred", color: "amber" },
];

export const ISSUE_TYPES = ["bug", "feature", "task", "epic", "chore", "decision"] as const;

export const PRIORITIES = [
  { value: 0, label: "P0 - Critical" },
  { value: 1, label: "P1 - High" },
  { value: 2, label: "P2 - Medium" },
  { value: 3, label: "P3 - Low" },
  { value: 4, label: "P4 - Lowest" },
] as const;
