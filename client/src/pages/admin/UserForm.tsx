import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, User } from 'lucide-react';

type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

const userSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userId = params.id ? parseInt(params.id) : null;
  const isEditing = Boolean(userId);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      isAdmin: false,
    },
  });

  // Fetch user data if editing
  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/cms/users/${userId}`],
    queryFn: getQueryFn(),
    enabled: isEditing,
  });

  // Populate form when user data is loaded
  useEffect(() => {
    if (user && isEditing) {
      form.reset({
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        password: '', // Don't populate password
        isAdmin: user.is_admin,
      });
    }
  }, [user, isEditing, form]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => 
      apiRequest('/api/cms/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/users'] });
      toast({
        title: "User created",
        description: "The user has been successfully created.",
      });
      setLocation('/admin/users');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserFormData) => 
      apiRequest(`/api/cms/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms/users'] });
      queryClient.invalidateQueries({ queryKey: [`/api/cms/users/${userId}`] });
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
      setLocation('/admin/users');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    // For editing, only include password if it's provided
    if (isEditing && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      if (userId) {
        updateUserMutation.mutate(dataWithoutPassword as UserFormData);
      }
    } else if (isEditing) {
      updateUserMutation.mutate(data);
    } else {
      // For creating, password is required
      if (!data.password) {
        form.setError('password', { message: 'Password is required for new users' });
        return;
      }
      createUserMutation.mutate(data);
    }
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>{isEditing ? 'Edit User' : 'Add User'} - Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/admin/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isEditing ? <User className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
              {isEditing ? 'Edit User' : 'Add User'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update user information and permissions' : 'Create a new user account'}
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit User' : 'Create New User'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Update the user information below. Leave password empty to keep current password.'
                : 'Fill in the information below to create a new user account.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be at least 3 characters long and unique
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password {isEditing && <span className="text-sm text-gray-500">(optional)</span>}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={isEditing ? "Leave empty to keep current password" : "Enter password"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {isEditing 
                          ? "Leave empty to keep the current password" 
                          : "Must be at least 6 characters long"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Administrator
                        </FormLabel>
                        <FormDescription>
                          Grant administrator privileges to this user. Admins can manage users, content, and settings.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending
                      ? 'Saving...'
                      : isEditing 
                        ? 'Update User' 
                        : 'Create User'
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/users')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}