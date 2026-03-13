"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { KanbanColumn } from "@/components/KanbanColumn";
import type { Task, BeadStatus } from "@/lib/types";

const columns: {
  status: BeadStatus;
  label: string;
  colorClass: string;
}[] = [
  {
    status: "open",
    label: "Open",
    colorClass: "bg-gray-700 text-white dark:bg-gray-600",
  },
  {
    status: "in_progress",
    label: "In Progress",
    colorClass: "bg-blue-600 text-white dark:bg-blue-700",
  },
  {
    status: "blocked",
    label: "Blocked",
    colorClass: "bg-red-600 text-white dark:bg-red-700",
  },
  {
    status: "deferred",
    label: "Deferred",
    colorClass: "bg-amber-500 text-white dark:bg-amber-600",
  },
  {
    status: "closed",
    label: "Closed",
    colorClass: "bg-green-600 text-white dark:bg-green-700",
  },
];

interface KanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: BeadStatus) => void;
}

export function KanbanView({
  tasks,
  onTaskClick,
  onTaskStatusChange,
}: KanbanViewProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.status)}
            onTaskClick={onTaskClick}
            onTaskDrop={onTaskStatusChange}
            colorClass={col.colorClass}
          />
        ))}
      </div>
    </DndProvider>
  );
}
