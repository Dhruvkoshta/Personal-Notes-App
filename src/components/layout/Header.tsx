import { Link } from 'react-router-dom';
import { BookOpen, LayoutList, LayoutGrid, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';
import { ThemeToggle } from './ThemeToggle';
import type { ViewMode } from '@/types/note';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({ searchQuery, onSearchChange, viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>Dev Notes</span>
        </Link>

        <div className="flex-1 flex items-center justify-center px-4">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <LayoutList className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewModeChange('tree')}
            title="Tree View"
          >
            <FolderTree className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
