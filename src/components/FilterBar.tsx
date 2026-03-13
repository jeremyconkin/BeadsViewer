"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BEAD_STATUSES, ISSUE_TYPES, PRIORITIES } from "@/lib/types";
import type { BeadStatus } from "@/lib/types";

interface FilterBarProps {
  selectedStatuses: BeadStatus[];
  selectedLabels: string[];
  searchQuery: string;
  selectedPriority: number | null;
  selectedType: string | null;
  availableLabels: string[];
  onStatusToggle: (status: BeadStatus) => void;
  onLabelToggle: (label: string) => void;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: number | null) => void;
  onTypeChange: (type: string | null) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  selectedStatuses,
  selectedLabels,
  searchQuery,
  selectedPriority,
  selectedType,
  availableLabels,
  onStatusToggle,
  onLabelToggle,
  onSearchChange,
  onPriorityChange,
  onTypeChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedLabels.length > 0 ||
    searchQuery.length > 0 ||
    selectedPriority !== null ||
    selectedType !== null;

  return (
    <div className="flex flex-col gap-3 px-4 py-3 border-b">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="pl-9"
        />
      </div>

      {/* Status toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Status:
        </span>
        {BEAD_STATUSES.map((s) => (
          <Button
            key={s.value}
            variant={
              selectedStatuses.includes(s.value) ? "secondary" : "outline"
            }
            size="sm"
            onClick={() => onStatusToggle(s.value)}
            className="h-7 text-xs"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Labels */}
      {availableLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Labels:
          </span>
          {availableLabels.map((label) => (
            <Badge
              key={label}
              variant={
                selectedLabels.includes(label) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => onLabelToggle(label)}
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      {/* Priority and Type */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Priority:
          </span>
          <Button
            variant={selectedPriority === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => onPriorityChange(null)}
            className="h-7 text-xs"
          >
            All
          </Button>
          {PRIORITIES.map((p) => (
            <Button
              key={p.value}
              variant={selectedPriority === p.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => onPriorityChange(p.value)}
              className="h-7 text-xs"
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Type:
          </span>
          <Button
            variant={selectedType === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTypeChange(null)}
            className="h-7 text-xs"
          >
            All
          </Button>
          {ISSUE_TYPES.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "secondary" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type)}
              className="h-7 text-xs capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
