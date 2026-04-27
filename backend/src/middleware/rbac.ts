import { Request, Response, NextFunction } from 'express';
import { Permission, hasRole, UserRole } from '../types/user';

/**
 * Simple RBAC middleware. Checks that the authenticated user belongs to the same organization
 * (and optionally property) as the resource they are accessing.
 *
 * Usage: requirePermission('asset', 'read')
 */
export function requirePermission(resource: 'asset' | 'issue' | 'walkthrough', action: 'read' | 'write') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userOrg = (req.user as any).org_id;
    const userProp = (req.user as any).property_id;
    const resourceId = req.params.id;
    if (!resourceId) {
      // No specific resource ID, allow based on role for creation/list actions
      return next();
    }

    // Fetch resource to check ownership
    let resourceItem: any;
    try {
      const { default: db } = await import('../config/database');
      const stmt = db.prepare(`SELECT * FROM ${resource}s WHERE id = ?`);
      resourceItem = stmt.get(resourceId);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'RBAC load error' });
    }

    if (!resourceItem) {
      return res.status(404).json({ success: false, message: `${resource} not found` });
    }

    // Admins bypass checks
    if (hasRole((req.user as any).role, 'admin')) {
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
      if (resourceItem.created_by && resourceItem.created_by !== (req.user as any).id) {
        return res.status(403).json({ success: false, message: 'Only owner can modify' });
      }
    }

    next();
  };
}
