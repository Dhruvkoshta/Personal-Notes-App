import { useState, useMemo } from "react";
import type { Note } from "@/types/note";

export function useSearch(notes: Note[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const query = searchQuery.toLowerCase();

    return notes.filter((note) => {
      // Search in title
      const title = note.frontmatter.title || note.filename;
      if (title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in content
      if (note.content.toLowerCase().includes(query)) {
        return true;
      }

      // Search in tags
      if (
        note.frontmatter.tags?.some((tag) => tag.toLowerCase().includes(query))
      ) {
        return true;
      }

      // Search in folder name
      if (note.folder.toLowerCase().includes(query)) {
        return true;
      }

      // Search in category
      if (note.frontmatter.category?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in author
      if (note.frontmatter.author?.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [notes, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredNotes,
    hasResults: filteredNotes.length > 0,
    resultsCount: filteredNotes.length,
  };
}
