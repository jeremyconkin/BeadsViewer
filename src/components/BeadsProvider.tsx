"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { buildTaskTree, flattenTasks } from "@/lib/tasks";
import type { Task, BeadStatus } from "@/lib/types";

interface BeadsContextValue {
  // State
  directory: string;
  isValidDirectory: boolean | null;
  isLoading: boolean;
  tasks: Task[];
  flatTasks: Task[];
  error: string | null;

  // Filters
  selectedStatuses: BeadStatus[];
  selectedLabels: string[];
  searchQuery: string;
  selectedPriority: number | null;
  selectedType: string | null;

  // Computed
  availableLabels: string[];
  filteredTasks: Task[];
  filteredFlatTasks: Task[];

  // View
  currentView: "kanban" | "tree";
  setCurrentView: (view: "kanban" | "tree") => void;

  // Actions
  setDirectory: (path: string) => void;
  refreshTasks: () => void;
  updateTaskStatus: (taskId: string, newStatus: BeadStatus) => void;
  saveTask: (taskId: string, updates: Record<string, unknown>) => void;

  // Filter setters
  toggleStatus: (status: BeadStatus) => void;
  toggleLabel: (label: string) => void;
  setSearchQuery: (query: string) => void;
  setPriority: (priority: number | null) => void;
  setType: (type: string | null) => void;
  clearFilters: () => void;
}

const BeadsContext = createContext<BeadsContextValue | null>(null);

export function useBeads() {
  const ctx = useContext(BeadsContext);
  if (!ctx) throw new Error("useBeads must be used within BeadsProvider");
  return ctx;
}

function filterFlatTasks(
  flatTasks: Task[],
  selectedStatuses: BeadStatus[],
  selectedLabels: string[],
  searchQuery: string,
  selectedPriority: number | null,
  selectedType: string | null
): Task[] {
  return flatTasks.filter((task) => {
    // Status filter
    if (
      selectedStatuses.length > 0 &&
      !selectedStatuses.includes(task.status)
    ) {
      return false;
    }
    // Label filter
    if (
      selectedLabels.length > 0 &&
      !task.labels.some((l) => selectedLabels.includes(l))
    ) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    // Priority filter
    if (selectedPriority !== null && task.priority !== selectedPriority) {
      return false;
    }
    // Type filter
    if (selectedType !== null && task.issueType !== selectedType) {
      return false;
    }
    return true;
  });
}

export function BeadsProvider({ children }: { children: ReactNode }) {
  const [directory, setDirectoryState] = useState("");
  const [isValidDirectory, setIsValidDirectory] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flatTasks, setFlatTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatuses, setSelectedStatuses] = useState<BeadStatus[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // View
  const [currentView, setCurrentView] = useState<"kanban" | "tree">("kanban");

  // Load saved directory on mount and fetch tasks
  useEffect(() => {
    const saved = localStorage.getItem("beads-viewer-dir");
    if (saved) {
      setDirectoryState(saved);
      setIsValidDirectory(true); // assume valid if previously saved
      fetchTasks(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = useCallback(async (dir: string) => {
    if (!dir) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/beads?dir=${encodeURIComponent(dir)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch tasks");
      }
      const data = await res.json();
      const tree = buildTaskTree(data);
      const flat = flattenTasks(tree);
      setTasks(tree);
      setFlatTasks(flat);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setTasks([]);
      setFlatTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setDirectory = useCallback(
    async (path: string) => {
      setDirectoryState(path);
      if (!path) {
        setIsValidDirectory(null);
        setTasks([]);
        setFlatTasks([]);
        return;
      }

      setIsLoading(true);
      setIsValidDirectory(null);
      try {
        const res = await fetch("/api/directory/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const data = await res.json();
        setIsValidDirectory(data.valid);
        if (data.valid) {
          localStorage.setItem("beads-viewer-dir", path);
          await fetchTasks(path);
        } else {
          setError(data.error || "Invalid directory");
          setTasks([]);
          setFlatTasks([]);
        }
      } catch {
        setIsValidDirectory(false);
        setError("Failed to validate directory");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks]
  );

  const refreshTasks = useCallback(() => {
    fetchTasks(directory);
  }, [directory, fetchTasks]);

  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: BeadStatus) => {
      try {
        const res = await fetch(`/api/beads/${encodeURIComponent(taskId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dir: directory, updates: { status: newStatus } }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update status");
        }
        await fetchTasks(directory);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [directory, fetchTasks]
  );

  const saveTask = useCallback(
    async (taskId: string, updates: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/beads/${encodeURIComponent(taskId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dir: directory, updates }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save task");
        }
        await fetchTasks(directory);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [directory, fetchTasks]
  );

  // Filter setters
  const toggleStatus = useCallback((status: BeadStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const toggleLabel = useCallback((label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedLabels([]);
    setSearchQuery("");
    setSelectedPriority(null);
    setSelectedType(null);
  }, []);

  // Computed values
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>();
    for (const task of flatTasks) {
      for (const label of task.labels) {
        labelSet.add(label);
      }
    }
    return Array.from(labelSet).sort();
  }, [flatTasks]);

  const filteredFlatTasks = useMemo(
    () =>
      filterFlatTasks(
        flatTasks,
        selectedStatuses,
        selectedLabels,
        searchQuery,
        selectedPriority,
        selectedType
      ),
    [
      flatTasks,
      selectedStatuses,
      selectedLabels,
      searchQuery,
      selectedPriority,
      selectedType,
    ]
  );

  const filteredTasks = useMemo(() => {
    if (
      selectedStatuses.length === 0 &&
      selectedLabels.length === 0 &&
      !searchQuery &&
      selectedPriority === null &&
      selectedType === null
    ) {
      return tasks;
    }
    // Get IDs of filtered flat tasks, then rebuild tree keeping parent chains
    const filteredIds = new Set(filteredFlatTasks.map((t) => t.id));

    function filterTree(nodes: Task[]): Task[] {
      const result: Task[] = [];
      for (const node of nodes) {
        const filteredChildren = filterTree(node.children);
        if (filteredIds.has(node.id) || filteredChildren.length > 0) {
          result.push({ ...node, children: filteredChildren });
        }
      }
      return result;
    }

    return filterTree(tasks);
  }, [
    tasks,
    filteredFlatTasks,
    selectedStatuses,
    selectedLabels,
    searchQuery,
    selectedPriority,
    selectedType,
  ]);

  const value: BeadsContextValue = {
    directory,
    isValidDirectory,
    isLoading,
    tasks,
    flatTasks,
    error,
    selectedStatuses,
    selectedLabels,
    searchQuery,
    selectedPriority,
    selectedType,
    availableLabels,
    filteredTasks,
    filteredFlatTasks,
    currentView,
    setCurrentView,
    setDirectory,
    refreshTasks,
    updateTaskStatus,
    saveTask,
    toggleStatus,
    toggleLabel,
    setSearchQuery,
    setPriority: setSelectedPriority,
    setType: setSelectedType,
    clearFilters,
  };

  return (
    <BeadsContext.Provider value={value}>{children}</BeadsContext.Provider>
  );
}
