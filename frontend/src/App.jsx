import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';
import Assessment from './pages/Assessment';
import Learning from './pages/Learning';
import LearningPathDetail from './pages/LearningPathDetail';
import LearningWorkspace from './pages/LearningWorkspace';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider, AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<AiAssistant />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="learning" element={<Learning />} />
            <Route path="learning/:id" element={<LearningPathDetail />} />
            <Route path="learning-path/:pathId/module/:moduleId/review" element={<LearningWorkspace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<div className="text-center mt-20 text-gray-500">Feature coming soon in this prototype...</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
