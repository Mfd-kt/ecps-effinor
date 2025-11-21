import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const RequireAdmin = ({ children, roles }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-16 w-16 animate-spin text-secondary-500" />
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user's role is in the allowed list
  if (roles && profile && !roles.includes(profile.role)) {
     // User is logged in but does not have the required role
     // Redirect to a default dashboard or an "access-denied" page
     return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;