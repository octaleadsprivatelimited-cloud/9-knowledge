import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdSlots, useCreateAdSlot, useUpdateAdSlot, useDeleteAdSlot, AdPosition } from '@/hooks/useAdSlots';
import { Plus, Edit, Trash, Loader2, Monitor, Sidebar, FileText, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const positions: { value: AdPosition; label: string; icon: any; description: string }[] = [
  { value: 'header', label: 'Header', icon: LayoutTemplate, description: 'Top of the page, below navigation' },
  { value: 'sidebar', label: 'Sidebar', icon: Sidebar, description: 'Right sidebar on article pages' },
  { value: 'in-article', label: 'In-Article', icon: FileText, description: 'Within article content' },
  { value: 'footer', label: 'Footer', icon: LayoutTemplate, description: 'Bottom of the page' },
  { value: 'between-posts', label: 'Between Posts', icon: Monitor, description: 'Between article cards in lists' },
];

const AdsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slot_id: '',
    position: 'header' as AdPosition,
    is_active: true,
  });

  const { data: adSlots, isLoading } = useAdSlots();
  const createAdSlot = useCreateAdSlot();
  const updateAdSlot = useUpdateAdSlot();
  const deleteAdSlot = useDeleteAdSlot();
  const { toast } = useToast();

  const openNewDialog = () => {
    setEditingSlot(null);
    setFormData({
      name: '',
      slot_id: '',
      position: 'header',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (slot: any) => {
    setEditingSlot(slot);
    setFormData({
      name: slot.name,
      slot_id: slot.slot_id,
      position: slot.position,
      is_active: slot.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slot_id) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingSlot) {
        await updateAdSlot.mutateAsync({ id: editingSlot.id, ...formData });
        toast({ title: 'Ad slot updated successfully' });
      } else {
        await createAdSlot.mutateAsync(formData);
        toast({ title: 'Ad slot created successfully' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error saving ad slot', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteAdSlot.mutateAsync(deleteId);
      toast({ title: 'Ad slot deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error deleting ad slot', description: error.message, variant: 'destructive' });
    }
    setDeleteId(null);
  };

  const toggleActive = async (slot: any) => {
    try {
      await updateAdSlot.mutateAsync({ id: slot.id, is_active: !slot.is_active });
      toast({ title: `Ad slot ${slot.is_active ? 'disabled' : 'enabled'}` });
    } catch (error: any) {
      toast({ title: 'Error updating ad slot', description: error.message, variant: 'destructive' });
    }
  };

  const getPositionBadge = (position: string) => {
    const positionData = positions.find(p => p.value === position);
    return (
      <Badge variant="outline" className="gap-1">
        {positionData?.icon && <positionData.icon className="h-3 w-3" />}
        {positionData?.label || position}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ad Management</h1>
            <p className="text-muted-foreground">Configure Google AdSense slots</p>
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Ad Slot
          </Button>
        </div>

        {/* Quick guide card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AdSense Setup Guide</CardTitle>
            <CardDescription>How to configure your ad slots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>1. Create ad units in your <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AdSense account</a></p>
            <p>2. Copy the <strong>data-ad-slot</strong> ID from each ad unit</p>
            <p>3. Add the slot ID here and select the position where you want it to appear</p>
            <p>4. Make sure to add your AdSense publisher ID to the site header</p>
          </CardContent>
        </Card>

        {/* Ad positions overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((pos) => {
            const activeSlot = adSlots?.find(s => s.position === pos.value && s.is_active);
            return (
              <Card key={pos.value} className={activeSlot ? 'border-primary/50' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <pos.icon className="h-4 w-4" />
                    {pos.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{pos.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeSlot ? (
                    <div className="text-sm">
                      <p className="font-medium text-green-600">Active: {activeSlot.name}</p>
                      <p className="text-xs text-muted-foreground">Slot: {activeSlot.slot_id}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active ad</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ad slots table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slot ID</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : adSlots?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No ad slots configured. Add your first ad slot to get started.
                  </TableCell>
                </TableRow>
              ) : (
                adSlots?.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.name}</TableCell>
                    <TableCell className="font-mono text-sm">{slot.slot_id}</TableCell>
                    <TableCell>{getPositionBadge(slot.position)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={slot.is_active ?? false}
                        onCheckedChange={() => toggleActive(slot)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(slot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(slot.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? 'Edit Ad Slot' : 'New Ad Slot'}
            </DialogTitle>
            <DialogDescription>
              {editingSlot ? 'Update ad slot configuration' : 'Add a new Google AdSense slot'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Header Banner, Sidebar Ad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot_id">AdSense Slot ID *</Label>
              <Input
                id="slot_id"
                value={formData.slot_id}
                onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                placeholder="e.g., 1234567890"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Find this in your AdSense account under the data-ad-slot attribute
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(value: AdPosition) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      <div className="flex items-center gap-2">
                        <pos.icon className="h-4 w-4" />
                        {pos.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAdSlot.isPending || updateAdSlot.isPending}
            >
              {(createAdSlot.isPending || updateAdSlot.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingSlot ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad slot? The ad will no longer appear on your site.
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

export default AdsPage;
