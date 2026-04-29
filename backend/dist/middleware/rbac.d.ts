import { Request, Response, NextFunction } from 'express';
/**
 * Simple RBAC middleware. Checks that the authenticated user belongs to the same organization
 * (and optionally property) as the resource they are accessing.
 *
 * Usage: requirePermission('asset', 'read')
 */
export declare function requirePermission(resource: 'asset' | 'issue' | 'walkthrough', action: 'read' | 'write'): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=rbac.d.ts.map