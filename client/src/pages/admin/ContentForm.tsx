import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Helmet } from 'react-helmet';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { AuthResponse, ContentItem } from '@/types/admin';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Trash, 
  Plus, 
  X,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

// Base schema for all content types
const baseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['hero', 'feature', 'use_case', 'pricing_plan', 'testimonial']),
  language: z.enum(['en', 'bg']),
  position: z.coerce.number().int().min(0, 'Position must be a non-negative integer'),
  isActive: z.boolean().default(true),
});

// Hero content schema
const heroSchema = baseSchema.extend({
  type: z.literal('hero'),
  content: z.object({
    title: z.string().min(1, 'Hero title is required'),
    subtitle: z.string().min(1, 'Hero subtitle is required'),
    cta: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().min(1, 'CTA URL is required'),
    }),
    image: z.string().optional(),
  }),
});

// Feature content schema
const featureSchema = baseSchema.extend({
  type: z.literal('feature'),
  content: z.object({
    title: z.string().min(1, 'Feature title is required'),
    description: z.string().min(1, 'Feature description is required'),
    icon: z.string().optional(),
    image: z.string().optional(),
  }),
});

// Use case content schema
const useCaseSchema = baseSchema.extend({
  type: z.literal('use_case'),
  content: z.object({
    title: z.string().min(1, 'Use case title is required'),
    description: z.string().min(1, 'Use case description is required'),
    industry: z.string().min(1, 'Industry is required'),
    benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
    image: z.string().optional(),
  }),
});

// Pricing plan content schema
const pricingPlanSchema = baseSchema.extend({
  type: z.literal('pricing_plan'),
  content: z.object({
    title: z.string().min(1, 'Pricing plan title is required'),
    price: z.string().min(1, 'Price is required'),
    period: z.string().min(1, 'Billing period is required'),
    description: z.string().min(1, 'Pricing plan description is required'),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    isPopular: z.boolean().default(false),
    cta: z.object({
      text: z.string().min(1, 'CTA text is required'),
      url: z.string().min(1, 'CTA URL is required'),
    }),
  }),
});

