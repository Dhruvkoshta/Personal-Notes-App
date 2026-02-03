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

interface GridViewProps {
  notes: Note[];
}

export function GridView({ notes }: GridViewProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No notes found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Link to={`/note/${note.slug}`}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer border border-border shadow-2xl">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">
                  <Folder className="h-3 w-3 mr-1" />
                  {note.folder}
                </Badge>
                <CardTitle className="line-clamp-2">
                  {note.frontmatter.title || note.filename}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {note.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {note.frontmatter.date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(note.frontmatter.date).toLocaleDateString()}
                  </div>
                )}
                {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.frontmatter.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {note.frontmatter.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.frontmatter.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
