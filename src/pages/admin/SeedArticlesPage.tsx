import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedArticles } from '@/utils/seedArticles';
import { Loader2, CheckCircle, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SeedArticlesPage = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    categoriesProcessed?: number;
    articlesCreated?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  const handleSeedArticles = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const seedResult = await seedArticles();
      setResult(seedResult);

      if (seedResult.success) {
        // Invalidate all article-related queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['articles'] });
        queryClient.invalidateQueries({ queryKey: ['articles-by-category'] });
        queryClient.invalidateQueries({ queryKey: ['published-articles'] });
        queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
        queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
        queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
        
        toast.success(
          `Successfully created ${seedResult.articlesCreated} articles across ${seedResult.categoriesProcessed} categories! Refresh the page to see them.`
        );
      } else {
        toast.error(seedResult.error || 'Failed to seed articles');
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      toast.error('Error seeding articles: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCache = () => {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
    queryClient.invalidateQueries({ queryKey: ['articles-by-category'] });
    queryClient.invalidateQueries({ queryKey: ['published-articles'] });
    queryClient.invalidateQueries({ queryKey: ['featured-articles'] });
    queryClient.invalidateQueries({ queryKey: ['trending-articles'] });
    queryClient.invalidateQueries({ queryKey: ['latest-articles'] });
    toast.success('Cache refreshed! Articles should now be visible.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Seed Articles</h1>
          <p className="text-muted-foreground">
            Add sample articles to your database (3 articles per category)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Article Seeding Tool
            </CardTitle>
            <CardDescription>
              This tool will create 3 sample articles for each active category in your database.
              Articles will be published and ready to display on your website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">⚠️ Important:</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                This tool will create articles in your Firestore database. After clicking the button below, 
                wait for the success message, then refresh your homepage to see the articles.
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                If articles don't appear, click "Refresh Cache" button or hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R).
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">What this does:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Fetches all active categories from Firestore</li>
                <li>Creates 3 published articles for each category</li>
                <li>Uses predefined content for common categories (Health, Technology, Food, Facts, Finance)</li>
                <li>Creates generic articles for other categories</li>
                <li>All articles are immediately published and visible on your website</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSeedArticles}
                disabled={isLoading}
                className="w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Articles...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Articles for All Categories
                  </>
                )}
              </Button>
              <Button
                onClick={handleRefreshCache}
                variant="outline"
                className="w-full sm:w-auto"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Cache
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
                {result.success ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        Articles Created Successfully!
                      </h3>
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <p>Categories processed: {result.categoriesProcessed}</p>
                      <p>Articles created: {result.articlesCreated}</p>
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Warnings:</p>
                          <ul className="list-disc list-inside">
                            {result.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h3 className="font-semibold text-red-900 dark:text-red-100">
                        Error Creating Articles
                      </h3>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {result.error || 'An unknown error occurred'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SeedArticlesPage;
