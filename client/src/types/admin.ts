// Authentication types
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}

// CMS content types
export type ContentType = 'hero' | 'feature' | 'use_case' | 'pricing_plan' | 'testimonial' | 'setting';

export interface ContentItem {
  id: number;
  title: string;
  type: ContentType;
  content: any; // JSON content will vary by type
  language: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  contentItemId?: number;
  createdAt: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  businessType?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  createdAt: string;
}

// Hero section content structure
export interface HeroContent {
  title: string;
  subtitle: string;
  cta: {
    text: string;
    url: string;
  };
  image?: string;
}

// Feature content structure
export interface FeatureContent {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

// Use case content structure
export interface UseCaseContent {
  title: string;
  description: string;
  industry: string;
  benefits: string[];
  image?: string;
}

// Pricing plan content structure
export interface PricingPlanContent {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  cta: {
    text: string;
    url: string;
  };
}

// Testimonial content structure
export interface TestimonialContent {
  quote: string;
  author: string;
  role: string;
  company: string;
  image?: string;
  rating?: number;
}