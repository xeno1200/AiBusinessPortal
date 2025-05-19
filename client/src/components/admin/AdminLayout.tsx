import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { AuthResponse } from '@/types/admin';

import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Authentication check
  const { data: userData, isLoading } = useQuery<AuthResponse>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !userData?.authenticated) {
      setLocation('/admin/login');
    }
  }, [userData, isLoading, setLocation]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setLocation('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin',
      active: location === '/admin'
    },
    {
      title: 'Content',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/content',
      active: location.startsWith('/admin/content')
    },
    {
      title: 'Media',
      icon: <ImageIcon className="h-5 w-5" />,
      href: '/admin/media',
      active: location.startsWith('/admin/media')
    },
    {
      title: 'Contacts',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/admin/contacts',
      active: location.startsWith('/admin/contacts')
    },
    {
      title: 'Newsletter',
      icon: <Mail className="h-5 w-5" />,
      href: '/admin/newsletter',
      active: location.startsWith('/admin/newsletter')
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/settings',
      active: location.startsWith('/admin/settings')
    }
  ];
  
  // If not authenticated or still loading, show placeholder
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!userData?.authenticated) {
    return null; // Will be redirected to login
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden bg-white p-4 shadow flex justify-between items-center">
        <div className="text-xl font-bold">TALQIO Admin</div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16">
          <div className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={item.active ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setLocation(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="bg-gray-800 text-white flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <div className="text-xl font-bold">TALQIO Admin</div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "justify-start text-left text-white hover:bg-gray-700 hover:text-white",
                  item.active && "bg-gray-700"
                )}
                onClick={() => setLocation(item.href)}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Button>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">{userData?.user?.fullName || userData?.user?.username}</h3>
                <p className="text-xs text-gray-400">{userData?.user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="md:ml-64 flex-1">
        <div className="p-6">
          {children}
        </div>
      </main>
      
      {/* Toast container */}
      <Toaster />
    </div>
  );
}