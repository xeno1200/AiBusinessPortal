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
  
  // Get all content items by type and language
  cmsRouter.get('/content/:type', async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const language = req.query.language as string || 'en';
      
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
  
  // Get single content item by ID
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