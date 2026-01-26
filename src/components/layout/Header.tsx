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

  // Keyboard shortcut to open search and close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsMenuOpen(false);
      }
      // Close menu on Escape key
      if (e.key === 'Escape' && isMenuOpen) {
        e.preventDefault();
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

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
      <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              className="lg:hidden relative z-[101]"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Apple-style design */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop with blur - starts below header */}
          <div 
            className="absolute top-[96px] left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsMenuOpen(false);
              }
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close menu"
          />
          
          {/* Menu Panel */}
          <div 
            className={cn(
              "absolute top-[96px] left-0 right-0 bottom-0 bg-background/95 backdrop-blur-xl z-[70]",
              "overflow-y-auto overscroll-contain",
              "transform transition-transform duration-300 ease-out",
              isMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}
            onClick={(e) => {
              // Prevent clicks inside menu from closing it
              e.stopPropagation();
            }}
          >
          <div className="px-6 pt-6 pb-6 space-y-1">
            {/* Search Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 group mb-4"
            >
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Search articles...
              </span>
            </button>

            {/* Categories Section - Display First */}
            <div className="space-y-1 mb-6">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categories
              </div>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 my-6"></div>

            {/* Navigation Links - Display After Categories */}
            <nav className="space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pages
              </div>
              <Link
                to="/"
                className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/privacy"
                className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy Policy
              </Link>
              <Link
                to="/disclaimer"
                className="block px-4 py-3.5 text-lg font-medium text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                onClick={() => setIsMenuOpen(false)}
              >
                Disclaimer
              </Link>
            </nav>
          </div>
        </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
