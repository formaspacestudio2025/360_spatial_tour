"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
const user_1 = require("../types/user");
/**
 * Simple RBAC middleware. Checks that the authenticated user belongs to the same organization
 * (and optionally property) as the resource they are accessing.
 *
 * Usage: requirePermission('asset', 'read')
 */
function requirePermission(resource, action) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const userOrg = req.user.org_id;
        const userProp = req.user.property_id;
        const resourceId = req.params.id;
        if (!resourceId) {
            // No specific resource ID, allow based on role for creation/list actions
            return next();
        }
        // Fetch resource to check ownership
        let resourceItem;
        try {
            const { default: db } = await Promise.resolve().then(() => __importStar(require('../config/database')));
            const stmt = db.prepare(`SELECT * FROM ${resource}s WHERE id = ?`);
            resourceItem = stmt.get(resourceId);
        }
        catch (e) {
            return res.status(500).json({ success: false, message: 'RBAC load error' });
        }
        if (!resourceItem) {
            return res.status(404).json({ success: false, message: `${resource} not found` });
        }
        // Admins bypass checks
        if ((0, user_1.hasRole)(req.user.role, 'admin')) {
            return next();
        }
        // Org check
        if (resourceItem.org_id && resourceItem.org_id !== userOrg) {
            return res.status(403).json({ success: false, message: 'Insufficient organization permissions' });
        }
        // Property check if applicable
        if (resourceItem.property_id && userProp && resourceItem.property_id !== userProp) {
            return res.status(403).json({ success: false, message: 'Insufficient property permissions' });
        }
        // For write actions, only allow if user is owner or admin (owner check via created_by if present)
        if (action === 'write') {
            // If resource has a created_by field, ensure the user matches it
            if (resourceItem.created_by && resourceItem.created_by !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Only owner can modify' });
            }
        }
        next();
    };
}
//# sourceMappingURL=rbac.js.map