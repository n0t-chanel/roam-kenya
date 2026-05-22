import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import AboutTeaser from "./components/AboutTeaser";
import Packages from "./components/Packages";
import Features from "./components/Features";

import CTA from "./components/CTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import AuthPage from './pages/AuthPage';
import Destination from "./pages/Destination";
import AboutPage from "./pages/AboutPage"; 
import Services from './pages/Services';

import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminHome from "./pages/admin/AdminHome";
import BookingsManagement from "./pages/admin/BookingsManagement";
import DriversManagement from "./pages/admin/DriversManagement";
import AgentsManagement from "./pages/admin/AgentsManagement";
import Analytics from "./pages/admin/Analytics";
import AgentHome from "./pages/admin/AgentHome";
import DriverTrips from "./pages/admin/DriverTrips";
import { ProtectedAdminRoute } from "./pages/admin/ProtectedAdminRoute";
function AppContent({ isLoading }) {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/isAdmin' ||
    location.pathname === '/agent' ||
    location.pathname === '/driver';

  return (
    <div className={isLoading ? "h-screen overflow-hidden" : ""}>
      {!isAdminRoute && (
        <div className="relative z-[1000]">
          <Navbar />
        </div>
      )}

      <main className="relative z-0">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <AboutTeaser />
              <Packages />
              <Features /> 
              <FAQ/>
              <CTA />
            </>
          } />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/destinations" element={<Destination />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />

          <Route path="/isAdmin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <AdminHome />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin", "booking_agent"]}>
                <BookingsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <DriversManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <AgentsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <Analytics />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedAdminRoute allowedRoles={["booking_agent"]}>
                <AgentHome />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedAdminRoute allowedRoles={["driver"]}>
                <DriverTrips />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <Preloader isLoading={isLoading} />
          <AppContent isLoading={isLoading} />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
