"use client";

import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { TaskCard } from "@/components/TaskCard";
import { cn } from "@/lib/utils";
import type { Task, BeadStatus } from "@/lib/types";

interface DraggableTaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

function DraggableTaskCard({ task, onTaskClick }: DraggableTaskCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  return (
    <div ref={ref}>
      <TaskCard
        task={task}
        onClick={() => onTaskClick(task)}
        isDragging={isDragging}
      />
    </div>
  );
}

interface KanbanColumnProps {
  status: BeadStatus;
  label: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newStatus: BeadStatus) => void;
  colorClass: string;
}

export function KanbanColumn({
  status,
  label,
  tasks,
  onTaskClick,
  onTaskDrop,
  colorClass,
}: KanbanColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onTaskDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg bg-muted/50 min-h-[400px]",
        isOver && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-lg",
          colorClass
        )}
      >
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="text-xs font-medium bg-white/20 text-white rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}
