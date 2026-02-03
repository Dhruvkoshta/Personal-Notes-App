import { useNotes } from "@/hooks/useNotes";
import { useSearch } from "@/hooks/useSearch";
import { useViewMode } from "@/hooks/useViewMode";
import { Header } from "@/components/layout/Header";
import { ListView } from "@/components/dashboard/ListView";
import { GridView } from "@/components/dashboard/GridView";
import { TreeView } from "@/components/dashboard/TreeView";

export function HomePage() {
  const { notesIndex, loading, error } = useNotes();
  const { viewMode, setViewMode } = useViewMode();
  const { searchQuery, setSearchQuery, filteredNotes } = useSearch(
    notesIndex?.notes || [],
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-destructive">Error loading notes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="container mx-auto px-4 py-8">
        {searchQuery && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Found {filteredNotes.length} result
              {filteredNotes.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          </div>
        )}

        {viewMode === "list" && <ListView notes={filteredNotes} />}
        {viewMode === "grid" && <GridView notes={filteredNotes} />}
        {viewMode === "tree" && notesIndex && (
          <TreeView folders={notesIndex.folders} />
        )}
      </main>
    </div>
  );
}
