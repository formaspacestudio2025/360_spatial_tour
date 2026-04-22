export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer' | 'contractor' | 'client_guest';
  created_at: string;
}

export type UserRole = User['role'];

// Enterprise Permission Constants
export enum Permission {
  VIEW_PROJECT = 'view_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  MANAGE_MEMBERS = 'manage_members',
  EDIT_GRAPH = 'edit_graph',
  UPLOAD_MEDIA = 'upload_media',
  CREATE_ISSUES = 'create_issues',
  RESOLVE_ISSUES = 'resolve_issues',
  COMMENT = 'comment',
  EXPORT_DATA = 'export_data',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  client_guest: 1,
  viewer: 2,
  contractor: 3,
  editor: 4,
  manager: 5,
  admin: 6,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
