import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import StorageResultsPage from './pages/StorageResultsPage';
import StorageDetailPage from './pages/StorageDetailPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPage from './pages/AuthPage';

export default function App() {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/owner') || location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/storages" element={<StorageResultsPage />} />
          <Route path="/storages/:id" element={<StorageDetailPage />} />
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
}
