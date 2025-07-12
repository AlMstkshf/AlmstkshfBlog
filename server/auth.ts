import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// JWT configuration - MUST be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Shorter access token lifetime
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Validate required environment variables
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
}

if (JWT_SECRET.length < 32 || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 characters long');
}

// Admin credentials - MUST be set in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Validate admin credentials
if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  throw new Error('ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD_HASH environment variables are required');
}

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

// Generate JWT tokens with separate secrets
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

  const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'almstkshf-blog',
    audience: 'almstkshf-admin',
    algorithm: 'HS256'
  });

  const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'almstkshf-blog',
    audience: 'almstkshf-admin',
    algorithm: 'HS256'
  });

  return { accessToken, refreshToken };
}

// Verify JWT token with appropriate secret based on token type
export function verifyToken(token: string, tokenType: 'access' | 'refresh' = 'access'): JWTPayload | null {
  try {
    const secret = tokenType === 'access' ? JWT_SECRET! : JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(token, secret, {
      issuer: 'almstkshf-blog',
      audience: 'almstkshf-admin',
      algorithms: ['HS256']
    }) as JWTPayload;
    
    // Verify token type matches expected type
    if (decoded.type !== tokenType) {
      throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
    }
    
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

// Rate limiting for auth endpoints with memory leak prevention
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_WINDOW = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Cleanup expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempt] of authAttempts.entries()) {
    if (now - attempt.lastAttempt > AUTH_WINDOW) {
      authAttempts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

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

// Change admin password (for production use, this should update a database)
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  // Verify current password
  const isCurrentValid = await verifyPassword(currentPassword, ADMIN_PASSWORD_HASH!);
  if (!isCurrentValid) {
    return false;
  }

  // In a real application, you would update the database here
  // For now, we'll generate the new hash for manual environment variable update
  const newHash = await hashPassword(newPassword);
  console.log('New admin password hash:', newHash);
  console.log('Update ADMIN_PASSWORD_HASH environment variable with this value and restart the application');
  
  return true;
}

// Refresh token functionality
export function refreshAccessToken(refreshToken: string): string | null {
  const payload = verifyToken(refreshToken, 'refresh');
  if (!payload) {
    return null;
  }

  const user: AuthUser = {
    id: payload.userId,
    username: payload.username,
    email: ADMIN_EMAIL!,
    role: payload.role
  };

  const { accessToken } = generateTokens(user);
  return accessToken;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}