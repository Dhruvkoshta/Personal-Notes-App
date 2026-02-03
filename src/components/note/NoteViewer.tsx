import { Link } from 'react-router-dom';
import { Calendar, Folder, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { Note } from '@/types/note';

interface NoteViewerProps {
  note: Note;
}

export function NoteViewer({ note }: NoteViewerProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/?folder=${note.folder}`}>
                {note.folder}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{note.frontmatter.title || note.filename}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {note.frontmatter.title || note.filename}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Folder className="h-4 w-4" />
              <Badge variant="secondary">{note.folder}</Badge>
            </div>

            {note.frontmatter.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(note.frontmatter.date).toLocaleDateString()}
              </div>
            )}

            {note.frontmatter.category && (
              <Badge variant="outline">{note.frontmatter.category}</Badge>
            )}
          </div>

          {note.frontmatter.tags && note.frontmatter.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {note.frontmatter.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <MarkdownRenderer content={note.content} />
      </div>
    </div>
  );
}
