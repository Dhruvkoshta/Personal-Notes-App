import { useState, useEffect } from "react";
import type { ViewMode } from "@/types/note";

const VIEW_MODE_KEY = "notes-view-mode";

export function useViewMode(defaultMode: ViewMode = "grid") {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved === "list" || saved === "grid" || saved === "tree") {
        return saved;
      }
    }
    return defaultMode;
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }
  }, [viewMode]);

  return { viewMode, setViewMode };
}
