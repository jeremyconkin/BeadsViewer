"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BeadStatus } from "@/lib/types";

const statusColors: Record<BeadStatus, string> = {
  open: "bg-gray-600 text-white dark:bg-gray-500 dark:text-white",
  in_progress: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
  blocked: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
  deferred: "bg-amber-500 text-white dark:bg-amber-500 dark:text-white",
  closed: "bg-green-600 text-white dark:bg-green-500 dark:text-white",
  pinned: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white",
  hooked: "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white",
};

const statusLabels: Record<BeadStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  blocked: "Blocked",
  deferred: "Deferred",
  closed: "Closed",
  pinned: "Pinned",
  hooked: "Hooked",
};

interface StateIndicatorProps {
  status: BeadStatus;
  size?: "sm" | "md";
}

export function StateIndicator({ status, size = "md" }: StateIndicatorProps) {
  return (
    <Badge
      className={cn(
        "border-transparent",
        statusColors[status],
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2.5 py-0.5"
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}
