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
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client';
import { Plus, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type AppRole = 'super_admin' | 'editor' | 'author';

const UsersPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('author');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all user roles
      const rolesSnapshot = await getDocs(collection(db, 'user_roles'));
      const roles = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get all profiles (stored in Firestore profiles collection)
      const profilesSnapshot = await getDocs(
        query(collection(db, 'profiles'), orderBy('created_at', 'desc'))
      );
      const profiles = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Combine profiles with roles
      return profiles.map((profile) => ({
        ...profile,
        role: roles.find((r) => r.user_id === profile.id)?.role || null,
      }));
    },
  });

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });
      }

      if (userCredential.user) {
        // Create profile document
        await setDoc(doc(db, 'profiles', userCredential.user.uid), {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          full_name: fullName,
          created_at: new Date().toISOString(),
        });

        // Add the role
        await setDoc(doc(db, 'user_roles', userCredential.user.uid), {
          user_id: userCredential.user.uid,
          role,
        });
      }

      toast({ title: 'User created successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('author');
    } catch (error: any) {
      toast({ title: 'Error creating user', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Update role document
      await setDoc(doc(db, 'user_roles', userId), {
        user_id: userId,
        role: newRole,
      }, { merge: true });
    },
    onSuccess: () => {
      toast({ title: 'Role updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating role', description: error.message, variant: 'destructive' });
    },
  });

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="default">Super Admin</Badge>;
      case 'editor':
        return <Badge variant="secondary">Editor</Badge>;
      case 'author':
        return <Badge variant="outline">Author</Badge>;
      default:
        return <Badge variant="outline">No Role</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage admin users and roles</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[150px]">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Unnamed User'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || ''}
                        onValueChange={(value) =>
                          updateUserRole.mutate({ userId: user.id, newRole: value as AppRole })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Set role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="author">Author</SelectItem>
                        </SelectContent>
                      </Select>
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
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new admin user account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@9knowledge.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;
