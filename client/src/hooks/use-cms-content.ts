import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ContentItem, ContentType } from '@shared/schema';
import { getContentByType, createFallbackContent, getSiteSettings } from '@/lib/cmsService';

/**
 * Custom hook to fetch CMS content with fallback
 */
export function useCmsContent(contentType: ContentType) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cms/content', contentType, currentLanguage],
    queryFn: () => getContentByType(contentType, currentLanguage),
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Provide fallback content if no data or error
  const contentItems: ContentItem[] = data && data.length > 0 && !error
    ? data
    : [createFallbackContent(contentType, currentLanguage)];
  
  return {
    contentItems,
    isLoading,
    error
  };
}

/**
 * Custom hook to fetch site settings
 */
export function useSiteSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cms/settings'],
    queryFn: async () => {
      try {
        const settings = await getSiteSettings();
        return settings;
      } catch (error) {
        console.error('Error fetching site settings:', error);
        return {
          site_title: 'IOBIC',
          site_description: 'AI Phone Agent for businesses',
          contact_email: 'contact@iobic.com',
          contact_phone: '+1 555-123-4567',
          facebook_url: 'https://facebook.com',
          instagram_url: 'https://instagram.com',
          default_language: 'en'
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    settings: data || {
      site_title: 'IOBIC',
      site_description: 'AI Phone Agent for businesses',
      contact_email: 'contact@iobic.com',
      contact_phone: '+1 555-123-4567',
      facebook_url: 'https://facebook.com',
      instagram_url: 'https://instagram.com',
      default_language: 'en'
    },
    isLoading,
    error
  };
}