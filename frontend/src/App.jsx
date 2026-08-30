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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="w-10 h-10 border-4 border-border-main border-t-secondary-600 rounded-full animate-spin" />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
