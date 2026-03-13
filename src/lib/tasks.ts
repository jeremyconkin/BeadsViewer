import { BeadIssue, Task } from "./types";

export function beadToTask(issue: BeadIssue): Task {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    priority: issue.priority,
    issueType: issue.issue_type,
    labels: issue.labels || [],
    assignee: issue.assignee || "",
    owner: issue.owner || "",
    children: [],
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    dueAt: issue.due_at ?? null,
    estimatedMinutes: issue.estimated_minutes ?? null,
    notes: issue.notes || "",
    raw: issue,
  };
}

export function buildTaskTree(issues: BeadIssue[]): Task[] {
  const taskMap = new Map<string, Task>();

  for (const issue of issues) {
    taskMap.set(issue.id, beadToTask(issue));
  }

  const roots: Task[] = [];

  for (const task of Array.from(taskMap.values())) {
    const lastDot = task.id.lastIndexOf(".");
    if (lastDot !== -1) {
      const parentId = task.id.substring(0, lastDot);
      const parent = taskMap.get(parentId);
      if (parent) {
        parent.children.push(task);
        continue;
      }
    }

    // Check parent-child dependencies
    const issue = task.raw;
    let foundParent = false;
    if (issue.dependencies) {
      for (const dep of issue.dependencies) {
        if (dep.dep_type === "parent-child") {
          const parent = taskMap.get(dep.target_id);
          if (parent) {
            parent.children.push(task);
            foundParent = true;
            break;
          }
        }
      }
    }

    if (!foundParent) {
      roots.push(task);
    }
  }

  return roots;
}

export function flattenTasks(tasks: Task[]): Task[] {
  const flat: Task[] = [];
  const flatten = (list: Task[]) => {
    for (const task of list) {
      flat.push(task);
      if (task.children.length > 0) {
        flatten(task.children);
      }
    }
  };
  flatten(tasks);
  return flat;
}
