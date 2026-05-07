import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  // 1. Set up the loading state (defaults to true when they visit the site)
  const [isLoading, setIsLoading] = useState(true);

  // 2. Start the timer when the app loads
  useEffect(() => {
    // 2000 ms = 2 seconds. You can increase or decrease this!
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      
      {/* 3. The Custom Loading Screen sits on top of everything */}
      <Preloader isLoading={isLoading} />
      
      {/* 4. This wrapper prevents scrolling while the preloader is active */}
      <div className={isLoading ? "h-screen overflow-hidden" : ""}>
        
        {/* Navbar stays on top of every page */}
        <div className="relative z-[1000]">
          <Navbar />
        </div>
        
        <main className="relative z-0">
          <Routes>
            {/* THE HOME ROUTE: Combines all your landing page sections */}
            <Route path="/" element={
              <>
                <Hero />
                <AboutTeaser />
                <Packages />
                <Features /> 
                {/*<Deals />*/}
                <CTA />
              </>
            } />

            {/* MULTI-PAGE ROUTES: These show individual pages */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/destinations" element={<Destination />} />
            <Route path="/booking" element={<BookingForm />} />
          </Routes>
        </main>

        {/* Footer stays at the bottom of every page */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;