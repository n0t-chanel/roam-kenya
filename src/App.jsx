import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import AboutTeaser from "./components/AboutTeaser";
import Packages from "./components/Packages";
import Features from "./components/Features";
//import Deals from "./components/Deals";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import AuthPage from './pages/AuthPage';
import Destination from "./pages/Destination";
import AboutPage from "./pages/AboutPage"; 
import Services from './pages/Services';
import AuthPage from "./pages/AuthPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

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
      <Router>
        <ScrollToTop />
        
        <Preloader isLoading={isLoading} />
        
        <div className={isLoading ? "h-screen overflow-hidden" : ""}>
          
          <div className="relative z-[1000]">
            <Navbar />
          </div>
          
          <main className="relative z-0">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <AboutTeaser />
                  <Packages />
                  <Features /> 
                  <Deals />
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
            </Routes>
          </main>

          <Footer />
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
