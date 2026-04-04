"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { StateIndicator } from "@/components/StateIndicator";
import { PriorityBadge } from "@/components/PriorityBadge";
import { TagChip } from "@/components/TagChip";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TreeNodeProps {
  task: Task;
  level: number;
  onTaskClick: (task: Task) => void;
}

export function TreeNode({ task, level, onTaskClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = task.children.length > 0;
  const paddingLeft = level * 24 + 8;
  const visibleLabels = task.labels.slice(0, 2);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-accent rounded-sm"
        )}
        style={{ paddingLeft }}
        onClick={() => onTaskClick(task)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="shrink-0 p-0.5 rounded hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <span className="text-sm truncate flex-1">
          <span className="font-mono text-xs text-muted-foreground mr-1.5">{task.id}</span>
          <span className="font-medium">{task.title}</span>
        </span>
        <StateIndicator status={task.status} size="sm" />
        <PriorityBadge priority={task.priority} size="sm" />
        {visibleLabels.map((label) => (
          <TagChip key={label} tag={label} />
        ))}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {task.children.map((child) => (
            <TreeNode
              key={child.id}
              task={child}
              level={level + 1}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