// Testimonial content schema
const testimonialSchema = baseSchema.extend({
  type: z.literal('testimonial'),
  content: z.object({
    quote: z.string().min(1, 'Quote is required'),
    author: z.string().min(1, 'Author name is required'),
    role: z.string().min(1, 'Author role is required'),
    company: z.string().min(1, 'Company name is required'),
    image: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
});

// Union of all content schemas
const contentSchema = z.discriminatedUnion('type', [
  heroSchema,
  featureSchema,
  useCaseSchema,
  pricingPlanSchema,
  testimonialSchema,
]);

type ContentFormValues = z.infer<typeof contentSchema>;

export default function ContentForm() {
  const [, params] = useRoute<{ id?: string }>('/admin/content/edit/:id');
  const [isNewRoute] = useRoute('/admin/content/new');
  const [, setLocation] = useLocation();
  const isEditing = !!params?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contentType, setContentType] = useState<string>('hero');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [newBenefit, setNewBenefit] = useState<string>('');
  const [newFeature, setNewFeature] = useState<string>('');

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

  // Fetch content item if editing
  const { data: contentItem, isLoading: isContentLoading } = useQuery<ContentItem>({
    queryKey: ['/api/cms/content/item', params?.id],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: isEditing && !!params?.id,
  });

  // Set form default values when editing
  useEffect(() => {
    if (contentItem && isEditing) {
      setContentType(contentItem.type);
      setSelectedLanguage(contentItem.language);
      
      // Parse string content if needed
      const contentData = typeof contentItem.content === 'string' 
        ? JSON.parse(contentItem.content) 
        : contentItem.content;
      
      const defaultValues = {
        title: contentItem.title,
        type: contentItem.type,
        language: contentItem.language,
        position: contentItem.position,
        isActive: contentItem.isActive,
        content: contentData,
      };
      
      form.reset(defaultValues as any);
    }
  }, [contentItem, isEditing]);

  // Handle form
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      type: 'hero' as const,
      language: 'en',
      position: 0,
      isActive: true,
      content: {
        title: '',
        subtitle: '',
        cta: {
          text: '',
          url: '',
        },
      } as any,
    },
  });

  // Update form when content type changes
  useEffect(() => {
    const currentValues = form.getValues();
    const newContent: any = {};
    
    // Set default values based on content type
    if (contentType === 'hero') {
      newContent.title = currentValues.content?.title || '';
      newContent.subtitle = currentValues.content?.subtitle || '';
      newContent.cta = {
        text: currentValues.content?.cta?.text || '',
        url: currentValues.content?.cta?.url || '',
      };
      newContent.image = currentValues.content?.image || '';
    } else if (contentType === 'feature') {
      newContent.title = currentValues.content?.title || '';
      newContent.description = currentValues.content?.description || '';
      newContent.icon = currentValues.content?.icon || '';
      newContent.image = currentValues.content?.image || '';
    } else if (contentType === 'use_case') {
      newContent.title = currentValues.content?.title || '';
      newContent.description = currentValues.content?.description || '';
      newContent.industry = currentValues.content?.industry || '';
      newContent.benefits = currentValues.content?.benefits || [];
      newContent.image = currentValues.content?.image || '';
    } else if (contentType === 'pricing_plan') {
      newContent.title = currentValues.content?.title || '';
      newContent.price = currentValues.content?.price || '';
      newContent.period = currentValues.content?.period || '';
      newContent.description = currentValues.content?.description || '';
      newContent.features = currentValues.content?.features || [];
      newContent.isPopular = currentValues.content?.isPopular || false;
      newContent.cta = {
        text: currentValues.content?.cta?.text || '',
        url: currentValues.content?.cta?.url || '',
      };
    } else if (contentType === 'testimonial') {
      newContent.quote = currentValues.content?.quote || '';
      newContent.author = currentValues.content?.author || '';
      newContent.role = currentValues.content?.role || '';
      newContent.company = currentValues.content?.company || '';
      newContent.image = currentValues.content?.image || '';
      newContent.rating = currentValues.content?.rating || 5;
    }
    
    form.setValue('type', contentType as any);
    form.setValue('content', newContent as any);
  }, [contentType, form]);

  // Update language field when language is changed
  useEffect(() => {
    form.setValue('language', selectedLanguage as any);
  }, [selectedLanguage, form]);

  // Add benefit to use case
  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    
    const currentBenefits = form.getValues().content?.benefits || [];
    form.setValue('content.benefits', [...currentBenefits, newBenefit.trim()] as any);
    setNewBenefit('');
  };

  // Remove benefit from use case
  const removeBenefit = (index: number) => {
    const currentBenefits = form.getValues().content?.benefits || [];
    form.setValue('content.benefits', currentBenefits.filter((_, i) => i !== index) as any);
  };

  // Add feature to pricing plan
  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    const currentFeatures = form.getValues().content?.features || [];
    form.setValue('content.features', [...currentFeatures, newFeature.trim()] as any);
    setNewFeature('');
  };

  // Remove feature from pricing plan
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues().content?.features || [];
    form.setValue('content.features', currentFeatures.filter((_, i) => i !== index) as any);
  };

  // Save content mutation
  const contentMutation = useMutation({
    mutationFn: async (data: ContentFormValues) => {
      if (isEditing && params?.id) {
        return apiRequest(`/api/cms/content/${params.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest('/api/cms/content', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Content ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cms/content'] });
      setLocation('/admin/content');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} content: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ContentFormValues) => {
    contentMutation.mutate(data);
  };

  // If loading, show loading indicator
  if (isAuthLoading || (isEditing && isContentLoading)) {
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
        <title>
          {isEditing ? 'Edit Content' : 'Add Content'} - IOBIC Admin
        </title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setLocation('/admin/content')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Content' : 'Add New Content'}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin/content')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={contentMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {contentMutation.isPending ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Content Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Configure the type, title, and other basic details of this content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Administrative Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Internal title for this content" />
                            </FormControl>
                            <FormDescription>
                              This title is for administrative purposes only and won't be displayed on the website.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select
                              value={contentType}
                              onValueChange={(value) => {
                                setContentType(value);
                                field.onChange(value);
                              }}
                              disabled={isEditing}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hero">Hero Section</SelectItem>
                                <SelectItem value="feature">Feature</SelectItem>
                                <SelectItem value="use_case">Use Case</SelectItem>
                                <SelectItem value="pricing_plan">Pricing Plan</SelectItem>
                                <SelectItem value="testimonial">Testimonial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {isEditing ? "Content type cannot be changed once created." : "Select the type of content you're creating."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select
                              value={selectedLanguage}
                              onValueChange={(value) => {
                                setSelectedLanguage(value);
                                field.onChange(value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="bg">Bulgarian</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The language of this content.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Lower numbers appear first.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>
                              <FormDescription>
                                Enable to show on website.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Content Details Tab */}
              <TabsContent value="content" className="space-y-6 pt-4">
                {/* Hero Content */}
                {contentType === 'hero' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section Content</CardTitle>
                      <CardDescription>
                        Configure the main hero section that appears at the top of the homepage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hero Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Main headline of the hero section" />
                            </FormControl>
                            <FormDescription>
                              The main headline that appears in the hero section.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hero Subtitle</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Subheadline or description text" 
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Supporting text that appears under the main headline.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="content.cta.text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Get Started" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content.cta.url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Button URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="#contact" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Feature Content */}
                {contentType === 'feature' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Content</CardTitle>
                      <CardDescription>
                        Configure a feature that highlights a benefit of your service
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feature Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="24/7 Virtual Reception" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feature Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Detailed description of this feature" 
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feature Icon</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Icon name (e.g., 'phone-call') or SVG code" 
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a Lucide icon name or SVG markup for the feature icon.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Use Case Content */}
                {contentType === 'use_case' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Use Case Content</CardTitle>
                      <CardDescription>
                        Define a specific industry use case for the AI phone agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Use Case Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="For Hair Salons" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Use Case Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Detailed description of how the service works for this industry" 
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Hair Salon, Hotel, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <FormLabel>Benefits</FormLabel>
                        <FormDescription>
                          List the benefits of using the service for this specific use case
                        </FormDescription>
                        
                        <div className="flex items-center mt-2 mb-4">
                          <Input
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            placeholder="Add a benefit"
                            className="flex-1 mr-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addBenefit();
                              }
                            }}
                          />
                          <Button type="button" onClick={addBenefit}>
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {form.watch('content.benefits')?.map((benefit, index) => (
                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                              <span className="flex-1">{benefit}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBenefit(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!form.watch('content.benefits') || form.watch('content.benefits').length === 0) && (
                            <div className="text-sm text-muted-foreground italic">
                              No benefits added yet.
                            </div>
                          )}
                        </div>
                        {form.formState.errors.content?.benefits && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.content?.benefits.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Pricing Plan Content */}
                {contentType === 'pricing_plan' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Plan Content</CardTitle>
                      <CardDescription>
                        Configure a pricing plan with features and subscription details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="content.title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plan Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Basic, Pro, Enterprise, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content.isPopular"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Highlight as Popular
                                </FormLabel>
                                <FormDescription>
                                  Add a special highlight to this plan.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="content.price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="€29, Contact Us, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content.period"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Period</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="monthly, yearly, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="content.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Brief description of this pricing plan" 
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="content.cta.text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Button Text</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Get Started, Sign Up, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content.cta.url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CTA Button URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="#contact" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Plan Features</FormLabel>
                        <FormDescription>
                          List the features included in this pricing plan
                        </FormDescription>
                        
                        <div className="flex items-center mt-2 mb-4">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a feature"
                            className="flex-1 mr-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addFeature();
                              }
                            }}
                          />
                          <Button type="button" onClick={addFeature}>
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {form.watch('content.features')?.map((feature, index) => (
                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                              <span className="flex-1">{feature}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFeature(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!form.watch('content.features') || form.watch('content.features').length === 0) && (
                            <div className="text-sm text-muted-foreground italic">
                              No features added yet.
                            </div>
                          )}
                        </div>
                        {form.formState.errors.content?.features && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.content?.features.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Testimonial Content */}
                {contentType === 'testimonial' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Testimonial Content</CardTitle>
                      <CardDescription>
                        Configure a customer testimonial to showcase positive feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content.quote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial Quote</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="The customer's testimonial text" 
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="content.author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content.role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author Role</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="CEO, Owner, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="content.company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Company name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content.rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-5)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="5" 
                                step="1"
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: Rating out of 5 stars
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Media</CardTitle>
                    <CardDescription>
                      Add images or other media files to your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Image upload functionality will be implemented in the future. For now, you can reference images by URL or path.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="content.image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL or Path</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="/images/sample.jpg" />
                          </FormControl>
                          <FormDescription>
                            Enter the URL or path to an image file.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium mb-1">Image upload coming soon</p>
                        <p className="text-xs text-muted-foreground">
                          You'll be able to upload images directly from this interface
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/admin/content')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={contentMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {contentMutation.isPending ? 'Saving...' : 'Save Content'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </AdminLayout>
  );
}