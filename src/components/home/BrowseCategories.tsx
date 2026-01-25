import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BrowseCategoriesProps {
  categories: Category[];
}

// Category images mapping - matching the design
const categoryImages: Record<string, string> = {
  health: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
  food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
  facts: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop",
  finance: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop",
};

const defaultImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop";

export function BrowseCategories({ categories }: BrowseCategoriesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="container py-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Browse Categories
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {categories.map((category) => {
          const imageUrl = categoryImages[category.slug.toLowerCase()] || defaultImage;
          
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Dark Overlay - More prominent at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                
                {/* Content - Centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white mb-2 md:mb-3 group-hover:text-accent transition-colors drop-shadow-lg">
                    {category.name}
                  </h3>
                  <span className="text-xs md:text-sm text-white/90 flex items-center gap-1 group-hover:text-accent transition-colors font-medium">
                    Explore <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
