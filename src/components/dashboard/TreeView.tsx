import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { NativeNestedListBaseUI, type ListItem } from "@/components/uitripled/native-nested-list-baseui";
import { Card } from "@/components/ui/card";
import type { Folder as FolderType } from "@/types/note";
import { motion, AnimatePresence } from "framer-motion";

interface TreeViewProps {
  folders: FolderType[];
}

export function TreeView({ folders }: TreeViewProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const items = useMemo<ListItem[]>(() => {
    const root: ListItem[] = [];
    const folderMap = new Map<string, ListItem>();

    const getOrCreateFolderItem = (path: string) => {
      if (folderMap.has(path)) {
        return folderMap.get(path)!;
      }

      const parts = path.split("/");
      const label = parts[parts.length - 1];
      const item: ListItem = {
        id: `folder:${path}`,
        label,
        icon: <Folder className="h-4 w-4 text-blue-500" />,
        children: [],
      };

      folderMap.set(path, item);

      if (parts.length === 1) {
        root.push(item);
      } else {
        const parentPath = parts.slice(0, -1).join("/");
        const parent = getOrCreateFolderItem(parentPath);
        parent.children = parent.children ?? [];
        parent.children.push(item);
      }

      return item;
    };

    folders.forEach((folder) => {
      const folderItem = getOrCreateFolderItem(folder.name);
      folder.notes.forEach((note) => {
        folderItem.children = folderItem.children ?? [];
        folderItem.children.push({
          id: `note:${note.id}`,
          label: note.frontmatter.title || note.filename,
          icon: <FileText className="h-4 w-4 text-gray-400" />,
          href: `/note/${note.slug}`,
        });
      });
    });

    const sortItems = (list: ListItem[]) => {
      list.sort((a, b) => {
        const aHasChildren = (a.children?.length ?? 0) > 0;
        const bHasChildren = (b.children?.length ?? 0) > 0;
        if (aHasChildren !== bHasChildren) {
          return aHasChildren ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
      });

      list.forEach((item) => {
        if (item.children?.length) {
          sortItems(item.children);
        }
      });
    };

    sortItems(root);
    return root;
  }, [folders]);

  const currentFolder = selectedFolder
    ? folders.find((folder) => folder.name === selectedFolder)
    : null;

  const activeId = selectedFolder ? `folder:${selectedFolder}` : undefined;

  const handleItemClick = (item: ListItem) => {
    if (item.id.startsWith("folder:")) {
      setSelectedFolder(item.id.replace("folder:", ""));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <motion.aside
        className="w-full rounded-lg border bg-background p-4 shadow-sm"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Folders
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <NativeNestedListBaseUI
            items={items}
            activeId={activeId}
            onItemClick={handleItemClick}
          />
        </div>
      </motion.aside>

      <motion.section
        className="rounded-lg border bg-background p-4 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {currentFolder ? (
            <motion.div
              key={currentFolder.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{currentFolder.name}</h2>
                <p className="text-muted-foreground">
                  {currentFolder.noteCount} notes
                </p>
              </div>
              {currentFolder.notes.length ? (
                <div className="space-y-4">
                  {currentFolder.notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to={`/note/${note.slug}`}>
                        <Card className="p-4 hover:border-primary transition-colors cursor-pointer border border-border shadow-2xl">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {note.frontmatter.title || note.filename}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {note.excerpt}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes in this folder yet.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex h-full min-h-[240px] flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-muted-foreground">
                Select a folder to view notes
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
