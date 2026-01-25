import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/articles', icon: FileText, label: 'Articles' },
  { href: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/admin/tags', icon: Tags, label: 'Tags' },
  { href: '/admin/media', icon: FolderOpen, label: 'Media' },
  { href: '/admin/settings', icon: Settings, label: 'Settings', superAdminOnly: true },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, role, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between border-b bg-background px-4 py-3">
        <Link to="/admin" className="font-bold text-xl text-primary">
          9knowledge
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="hidden lg:flex items-center h-16 px-6 border-b">
              <Link to="/admin" className="font-bold text-xl text-primary">
                9knowledge
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh-0px)]">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
