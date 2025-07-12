import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler, notFoundHandler } from "./errors";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test database connection first
    const { db } = await import("./db");
    await db.execute('SELECT 1');
    log('Database connection successful');

    const server = await registerRoutes(app);

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use centralized error handler AFTER Vite setup
    // This ensures that non-API routes are handled by Vite first
    app.use(notFoundHandler);
    app.use(errorHandler);

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    
    // If database connection fails, still start the server but log the issue
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('database') || errorMessage.includes('connection')) {
      console.error('Database connection failed. Starting server anyway...');
      
      try {
        const server = await registerRoutes(app);
        
        if (app.get("env") === "development") {
          await setupVite(app, server);
        } else {
          serveStatic(app);
        }

        // Add error middleware AFTER Vite setup
        app.use(notFoundHandler);
        app.use(errorHandler);

        const port = 5000;
        server.listen(port, "0.0.0.0", () => {
          log(`serving on port ${port} (database connection failed)`);
        });
      } catch (fallbackError) {
        console.error('Failed to start server even without database:', fallbackError);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
})();
