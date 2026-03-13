"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityColors: Record<number, string> = {
  0: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
  1: "bg-orange-500 text-white dark:bg-orange-500 dark:text-white",
  2: "bg-yellow-500 text-white dark:bg-yellow-500 dark:text-white",
  3: "bg-sky-500 text-white dark:bg-sky-500 dark:text-white",
  4: "bg-gray-500 text-white dark:bg-gray-500 dark:text-white",
};

interface PriorityBadgeProps {
  priority: number;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const colorClass =
    priorityColors[priority] || priorityColors[4];

  return (
    <Badge
      className={cn(
        "border-transparent",
        colorClass,
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2.5 py-0.5"
      )}
    >
      P{priority}
    </Badge>
  );
}
