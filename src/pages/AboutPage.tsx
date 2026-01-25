import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, Users, Target, Award, Globe } from "lucide-react";

const AboutPage = () => {
  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="container py-4 border-b border-border">
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

      {/* Hero */}
      <header className="container py-16 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
          About <span className="text-accent">9</span>knowledge
        </h1>
        <p className="text-xl text-muted-foreground">
          We believe in the power of knowledge to transform lives. 9knowledge is a leading 
          digital media platform dedicated to delivering insightful, accurate, and engaging 
          content that empowers our readers to make informed decisions in technology, health, 
          business, and beyond.
        </p>
      </header>

      {/* Values */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Community First</h3>
            <p className="text-sm text-muted-foreground">
              We build for our readers, listening to feedback and continuously improving.
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Accuracy</h3>
            <p className="text-sm text-muted-foreground">
              Every article is fact-checked and reviewed to ensure reliability.
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Quality</h3>
            <p className="text-sm text-muted-foreground">
              We maintain the highest standards in journalism and content creation.
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Global Reach</h3>
            <p className="text-sm text-muted-foreground">
              Serving readers worldwide with diverse perspectives and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container py-12 max-w-4xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-foreground mb-6 text-center">
          Our Story
        </h2>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p>
            Founded in 2020 with a vision to democratize access to quality information, 
            9knowledge has grown from a small blog into a trusted source for millions of 
            readers worldwide. Our platform serves as a bridge between complex information 
            and everyday understanding.
          </p>
          <p className="mt-4">
            Our team of experienced journalists, researchers, and industry experts work 
            tirelessly to bring you the most relevant and impactful stories across 
            technology, health, business, science, lifestyle, and more. We combine 
            rigorous research with accessible writing to make knowledge available to everyone.
          </p>
          <p className="mt-4">
            At 9knowledge, we believe that everyone deserves access to accurate, 
            well-researched content that helps them understand the world better and make 
            informed decisions in their daily lives. Our commitment to editorial integrity 
            and fact-checking ensures that our readers can trust the information we provide.
          </p>
          <p className="mt-4">
            We are headquartered in San Francisco, California, with contributors and 
            readers spanning across the globe. Our diverse team brings together expertise 
            from various fields, ensuring comprehensive coverage of topics that matter to 
            our community.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
