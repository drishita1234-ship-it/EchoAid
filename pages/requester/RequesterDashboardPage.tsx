import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DUMMY_USERS } from '../../constants';
import EmergencyCard from '../../components/EmergencyCard';
import DashboardLayout from '../../components/DashboardLayout';
import SafeApproachBanner from '../../components/SafeApproachBanner';
import { ListChecks, Send, UserCircle } from 'lucide-react';
import { RequestStatus, SOSRequest, User } from '../../types';

const RequesterDashboardPage: React.FC = () => {
  const { sosRequests } = useContext(AppContext)!;
  const { user } = useAuth();
  
  const [approachingMission, setApproachingMission] = useState<{ request: SOSRequest; responder: User } | null>(null);

  const myRequests = user ? sosRequests.filter(req => req.requesterId === user.id) : [];

  // Effect to simulate a responder approaching for an "In Progress" mission
  useEffect(() => {
    // Find the first "In Progress" mission for the current user
    const inProgressMission = myRequests.find(req => req.status === RequestStatus.InProgress && req.volunteerId);
    
    if (inProgressMission) {
      // Find the responder's details
      const responderDetails = DUMMY_USERS.find(u => u.id === inProgressMission.volunteerId);
      
      if (responderDetails && responderDetails.isAegisVerified) {
        // Set a timer to simulate the responder's arrival
        const timer = setTimeout(() => {
          setApproachingMission({ request: inProgressMission, responder: responderDetails });
        }, 5000); // Trigger after 5 seconds
        
        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
      }
    }
  }, [myRequests]);

  const sidebarLinks = [
    { path: '/requester/requests', label: 'My Requests', icon: <ListChecks size={24}/> },
    { path: '/requester/new-sos', label: 'New SOS', icon: <Send size={24}/> },
    { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      {approachingMission && (
        <SafeApproachBanner
          responder={approachingMission.responder}
          verificationCode={approachingMission.request.responderVerificationCode!}
          onDismiss={() => setApproachingMission(null)}
        />
      )}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My SOS Requests</h1>
            <Link to="/requester/new-sos" className="bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition flex items-center gap-2">
                <Send size={18} /> New Request
            </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRequests.length > 0 ? (
            myRequests.map(request => <EmergencyCard key={request.id} request={request} />)
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-gray-400">You haven't made any requests yet.</p>
                <Link to="/requester/new-sos" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
                    Submit your first SOS request
                </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequesterDashboardPage;