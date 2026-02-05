import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const AboutPage = () => {
  return (
    <Layout>
      <nav className="container py-3 border-b border-border">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" />
          <li className="text-foreground font-medium">About Us</li>
        </ol>
      </nav>

      <PageHero
        title={
          <>
            About <span className="text-white">9</span>knowledge
          </>
        }
        subtitle="Insightful articles and trusted news across technology, health, business, science, and more."
      />

      <section className="container py-12 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p>
            9knowledge is a website that shares insightful articles and information across 
            various topics like technology, health, business, science, and more. We aim to 
            keep readers informed with trusted news and expert-style analysis.
          </p>
          <p className="mt-4">
            Our platform delivers useful content and insights for people interested in 
            current trends and knowledge in different fields. The focus is on news, 
            informational articles, and expert-style insights across multiple subjects—so 
            you can stay updated and make better-informed decisions.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
