import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";

// Import modular route handlers
import { createAuthRoutes } from "./routes/auth";
import { createArticlesRoutes } from "./routes/articles";
import { createCategoriesRoutes } from "./routes/categories";
import { createDownloadsRoutes } from "./routes/downloads";
import { createNewsletterRoutes } from "./routes/newsletter";
import { createContactRoutes } from "./routes/contact";
import { createAdminRoutes } from "./routes/admin";
import { createUtilsRoutes } from "./routes/utils";

// Import automation and other utilities
import { automationRouter } from "./automation/automationRoutes";
import { registerN8NRoutes } from "./n8n-automation";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Import authentication utilities
  const { requireAuth, requireAdmin } = await import("./auth");
  
  // Ensure upload directories exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  const downloadDirs = ['pdfs', 'images', 'documents', 'files'].map(dir => path.join(uploadDir, dir));
  
  [uploadDir, ...downloadDirs].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadDir));

  // Register public routes (no authentication required)
  app.use("/api/auth", createAuthRoutes());
  app.use("/api/contact", createContactRoutes());
  app.use("/api/newsletter", createNewsletterRoutes());
  
  // Categories routes (public GET, protected CUD)
  const categoriesRouter = createCategoriesRoutes();
  app.use("/api/categories", categoriesRouter);
  
  // Articles routes (public GET, protected CUD)
  const articlesRouter = createArticlesRoutes();
  app.use("/api/articles", articlesRouter);
  
  // Downloads routes (public GET, protected CUD)
  const downloadsRouter = createDownloadsRoutes();
  app.use("/api/downloads", downloadsRouter);
  
  // Admin routes (all protected)
  app.use("/api/admin", requireAuth, requireAdmin, createAdminRoutes());

  // Register utility routes (search, sitemap, health, AI, etc.)
  const utilsRouter = createUtilsRoutes();
  app.use("/api", utilsRouter);
  
  // Mount sitemap and robots.txt at root level
  app.get("/sitemap.xml", utilsRouter);
  app.get("/robots.txt", utilsRouter);

  // Mount automation routes
  app.use("/api/automation", automationRouter);

  // Register N8N automation routes
  registerN8NRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}