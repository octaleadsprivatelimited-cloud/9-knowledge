import { ReactNode } from "react";

/** Default hero background - can be overridden per page via backgroundImage prop */
const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80";

interface PageHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional custom background image URL */
  backgroundImage?: string;
  /** Optional custom class for the content container */
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  backgroundImage = DEFAULT_HERO_IMAGE,
  className = "",
}: PageHeroProps) {
  return (
    <header
      className={`relative min-h-[240px] sm:min-h-[280px] flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" aria-hidden />
      <div className="container relative z-10 py-12 sm:py-16 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white drop-shadow-md">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
