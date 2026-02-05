import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const DisclaimerPage = () => {
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
          <li className="text-foreground font-medium">Disclaimer</li>
        </ol>
      </nav>

      <PageHero
        title="Disclaimer"
        subtitle="General information and limitations of liability."
      />

      <article className="container py-12 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Legal notice</span>
        </div>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: January 25, 2025
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
              9knowledge excludes all representations, warranties, and conditions relating to our website and the use of this website.
            </p>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            1. General Information
          </h2>
          <p>
            The information contained on 9knowledge.com (the "Service") is for general information purposes only. 
            While we endeavor to keep the information up to date and correct, we make no representations or warranties 
            of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability 
            with respect to the website or the information, products, services, or related graphics contained on the 
            website for any purpose.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            2. Not Professional Advice
          </h2>
          <p>
            The content on 9knowledge is not intended to be a substitute for professional advice, diagnosis, or treatment. 
            Always seek the advice of your physician, financial advisor, lawyer, or other qualified professional with any 
            questions you may have regarding a medical condition, financial situation, legal matter, or other professional concern.
          </p>
          <p className="mt-4">
            Never disregard professional advice or delay in seeking it because of something you have read on this website.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            3. Accuracy of Information
          </h2>
          <p>
            We strive to provide accurate and up-to-date information, but we do not guarantee the accuracy, completeness, 
            or timeliness of any information on our website. The content may contain technical inaccuracies or typographical 
            errors. We reserve the right to make changes to the content at any time without notice.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            4. External Links
          </h2>
          <p>
            Our website may contain links to external websites that are not provided or maintained by or in any way 
            affiliated with 9knowledge. We do not guarantee the accuracy, relevance, timeliness, or completeness of 
            any information on these external websites. The inclusion of any links does not necessarily imply a 
            recommendation or endorse the views expressed within them.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            5. Limitation of Liability
          </h2>
          <p>
            In no event will 9knowledge, its owners, employees, or affiliates be liable for any loss or damage including, 
            without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from 
            loss of data or profits arising out of, or in connection with, the use of this website.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            6. Health and Medical Information
          </h2>
          <p>
            Any health and medical information provided on 9knowledge is for informational purposes only and should not 
            be considered as medical advice. Always consult with a qualified healthcare provider before making any 
            decisions about your health or medical treatment.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            7. Financial Information
          </h2>
          <p>
            Financial information and investment advice provided on 9knowledge is for informational purposes only and 
            should not be construed as financial advice. Always consult with a qualified financial advisor before making 
            any investment decisions. Past performance does not guarantee future results.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            8. Technology and Software
          </h2>
          <p>
            While we strive to keep the website running smoothly, we do not guarantee that the website will be available 
            at all times or that it will be free from errors, viruses, or other harmful components. We are not responsible 
            for any technical issues that may arise from using our website.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            9. User-Generated Content
          </h2>
          <p>
            Comments, opinions, and other user-generated content on 9knowledge reflect the views of the individual authors 
            and do not necessarily reflect the views of 9knowledge. We are not responsible for the accuracy or reliability 
            of any user-generated content.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            10. Changes to Disclaimer
          </h2>
          <p>
            We reserve the right to update this disclaimer at any time without notice. We encourage you to review this 
            page periodically to stay informed about how we are protecting your interests and the limitations of our 
            liability.
          </p>

          <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
            11. Contact Us
          </h2>
          <p>
            If you have any questions about this Disclaimer, please contact us at{" "}
            <a href="mailto:info@9knowledge.com" className="text-accent hover:underline">
              info@9knowledge.com
            </a>
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              By using 9knowledge, you acknowledge that you have read, understood, and agree to be bound by this Disclaimer. 
              If you do not agree with any part of this disclaimer, please do not use our website.
            </p>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default DisclaimerPage;
