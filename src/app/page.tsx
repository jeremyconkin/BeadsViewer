"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBeads } from "@/components/BeadsProvider";
import { DirectoryPicker } from "@/components/DirectoryPicker";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { FilterBar } from "@/components/FilterBar";
import { KanbanView } from "@/components/KanbanView";
import { TreeView } from "@/components/TreeView";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import type { Task } from "@/lib/types";

export default function Home() {
  const {
    directory,
    isValidDirectory,
    isLoading,
    error,
    filteredTasks,
    filteredFlatTasks,
    currentView,
    setCurrentView,
    setDirectory,
    updateTaskStatus,
    saveTask,
    selectedStatuses,
    selectedLabels,
    searchQuery,
    selectedPriority,
    selectedType,
    availableLabels,
    toggleStatus,
    toggleLabel,
    setSearchQuery,
    setPriority,
    setType,
    clearFilters,
  } = useBeads();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleSave = (taskId: string, updates: Record<string, unknown>) => {
    saveTask(taskId, updates);
    setDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <DirectoryPicker
        currentPath={directory}
        onPathChange={setDirectory}
        isValid={isValidDirectory}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-xl font-semibold">Beads Viewer</h1>
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      <FilterBar
        selectedStatuses={selectedStatuses}
        selectedLabels={selectedLabels}
        searchQuery={searchQuery}
        selectedPriority={selectedPriority}
        selectedType={selectedType}
        availableLabels={availableLabels}
        onStatusToggle={toggleStatus}
        onLabelToggle={toggleLabel}
        onSearchChange={setSearchQuery}
        onPriorityChange={setPriority}
        onTypeChange={setType}
        onClearFilters={clearFilters}
      />

      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && !directory && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a directory to get started
            </p>
          </div>
        )}

        {!isLoading && !error && directory && isValidDirectory && (
          <>
            {currentView === "kanban" ? (
              <KanbanView
                tasks={filteredFlatTasks}
                onTaskClick={handleTaskClick}
                onTaskStatusChange={updateTaskStatus}
              />
            ) : (
              <TreeView
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
              />
            )}
          </>
        )}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSave}
      />
    </div>
  );
}
