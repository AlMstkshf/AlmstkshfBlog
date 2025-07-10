import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Admin credentials (in production, store hashed password in database)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rased@almstkshf.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Default: 'password'

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin';
  type: 'access' | 'refresh';
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT tokens
export function generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
  const accessTokenPayload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    type: 'access'
  };

  const refreshTokenPayload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    type: 'refresh'
  };

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'almstkshf-blog',
    audience: 'almstkshf-admin'
  });

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'almstkshf-blog',
    audience: 'almstkshf-admin'
  });

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'almstkshf-blog',
      audience: 'almstkshf-admin'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Authenticate admin credentials (supports both username and email)
export async function authenticateAdmin(usernameOrEmail: string, password: string): Promise<AuthUser | null> {
  // Check if login is with username or email
  const isValidUser = usernameOrEmail === ADMIN_USERNAME || usernameOrEmail === ADMIN_EMAIL;
  
  if (!isValidUser) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: 'admin-1',
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    role: 'admin'
  };
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const payload = verifyToken(token);

  if (!payload || payload.type !== 'access') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }

  // Add user info to request
  req.user = {
    id: payload.userId,
    username: payload.username,
    role: payload.role
  };

  next();
}

// Admin role middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }
  next();
}

// Rate limiting for auth endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_WINDOW = 15 * 60 * 1000; // 15 minutes

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = authAttempts.get(clientIP);
  
  if (attempts) {
    // Reset if window has passed
    if (now - attempts.lastAttempt > AUTH_WINDOW) {
      authAttempts.delete(clientIP);
    } else if (attempts.count >= MAX_AUTH_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((AUTH_WINDOW - (now - attempts.lastAttempt)) / 1000)
      });
    }
  }
  
  next();
}

export function recordAuthAttempt(clientIP: string, success: boolean) {
  if (success) {
    // Clear attempts on successful login
    authAttempts.delete(clientIP);
    return;
  }
  
  const now = Date.now();
  const attempts = authAttempts.get(clientIP);
  
  if (attempts) {
    attempts.count++;
    attempts.lastAttempt = now;
  } else {
    authAttempts.set(clientIP, { count: 1, lastAttempt: now });
  }
}

// Utility to generate a secure admin password hash
export async function generateAdminPasswordHash(password: string): Promise<void> {
  const hash = await hashPassword(password);
  console.log('Admin password hash:', hash);
  console.log('Set this as ADMIN_PASSWORD_HASH environment variable');
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}