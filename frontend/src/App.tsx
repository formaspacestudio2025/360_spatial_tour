import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WalkthroughViewer from './pages/WalkthroughViewer';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/walkthrough/:id" element={<ProtectedRoute><WalkthroughViewer /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
