import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutTeaser from "./components/AboutTeaser";
import Gallery from "./components/Gallery";
import Packages from "./components/Packages";
import Features from "./components/Features";
import Deals from "./components/Deals";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import Destination from "./pages/Destination";
// IMPORTANT: Make sure these exist in your folders!
import AboutPage from "./pages/AboutPage"; 
import Services from './pages/Services';

function App() {
  return (
    <Router>
      {/* Navbar stays on top of every page */}
      <div className="relative z-[1000]">
        <ScrollToTop />
        <Navbar />
      </div>
      
      <main className="relative z-0">
        <Routes>
          {/* THE HOME ROUTE: Combines all your landing page sections */}
          <Route path="/" element={
            <>
              <Hero />
              <AboutTeaser />
              <Gallery />
              <Packages />
              <Features /> 
              <Deals />
              <CTA />
            </>
          } />

          {/* MULTI-PAGE ROUTES: These show individual pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/destinations" element={<Destination />} />
          <Route path="/booking" element={<BookingForm />} />
         
        </Routes>
      </main>

      {/* Footer stays at the bottom of every page */}
      <Footer />
    </Router>
  );
}

export default App;