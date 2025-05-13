import { 
  users, type User, type InsertUser,
  contacts, type Contact, type InsertContact,
  newsletterSubscriptions, type NewsletterSubscription, type InsertNewsletterSubscription
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact methods
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Newsletter methods
  getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private userCurrentId: number;
  private contactCurrentId: number;
  private subscriptionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.newsletterSubscriptions = new Map();
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.subscriptionCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactCurrentId++;
    const createdAt = new Date().toISOString();
    const contact: Contact = { ...insertContact, id, createdAt };
    this.contacts.set(id, contact);
    return contact;
  }
  
  // Newsletter methods
  async getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined> {
    return this.newsletterSubscriptions.get(id);
  }
  
  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    return Array.from(this.newsletterSubscriptions.values()).find(
      (subscription) => subscription.email === email,
    );
  }
  
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existingSubscription = await this.getNewsletterSubscriptionByEmail(insertSubscription.email);
    if (existingSubscription) {
      return existingSubscription; // Return existing subscription instead of creating a duplicate
    }
    
    const id = this.subscriptionCurrentId++;
    const createdAt = new Date().toISOString();
    const subscription: NewsletterSubscription = { ...insertSubscription, id, createdAt };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }
}

export const storage = new MemStorage();
