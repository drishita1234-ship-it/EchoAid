import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import EmergencyCard from '../../components/EmergencyCard';
import DashboardLayout from '../../components/DashboardLayout';
import { Compass, Map as MapIcon, UserCircle, ShieldCheck } from 'lucide-react';

const MyMissionsPage: React.FC = () => {
    const { sosRequests } = useContext(AppContext)!;
    const { user } = useAuth();

    const myMissions = useMemo(() => {
        if (!user) return [];
        return sosRequests
            .filter(req => req.volunteerId === user.id)
            .sort((a, b) => {
                // Keep In Progress missions at the top
                if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
                if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
                // Then sort by most recent
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            });
    }, [sosRequests, user]);

    const sidebarLinks = [
        { path: '/volunteer/nearby', label: 'Dashboard', icon: <Compass size={24}/> },
        { path: '/volunteer/missions', label: 'My Missions', icon: <MapIcon size={24}/> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks}>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="text-primary-500" />
                        My Accepted Missions
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMissions.length > 0 ? (
                        myMissions.map(request => (
                            <EmergencyCard 
                                key={request.id} 
                                request={request} 
                                isVolunteer={true} 
                                currentUserId={user?.id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                            <p className="text-gray-500 dark:text-gray-400">You haven't accepted any missions yet.</p>
                            <Link to="/volunteer/nearby" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
                                View nearby requests
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyMissionsPage;