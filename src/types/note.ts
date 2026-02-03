export interface NoteFrontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  category?: string;
  author?: string;
  description?: string;
}

export interface Note {
  id: string;
  slug: string;
  filepath: string;
  folder: string;
  filename: string;
  frontmatter: NoteFrontmatter;
  content: string;
  excerpt: string;
  createdAt: string;
  modifiedAt: string;
}

export interface Folder {
  name: string;
  path: string;
  noteCount: number;
  notes: Note[];
}

export interface NotesIndex {
  folders: Folder[];
  notes: Note[];
}

export type ViewMode = 'list' | 'grid' | 'tree';
