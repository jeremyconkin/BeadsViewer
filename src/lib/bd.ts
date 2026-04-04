import { execFile } from "child_process";
import { promisify } from "util";
import { access } from "fs/promises";
import path from "path";
import { BeadIssue } from "./types";

const execFileAsync = promisify(execFile);

const SHELL_METACHARACTERS = /[;&|`$(){}[\]<>!#*?~\n\r]/;

/**
 * Execute a `bd` CLI command with --json, running from the project directory.
 * bd auto-discovers .beads/ when run from the project root.
 */
export async function execBd(args: string[], cwd: string): Promise<string> {
  if (SHELL_METACHARACTERS.test(cwd)) {
    throw new Error("Invalid directory path: contains shell metacharacters");
  }

  const fullArgs = [...args, "--json"];

  try {
    const { stdout } = await execFileAsync("bd", fullArgs, {
      cwd,
      timeout: 30_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "stderr" in error) {
      const stderr = (error as { stderr: string }).stderr;
      throw new Error(stderr || "bd command failed");
    }
    throw error;
  }
}

/**
 * List all issues in the given beads project directory.
 * Uses --limit 0 for unlimited and --all to include closed issues.
 */
export async function listIssues(dir: string): Promise<BeadIssue[]> {
  const stdout = await execBd(["list", "--limit", "0", "--all", "--flat"], dir);
  if (!stdout.trim()) {
    return [];
  }
  const parsed = JSON.parse(stdout);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && Array.isArray(parsed.issues)) {
    return parsed.issues;
  }
  return [];
}

/**
 * Show a single issue by ID. Returns the first element of the JSON array.
 */
export async function showIssue(id: string, dir: string): Promise<BeadIssue> {
  const stdout = await execBd(["show", id], dir);
  const parsed = JSON.parse(stdout);
  // bd show returns an array with one element
  if (Array.isArray(parsed)) {
    return parsed[0];
  }
  return parsed;
}

/**
 * Update an issue using `bd update`. Handles status transitions and field edits.
 */
export async function updateIssue(
  id: string,
  dir: string,
  updates: Record<string, unknown>
): Promise<void> {
  const args: string[] = ["update", id];

  if (updates.status !== undefined) {
    const newStatus = updates.status as string;
    if (newStatus === "closed") {
      // Use bd close for closing
      await execBd(["close", id], dir);
      // Handle remaining non-status updates
      const remaining = { ...updates };
      delete remaining.status;
      if (Object.keys(remaining).length > 0) {
        await updateIssue(id, dir, remaining);
      }
      return;
    }
    args.push("--status", newStatus);
  }

  if (updates.title !== undefined) {
    args.push("--title", String(updates.title));
  }
  if (updates.description !== undefined) {
    args.push("--description", String(updates.description));
  }
  if (updates.priority !== undefined) {
    args.push("--priority", String(updates.priority));
  }
  if (updates.assignee !== undefined) {
    args.push("--assignee", String(updates.assignee));
  }
  if (updates.issueType !== undefined || updates.issue_type !== undefined) {
    args.push("--type", String(updates.issueType ?? updates.issue_type));
  }
  if (updates.dueAt !== undefined || updates.due_at !== undefined) {
    const due = updates.dueAt ?? updates.due_at;
    args.push("--due", due ? String(due) : "");
  }
  if (updates.notes !== undefined) {
    args.push("--notes", String(updates.notes));
  }
  if (updates.labels !== undefined) {
    const labels = updates.labels as string[];
    args.push("--set-labels", labels.join(","));
  }

  // Only run if we have more than just ["update", id]
  if (args.length > 2) {
    await execBd(args, dir);
  }
}

/**
 * Validate that a directory contains a beads project (has .beads subdirectory).
 */
export async function validateDirectory(
  dirPath: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const beadsDir = path.join(dirPath, ".beads");
    await access(beadsDir);
    return { valid: true };
  } catch {
    return { valid: false, error: "No .beads directory found at the specified path" };
  }
}
