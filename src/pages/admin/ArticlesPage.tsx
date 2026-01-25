import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useArticles, useDeleteArticle, useUpdateArticle } from '@/hooks/useArticles';
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ArticlesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: articles, isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();
  const updateArticle = useUpdateArticle();
  const { toast } = useToast();

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteArticle.mutateAsync(deleteId);
      toast({ title: 'Article deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error deleting article', description: error.message, variant: 'destructive' });
    }
    setDeleteId(null);
  };

  const togglePublish = async (article: any) => {
    try {
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      await updateArticle.mutateAsync({
        id: article.id,
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      });
      toast({ title: `Article ${newStatus === 'published' ? 'published' : 'unpublished'}` });
    } catch (error: any) {
      toast({ title: 'Error updating article', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge>Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Articles</h1>
            <p className="text-muted-foreground">Manage your blog articles</p>
          </div>
          <Button asChild>
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredArticles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No articles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Link
                        to={`/admin/articles/${article.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {(article.category as any)?.name || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(article.status || 'draft')}</TableCell>
                    <TableCell>{article.view_count || 0}</TableCell>
                    <TableCell>
                      {format(new Date(article.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/articles/${article.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(article)}>
                            {article.status === 'published' ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(article.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ArticlesPage;
