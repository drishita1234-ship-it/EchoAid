
import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyType, RequestStatus } from '../types';
import { Send, Loader2, ListChecks, UserCircle, MapPin, HeartPulse, Flame, Waves, Zap, MoreHorizontal, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import CalmProtocol from '../components/CalmProtocol';
import { getSearchGroundedInfo, GroundedInfo } from '../services/geminiService';

const emergencyTypesWithOptions = [
    { type: EmergencyType.Medical, icon: <HeartPulse size={40} />, label: 'Medical' },
    { type: EmergencyType.Fire, icon: <Flame size={40} />, label: 'Fire' },
    { type: EmergencyType.Flood, icon: <Waves size={40} />, label: 'Flood' },
    { type: EmergencyType.Earthquake, icon: <Zap size={40} />, label: 'Earthquake' },
    { type: EmergencyType.Other, icon: <MoreHorizontal size={40} />, label: 'Other' },
];

type SubmissionStatus = 'idle' | 'detecting_location' | 'submitting' | 'success' | 'queued' | 'error';


const SosSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { submitSOSRequest } = useContext(AppContext)!;
  const { user } = useAuth();
  
  const [emergencyType, setEmergencyType] = useState<EmergencyType>(EmergencyType.Medical);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: '' });
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState('');
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [isFetchingGroundedInfo, setIsFetchingGroundedInfo] = useState(false);
  const [groundedInfo, setGroundedInfo] = useState<GroundedInfo | null>(null);
  
  const handleDetectLocation = useCallback(() => {
    setSubmissionStatus('detecting_location');
    setStatusMessage('Acquiring your location. Please wait.');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            address: 'Current Location Detected'
        });
        setSubmissionStatus('idle');
        setStatusMessage('Location detected.');
      },
      () => {
        setError('Could not get your location. Please enter it manually.');
        setSubmissionStatus('idle');
        setStatusMessage('Location detection failed. Please enter address manually.');
        addressInputRef.current?.focus();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // Automatically detect location when the component mounts.
    handleDetectLocation();
  }, [handleDetectLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.address.trim()) {
      setError('Please provide a location and a brief description.');
      return;
    }
    
    setSubmissionStatus('submitting');
    setStatusMessage('Submitting your SOS request.');
    setError('');

    try {
      if (!user) throw new Error("User not found");
      
      const result = await submitSOSRequest({
        requesterId: user.id,
        name: user.name,
        location,
        emergencyType,
        description,
      });
      
      if(result) {
        setSubmittedRequestId(result.id);
        if (result.status === RequestStatus.Queued) {
          setSubmissionStatus('queued');
          setStatusMessage('Request queued. You appear to be offline. Your request will be sent when you reconnect.');
        } else {
          setSubmissionStatus('success');
          setStatusMessage('SOS request submitted successfully. Fetching local info...');

          setIsFetchingGroundedInfo(true);
          try {
            const query = `For an emergency of type "${emergencyType}" at ${location.address}, what are the immediate safety instructions and official advice from reliable sources?`;
            const info = await getSearchGroundedInfo(query);
            setGroundedInfo(info);
          } catch (e) {
            console.error("Failed to get grounded info:", e);
            // Don't fail the whole flow, just log it. The user has already sent the SOS.
            // The CalmProtocol will handle the null state.
          } finally {
            setIsFetchingGroundedInfo(false);
          }
        }
      } else {
          throw new Error("Failed to get submission result.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setSubmissionStatus('error');
      setError(errorMessage);
      setStatusMessage(`Submission failed: ${errorMessage}`);
    }
  };

  const handleResetForm = () => {
    setEmergencyType(EmergencyType.Medical);
    setDescription('');
    setLocation({ lat: 0, lng: 0, address: '' });
    setSubmissionStatus('idle');
    setSubmittedRequestId(null);
    setError('');
    setGroundedInfo(null);
    setIsFetchingGroundedInfo(false);
    handleDetectLocation();
  };


  const sidebarLinks = [
        { path: '/requester/requests', label: 'My Requests', icon: <ListChecks size={24}/> },
        { path: '/requester/new-sos', label: 'New SOS', icon: <Send size={24}/> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
    ];

  const renderStatusScreen = () => {
    switch (submissionStatus) {
      case 'success':
        return <CalmProtocol 
                    emergencyType={emergencyType} 
                    requestId={submittedRequestId!} 
                    onClose={() => navigate('/requester/requests')}
                    isFetchingGroundedInfo={isFetchingGroundedInfo}
                    groundedInfo={groundedInfo}
                />;
      case 'queued':
        return (
          <div className="text-center p-8">
            <WifiOff size={64} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Request Queued</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              You appear to be offline. Your SOS request has been saved and will be sent automatically as soon as your connection is restored. Please keep the app open if possible.
            </p>
             <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={() => navigate('/requester/requests')} className="bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition">View My Requests</button>
                <button onClick={handleResetForm} className="font-semibold text-primary-600 dark:text-primary-400">Submit Another Report</button>
            </div>
          </div>
        );
      case 'error':
         return (
          <div className="text-center p-8">
            <AlertTriangle size={64} className="mx-auto text-critical-bg mb-4" />
            <h2 className="text-3xl font-bold mb-2">Submission Failed</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <button onClick={handleResetForm} className="bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition">Try Again</button>
          </div>
        );
      default:
        return null;
    }
  };

  const isFormDisabled = submissionStatus === 'submitting' || submissionStatus === 'detecting_location';

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 min-h-[500px] flex items-center justify-center">
              <div aria-live="assertive" className="sr-only">
                {statusMessage}
              </div>
              {submissionStatus === 'idle' || submissionStatus === 'submitting' || submissionStatus === 'detecting_location' ? (
                <div className="p-6 sm:p-8 w-full">
                  <div className="text-center">
                    <AlertTriangle className="mx-auto text-critical-bg" size={48} />
                    <h1 className="text-3xl font-extrabold mt-4 mb-2">Submit SOS Request</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Stay calm. Provide as much information as you can safely.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">1. Your Location</label>
                      <button type="button" onClick={handleDetectLocation} disabled={isFormDisabled} className="w-full flex justify-center items-center gap-3 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold py-4 px-4 text-lg rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900 transition disabled:opacity-50 disabled:cursor-wait min-h-[60px]">
                        {submissionStatus === 'detecting_location' ? <Loader2 className="animate-spin" /> : <MapPin />}
                        {submissionStatus === 'detecting_location' ? 'Acquiring your location...' : 'Auto-detect Location'}
                      </button>
                      <input ref={addressInputRef} type="text" id="location" value={location.address} onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))} className="mt-3 text-lg block w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Or enter address manually" required disabled={isFormDisabled}/>
                      {location.lat !== 0 && <p className="text-xs text-gray-500 mt-1 text-center">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
                    </div>
                    <div>
                      <label className="block text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">2. What's happening?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {emergencyTypesWithOptions.map(({ type, icon, label }) => (
                              <button key={type} type="button" aria-label={`Select emergency type: ${label}`} onClick={() => setEmergencyType(type)} disabled={isFormDisabled} className={`flex flex-col items-center justify-center text-center p-4 min-h-[128px] rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${emergencyType === type ? 'bg-primary-500 text-white border-primary-600 shadow-lg scale-105' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-600'}`}>
                                  {icon}
                                  <span className="mt-2 text-md font-bold">{label}</span>
                              </button>
                          ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">3. Add details (optional but helpful)</label>
                      <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="text-lg mt-1 block w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Any details can help. E.g., 'Person is unconscious.'" required disabled={isFormDisabled}/>
                    </div>
                    {error && <p className="text-red-500 text-center text-md font-semibold">{error}</p>}
                    <button type="submit" disabled={isFormDisabled} className="w-full flex justify-center items-center gap-3 bg-critical-bg text-white font-extrabold py-5 px-4 text-2xl rounded-lg hover:bg-critical-border transition disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed shadow-lg min-h-[72px]">
                      {submissionStatus === 'submitting' ? <Loader2 className="animate-spin" /> : <Send />}
                      {submissionStatus === 'submitting' ? 'SENDING...' : 'SEND SOS NOW'}
                    </button>
                  </form>
                </div>
              ) : (
                renderStatusScreen()
              )}
            </div>
        </div>
    </DashboardLayout>
  );
};

export default SosSubmissionPage;
