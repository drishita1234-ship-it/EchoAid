
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      let dashboardPath: string;
      switch (user.role) {
        case UserRole.Requester:
          dashboardPath = '/requester/requests';
          break;
        case UserRole.Volunteer:
          dashboardPath = '/volunteer/nearby';
          break;
        case UserRole.Safe:
          dashboardPath = '/safe/dashboard';
          break;
        default:
          // Fallback for any other case
          dashboardPath = '/login';
          break;
      }
      navigate(dashboardPath, { replace: true });
    } else {
        // If for some reason a non-logged in user gets here, redirect to login
        navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-primary-500" size={48} />
        <p className="ml-4 text-xl">Redirecting to your dashboard...</p>
    </div>
  );
};

export default DashboardPage;
