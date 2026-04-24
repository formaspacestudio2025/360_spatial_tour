import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user';
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
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
/**
 * Require specific role(s)
 */
export declare function requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Require any authenticated user (viewer or higher)
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map