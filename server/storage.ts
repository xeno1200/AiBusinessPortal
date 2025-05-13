import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  newsletterSubscriptions, type NewsletterSubscription, type InsertNewsletterSubscription,
  contentItems, type ContentItem, type InsertContentItem, type ContentType,
  media, type Media, type InsertMedia,
  siteSettings, type SiteSetting, type InsertSiteSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Contact methods
  getContact(id: number): Promise<Contact | undefined>;
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined>;
  
  // Newsletter methods
  getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // CMS Content methods
  getContentItem(id: number): Promise<ContentItem | undefined>;
  getContentItemsByType(type: ContentType, language?: string): Promise<ContentItem[]>;
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, data: Partial<InsertContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: number): Promise<boolean>;
  
  // Media methods
  getMedia(id: number): Promise<Media | undefined>;
  getMediaByContentItemId(contentItemId: number): Promise<Media[]>;
  createMedia(mediaItem: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Site settings methods
  getSiteSetting(id: number): Promise<SiteSetting | undefined>;
  getSiteSettingByKey(key: string): Promise<SiteSetting | undefined>;
  getSiteSettings(): Promise<SiteSetting[]>;
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(id: number, data: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db.insert(users)
      .values({...insertUser, password: hashedPassword})
      .returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    // If password is included, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    const [user] = await db.update(users)
      .set({...data, updatedAt: new Date()})
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(contacts.createdAt);
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }
  
  async updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }
  
  // Newsletter methods
  async getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.id, id));
    return subscription;
  }
  
  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db.select().from(newsletterSubscriptions).orderBy(newsletterSubscriptions.createdAt);
  }
  
  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db.select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return subscription;
  }
  
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existingSubscription = await this.getNewsletterSubscriptionByEmail(insertSubscription.email);
    if (existingSubscription) {
      return existingSubscription; // Return existing subscription instead of creating a duplicate
    }
    
    const [subscription] = await db.insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }
  
  // CMS Content methods
  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item;
  }
  
  async getContentItemsByType(type: ContentType, language: string = "en"): Promise<ContentItem[]> {
    return await db.select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.type, type),
          eq(contentItems.language, language),
          eq(contentItems.isActive, true)
        )
      )
      .orderBy(contentItems.position);
  }
  
  async createContentItem(insertItem: InsertContentItem): Promise<ContentItem> {
    const [item] = await db.insert(contentItems)
      .values({...insertItem, updatedAt: new Date()})
      .returning();
    return item;
  }
  
  async updateContentItem(id: number, data: Partial<InsertContentItem>): Promise<ContentItem | undefined> {
    const [item] = await db.update(contentItems)
      .set({...data, updatedAt: new Date()})
      .where(eq(contentItems.id, id))
      .returning();
    return item;
  }
  
  async deleteContentItem(id: number): Promise<boolean> {
    const result = await db.delete(contentItems)
      .where(eq(contentItems.id, id));
    return true; // Assuming successful if no error is thrown
  }
  
  // Media methods
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }
  
  async getMediaByContentItemId(contentItemId: number): Promise<Media[]> {
    return await db.select()
      .from(media)
      .where(eq(media.contentItemId, contentItemId))
      .orderBy(media.createdAt);
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db.insert(media)
      .values(insertMedia)
      .returning();
    return mediaItem;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    await db.delete(media).where(eq(media.id, id));
    return true; // Assuming successful if no error is thrown
  }
  
  // Site settings methods
  async getSiteSetting(id: number): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.id, id));
    return setting;
  }
  
  async getSiteSettingByKey(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    return setting;
  }
  
  async getSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(siteSettings.key);
  }
  
  async createSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db.insert(siteSettings)
      .values({...insertSetting, updatedAt: new Date()})
      .returning();
    return setting;
  }
  
  async updateSiteSetting(id: number, data: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const [setting] = await db.update(siteSettings)
      .set({...data, updatedAt: new Date()})
      .where(eq(siteSettings.id, id))
      .returning();
    return setting;
  }
}

// Export a DatabaseStorage instance
export const storage = new DatabaseStorage();
