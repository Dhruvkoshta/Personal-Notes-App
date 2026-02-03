import { useState, useEffect } from 'react';
import type { NotesIndex, Note, Folder } from '@/types/note';

export function useNotes() {
  const [notesIndex, setNotesIndex] = useState<NotesIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const response = await fetch('/notes-index.json');
        if (!response.ok) {
          throw new Error('Failed to load notes index');
        }
        const data: NotesIndex = await response.json();
        setNotesIndex(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  return { notesIndex, loading, error };
}

export function useNote(slug: string) {
  const { notesIndex, loading: indexLoading, error } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    // If we're still loading the index, wait.
    if (indexLoading) {
      return;
    }

    // If index failed to load or is empty, stop searching.
    if (!notesIndex) {
      setIsSearching(false);
      return;
    }

    if (slug) {
      const decodedSlug = decodeURIComponent(slug);
      console.log('useNote - searching for slug:', decodedSlug);
      
      const foundNote = notesIndex.notes.find((n) => n.slug === decodedSlug);
      
      if (!foundNote) {
        // Try fuzzy matching
        const fuzzyNote = notesIndex.notes.find((n) => 
          n.slug.toLowerCase() === decodedSlug.toLowerCase()
        );
        setNote(fuzzyNote || null);
        console.log('useNote - result:', fuzzyNote ? 'found (fuzzy)' : 'not found');
      } else {
        setNote(foundNote);
        console.log('useNote - result: found (exact)');
      }
    } else {
        setNote(null);
    }
    
    // Search complete
    setIsSearching(false);
  }, [notesIndex, slug, indexLoading]);

  return { note, loading: indexLoading || isSearching, error };
}

export function useFolder(folderName: string) {
  const { notesIndex, loading, error } = useNotes();
  const [folder, setFolder] = useState<Folder | null>(null);

  useEffect(() => {
    if (notesIndex) {
      const foundFolder = notesIndex.folders.find((f) => f.name === folderName);
      setFolder(foundFolder || null);
    }
  }, [notesIndex, folderName]);

  return { folder, loading, error };
}
