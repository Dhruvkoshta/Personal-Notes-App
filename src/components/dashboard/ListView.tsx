import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Folder, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Note } from "@/types/note";

interface ListViewProps {
  notes: Note[];
}

export function ListView({ notes }: ListViewProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No notes found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.08, duration: 0.4 },
        },
      }}
    >
      {notes.map((note) => (
        <motion.div
          key={note.id}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Link to={`/note/${note.slug}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full border border-border shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <CardTitle>
                      {note.frontmatter.title || note.filename}
                    </CardTitle>
                    <CardDescription>{note.excerpt}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Folder className="h-3 w-3 mr-1" />
                    {note.folder}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {note.frontmatter.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(note.frontmatter.date).toLocaleDateString()}
                    </div>
                  )}
                  {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <div className="flex gap-1">
                        {note.frontmatter.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
