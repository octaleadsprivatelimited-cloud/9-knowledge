import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const TermsPage = () => {
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
          <li className="text-foreground font-medium">Terms of Service</li>
        </ol>
      </nav>

      <PageHero
        title="Terms of Service"
        subtitle="Terms and conditions for using 9knowledge."
      />

      <article className="container py-12 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 12, 2025
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using 9knowledge, you accept and agree to be bound by these 
            Terms of Service. If you do not agree to these terms, please do not use our 
            service.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            2. Use License
          </h2>
          <p>
            Permission is granted to temporarily access the materials on 9knowledge for 
            personal, non-commercial use only. This is a license, not a transfer of title.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            3. User Content
          </h2>
          <p>
            Users may submit comments and other content. By submitting content, you grant 
            us a non-exclusive, worldwide, royalty-free license to use, reproduce, and 
            publish such content.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            4. Disclaimer
          </h2>
          <p>
            The materials on 9knowledge are provided "as is". We make no warranties, 
            expressed or implied, and hereby disclaim all warranties including accuracy, 
            reliability, or fitness for any purpose.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            5. Modifications
          </h2>
          <p>
            We may revise these terms at any time without notice. By using this website, 
            you agree to be bound by the current version of these Terms of Service.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            6. Contact
          </h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:info@9knowledge.com" className="text-accent hover:underline">
              info@9knowledge.com
            </a>
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default TermsPage;
