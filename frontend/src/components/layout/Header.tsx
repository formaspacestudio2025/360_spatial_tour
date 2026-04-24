import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, LogOut, User, Shield } from 'lucide-react';
import WalkthroughForm from '@/components/walkthrough/WalkthroughForm';
import { useAuthStore, canEdit } from '@/stores/authStore';

function Header() {
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <Box size={28} className="text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Spatial Tours</h1>
              <p className="text-xs text-gray-400">360° Walkthrough Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/issues" className="text-gray-300 hover:text-white transition-colors">
              Issue Management
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                <User size={16} className="text-gray-400" />
                <span className="text-sm text-white font-medium">{user.username}</span>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded-full">
                  <Shield size={10} />
                  {user.role}
                </span>
              </div>

              {canEdit(user.role) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  New Walkthrough
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {canEdit(user?.role || '') && (
      <WalkthroughForm isOpen={showForm} onClose={() => setShowForm(false)} />
    )}
    </>
  );
}

export default Header;