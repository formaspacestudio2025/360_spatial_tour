import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Permission, ROLE_HIERARCHY } from '@/types';
import type { UserRole } from '@/types';

// Static permission matrix (which role has which permission)
const PERMISSIONS = Object.values(Permission);
const ROLES: UserRole[] = ['admin', 'manager', 'editor', 'viewer', 'contractor', 'client_guest'];

// Simple rule: higher hierarchy roles inherit lower ones' permissions (simplified)
function hasPermission(role: UserRole, permission: Permission): boolean {
  // Admin has all
  if (role === 'admin') return true;
  // Manager has all except delete_project and manage_members
  if (role === 'manager') {
    return ![Permission.DELETE_PROJECT, Permission.MANAGE_MEMBERS].includes(permission);
  }
  // Editor can edit project, resolve issues, comment, export data
  if (role === 'editor') {
    return [
      Permission.VIEW_PROJECT,
      Permission.EDIT_PROJECT,
      Permission.EDIT_GRAPH,
      Permission.UPLOAD_MEDIA,
      Permission.CREATE_ISSUES,
      Permission.RESOLVE_ISSUES,
      Permission.COMMENT,
      Permission.EXPORT_DATA,
    ].includes(permission);
  }
  // Viewer can view and comment
  if (role === 'viewer') {
    return [Permission.VIEW_PROJECT, Permission.COMMENT].includes(permission);
  }
  // Contractor can only create issues and comment
  if (role === 'contractor') {
    return [Permission.CREATE_ISSUES, Permission.COMMENT].includes(permission);
  }
  // Client guest can only view
  return permission === Permission.VIEW_PROJECT;
}

const PermissionMatrix: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Permission Matrix</h1>
            <p className="text-sm text-gray-400">View role-based access permissions</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                {PERMISSIONS.map(p => (
                  <th key={p} className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase whitespace-nowrap">
                    {p.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ROLES.map(role => (
                <tr key={role} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium capitalize">{role.replace('_', ' ')}</td>
                  {PERMISSIONS.map(p => (
                    <td key={p} className="px-4 py-4 text-center">
                      {hasPermission(role, p) ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-green-500/20 text-green-400">✓</span>
                      ) : (
                        <span className="inline-block w-5 h-5 rounded-full bg-red-500/20 text-red-400">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Permissions are enforced via <code className="text-gray-400">backend/src/middleware/rbac.ts</code> and the role hierarchy defined in <code className="text-gray-400">backend/src/types/user.ts</code>.
        </p>
      </main>
    </div>
  );
};

export default PermissionMatrix;
