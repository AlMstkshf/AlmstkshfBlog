import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse 
} from "../errors";

export function createContactRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  let emailService: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  const getEmailService = async () => {
    if (!emailService) {
      const email = await import("../email");
      emailService = email.emailService;
    }
    return emailService;
  };

  // Submit contact form
  router.post("/", asyncHandler(async (req: Request, res: Response) => {
    const contactData = insertContactSubmissionSchema.parse(req.body);
    
    // Save to database
    const submission = await storage.submitContactForm(contactData);
    
    // Send email notification
    try {
      const emailSvc = await getEmailService();
      await emailSvc.sendContactFormEmail({
        name: contactData.name,
        email: contactData.email,
        company: contactData.company || '',
        type: contactData.type,
        message: contactData.message,
        language: contactData.language || 'en'
      });
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Continue even if email fails - form submission was successful
    }
    
    successResponse(res, submission, "Contact form submitted successfully", 201);
  }));

  // Get contact submissions (admin only)
  router.get("/submissions", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const submissions = await storage.getContactSubmissions();
          successResponse(res, submissions, "Contact submissions retrieved successfully");
        })(req, res, next);
      });
    });
  });

  return router;
}