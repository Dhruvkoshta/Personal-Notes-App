import { useParams, Navigate } from "react-router-dom";
import { useNote } from "@/hooks/useNotes";
import { NoteViewer } from "@/components/note/NoteViewer";

export function NotePage() {
  const { "*": slug } = useParams();
  const { note, loading, error } = useNote(slug || "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading note: {error}</p>
      </div>
    );
  }

  if (!note) {
    return <Navigate to="/" replace />;
  }

  return <NoteViewer note={note} />;
}
