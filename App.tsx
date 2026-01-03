import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SosSubmissionPage from './pages/SosSubmissionPage';
import GlobalCrisisMapPage from './pages/GlobalCrisisMapPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import RequesterDashboardPage from './pages/requester/RequesterDashboardPage';
import VolunteerDashboardPage from './pages/volunteer/VolunteerDashboardPage';
import MyMissionsPage from './pages/volunteer/MyMissionsPage';
import SafeUserDashboardPage from './pages/safe/SafeUserDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import OfficialDisasterFeedPage from './pages/OfficialDisasterFeedPage';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
          <AppProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/map" element={<GlobalCrisisMapPage />} />
                    <Route path="/official-feed" element={<OfficialDisasterFeedPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    {/* All users */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.Requester, UserRole.Volunteer, UserRole.Safe]} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                    </Route>

                    {/* Requester Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.Requester]} />}>
                        <Route path="/requester/new-sos" element={<SosSubmissionPage />} />
                        <Route path="/requester/requests" element={<RequesterDashboardPage />} />
                    </Route>

                    {/* Volunteer Routes */}
                     <Route element={<ProtectedRoute allowedRoles={[UserRole.Volunteer]} />}>
                        <Route path="/volunteer/nearby" element={<VolunteerDashboardPage />} />
                        <Route path="/volunteer/missions" element={<MyMissionsPage />} />
                    </Route>
                    
                    {/* Safe User Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.Safe]} />}>
                        <Route path="/safe/dashboard" element={<SafeUserDashboardPage />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
                <Footer />
                <Chatbot />
              </div>
            </Router>
          </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
