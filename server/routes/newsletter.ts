import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse 
} from "../errors";

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
          const subscribers = await storage.getNewsletterSubscribers();
          successResponse(res, subscribers, "Subscribers retrieved successfully");
        })(req, res, next);
      });
    });
  });

  return router;
}