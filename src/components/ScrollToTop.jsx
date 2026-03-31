import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Access the current location (URL) from the router
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the pathname changes, move the window to the top
    window.scrollTo({
  top: 0,
  left: 0,
  behavior: "smooth" // This gives a nice gliding effect
});
  }, [pathname]); // This array ensures the effect runs only when pathname changes

  return null; // This component doesn't need to show anything on the screen
};

export default ScrollToTop;