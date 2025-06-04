import express, { Request, Response } from 'express';
import { storage as dbStorage } from './storage';
import { requireAuth, requireAdmin } from './auth';
import { insertContentItemSchema, insertMediaSchema, insertSiteSettingSchema, ContentType } from '@shared/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ 
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and common document types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerCmsRoutes(app: express.Express): void {
  const cmsRouter = express.Router();

  // Content Items Routes
  
  // Get single content item by ID - this needs to come BEFORE the more general route
  cmsRouter.get('/content/item/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const item = await dbStorage.getContentItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Content item not found' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Error fetching content item:', error);
      res.status(500).json({ error: 'Failed to fetch content item' });
    }
  });
  
  // Get all content items by type and language
  cmsRouter.get('/content/:type', async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const language = req.query.language as string || 'en';
      
      // Skip if the type is 'item' as it's handled by the route above
      if (type === 'item') {
        return res.status(400).json({ error: 'Use /content/item/:id for item retrieval' });
      }
      
      // Validate type
      const validTypes = ['hero', 'feature', 'use_case', 'pricing_plan', 'testimonial', 'setting'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid content type' });
      }
      
      const items = await dbStorage.getContentItemsByType(type as ContentType, language);
      res.json(items);
    } catch (error) {
      console.error('Error fetching content items:', error);
      res.status(500).json({ error: 'Failed to fetch content items' });
    }
  });
  
  // Create content item (admin only)
  cmsRouter.post('/content', requireAdmin, async (req: Request, res: Response) => {
    try {
      const validationResult = insertContentItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid content item data',
          details: validationResult.error.errors 
        });
      }
      
      const newItem = await dbStorage.createContentItem(validationResult.data);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating content item:', error);
      res.status(500).json({ error: 'Failed to create content item' });
    }
  });
  
  // Update content item (admin only)
  cmsRouter.put('/content/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      // Find the item first
      const existingItem = await dbStorage.getContentItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: 'Content item not found' });
      }
      
      // Update the item
      const updatedItem = await dbStorage.updateContentItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating content item:', error);
      res.status(500).json({ error: 'Failed to update content item' });
    }
  });
  
  // Delete content item (admin only)
  cmsRouter.delete('/content/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      // Find the item first
      const existingItem = await dbStorage.getContentItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: 'Content item not found' });
      }
      
      // Delete the item
      await dbStorage.deleteContentItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting content item:', error);
      res.status(500).json({ error: 'Failed to delete content item' });
    }
  });
  
  // Media Routes
  
  // Upload media file (admin only)
  cmsRouter.post('/media', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      const { filename, originalname, mimetype, size } = req.file;
      const contentItemId = req.body.contentItemId ? parseInt(req.body.contentItemId) : null;
      
      // Create media record
      const mediaData = {
        filename,
        originalName: originalname,
        mimeType: mimetype,
        size,
        path: `/uploads/${filename}`,
        contentItemId: contentItemId || undefined
      };
      
      const newMedia = await dbStorage.createMedia(mediaData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error('Error uploading media:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });
  
  // Get media by content item ID
  cmsRouter.get('/media/content/:contentItemId', async (req: Request, res: Response) => {
    try {
      const contentItemId = parseInt(req.params.contentItemId);
      if (isNaN(contentItemId)) {
        return res.status(400).json({ error: 'Invalid content item ID' });
      }
      
      const mediaItems = await dbStorage.getMediaByContentItemId(contentItemId);
      res.json(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      res.status(500).json({ error: 'Failed to fetch media items' });
    }
  });
  
  // Delete media (admin only)
  cmsRouter.delete('/media/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      // Find the media item first
      const mediaItem = await dbStorage.getMedia(id);
      if (!mediaItem) {
        return res.status(404).json({ error: 'Media not found' });
      }
      
      // Delete the file from the filesystem
      const filePath = path.join(process.cwd(), mediaItem.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete the database record
      await dbStorage.deleteMedia(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting media:', error);
      res.status(500).json({ error: 'Failed to delete media' });
    }
  });
  
  // User Management Routes
  
  // Get all users (admin only)
  cmsRouter.get('/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await dbStorage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  // Get single user by ID (admin only)
  cmsRouter.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const user = await dbStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  // Create new user (admin only)
  cmsRouter.post('/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, username, email, password, isAdmin } = req.body;
      
      // Validate required fields
      if (!fullName || !username || !email || !password) {
        return res.status(400).json({ 
          error: 'All fields are required (fullName, username, email, password)' 
        });
      }
      
      // Check if username already exists
      const existingUsername = await dbStorage.getUserByUsername(username).catch(() => null);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Check if email already exists
      const existingEmail = await dbStorage.getUserByEmail(email).catch(() => null);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Create user
      const newUser = await dbStorage.createUser({
        fullName,
        username,
        email,
        password, // Will be hashed in storage layer
        isAdmin: Boolean(isAdmin)
      });
      
      // Remove password from response
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  // Update user (admin only)
  cmsRouter.put('/users/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Find the user first
      const existingUser = await dbStorage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { fullName, username, email, password, isAdmin } = req.body;
      
      // Check if username conflicts with another user
      if (username && username !== existingUser.username) {
        const existingUsername = await dbStorage.getUserByUsername(username).catch(() => null);
        if (existingUsername && existingUsername.id !== id) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      
      // Check if email conflicts with another user
      if (email && email !== existingUser.email) {
        const existingEmail = await dbStorage.getUserByEmail(email).catch(() => null);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      
      // Prepare update data
      const updateData: any = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (password !== undefined && password.length > 0) updateData.password = password;
      if (isAdmin !== undefined) updateData.isAdmin = Boolean(isAdmin);
      
      // Update the user
      const updatedUser = await dbStorage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password: _, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });
  
  // Delete user (admin only)
  cmsRouter.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Find the user first
      const existingUser = await dbStorage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent deleting the last admin user
      if (existingUser.isAdmin) {
        const users = await dbStorage.getUsers();
        const adminCount = users.filter(u => u.isAdmin).length;
        if (adminCount <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }
      }
      
      // Delete the user
      await dbStorage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Site Settings Routes
  
  // Get all site settings
  cmsRouter.get('/settings', async (req: Request, res: Response) => {
    try {
      const settings = await dbStorage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ error: 'Failed to fetch site settings' });
    }
  });
  
  // Get setting by key
  cmsRouter.get('/settings/:key', async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const setting = await dbStorage.getSiteSettingByKey(key);
      
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      res.json(setting);
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });
  
  // Create or update setting (admin only)
  cmsRouter.post('/settings', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { key, value, description, isSystem } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ error: 'Key and value are required' });
      }
      
      // Check if setting already exists
      const existingSetting = await dbStorage.getSiteSettingByKey(key);
      
      if (existingSetting) {
        // Update existing setting
        const updatedSetting = await dbStorage.updateSiteSetting(existingSetting.id, {
          value,
          description,
          isSystem
        });
        return res.json(updatedSetting);
      }
      
      // Create new setting
      const validationResult = insertSiteSettingSchema.safeParse({
        key,
        value,
        description,
        isSystem: isSystem || false
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid setting data',
          details: validationResult.error.errors 
        });
      }
      
      const newSetting = await dbStorage.createSiteSetting(validationResult.data);
      res.status(201).json(newSetting);
    } catch (error) {
      console.error('Error creating/updating setting:', error);
      res.status(500).json({ error: 'Failed to create/update setting' });
    }
  });
  
  // Register CMS routes
  app.use('/api/cms', cmsRouter);
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));
}