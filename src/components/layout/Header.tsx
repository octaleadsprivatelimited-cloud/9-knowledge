import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/search/SearchModal";
import { useLatestArticles } from "@/hooks/usePublicArticles";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Use a small limit and cache for 5 minutes - this query is shared with other components
  const { data: latestArticles } = useLatestArticles(1);
  const latestArticle = latestArticles && latestArticles.length > 0 ? latestArticles[0] : null;

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Top Bar */}
        <div className="border-b border-border bg-primary text-primary-foreground">
          <div className="container flex h-8 items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="font-medium">Trending:</span>
                {latestArticle ? (
                  <Link 
                    to={`/article/${latestArticle.slug}`} 
                    className="hover:text-accent transition-colors line-clamp-1 max-w-[200px] md:max-w-none truncate"
                    title={latestArticle.title}
                  >
                    {latestArticle.title}
                  </Link>
                ) : (
                  <Link to="/article/future-of-artificial-intelligence-2025" className="hover:text-accent transition-colors">
                    AI Revolution 2025
                  </Link>
                )}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <Link to="/disclaimer" className="hover:text-accent transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl font-display font-bold text-accent">9</span>
              <span className="text-2xl font-display font-bold text-foreground">knowledge</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 7).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search</span>
              <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Outside header to avoid z-index issues */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu */}
          <div className="fixed top-[96px] left-0 right-0 bottom-0 lg:hidden border-t border-border bg-background z-[70] overflow-y-auto animate-fade-in">
            <div className="container py-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 mb-4 text-muted-foreground"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                <Search className="h-4 w-4" />
                Search articles...
              </Button>
              <nav className="grid gap-1">
                <Link
                  to="/"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/privacy"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/disclaimer"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Disclaimer
                </Link>
                <div className="border-t border-border my-2"></div>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
