import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetManagement from './pages/AssetManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import VendorManagement from './pages/VendorManagement';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Helper component for route protection
const ProtectedLayout = () => {
  const isLoggedIn = localStorage.getItem('itam_is_logged_in') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

const PublicLoginRoute = () => {
  const isLoggedIn = localStorage.getItem('itam_is_logged_in') === 'true';
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicLoginRoute />} />
        
        {/* Protected Routes Wrapper */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
