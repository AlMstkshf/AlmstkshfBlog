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

      // Set secure HTTP-only cookies for both access and refresh tokens
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Access token cookie (shorter expiry)
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });
      
      // Refresh token cookie (longer expiry)
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      successResponse(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        // Still provide access token for API clients that need it
        accessToken: tokens.accessToken,
        expiresIn: '15m'
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
    const isProduction = process.env.NODE_ENV === 'production';

    // Update both access and refresh token cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    successResponse(res, {
      accessToken: tokens.accessToken,
      expiresIn: '15m'
    }, "Token refreshed");
  }));

  // Logout endpoint
  router.post("/logout", asyncHandler(async (req: Request, res: Response) => {
    // Clear both access and refresh token cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/'
    };
    
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    
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