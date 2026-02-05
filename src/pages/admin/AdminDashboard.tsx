import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FileText, FolderOpen, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Image } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  trendValue,
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// Fallback when no daily views yet (last 7 days with 0)
function getDefaultDailyViews() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return { name: format(d, 'EEE d'), views: 0 };
  });
}

const categoryData = [
  { name: 'Technology', value: 35, color: '#3b82f6' },
  { name: 'Health', value: 25, color: '#22c55e' },
  { name: 'Business', value: 20, color: '#f59e0b' },
  { name: 'Lifestyle', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const AdminDashboard = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your admin dashboard</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your blog.
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Badge className="cursor-pointer hover:bg-primary/90">
              + New Article
            </Badge>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Articles"
            value={analytics?.totalArticles || 0}
            icon={FileText}
            description={`${analytics?.publishedArticles || 0} published`}
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Categories"
            value={analytics?.categoryCount || 0}
            icon={FolderOpen}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Views Overview
              </CardTitle>
              <CardDescription>Daily page views for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.dailyViews?.length ? analytics.dailyViews : getDefaultDailyViews()}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Content by Category
              </CardTitle>
              <CardDescription>Distribution of articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium ml-auto">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Articles
              </CardTitle>
              <CardDescription>Your latest content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentArticles?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No articles yet.{' '}
                    <Link to="/admin/articles/new" className="text-primary hover:underline">
                      Create your first article
                    </Link>
                  </p>
                ) : (
                  analytics?.recentArticles?.slice(0, 5).map((article: any) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/admin/articles/${article.id}`}
                          className="text-sm font-medium hover:text-primary truncate block"
                        >
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.category?.name}</span>
                          <span>•</span>
                          <span>{article.view_count || 0} views</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          article.status === 'published'
                            ? 'default'
                            : article.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {article.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Link
                  to="/admin/articles/new"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">New Article</p>
                    <p className="text-xs text-muted-foreground">
                      Create a new blog post
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/categories"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Manage Categories</p>
                    <p className="text-xs text-muted-foreground">
                      Add or edit categories
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/media"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <Image className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Media Library</p>
                    <p className="text-xs text-muted-foreground">
                      Upload and manage images
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/seed-articles"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Seed Articles</p>
                    <p className="text-xs text-muted-foreground">
                      Add sample articles (3 per category)
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Status */}
        <Card>
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
            <CardDescription>Overview of your article pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Published</span>
                  <span className="font-medium">{analytics?.publishedArticles || 0}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Draft</span>
                  <span className="font-medium">{(analytics?.totalArticles || 0) - (analytics?.publishedArticles || 0)}</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Scheduled</span>
                  <span className="font-medium">0</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Archived</span>
                  <span className="font-medium">0</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
