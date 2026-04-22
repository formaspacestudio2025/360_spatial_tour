import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, canEdit } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEdit?: boolean;
}

function ProtectedRoute({ children, requireEdit = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEdit && user && !canEdit(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
