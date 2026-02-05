import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/search/SearchModal";
import { useCategories } from "@/hooks/useCategories";
import { sortCategoriesByDisplayOrder } from "@/lib/categoryOrder";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: categoriesRaw = [] } = useCategories();
  const categories = sortCategoriesByDisplayOrder(categoriesRaw);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsMenuOpen(false);
      }
      if (e.key === "Escape" && isMenuOpen) {
        e.preventDefault();
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Boldsky-style: single row, white, logo + nav + search */}
      <header className="sticky top-0 z-[100] w-full border-b border-border bg-white">
        <div className="container flex h-14 md:h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl font-display font-bold text-primary">9</span>
            <span className="text-2xl font-display font-bold text-foreground">knowledge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-foreground hover:text-primary"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative z-[101]"
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "absolute top-0 left-0 right-0 bottom-0 bg-white z-[70] overflow-y-auto pt-20 px-4 pb-8"
            )}
          >
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                Categories
              </div>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <div className="border-t my-4" />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                Pages
              </div>
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/disclaimer", label: "Disclaimer" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
