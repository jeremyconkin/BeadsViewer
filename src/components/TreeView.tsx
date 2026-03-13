"use client";

import { TreeNode } from "@/components/TreeNode";
import type { Task } from "@/lib/types";

interface TreeViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TreeView({ tasks, onTaskClick }: TreeViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {tasks.map((task) => (
        <TreeNode
          key={task.id}
          task={task}
          level={0}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
