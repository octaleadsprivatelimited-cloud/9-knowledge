import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/useSearch';
import { Search, X, Loader2, Clock, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in-0"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl">
        <div
          ref={modalRef}
          className="bg-background border rounded-xl shadow-2xl animate-in slide-in-from-top-4 fade-in-0 duration-300"
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg py-6"
            />
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : query ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <kbd className="hidden md:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
                ESC
              </kbd>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Type at least 2 characters to search</p>
                <p className="text-xs mt-1 opacity-70">
                  Search through article titles, excerpts, and content
                </p>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No results found</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
                <ul className="space-y-1">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link
                        to={`/article/${result.slug}`}
                        onClick={onClose}
                        className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                      >
                        {result.featured_image && (
                          <img
                            src={result.featured_image}
                            alt=""
                            className="w-20 h-14 object-cover rounded-md shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {result.category && (
                              <Badge variant="secondary" className="text-xs">
                                {result.category.name}
                              </Badge>
                            )}
                            {result.reading_time && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {result.reading_time} min
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {result.title}
                          </h4>
                          {result.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {result.excerpt}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↵</kbd>
                <span>Open</span>
              </span>
            </div>
            <span>Powered by 9knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
