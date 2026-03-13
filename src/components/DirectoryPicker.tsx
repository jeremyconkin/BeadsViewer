"use client";

import { FolderOpen, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DirectoryPickerProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  isValid: boolean | null;
  isLoading: boolean;
}

export function DirectoryPicker({
  currentPath,
  onPathChange,
  isValid,
  isLoading,
}: DirectoryPickerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b">
      <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="relative flex-1">
        <Input
          value={currentPath}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="Enter project directory path..."
          className="pr-8"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!isLoading && isValid === true && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          {!isLoading && isValid === false && (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
      </div>
      <Button
        onClick={() => onPathChange(currentPath)}
        disabled={isLoading || !currentPath}
        size="sm"
      >
        Open
      </Button>
    </div>
  );
}
