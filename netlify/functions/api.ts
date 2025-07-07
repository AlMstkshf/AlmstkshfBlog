import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import express from "express";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";
import { registerServerlessRoutes } from "../../server/routes-serverless";
import { errorHandler, notFoundHandler } from "../../server/errors";

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// CORS for Netlify
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize routes
let routesInitialized = false;

const initializeRoutes = async () => {
  if (!routesInitialized) {
    try {
      // Test database connection
      const { db } = await import("../../server/db");
      await db.execute('SELECT 1');
      console.log('Database connection successful');
      
      // Register routes (but don't create HTTP server)
      await registerServerlessRoutes(app);
      
      // Error handlers
      app.use(notFoundHandler);
      app.use(errorHandler);
      
      routesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize routes:', error);
      // Continue without database if connection fails
      await registerServerlessRoutes(app);
      app.use(notFoundHandler);
      app.use(errorHandler);
      routesInitialized = true;
    }
  }
};

// Netlify function handler
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Initialize routes on first request
  await initializeRoutes();
  
  // Convert to serverless
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};

export { handler };