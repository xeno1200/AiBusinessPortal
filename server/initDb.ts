import { db } from './db';
import { users, contentItems, siteSettings } from '@shared/schema';
import * as bcrypt from 'bcrypt';

/**
 * Initialize the database with default admin user and default settings
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create default admin user if no users exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@iobic.com',
        password: hashedPassword,
        fullName: 'Administrator',
        isAdmin: true
      });
      
      console.log('Default admin user created.');
    } else {
      console.log('Users already exist, skipping admin user creation.');
    }
    
    // Add default site settings if they don't exist
    const existingSettings = await db.select().from(siteSettings);
    
    if (existingSettings.length === 0) {
      console.log('Creating default site settings...');
      
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
      
      for (const setting of defaultSettings) {
        await db.insert(siteSettings).values({
          ...setting,
          isSystem: true
        });
      }
      
      console.log('Default site settings created.');
    } else {
      console.log('Settings already exist, skipping default settings creation.');
    }
    
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if this file is executed directly
// For ESM compatibility
if (import.meta.url === import.meta.resolve('./initDb.ts')) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;