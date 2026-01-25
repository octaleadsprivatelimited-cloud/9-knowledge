import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Linkedin, Instagram, ChevronDown, ArrowRight, Sparkles, Clock } from "lucide-react";
import { categories } from "@/lib/data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLatestArticles } from "@/hooks/usePublicArticles";

export function Footer() {
  // Initialize all sections as open by default (especially for desktop)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    more: true,
    company: true,
    latest: true,
  });
  const [email, setEmail] = useState("");
  const { data: latestArticles, error: latestError } = useLatestArticles(5);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/98 to-primary border-t border-border">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-20">
        {/* Newsletter Section */}
        <div className="mb-16 pb-12 border-b border-primary-foreground/10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 mb-6">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Stay Updated
            </h3>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Subscribe to our newsletter and never miss the latest articles and insights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent"
                required
              />
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white px-8 font-semibold"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center mb-6 group">
              <span className="text-3xl font-display font-bold text-accent group-hover:scale-110 transition-transform duration-300">9</span>
              <span className="text-3xl font-display font-bold text-primary-foreground">knowledge</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Your trusted source for insightful articles on technology, health, business, and more. Stay informed with expert analysis.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:9knowledgeblog@gmail.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 group">
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>9knowledgeblog@gmail.com</span>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-accent border border-primary-foreground/20 hover:border-accent flex items-center justify-center text-primary-foreground/70 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-accent border border-primary-foreground/20 hover:border-accent flex items-center justify-center text-primary-foreground/70 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-accent border border-primary-foreground/20 hover:border-accent flex items-center justify-center text-primary-foreground/70 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 hover:bg-accent border border-primary-foreground/20 hover:border-accent flex items-center justify-center text-primary-foreground/70 hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories - Collapsible on mobile */}
          <div>
            <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full md:pointer-events-none mb-4">
                <h4 className="text-lg font-display font-bold text-primary-foreground">Categories</h4>
                <ChevronDown className={`h-5 w-5 md:hidden transition-transform text-primary-foreground/50 ${openSections.categories ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="md:!block md:!visible md:data-[state=closed]:!block md:data-[state=closed]:!visible">
                <ul className="space-y-3">
                  {categories.slice(0, 6).map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.slug}`}
                        className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform">{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* More Categories - Collapsible on mobile - Only show if there are items */}
          {categories.slice(6).length > 0 && (
            <div>
              <Collapsible open={openSections.more} onOpenChange={() => toggleSection('more')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full md:pointer-events-none mb-4">
                  <h4 className="text-lg font-display font-bold text-primary-foreground">More</h4>
                  <ChevronDown className={`h-5 w-5 md:hidden transition-transform text-primary-foreground/50 ${openSections.more ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="md:!block md:!visible md:data-[state=closed]:!block md:data-[state=closed]:!visible">
                  <ul className="space-y-3">
                    {categories.slice(6).map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.slug}`}
                          className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                          <span className="group-hover:translate-x-1 transition-transform">{category.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Company - Collapsible on mobile */}
          <div>
            <Collapsible open={openSections.company} onOpenChange={() => toggleSection('company')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full md:pointer-events-none mb-4">
                <h4 className="text-lg font-display font-bold text-primary-foreground">Company</h4>
                <ChevronDown className={`h-5 w-5 md:hidden transition-transform text-primary-foreground/50 ${openSections.company ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="md:!block md:!visible md:data-[state=closed]:!block md:data-[state=closed]:!visible">
                <ul className="space-y-3">
                  <li>
                    <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">Careers</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform">Advertise</span>
                    </a>
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Latest News - Collapsible on mobile */}
          <div>
            <Collapsible open={openSections.latest} onOpenChange={() => toggleSection('latest')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full md:pointer-events-none mb-4">
                <h4 className="text-lg font-display font-bold text-primary-foreground">Latest News</h4>
                <ChevronDown className={`h-5 w-5 md:hidden transition-transform text-primary-foreground/50 ${openSections.latest ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="md:!block md:!visible md:data-[state=closed]:!block md:data-[state=closed]:!visible">
                {latestArticles && latestArticles.length > 0 ? (
                  <ul className="space-y-3">
                    {latestArticles.map((article) => (
                      <li key={article.id}>
                        <Link
                          to={`/article/${article.slug}`}
                          className="text-sm text-primary-foreground/70 hover:text-accent transition-all duration-300 flex items-start gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="group-hover:translate-x-1 transition-transform line-clamp-2 block">
                              {article.title}
                            </span>
                            {article.published_at && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-primary-foreground/50">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(article.published_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : latestError ? (
                  <p className="text-sm text-primary-foreground/50">Unable to load articles.</p>
                ) : (
                  <p className="text-sm text-primary-foreground/50">No articles yet.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10 bg-primary/50 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/70 text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold text-primary-foreground">9knowledge</span>. All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
                <Link to="/privacy" className="hover:text-accent transition-colors">
                  Privacy
                </Link>
                <span className="text-primary-foreground/30 hidden md:inline">•</span>
                <Link to="/terms" className="hover:text-accent transition-colors">
                  Terms
                </Link>
                <span className="text-primary-foreground/30 hidden md:inline">•</span>
              </div>
              <div className="text-center md:text-left">
                <span className="text-primary-foreground/70">Developed by </span>
                <a 
                  href="https://octaleads.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-primary-foreground hover:text-accent transition-colors underline underline-offset-2"
                >
                  Octaleads Pvt Ltd
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
