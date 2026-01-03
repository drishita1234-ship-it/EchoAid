
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's own specific dashboard if they try to access a page they are not allowed to see.
    let userDashboard: string;
    switch (user.role) {
      case UserRole.Requester:
        userDashboard = '/requester/requests';
        break;
      case UserRole.Volunteer:
        userDashboard = '/volunteer/nearby';
        break;
      case UserRole.Safe:
        userDashboard = '/safe/dashboard';
        break;
      default:
        userDashboard = '/login'; // Fallback
    }
    return <Navigate to={userDashboard} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
