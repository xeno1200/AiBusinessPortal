import { db } from './db';
import { users, contentItems, siteSettings } from '@shared/schema';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

/**
 * Initialize the database with default admin user and default settings
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create default admin user if no admin users exist
    const defaultUsername = 'admin';
    const existingAdmin = await db.select().from(users).where(eq(users.username, defaultUsername)).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log('Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Check if email exists
      const adminEmail = 'admin@iobic.com';
      const existingEmail = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
      
      if (existingEmail.length === 0) {
        await db.insert(users).values({
          username: defaultUsername,
          email: adminEmail,
          password: hashedPassword,
          fullName: 'Administrator',
          isAdmin: true
        });
        
        console.log('Default admin user created.');
      } else {
        console.log(`Admin email ${adminEmail} already exists, skipping admin user creation.`);
      }
    } else {
      console.log('Admin user already exists, skipping admin user creation.');
    }
    
    // Add default site settings if they don't exist
    // We'll check each setting individually
    console.log('Checking default site settings...');
    
    // Core settings
    const defaultSettings = [
      {
        key: 'site_title',
        value: 'IOBIC - AI Phone Agent',
        description: 'Website title'
      },
      {
        key: 'site_description',
        value: 'AI Phone Agent for Small Businesses',
        description: 'Website meta description'
      },
      {
        key: 'contact_email',
        value: 'contact@iobic.com',
        description: 'Contact email address'
      },
      {
        key: 'contact_phone',
        value: '+359 888 123 456',
        description: 'Contact phone number'
      },
      {
        key: 'facebook_url',
        value: 'https://facebook.com/iobic',
        description: 'Facebook page URL'
      },
      {
        key: 'instagram_url',
        value: 'https://instagram.com/iobic',
        description: 'Instagram profile URL'
      },
      {
        key: 'default_language',
        value: 'bg',
        description: 'Default website language'
      }
    ];
    
    // Create settings that don't exist
    for (const setting of defaultSettings) {
      const existingSetting = await db.select()
        .from(siteSettings)
        .where(eq(siteSettings.key, setting.key))
        .limit(1);
        
      if (existingSetting.length === 0) {
        console.log(`Creating setting: ${setting.key}`);
        await db.insert(siteSettings).values({
          ...setting,
          isSystem: true
        });
      } else {
        console.log(`Setting ${setting.key} already exists, skipping.`);
      }
    }
      
    console.log('Default site settings setup completed.');
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// We don't need to run auto-initialization here
// This file is only imported in routes.ts

export default initializeDatabase;