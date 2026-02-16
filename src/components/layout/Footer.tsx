import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";

/** Boldsky-style minimal footer: brand, links, copyright */
export function Footer() {
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          {/* Brand + inline links */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link to="/" className="inline-flex items-center shrink-0">
              <span className="text-2xl font-display font-bold text-primary">9</span>
              <span className="text-2xl font-display font-bold text-foreground">knowledge</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/sitemap.xml" className="text-muted-foreground hover:text-foreground transition-colors">
                Sitemap
              </Link>
            </nav>
          </div>

          {/* Social + copyright row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {/* Email */}
              <a 
                href="mailto:9knowledgeblog@gmail.com" 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              
              {/* Twitter/X - Only show if URL exists */}
              {settings?.social_media?.twitter && (
                <a 
                  href={settings.social_media.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              
              {/* Facebook - Only show if URL exists */}
              {settings?.social_media?.facebook && (
                <a 
                  href={settings.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              
              {/* LinkedIn - Only show if URL exists */}
              {settings?.social_media?.linkedin && (
                <a 
                  href={settings.social_media.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              
              {/* Instagram - Only show if URL exists */}
              {settings?.social_media?.instagram && (
                <a 
                  href={settings.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors" 
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-semibold text-foreground">9knowledge</span>. All rights reserved.
              {" · "}
              <a href="https://octaleads.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Octaleads Pvt Ltd
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
