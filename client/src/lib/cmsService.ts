import { ContentItem, ContentType } from '@shared/schema';

/**
 * Get all content items of a specific type and language
 */
export async function getContentByType(
  type: ContentType,
  language: string = 'en'
): Promise<ContentItem[]> {
  try {
    const response = await fetch(`/api/cms/content/${type}?language=${language}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} content`);
    }
    const items = await response.json();
    return items || [];
  } catch (error) {
    console.error(`Error fetching ${type} content:`, error);
    return [];
  }
}

/**
 * Get a single content item by ID
 */
export async function getContentById(id: number): Promise<ContentItem | null> {
  try {
    const response = await fetch(`/api/cms/content/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch content item ${id}`);
    }
    const item = await response.json();
    return item;
  } catch (error) {
    console.error(`Error fetching content item ${id}:`, error);
    return null;
  }
}

/**
 * Get all site settings
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/cms/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    const settings = await response.json();
    
    // Convert settings array to key-value object
    const settingsObject: Record<string, string> = {};
    if (settings) {
      settings.forEach((setting: {key: string, value: string}) => {
        settingsObject[setting.key] = setting.value;
      });
    }
    
    return settingsObject;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }
}

/**
 * Create fallback content with default values when DB content isn't available
 */
export function createFallbackContent(type: ContentType, language: string = 'en'): ContentItem {
  // Base content structure
  const baseContent: Partial<ContentItem> = {
    id: 0,
    title: 'IOBIC AI Phone Agent',
    type,
    language,
    position: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add type-specific content
  let content: any = {};
  
  switch (type) {
    case 'hero':
      content = {
        title: language === 'bg' ? 'TALQIO AI Телефонен Агент' : 'TALQIO AI Phone Agent',
        subtitle: language === 'bg' ? 'Никога повече пропуснато обаждане' : 'Never miss a call again',
        cta: {
          text: language === 'bg' ? 'Свържете се с нас' : 'Contact Us',
          url: '#contact'
        }
      };
      break;
    
    case 'feature':
      content = {
        title: language === 'bg' ? 'Автоматизирани Отговори' : 'Automated Responses',
        description: language === 'bg' 
          ? 'Нашият AI телефонен агент отговаря на обажданията от ваше име 24/7'
          : 'Our AI phone agent answers calls on your behalf 24/7',
        icon: 'PhoneCall'
      };
      break;
    
    case 'use_case':
      content = {
        title: language === 'bg' ? 'Фризьорски салон' : 'Hair Salon',
        description: language === 'bg'
          ? 'Оптимизирайте записването на часове и отговаряйте на въпроси'
          : 'Streamline appointment booking and answer inquiries',
        industry: language === 'bg' ? 'Салони за красота' : 'Beauty Salons',
        benefits: language === 'bg'
          ? ['Автоматично записване', 'Информация за услуги', 'Напомняния за часове']
          : ['Automated booking', 'Service information', 'Appointment reminders']
      };
      break;
    
    case 'pricing_plan':
      content = {
        title: language === 'bg' ? 'Стандартен' : 'Standard',
        price: '49',
        period: language === 'bg' ? 'месечно' : 'monthly',
        description: language === 'bg'
          ? 'Идеален за малки бизнеси'
          : 'Perfect for small businesses',
        features: language === 'bg'
          ? ['Неограничени обаждания', 'Базови интеграции', 'Email поддръжка']
          : ['Unlimited calls', 'Basic integrations', 'Email support'],
        isPopular: false,
        cta: {
          text: language === 'bg' ? 'Започнете сега' : 'Get Started',
          url: '#contact'
        }
      };
      break;
    
    case 'testimonial':
      content = {
        quote: language === 'bg'
          ? 'IOBIC промени начина, по който управлявам салона си. Никога не пропускам обаждане!'
          : 'IOBIC changed the way I run my salon. I never miss a call anymore!',
        author: language === 'bg' ? 'Мария Иванова' : 'Maria Johnson',
        role: language === 'bg' ? 'Собственик' : 'Owner',
        company: language === 'bg' ? 'Салон Красота' : 'Beauty Salon',
        rating: 5
      };
      break;
    
    default:
      break;
  }
  
  return {
    ...baseContent,
    content
  } as ContentItem;
}