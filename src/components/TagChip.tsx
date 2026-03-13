"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const knownColors: Record<string, string> = {
  bug: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  feature: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  enhancement:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  documentation:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  urgent:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  chore: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const defaultColor =
  "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  variant?: "default" | "secondary" | "outline";
}

export function TagChip({ tag, onRemove, variant }: TagChipProps) {
  const colorClass = knownColors[tag.toLowerCase()] || defaultColor;

  return (
    <Badge
      variant={variant}
      className={cn(
        "border-transparent gap-1",
        !variant && colorClass
      )}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
