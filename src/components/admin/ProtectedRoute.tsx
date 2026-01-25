import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  requireEditor?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireSuperAdmin = false,
  requireEditor = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isSuperAdmin, isEditor, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user is logged in but has no role, show helpful message
  if (role === null && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-2">Role Assignment Required</h1>
          <p className="text-muted-foreground mb-4">
            Your account needs a role to access the admin panel. Please set up your role in Firestore.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm space-y-2">
            <p className="font-medium">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to Firebase Console → Firestore Database</li>
              <li>Create or open the <code className="bg-background px-1 rounded">user_roles</code> collection</li>
              <li>Create a document with ID: <code className="bg-background px-1 rounded">{user.uid}</code></li>
              <li>Add field: <code className="bg-background px-1 rounded">role</code> = <code className="bg-background px-1 rounded">"super_admin"</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page. Your current role: <strong>{role || 'none'}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Required roles: super_admin, editor, or author
          </p>
        </div>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Super Admin Required</h1>
          <p className="text-muted-foreground">
            This page requires super admin privileges.
          </p>
        </div>
      </div>
    );
  }

  if (requireEditor && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Editor Access Required</h1>
          <p className="text-muted-foreground">
            This page requires editor privileges.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
