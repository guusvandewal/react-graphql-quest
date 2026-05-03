import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <p aria-hidden="true" className="mb-2 text-6xl font-bold text-muted-foreground/40">
          404
        </p>
        <h1 className="mb-4 text-2xl font-bold">Page not found</h1>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
