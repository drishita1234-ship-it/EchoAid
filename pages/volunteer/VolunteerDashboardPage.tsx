import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { RequestStatus, SOSRequest } from '../../types';
import EmergencyCard from '../../components/EmergencyCard';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import CrisisMap from '../../components/CrisisMap';
import AegisVerificationModal from '../../components/AegisVerificationModal';
import RumorFeedWidget from '../../components/RumorFeedWidget';
import SearchVerificationModal from '../../components/SearchVerificationModal';
import { DUMMY_RUMORS } from '../../constants';
import { Compass, Map as MapIcon, UserCircle, AlertTriangle, Users, TrendingUp, CheckCircle, Bell, ShieldAlert } from 'lucide-react';
import { getSearchGroundedInfo, GroundedInfo } from '../../services/geminiService';

const VolunteerDashboardPage: React.FC = () => {
    const { sosRequests, assignVolunteer } = useContext(AppContext)!;
    const { user } = useAuth();
    
    const [isRumorLayerVisible, setIsRumorLayerVisible] = useState(false);
    
    // State for Aegis Modal
    const [selectedAegisRequest, setSelectedAegisRequest] = useState<SOSRequest | null>(null);
    const [isAegisModalOpen, setIsAegisModalOpen] = useState(false);
    
    // State for Search Verification Modal
    const [investigatingRequest, setInvestigatingRequest] = useState<SOSRequest | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<GroundedInfo | null>(null);
    const [searchError, setSearchError] = useState('');


    const { activeRequests, triageFeed } = useMemo(() => {
        const active = sosRequests.filter(req => req.status === RequestStatus.Pending || req.status === RequestStatus.InProgress);
        const sorted = [...active].sort((a, b) => b.urgencyScore - a.urgencyScore);
        return { activeRequests: active, triageFeed: sorted };
    }, [sosRequests]);
    
    const stats = useMemo(() => {
        const volunteers = new Set(sosRequests.filter(r => r.volunteerId).map(r => r.volunteerId));
        
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const resolvedToday = sosRequests.filter(r => r.status === RequestStatus.Resolved && new Date(r.timestamp) > twentyFourHoursAgo).length;

        return {
            activeRequests: activeRequests.length,
            volunteersActive: volunteers.size,
            highestUrgency: Math.max(0, ...activeRequests.map(r => r.urgencyScore)),
            resolvedToday: resolvedToday
        }
    }, [sosRequests, activeRequests]);

    const handleAcceptMission = (requestId: string) => {
        if (user) {
            assignVolunteer(requestId, user.id);
        }
    };
    
    const handleViewAegisVerification = (request: SOSRequest) => {
        setSelectedAegisRequest(request);
        setIsAegisModalOpen(true);
    };

    const handleInvestigate = async (request: SOSRequest) => {
        setInvestigatingRequest(request);
        setIsSearchModalOpen(true);
        setIsSearching(true);
        setSearchError('');
        setSearchResult(null);

        try {
            const query = `${request.emergencyType} reported at ${request.location.address}. Description: ${request.description}`;
            const result = await getSearchGroundedInfo(query);
            setSearchResult(result);
        } catch (e) {
            setSearchError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsSearching(false);
        }
    };

    const sidebarLinks = [
        { path: '/volunteer/nearby', label: 'Dashboard', icon: <Compass size={24}/> },
        { path: '/volunteer/missions', label: 'My Missions', icon: <MapIcon size={24}/> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
    ];

    return (
         <DashboardLayout sidebarLinks={sidebarLinks}>
            <div className="space-y-8">
                {/* Key Stats Section */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">Responder Dashboard</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Active Requests"
                            value={stats.activeRequests}
                            icon={<AlertTriangle size={24} />}
                            colorClass="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300"
                        />
                         <StatCard 
                            title="Volunteers Active"
                            value={stats.volunteersActive}
                            icon={<Users size={24} />}
                            colorClass="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                        />
                         <StatCard 
                            title="Highest Urgency"
                            value={`${stats.highestUrgency}/10`}
                            icon={<TrendingUp size={24} />}
                            colorClass="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300"
                        />
                         <StatCard 
                            title="Resolved Today"
                            value={stats.resolvedToday}
                            icon={<CheckCircle size={24} />}
                            colorClass="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300"
                        />
                    </div>
                </div>

                {/* Main Content: Map and Triage Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-350px)] min-h-[600px]">
                    {/* Interactive Crisis Map */}
                    <div className="lg:col-span-2 h-full">
                        <CrisisMap 
                            requests={activeRequests}
                            rumors={DUMMY_RUMORS}
                            isRumorLayerVisible={isRumorLayerVisible}
                            toggleRumorLayer={() => setIsRumorLayerVisible(!isRumorLayerVisible)}
                        />
                    </div>

                    {/* Triage Feed */}
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Bell /> Triage Feed</h2>
                        <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-4 overflow-y-auto" aria-live="polite" aria-atomic="false" aria-relevant="additions">
                             {triageFeed.length > 0 ? (
                                <div className="space-y-4">
                                {triageFeed.map(request => (
                                    <EmergencyCard 
                                        key={request.id} 
                                        request={request}
                                        onAccept={request.status === RequestStatus.Pending ? handleAcceptMission : undefined}
                                        onViewVerification={handleViewAegisVerification}
                                        onInvestigate={handleInvestigate}
                                        isVolunteer={true}
                                        currentUserId={user?.id}
                                    />
                                ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 dark:text-gray-400">No active requests. All clear!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rumor Control Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ShieldAlert /> Intelligence & Rumor Control</h2>
                    <RumorFeedWidget rumors={DUMMY_RUMORS} />
                </div>
            </div>
            {isAegisModalOpen && selectedAegisRequest && (
                <AegisVerificationModal
                    isOpen={isAegisModalOpen}
                    onClose={() => setIsAegisModalOpen(false)}
                    request={selectedAegisRequest}
                />
            )}
            {isSearchModalOpen && investigatingRequest && (
                <SearchVerificationModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    request={investigatingRequest}
                    isLoading={isSearching}
                    result={searchResult}
                    error={searchError}
                />
            )}
         </DashboardLayout>
    );
};

export default VolunteerDashboardPage;
