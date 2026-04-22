import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UserRole, hasRole } from '../types/user';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Authenticate JWT token from Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    const user = authService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message || 'Invalid token' });
  }
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const hasRequiredRole = roles.some(role => hasRole(req.user!.role, role));
    if (!hasRequiredRole) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Require any authenticated user (viewer or higher)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  next();
}
