import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse 
} from "../errors";
import { cacheService, CACHE_TTL, cacheInvalidation } from "../cache";

export function createNewsletterRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  let emailAutomation: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  const getEmailAutomation = async () => {
    if (!emailAutomation) {
      const automation = await import("../automation/emailAutomation");
      emailAutomation = automation.emailAutomation;
    }
    return emailAutomation;
  };

  // Subscribe to newsletter
  router.post("/subscribe", asyncHandler(async (req: Request, res: Response) => {
    const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
    const subscriber = await storage.subscribeToNewsletter(subscriberData);
    
    // Invalidate newsletter subscribers cache after new subscription
    cacheInvalidation.newsletter();
    
    // Automatically send welcome email
    try {
      const emailAuto = await getEmailAutomation();
      await emailAuto.sendWelcomeEmail(
        subscriber.email, 
        'Subscriber',
        'en'
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }
    
    successResponse(res, subscriber, "Successfully subscribed to newsletter", 201);
  }));

  // Get newsletter subscribers (admin only)
  router.get("/subscribers", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const cacheKey = 'newsletter:subscribers:all';
          
          const subscribers = await cacheService.getOrSet(
            cacheKey,
            async () => {
              return await storage.getNewsletterSubscribers();
            },
            CACHE_TTL.NEWSLETTER_SUBSCRIBERS
          );
          
          res.set({
            'Cache-Control': 'private, max-age=300', // 5 minutes for admin data
            'X-Cache': subscribers === await storage.getNewsletterSubscribers() ? 'MISS' : 'HIT'
          });
          
          successResponse(res, subscribers, "Subscribers retrieved successfully");
        })(req, res, next);
      });
    });
  });

  return router;
}