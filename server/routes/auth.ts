import { Router, Request, Response } from "express";
import { 
  asyncHandler, 
  successResponse, 
  ValidationError, 
  AuthenticationError 
} from "../errors";

export function createAuthRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  // Login endpoint
  router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const { 
      authenticateAdmin, 
      generateTokens, 
      recordAuthAttempt 
    } = await getAuthUtils();

    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new ValidationError("Username/email and password are required");
    }

    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    try {
      const user = await authenticateAdmin(username, password);
      
      if (!user) {
        recordAuthAttempt(clientIP, false);
        throw new AuthenticationError("Invalid credentials");
      }

      const tokens = generateTokens(user);
      recordAuthAttempt(clientIP, true);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      successResponse(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken: tokens.accessToken,
        expiresIn: '24h'
      }, "Login successful");
      
    } catch (error) {
      recordAuthAttempt(clientIP, false);
      throw error;
    }
  }));

  // Refresh token endpoint
  router.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const { verifyToken, generateTokens } = await getAuthUtils();
    
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AuthenticationError("Refresh token required");
    }

    const payload = verifyToken(refreshToken);
    
    if (!payload || payload.type !== 'refresh') {
      throw new AuthenticationError("Invalid refresh token");
    }

    const user = {
      id: payload.userId,
      username: payload.username,
      role: payload.role as 'admin'
    };

    const tokens = generateTokens(user);

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    successResponse(res, {
      accessToken: tokens.accessToken,
      expiresIn: '24h'
    }, "Token refreshed");
  }));

  // Logout endpoint
  router.post("/logout", asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    successResponse(res, null, "Logged out successfully");
  }));

  // Verify token endpoint
  router.get("/verify", async (req: Request, res: Response, next) => {
    const { requireAuth } = await getAuthUtils();
    
    requireAuth(req, res, () => {
      asyncHandler(async (req: Request, res: Response) => {
        successResponse(res, {
          user: req.user
        }, "Token valid");
      })(req, res, next);
    });
  });

  return router;
}