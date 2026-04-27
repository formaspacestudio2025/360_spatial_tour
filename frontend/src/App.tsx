import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WalkthroughViewer from './pages/WalkthroughViewer';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import IssueListPage from './components/issueManagement/IssueListPage';
import UserManagement from './pages/UserManagement';
import AssetManagement from './pages/AssetManagement';
import PermissionMatrix from './pages/PermissionMatrix';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/walkthrough/:id" element={<ProtectedRoute><WalkthroughViewer /></ProtectedRoute>} />
      <Route path="/issues" element={<ProtectedRoute><IssueListPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
      <Route path="/permission-matrix" element={<ProtectedRoute><PermissionMatrix /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
