import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { getQueryFn } from '@/lib/queryClient';
import { AuthResponse } from '@/types/admin';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  PhoneCall, 
  Mail, 
  FileText, 
  Users,
  Settings, 
  Layout, 
  Image 
} from 'lucide-react';

type DashboardStats = {
  contacts: number;
  newsletterSubscriptions: number;
  contentItems: number;
  users: number;
  media: number;
  settings: number;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // Use a query to fetch the current user
  const { data: userData, isLoading, isError } = useQuery<AuthResponse>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !userData?.authenticated) {
      setLocation('/admin/login');
    }
  }, [userData, isLoading, setLocation]);
  
  // Example stats - in a real implementation these would come from the server
  const [stats] = useState<DashboardStats>({
    contacts: 12,
    newsletterSubscriptions: 56,
    contentItems: 23,
    users: 2,
    media: 8,
    settings: 15
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, render nothing (will be redirected)
  if (isError || !userData?.authenticated) {
    return null;
  }
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard - TALQIO</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div>
            <Button onClick={() => setLocation('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Site Settings
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacts}</div>
              <p className="text-xs text-muted-foreground">
                Customer inquiries
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/admin/contacts')}
              >
                View Contacts
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Newsletter Subscriptions</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newsletterSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                Email subscribers
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/admin/newsletters')}
              >
                View Subscribers
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Content Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contentItems}</div>
              <p className="text-xs text-muted-foreground">
                Website content blocks
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/admin/content')}
              >
                Manage Content
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">
                System users
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/admin/users')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Media Files</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.media}</div>
              <p className="text-xs text-muted-foreground">
                Images and documents
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setLocation('/admin/media')}
              >
                Media Library
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Website Preview</CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                View the current state of the website
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => window.open('/', '_blank')}
              >
                Open Website
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" onClick={() => setLocation('/admin/content/new')}>
              <FileText className="mr-2 h-4 w-4" />
              Add Content Item
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/users/new')}>
              <Users className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/media/upload')}>
              <Image className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
            <Button variant="outline" onClick={() => setLocation('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Site Settings
            </Button>
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              <Layout className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}