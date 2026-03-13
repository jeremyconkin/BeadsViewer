"use client";

import { LayoutGrid, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewSwitcherProps {
  currentView: "kanban" | "tree";
  onViewChange: (view: "kanban" | "tree") => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={currentView === "kanban" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("kanban")}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Kanban
      </Button>
      <Button
        variant={currentView === "tree" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("tree")}
      >
        <Network className="h-4 w-4 mr-1" />
        Tree
      </Button>
    </div>
  );
}
