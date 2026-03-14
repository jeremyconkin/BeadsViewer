"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StateIndicator } from "@/components/StateIndicator";
import { PriorityBadge } from "@/components/PriorityBadge";
import { TagChip } from "@/components/TagChip";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const visibleLabels = task.labels.slice(0, 3);
  const extraCount = task.labels.length - 3;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <p className="font-medium text-sm leading-tight">
          <span className="font-mono text-xs text-muted-foreground mr-1.5">{task.id}</span>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <StateIndicator status={task.status} size="sm" />
          <PriorityBadge priority={task.priority} size="sm" />
        </div>
        {visibleLabels.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {visibleLabels.map((label) => (
              <TagChip key={label} tag={label} />
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{extraCount} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
