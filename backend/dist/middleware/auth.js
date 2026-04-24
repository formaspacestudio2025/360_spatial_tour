"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requireAuth = requireAuth;
const auth_service_1 = require("../services/auth.service");
const user_1 = require("../types/user");
/**
 * Authenticate JWT token from Authorization header
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = auth_service_1.authService.verifyToken(token);
        const user = auth_service_1.authService.getUserById(decoded.userId);
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
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message || 'Invalid token' });
    }
}
/**
 * Require specific role(s)
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const hasRequiredRole = roles.some(role => (0, user_1.hasRole)(req.user.role, role));
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
function requireAuth(req, res, next) {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map