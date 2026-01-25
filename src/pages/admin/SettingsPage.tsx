import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, Mail, Bell, Shield, Palette, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SettingsPage = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '9knowledge',
    siteDescription: 'Your trusted source for insightful articles on technology, health, business, and more.',
    siteUrl: 'https://9knowledge.com',
    logo: '',
    favicon: '',
    contactEmail: 'info@9knowledge.com',
    supportEmail: 'support@9knowledge.com',
  });

  const [seoSettings, setSeoSettings] = useState({
    defaultMetaTitle: '9knowledge - Knowledge Portal',
    defaultMetaDescription: 'Discover insightful articles on technology, health, business, and more.',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    facebookPixelId: '',
  });

  const [socialSettings, setSocialSettings] = useState({
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    youtube: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewSubscriber: true,
    emailNewComment: true,
    emailWeeklyReport: true,
    browserNotifications: false,
  });

  const handleSave = (section: string) => {
    toast({ title: `${section} settings saved successfully` });
  };

  // Keep-alive functionality removed - Firebase doesn't require keep-alive pings
  // Firebase services stay active automatically

  const KeepAliveSettings = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Backend Status
            </CardTitle>
            <CardDescription>
              Firebase services stay active automatically - no keep-alive needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="font-medium text-green-900 dark:text-green-100">Firebase Services Active</p>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Firebase services (Firestore, Storage, Authentication) are always active and don't require keep-alive pings. 
                Your backend will remain available 24/7 without any additional configuration.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Unlike some free-tier database services, Firebase services don't go to sleep after inactivity. 
                Your application will always be ready to serve requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="keepalive" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Keep-Alive</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic site configuration and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={generalSettings.siteUrl}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={generalSettings.logo}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      value={generalSettings.favicon}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, favicon: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('General')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
                  <Input
                    id="defaultMetaTitle"
                    value={seoSettings.defaultMetaTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultMetaTitle: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Used when pages don't have a custom title</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
                  <Textarea
                    id="defaultMetaDescription"
                    value={seoSettings.defaultMetaDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, defaultMetaDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleSearchConsoleId">Google Search Console ID</Label>
                    <Input
                      id="googleSearchConsoleId"
                      value={seoSettings.googleSearchConsoleId}
                      onChange={(e) => setSeoSettings({ ...seoSettings, googleSearchConsoleId: e.target.value })}
                      placeholder="Verification code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                    placeholder="XXXXXXXXXXXXXXXXX"
                  />
                </div>

                <Button onClick={() => handleSave('SEO')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={socialSettings.twitter}
                      onChange={(e) => setSocialSettings({ ...socialSettings, twitter: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={socialSettings.facebook}
                      onChange={(e) => setSocialSettings({ ...socialSettings, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={socialSettings.linkedin}
                      onChange={(e) => setSocialSettings({ ...socialSettings, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={socialSettings.instagram}
                      onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={socialSettings.youtube}
                      onChange={(e) => setSocialSettings({ ...socialSettings, youtube: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Social')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email templates and SMTP settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Email configuration is managed through Lovable Cloud. 
                    Contact support for custom email template changes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Email Templates</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Welcome Email</p>
                        <p className="text-sm text-muted-foreground">Sent to new subscribers</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Newsletter</p>
                        <p className="text-sm text-muted-foreground">Weekly digest template</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Password Reset</p>
                        <p className="text-sm text-muted-foreground">Account recovery email</p>
                      </div>
                      <Button variant="outline" size="sm">Preview</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Subscriber</p>
                      <p className="text-sm text-muted-foreground">Get notified when someone subscribes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNewSubscriber}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNewSubscriber: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Comment</p>
                      <p className="text-sm text-muted-foreground">Get notified on new article comments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNewComment}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailNewComment: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics summary</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailWeeklyReport}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, emailWeeklyReport: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Browser Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({ ...notificationSettings, browserNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Notification')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keepalive">
            <KeepAliveSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
