import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { configureAuth } from "./auth";
import { registerCmsRoutes } from "./cmsRoutes";
import initializeDatabase from "./initDb";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database with default admin and settings
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    // Continue with server startup even if database initialization fails
  }
  
  // Configure authentication
  configureAuth(app);
  
  // Register CMS routes
  registerCmsRoutes(app);
  
  // Add an API status endpoint for debugging
  app.get("/api/status", (_req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body against schema
      const result = contactSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: validationError.message 
        });
      }
      
      // Store contact information
      const contact = await storage.createContact(result.data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Contact request received successfully", 
        id: contact.id 
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      return res.status(500).json({ 
        message: "Internal server error while processing contact form" 
      });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      // Store newsletter subscription
      const subscription = await storage.createNewsletterSubscription({ email });
      
      return res.status(201).json({ 
        success: true, 
        message: "Newsletter subscription created successfully", 
        id: subscription.id 
      });
    } catch (error) {
      console.error("Error processing newsletter subscription:", error);
      return res.status(500).json({ 
        message: "Internal server error while processing newsletter subscription" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
