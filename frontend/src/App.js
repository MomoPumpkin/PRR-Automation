import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AnalysisCreate from './pages/AnalysisCreate';
import AnalysisDetail from './pages/AnalysisDetail';
import AnalysisList from './pages/AnalysisList';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

// Protected Route Component
// Modified to always allow access without authentication
const ProtectedRoute = ({ children }) => {
  // Always allow access without checking for a token
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Redirect login and register to dashboard */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="analysis">
            <Route index element={<AnalysisList />} />
            <Route path="create" element={<AnalysisCreate />} />
            <Route path=":id" element={<AnalysisDetail />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;