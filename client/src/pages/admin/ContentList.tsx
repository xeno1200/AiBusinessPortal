import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AuthResponse, ContentItem } from '@/types/admin';

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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Plus,
  Edit,
  Trash,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Helper function to get title for content type
const getContentTypeTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'hero': 'Hero Section',
    'feature': 'Features',
    'use_case': 'Use Cases',
    'pricing_plan': 'Pricing Plans',
    'testimonial': 'Testimonials',
    'setting': 'Settings'
  };
  return titles[type] || type;
};

export default function ContentList() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  // Authentication check
  const { data: userData, isLoading: isAuthLoading } = useQuery<AuthResponse>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !userData?.authenticated) {
      setLocation('/admin/login');
    }
  }, [userData, isAuthLoading, setLocation]);

  // Fetch all content items
  const { data: contentItems, isLoading: isContentLoading, refetch } = useQuery<ContentItem[]>({
    queryKey: ['/api/cms/content'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });
  
  // Filter content items based on selected filters
  const filteredItems = contentItems?.filter(item => {
    // Filter by language
    if (selectedLanguage !== 'all' && item.language !== selectedLanguage) {
      return false;
    }
    
    // Filter by type
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle content deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cms/content/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: 'Content Deleted',
          description: 'The content item has been successfully deleted.',
        });
        refetch();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete the content item.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the content.',
        variant: 'destructive'
      });
    }
  };

  // Handle toggling content active state
  const handleToggleActive = async (id: number, currentState: boolean) => {
    try {
      const response = await fetch(`/api/cms/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentState }),
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: 'Status Updated',
          description: `Content is now ${!currentState ? 'active' : 'inactive'}.`,
        });
        refetch();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update content status.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while updating content status.',
        variant: 'destructive'
      });
    }
  };

  // If loading, show loading indicator
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, render nothing (will be redirected)
  if (!userData?.authenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Content Management - IOBIC Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {selectedType !== 'all' ? getContentTypeTitle(selectedType) : 'All Content'}
          </h1>
          <Button onClick={() => setLocation('/admin/content/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Content
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Filters</CardTitle>
            <CardDescription>
              Filter and search through your content items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select 
                  value={selectedType} 
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="feature">Features</SelectItem>
                    <SelectItem value="use_case">Use Cases</SelectItem>
                    <SelectItem value="pricing_plan">Pricing Plans</SelectItem>
                    <SelectItem value="testimonial">Testimonials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Language</label>
                <Select 
                  value={selectedLanguage} 
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bg">Bulgarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isContentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems && filteredItems.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getContentTypeTitle(item.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="uppercase">
                      {item.language}
                    </TableCell>
                    <TableCell>{item.position}</TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          <XCircle className="mr-1 h-4 w-4" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLocation(`/admin/content/edit/${item.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(item.id, item.isActive)}>
                            {item.isActive ? 
                              <><XCircle className="mr-2 h-4 w-4" />Deactivate</> : 
                              <><CheckCircle className="mr-2 h-4 w-4" />Activate</>
                            }
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md border">
            <p className="text-muted-foreground">No content items found.</p>
            {searchTerm || selectedType !== 'all' || selectedLanguage !== 'all' ? (
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLanguage('all');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button 
                className="mt-2" 
                onClick={() => setLocation('/admin/content/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Content
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}