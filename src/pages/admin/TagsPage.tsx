import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const TagsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const { toast } = useToast();

  const handleNameChange = (name: string) => {
    setFormData({ name, slug: generateSlug(name) });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast({ title: 'Please fill in the tag name', variant: 'destructive' });
      return;
    }

    try {
      await createTag.mutateAsync(formData);
      toast({ title: 'Tag created successfully' });
      setDialogOpen(false);
      setFormData({ name: '', slug: '' });
    } catch (error: any) {
      toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteTag.mutateAsync(deleteId);
      toast({ title: 'Tag deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
    }
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-muted-foreground">Manage article tags</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tag
          </Button>
        </div>

        <div className="border rounded-lg p-6">
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : tags?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tags found. Create your first tag.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-sm py-1.5 px-3 gap-2"
                >
                  {tag.name}
                  <button
                    onClick={() => setDeleteId(tag.id)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Tag</DialogTitle>
            <DialogDescription>Create a new tag for articles</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Tag name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="tag-slug"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createTag.isPending}>
              {createTag.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? It will be removed from all articles.
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

export default TagsPage;
