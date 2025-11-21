import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    // If logged in, go to /home. If not, go to landing page
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <button 
          onClick={handleGoHome}
          className="text-primary hover:text-primary/80 underline transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
