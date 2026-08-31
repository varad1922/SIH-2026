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
import Profile from './pages/Profile';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-main relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin shadow-lg" />
          <h2 className="mt-6 text-lg font-bold text-text-main tracking-widest uppercase animate-pulse">Skill Intel</h2>
          <p className="text-sm font-medium text-text-secondary mt-1">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<AiAssistant />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="learning" element={<Learning />} />
            <Route path="learning/:learningPathId" element={<LearningPathDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Full-screen learning workspace: intentionally outside DashboardLayout */}
          <Route
            path="/learning-path/:pathId/module/:moduleId/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LearningWorkspace />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
