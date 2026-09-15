import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import GradingPage from './pages/GradingPage';
import PlagiarismPage from './pages/PlagiarismPage';
import { ProcessingProvider } from './context/ProcessingContext';
import AuthLayout from './components/ui/AuthLayout';

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-gray-50">
        <ProcessingProvider>
          <Routes>
            <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/grading" element={<PrivateRoute element={<GradingPage />} />} />
            <Route path="/plagiarism" element={<PrivateRoute element={<PlagiarismPage />} />} />
          </Routes>
        </ProcessingProvider>
      </div>
    </AuthProvider>
  );
};

export default App;