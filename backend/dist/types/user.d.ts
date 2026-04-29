export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'manager' | 'editor' | 'viewer' | 'contractor' | 'client_guest';
    org_id?: string;
    property_id?: string;
    created_at: string;
}
export type UserRole = User['role'];
export declare enum Permission {
    VIEW_PROJECT = "view_project",
    EDIT_PROJECT = "edit_project",
    DELETE_PROJECT = "delete_project",
    MANAGE_MEMBERS = "manage_members",
    EDIT_GRAPH = "edit_graph",
    UPLOAD_MEDIA = "upload_media",
    CREATE_ISSUES = "create_issues",
    RESOLVE_ISSUES = "resolve_issues",
    COMMENT = "comment",
    EXPORT_DATA = "export_data"
}
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
export declare function hasRole(userRole: UserRole, requiredRole: UserRole): boolean;
//# sourceMappingURL=user.d.ts.map