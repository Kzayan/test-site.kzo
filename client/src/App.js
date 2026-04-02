import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MasterDashboard from './pages/master/Dashboard';
import NewOrderPage from './pages/master/NewOrder';
import OrderDetailsPage from './pages/OrderDetails';
import ClientCatalog from './pages/client/Catalog';
import ClientMap from './pages/client/Map';
import CalculatorPage from './pages/CalculatorPage';
import ProfilePage from './pages/ProfilePage';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/calculator" element={<CalculatorPage />} />
      
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/master" element={<MasterDashboard />} />
          <Route path="/master/new-order" element={<NewOrderPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      
      <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
        <Route element={<Layout />}>
          <Route path="/catalog" element={<ClientCatalog />} />
          <Route path="/map" element={<ClientMap />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;