import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const PrivacyPage = () => {
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
          <li className="text-foreground font-medium">Privacy Policy</li>
        </ol>
      </nav>

      <PageHero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information."
      />

      <article className="container py-12 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 25, 2025
          </p>
          <p className="mb-6">
            At 9knowledge, we are committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you 
            visit our website 9knowledge.com and use our services.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            1. Information We Collect
          </h2>
          <p>
            At 9knowledge, we collect information you provide directly to us, such as when 
            you subscribe to our newsletter, create an account, comment on articles, or 
            contact us. This may include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Name and email address</li>
            <li>Contact information when you reach out to us</li>
            <li>Comments and content you submit</li>
            <li>Preferences and settings</li>
            <li>Any other information you choose to provide</li>
          </ul>
          <p className="mt-4">
            We also automatically collect certain information about your device and how you 
            interact with our website, including IP address, browser type, pages viewed, and 
            time spent on pages.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Provide, maintain, and improve our services and website</li>
            <li>Send you newsletters, updates, and promotional communications (with your consent)</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations and protect our rights</li>
          </ul>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            3. Cookies and Tracking Technologies
          </h2>
          <p>
            We use cookies and similar tracking technologies to collect information about 
            your browsing activities and to personalize your experience on 9knowledge. 
            Cookies help us:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our website</li>
            <li>Improve our content and services</li>
            <li>Provide personalized content and advertisements</li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. However, disabling cookies 
            may limit your ability to use certain features of our website.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            4. Data Security
          </h2>
          <p>
            At 9knowledge, we take the security of your personal information seriously. 
            We implement appropriate technical and organizational measures to protect your 
            data from unauthorized access, use, alteration, or disclosure. This includes:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure hosting infrastructure</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet or electronic storage is 
            100% secure. While we strive to protect your information, we cannot guarantee 
            absolute security.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            5. Your Rights
          </h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal 
            information, including:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to delete your personal information</li>
            <li>The right to opt-out of certain data processing activities</li>
            <li>The right to data portability</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided below.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            6. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our 
            practices or for other operational, legal, or regulatory reasons. We will notify 
            you of any material changes by posting the new Privacy Policy on this page and 
            updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            7. Contact Us
          </h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy 
            or our data practices, please contact us at:
          </p>
          <p className="mt-2">
            <strong>9knowledge</strong><br />
            Email: <a href="mailto:privacy@9knowledge.com" className="text-accent hover:underline">
              privacy@9knowledge.com
            </a><br />
            General Inquiries: <a href="mailto:info@9knowledge.com" className="text-accent hover:underline">
              info@9knowledge.com
            </a><br />
            Address: 123 Knowledge Street, Suite 400, San Francisco, CA 94102
          </p>
        </div>
      </article>
    </Layout>
  );
};

export default PrivacyPage;
