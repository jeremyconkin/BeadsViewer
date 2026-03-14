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
  showClosed: boolean;
  onShowClosedChange: (show: boolean) => void;
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
  showClosed,
  onShowClosedChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedLabels.length > 0 ||
    searchQuery.length > 0 ||
    selectedPriority !== null ||
    selectedType !== null ||
    showClosed;

  const allButtonClass =
    "h-7 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90";
  const selectedButtonClass =
    "h-7 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90";
  const unselectedButtonClass =
    "h-7 text-xs font-medium border-border text-muted-foreground hover:text-foreground hover:bg-accent";

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
        <span className="text-xs font-semibold text-foreground">Status:</span>
        <Button
          variant={selectedStatuses.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={() => {
            // Clear all status selections
            selectedStatuses.forEach((s) => onStatusToggle(s));
          }}
          className={
            selectedStatuses.length === 0
              ? allButtonClass
              : unselectedButtonClass
          }
        >
          All
        </Button>
        {BEAD_STATUSES.map((s) => (
          <Button
            key={s.value}
            variant={
              selectedStatuses.includes(s.value) ? "default" : "outline"
            }
            size="sm"
            onClick={() => onStatusToggle(s.value)}
            className={
              selectedStatuses.includes(s.value)
                ? selectedButtonClass
                : unselectedButtonClass
            }
          >
            {s.label}
          </Button>
        ))}
        <span className="mx-1 text-border">|</span>
        <Button
          variant={showClosed ? "default" : "outline"}
          size="sm"
          onClick={() => onShowClosedChange(!showClosed)}
          className={
            showClosed ? selectedButtonClass : unselectedButtonClass
          }
        >
          Closed
        </Button>
      </div>

      {/* Labels */}
      {availableLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Labels:
          </span>
          {availableLabels.map((label) => (
            <Badge
              key={label}
              variant={
                selectedLabels.includes(label) ? "default" : "outline"
              }
              className={
                selectedLabels.includes(label)
                  ? "cursor-pointer font-medium"
                  : "cursor-pointer font-medium text-muted-foreground hover:text-foreground"
              }
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
          <span className="text-xs font-semibold text-foreground">
            Priority:
          </span>
          <Button
            variant={selectedPriority === null ? "default" : "outline"}
            size="sm"
            onClick={() => onPriorityChange(null)}
            className={
              selectedPriority === null
                ? allButtonClass
                : unselectedButtonClass
            }
          >
            All
          </Button>
          {PRIORITIES.map((p) => (
            <Button
              key={p.value}
              variant={selectedPriority === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => onPriorityChange(p.value)}
              className={
                selectedPriority === p.value
                  ? selectedButtonClass
                  : unselectedButtonClass
              }
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Type:</span>
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(null)}
            className={
              selectedType === null ? allButtonClass : unselectedButtonClass
            }
          >
            All
          </Button>
          {ISSUE_TYPES.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type)}
              className={
                selectedType === type
                  ? selectedButtonClass + " capitalize"
                  : unselectedButtonClass + " capitalize"
              }
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
            className="h-7 text-xs font-medium text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
