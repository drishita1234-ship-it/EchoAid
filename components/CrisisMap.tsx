
import React, { useState, useEffect, useRef } from 'react';
import type { SOSRequest, Rumor } from '../types';
import { EmergencyType, RequestStatus, VerificationState, RumorState } from '../types';
import { HeartPulse, Flame, Waves, Zap, MoreHorizontal, ShieldCheck, MapPin, Check, AlertTriangle, HelpCircle, XCircle, ShieldAlert } from 'lucide-react';

const emergencyIcons: Record<EmergencyType, React.ReactNode> = {
  [EmergencyType.Medical]: <HeartPulse className="h-5 w-5 text-white" />,
  [EmergencyType.Fire]: <Flame className="h-5 w-5 text-white" />,
  [EmergencyType.Flood]: <Waves className="h-5 w-5 text-white" />,
  [EmergencyType.Earthquake]: <Zap className="h-5 w-5 text-white" />,
  [EmergencyType.Other]: <MoreHorizontal className="h-5 w-5 text-white" />,
};

// Use colors with WCAG AA compliant contrast for text
const getUrgencyClasses = (score: number) => {
  if (score > 8) return { bg: 'bg-red-700', ring: 'bg-red-400', text: 'text-white' };
  if (score > 6) return { bg: 'bg-amber-700', ring: 'bg-amber-500', text: 'text-white' };
  if (score > 3) return { bg: 'bg-yellow-500', ring: 'bg-yellow-400', text: 'text-yellow-950' };
  return { bg: 'bg-green-800', ring: 'bg-green-500', text: 'text-white' };
};


interface CrisisMapProps {
  requests: SOSRequest[];
  rumors: Rumor[];
  isRumorLayerVisible: boolean;
  toggleRumorLayer: () => void;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const convertLatLngToPercent = (lat: number, lng: number) => {
  const latMin = 8.0, latMax = 37.0; // Approx lat range for India
  const lngMin = 68.0, lngMax = 98.0; // Approx lng range for India

  const left = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const top = ((latMax - lat) / (latMax - latMin)) * 100;

  return { left: `${left}%`, top: `${top}%` };
};


const CrisisMap: React.FC<CrisisMapProps> = ({ requests, rumors, isRumorLayerVisible, toggleRumorLayer }) => {
  const [pulsingPinId, setPulsingPinId] = useState<string | null>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  
  const prevRequests = usePrevious(requests);
  const prevRumors = usePrevious(rumors);

  useEffect(() => {
    if (prevRequests && requests.length > prevRequests.length) {
      const newRequestsCount = requests.length - prevRequests.length;
      setLiveRegionMessage(`${newRequestsCount} new SOS ${newRequestsCount > 1 ? 'requests' : 'request'} added to the map.`);
    }
  }, [requests, prevRequests]);

  useEffect(() => {
    if (prevRumors && rumors) {
      for (const newRumor of rumors) {
        const oldRumor = prevRumors.find(r => r.id === newRumor.id);
        if (oldRumor && oldRumor.state !== newRumor.state) {
          setLiveRegionMessage(`Rumor status updated: ${newRumor.title} is now ${newRumor.state}.`);
          break; // Announce first change found
        }
      }
    }
  }, [rumors, prevRumors]);


  useEffect(() => {
    if (prevRequests && requests) {
        for (const newReq of requests) {
            const oldReq = prevRequests.find(r => r.id === newReq.id);
            if (oldReq && newReq.lastPulseTimestamp !== oldReq.lastPulseTimestamp) {
                setPulsingPinId(newReq.id);
                const timer = setTimeout(() => setPulsingPinId(null), 3000);
                return () => clearTimeout(timer);
            }
        }
    }
  }, [requests, prevRequests]);

  const renderPin = (req: SOSRequest) => {
    const urgency = getUrgencyClasses(req.urgencyScore);
    const isAccepted = req.status === RequestStatus.InProgress;
    const isPulsing = req.id === pulsingPinId;
    const { verificationState = VerificationState.Unverified, clusterCount = 0 } = req;
    const { left, top } = convertLatLngToPercent(req.location.lat, req.location.lng);
    
    let pinContent;
    switch (verificationState) {
        case VerificationState.AegisVerified:
        case VerificationState.OfficiallyVerified:
            pinContent = (
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full ${urgency.bg} shadow-lg ring-4 ring-offset-2 dark:ring-offset-slate-700 ring-blue-500 z-10`}>
                    <div className="absolute -top-2 -right-2 z-20 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-md">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="relative z-10">{emergencyIcons[req.emergencyType]}</div>
                </div>
            );
            break;
        case VerificationState.ClusterVerified:
            pinContent = (
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 shadow-md z-10`}>
                    <div className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" style={{ animation: 'pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    <span className="relative text-white font-bold text-sm">{clusterCount}</span>
                </div>
            );
            break;
        case VerificationState.Unverified:
        default:
            pinContent = <div className={`relative w-6 h-6 rounded-full ${urgency.bg} shadow-sm z-10 ring-2 ring-white dark:ring-slate-700`}></div>;
    }
    
    return (
        <div 
            key={req.id} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex items-center justify-center w-12 h-12"
            style={{ top, left }}
            role="button"
            aria-label={`SOS Request: ${req.emergencyType} at ${req.location.address}`}
        >
             {isPulsing && (
                <div 
                    className={`absolute w-16 h-16 rounded-full ${urgency.bg} z-0`}
                    style={{ animation: 'ping-pulse 2s ease-out forwards' }}
                ></div>
            )}
            {pinContent}
            <div className="absolute bottom-full mb-2 w-56 p-3 text-sm bg-white dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-200 dark:border-slate-600 z-20">
              <p className="font-bold text-base flex items-center gap-2">{emergencyIcons[req.emergencyType]} {req.emergencyType}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-start gap-1"><MapPin size={14} className="mt-0.5"/>{req.location.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`px-2 py-0.5 inline-block rounded-full text-xs font-semibold ${urgency.bg} ${urgency.text}`}>
                    Urgency: {req.urgencyScore}/10
                </div>
                 {isAccepted && <p className="text-xs font-bold text-blue-500 flex items-center gap-1"><Check size={14}/>Accepted</p>}
              </div>
            </div>
        </div>
    );
  };
  
  const renderRumor = (rumor: Rumor) => {
    let icon, colorClass, pulseClass = '';
    const { left, top } = convertLatLngToPercent(rumor.location.lat, rumor.location.lng);

    switch(rumor.state) {
        case RumorState.Investigating:
            icon = <HelpCircle size={32} />;
            colorClass = 'text-yellow-500 bg-yellow-500/10';
            pulseClass = 'animate-pulse';
            break;
        case RumorState.Debunked:
            icon = <XCircle size={32} />;
            colorClass = 'text-red-500 bg-red-500/10 opacity-70';
            break;
        case RumorState.Confirmed:
            icon = <ShieldAlert size={32} />;
            colorClass = 'text-red-600 bg-red-600/20';
            break;
    }

    return (
        <div
            key={rumor.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex items-center justify-center w-12 h-12"
            style={{ top, left }}
            role="button"
            aria-label={`Rumor: ${rumor.title}, Status: ${rumor.state}`}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl ${colorClass} ${pulseClass}`}>
                {icon}
            </div>
             <div className="absolute bottom-full mb-2 w-64 p-3 text-sm bg-white dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-200 dark:border-slate-600 z-20">
              <p className="font-bold text-base">{rumor.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{rumor.details.description}</p>
              {rumor.details.sourceOfTruth && <p className="text-xs font-bold text-primary-500 mt-1">Source: {rumor.details.sourceOfTruth}</p>}
            </div>
        </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden border border-gray-300 dark:border-slate-600">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
            {liveRegionMessage}
        </div>
        <div className="absolute top-3 right-3 z-20">
            <button 
                onClick={toggleRumorLayer} 
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-md min-h-[44px] ${isRumorLayerVisible ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}
            >
                <ShieldAlert size={16} /> Rumor Control
            </button>
        </div>
        
        {/* Simplified SVG of India as a background */}
        <svg viewBox="0 0 400 450" className="absolute inset-0 w-full h-full text-gray-300 dark:text-slate-600" fill="currentColor">
            <path d="M213.9,1.5c-2.3,1.3-4.5,2.6-6.6,4.1c-1.3,0.9-2.5,1.9-3.7,2.9c-4,3.2-7.8,6.8-11.2,10.7c-2.8,3.2-5.3,6.6-7.5,10.2 c-1.5,2.5-2.9,5.1-4.2,7.7c-2.5,5.1-4.5,10.5-5.9,15.9c-0.8,3.1-1.5,6.3-2,9.5c-1,5.9-1.6,11.9-1.6,17.9c0.1,3.4,0.1,6.8,0.4,10.2 c0.5,6.5,1.5,12.9,2.9,19.2c0.9,3.8,1.9,7.5,3.1,11.2c1.7,5.2,3.7,10.3,5.9,15.3c1.7,3.9,3.5,7.7,5.3,11.5 c2,4.1,4.1,8.1,6.2,12.1c1.5,2.8,2.9,5.6,4.3,8.4c-3.1,1.5-6.2,3-9.2,4.6c-2,1.1-4,2.2-6,3.3c-2.1,1.2-4.2,2.4-6.3,3.6 c-2.3,1.3-4.6,2.6-6.8,3.9c-3.4,2-6.7,3.9-9.9,5.9c-2.1,1.3-4.2,2.6-6.2,4c-1.8,1.2-3.6,2.5-5.4,3.7c-1,0.7-2,1.4-3,2.1 c-2.6,1.9-5.1,3.9-7.5,6c-1,0.9-2,1.8-3,2.7c-2.2,2-4.4,4.1-6.4,6.3c-2.4,2.7-4.7,5.5-6.8,8.4c-1.6,2.2-3.2,4.4-4.6,6.7 c-2,3.2-3.9,6.4-5.6,9.8c-1,2-1.9,3.9-2.8,5.9c-1.5,3.2-2.8,6.4-4,9.7c-1.2,3.3-2.3,6.6-3.2,10c-0.9,3.2-1.7,6.4-2.3,9.7 c-0.6,3.1-1.1,6.3-1.4,9.4c-0.3,3.4-0.4,6.8-0.3,10.2c0,2.1,0.1,4.2,0.3,6.3c0.2,2.3,0.5,4.6,0.9,6.8c0.4,2.3,1,4.6,1.6,6.9 c0.6,2.3,1.3,4.6,2.1,6.8c1.3,3.7,2.8,7.3,4.6,10.8c1.1,2.2,2.2,4.4,3.5,6.5c1.1,1.8,2.2,3.6,3.4,5.4c1,1.5,2,3,3,4.4 c0.7,1,1.4,2,2.1,2.9c0.9,1.2,1.8,2.4,2.7,3.5c1.4,1.8,2.9,3.5,4.4,5.1c0.8,0.8,1.6,1.6,2.4,2.4c1.1,1,2.2,2,3.3,2.9 c-0.2,2-0.4,3.9-0.5,5.9c-0.1,1.2-0.2,2.4-0.2,3.6c-0.1,2.6-0.1,5.2-0.1,7.8c0,1.5,0,3,0,4.4c0.1,2.1,0.2,4.2,0.3,6.3 c0.2,2.6,0.5,5.2,0.8,7.8c0.1,1.1,0.3,2.2,0.4,3.3c0.2,1.8,0.4,3.6,0.7,5.4c0.3,1.9,0.7,3.8,1.1,5.7c0.2,1,0.5,2,0.8,3 c0.3,1.1,0.7,2.2,1.1,3.3c0.4,1.1,0.9,2.2,1.4,3.3c0.5,1,1,2,1.6,3c0.8,1.3,1.6,2.6,2.5,3.9c0.9,1.3,1.8,2.6,2.8,3.8 c1,1.2,2,2.4,3,3.6c2.8,3.2,5.7,6.2,8.6,9.1c1,1,2,2,3,3c1.2,1.2,2.4,2.4,3.6,3.6c1,1,2,1.9,3,2.9c0.7,0.7,1.4,1.4,2.1,2 c0.7,0.7,1.5,1.3,2.2,2c0.7,0.6,1.4,1.2,2.1,1.8c1.7,1.4,3.4,2.7,5.2,3.9c1,0.7,2,1.4,3,2c1.4,0.9,2.8,1.7,4.2,2.5 c1.5,0.9,3,1.7,4.5,2.5c2.9,1.6,5.8,3,8.7,4.3c3.1,1.4,6.2,2.6,9.4,3.6c3.2,1,6.4,1.9,9.6,2.6c1.6,0.4,3.2,0.7,4.8,1 c3.4,0.7,6.8,1.1,10.2,1.4c3.4,0.3,6.8,0.4,10.2,0.4c3.4,0,6.8-0.1,10.2-0.4c3.4-0.3,6.8-0.7,10.2-1.4c1.6-0.3,3.2-0.7,4.8-1 c3.2-0.7,6.4-1.6,9.6-2.6c3.2-1,6.3-2.2,9.4-3.6c2.9-1.3,5.8-2.7,8.7-4.3c1.5-0.8,3-1.6,4.5-2.5c1.4-0.8,2.8-1.6,4.2-2.5 c1-0.6,2-1.3,3-2c1.8-1.2,3.5-2.5,5.2-3.9c0.7-0.6,1.4-1.2,2.1-1.8c0.7-0.6,1.5-1.3,2.2-2c0.7-0.6,1.4-1.3,2.1-2 c1-1,2-1.9,3-2.9c1.2-1.2,2.4-2.4,3.6-3.6c1-1,2-2,3-3c2.9-2.9,5.8-5.9,8.6-9.1c1-1.2,2-2.4,3-3.6c1-1.2,1.9-2.5,2.8-3.8 c0.9-1.3,1.7-2.6,2.5-3.9c0.6-1,1.1-2,1.6-3c0.5-1.1,1-2.2,1.4-3.3c0.4-1.1,0.8-2.2,1.1-3.3c0.3-1,0.6-2,0.8-3 c0.4-1.9,0.8-3.8,1.1-5.7c0.3-1.8,0.5-3.6,0.7-5.4c0.1-1.1,0.3-2.2,0.4-3.3c0.3-2.6,0.6-5.2,0.8-7.8c0.1-2.1,0.2-4.2,0.3-6.3 c0-1.5,0-3,0-4.4c0-2.6,0-5.2-0.1-7.8c-0.1-1.2-0.1-2.4-0.2-3.6c-0.1-2-0.3-3.9-0.5-5.9c1.1-0.9,2.2-1.9,3.3-2.9 c0.8-0.8,1.6-1.6,2.4-2.4c1.5-1.6,3-3.3,4.4-5.1c0.9-1.1,1.8-2.3,2.7-3.5c0.7-0.9,1.4-1.9,2.1-2.9c0.7-1,1.4-2,2.1-2.9 c1.2-1.8,2.3-3.6,3.4-5.4c1.3-2.1,2.4-4.3,3.5-6.5c1.8-3.5,3.3-7.1,4.6-10.8c0.8-2.2,1.5-4.5,2.1-6.8c0.6-2.3,1.2-4.6,1.6-6.9 c0.4-2.3,0.7-4.6,0.9-6.8c0.2-2.1,0.3-4.2,0.3-6.3c0.1-3.4,0-6.8-0.3-10.2c-0.3-3.1-0.8-6.3-1.4-9.4c-0.6-3.3-1.4-6.5-2.3-9.7 c-0.9-3.4-2-6.7-3.2-10c-1.2-3.3-2.5-6.5-4-9.7c-0.9-2-1.8-3.9-2.8-5.9c-1.7-3.4-3.6-6.6-5.6-9.8c-1.4-2.3-3-4.5-4.6-6.7 c-2.1-2.9-4.4-5.7-6.8-8.4c-2-2.2-4-4.3-6.4-6.3c-1-0.9-2-1.8-3-2.7c-2.4-2.1-4.9-4.1-7.5-6c-1-0.7-2-1.4-3-2.1 c-1.8-1.2-3.6-2.5-5.4-3.7c-2-1.4-4.1-2.7-6.2-4c-3.2-2-6.5-3.9-9.9-5.9c-2.2-1.3-4.5-2.6-6.8-3.9c-2.1-1.2-4.2-2.4-6.3-3.6 c-2-1.1-4-2.2-6-3.3c-3-1.6-6.1-3.1-9.2-4.6c1.4-2.8,2.8-5.6,4.3-8.4c2.1-4,4.2-8,6.2-12.1c2-3.8,3.8-7.6,5.3-11.5 c2.2-5,4.2-10.1,5.9-15.3c1.2-3.7,2.2-7.4,3.1-11.2c1.4-6.3,2.4-12.7,2.9-19.2c0.3-3.4,0.3-6.8,0.4-10.2 c-0.1-6-0.6-12-1.6-17.9c-0.5-3.2-1.2-6.4-2-9.5c-1.4-5.4-3.4-10.8-5.9-15.9c-1.3-2.6-2.7-5.2-4.2-7.7c-2.2-3.6-4.7-7-7.5-10.2 c-3.4-3.9-7.2-7.5-11.2-10.7c-1.2-1-2.4-2-3.7-2.9C218.4,4.1,216.2,2.8,213.9,1.5z M226.4,26.4c-1.1,1.8-2.3,3.6-3.4,5.4 c-0.9,1.5-1.8,3-2.7,4.6c-1.4,2.5-2.7,5.1-3.9,7.7c-1.8,4.1-3.3,8.3-4.5,12.6c-0.8,2.9-1.5,5.8-2,8.7c-0.8,4.3-1.3,8.7-1.5,13.1 c-0.1,2.8-0.1,5.6,0,8.4c0.1,3,0.3,6,0.7,9c0.6,4.4,1.6,8.8,2.8,13.1c0.9,3.1,1.8,6.2,2.8,9.3c1.3,4,2.7,7.9,4.2,11.8 c1.2,3,2.4,6,3.7,8.9c1,2.1,2,4.2,3,6.3c0.3,0.7,0.7,1.4,1,2.1c-1.7,0.7-3.4,1.4-5.1,2.1c-1.5,0.6-3,1.3-4.5,1.9 c-2.3,1-4.6,2-6.8,3.1c-1.7,0.9-3.4,1.7-5.1,2.6c-1.1,0.6-2.2,1.2-3.3,1.8c-1.7,0.9-3.4,1.9-5,2.8c-1.4,0.8-2.8,1.7-4.2,2.5 c-1.6,1-3.2,2-4.7,3.1c-1.8,1.3-3.5,2.6-5.2,4c-1.1,0.9-2.2,1.8-3.2,2.8c-1.5,1.5-2.9,3-4.3,4.6c-1.5,1.7-3,3.5-4.3,5.3 c-1,1.4-1.9,2.8-2.8,4.3c-1.3,2.1-2.5,4.3-3.6,6.5c-0.8,1.6-1.6,3.2-2.3,4.8c-1,2.3-1.9,4.6-2.7,6.9c-0.8,2.3-1.5,4.7-2.1,7.1 c-0.5,2-0.9,4-1.2,6c-0.3,2.1-0.5,4.2-0.6,6.3c-0.1,2.2-0.1,4.4,0,6.6c0.1,2.5,0.2,5,0.5,7.5c0.3,2.5,0.7,5,1.2,7.5 c0.5,2.4,1,4.8,1.6,7.2c1,3.5,2.2,6.9,3.6,10.2c0.8,1.9,1.6,3.8,2.5,5.6c0.8,1.6,1.6,3.2,2.4,4.8c0.6,1.2,1.2,2.4,1.8,3.6 c0.7,1.4,1.4,2.8,2.1,4.1c1.2,2.1,2.4,4.1,3.7,6.1c0.7,1,1.4,2,2.1,3c0.8,1.1,1.6,2.2,2.4,3.3c1,1.3,2,2.6,3,3.9 c-0.1,1.1-0.2,2.2-0.3,3.3c-0.1,1.4-0.1,2.8-0.1,4.2c0,1.8,0,3.6,0.1,5.4c0.1,2.1,0.2,4.2,0.4,6.3c0.1,1.3,0.3,2.6,0.4,3.9 c0.2,1.5,0.4,3,0.7,4.5c0.2,1.3,0.5,2.6,0.8,3.9c0.3,1.2,0.6,2.4,0.9,3.6c0.1,0.6,0.3,1.2,0.4,1.8c0.8,2.3,1.6,4.6,2.5,6.8 c0.7,1.7,1.4,3.4,2.1,5.1c0.9,2,1.8,3.9,2.8,5.8c1,1.9,2,3.8,3,5.6c1.8,3.3,3.7,6.4,5.6,9.4c1.1,1.7,2.2,3.4,3.3,5.1 c0.8,1.2,1.6,2.4,2.4,3.6c0.7,1,1.4,2,2.1,2.9c1,1.2,2,2.4,3,3.6c1.1,1.3,2.2,2.6,3.3,3.8c1.3,1.4,2.6,2.8,3.9,4.1 c1,1,2,2,3,3c1.7,1.6,3.4,3.1,5.1,4.6c2.4,2,4.8,3.9,7.2,5.6c1.7,1.2,3.4,2.3,5.1,3.3c1.9,1.1,3.8,2.1,5.7,3 c2,0.9,4,1.7,6,2.4c2.8,1,5.6,1.8,8.4,2.4c2.9,0.6,5.8,1,8.7,1.2c2.9,0.2,5.8,0.2,8.7,0c2.9-0.2,5.8-0.6,8.7-1.2 c2.8-0.6,5.6-1.4,8.4-2.4c2-0.7,4-1.5,6-2.4c1.9-0.9,3.8-1.9,5.7-3c1.7-1,3.4-2.1,5.1-3.3c2.4-1.7,4.8-3.6,7.2-5.6 c1.7-1.5,3.4-3,5.1-4.6c1-1,2-2,3-3c1.3-1.3,2.6-2.7,3.9-4.1c1.1-1.2,2.2-2.5,3.3-3.8c1-1.2,2-2.4,3-3.6 c0.7-1,1.4-1.9,2.1-2.9c0.8-1.2,1.6-2.4,2.4-3.6c1.1-1.7,2.2-3.4,3.3-5.1c1.9-2.9,3.8-6,5.6-9.4c1-1.8,2-3.7,3-5.6 c1-1.9,1.9-3.8,2.8-5.8c0.7-1.7,1.4-3.4,2.1-5.1c0.9-2.2,1.7-4.5,2.5-6.8c0.1-0.6,0.3-1.2,0.4-1.8c0.3-1.2,0.6-2.4,0.9-3.6 c0.3-1.3,0.5-2.6,0.8-3.9c0.2-1.5,0.4-3,0.7-4.5c0.2-1.3,0.3-2.6,0.4-3.9c0.2-2.1,0.3-4.2,0.4-6.3c0.1-1.8,0.1-3.6,0.1-5.4 c0-1.4,0-2.8-0.1-4.2c-0.1-1.1-0.2-2.2-0.3-3.3c1-1.3,2-2.6,3-3.9c0.8-1.1,1.6-2.2,2.4-3.3c0.7-1,1.4-2,2.1-3 c1.3-2,2.5-4,3.7-6.1c0.7-1.3,1.4-2.7,2.1-4.1c0.6-1.2,1.2-2.4,1.8-3.6c0.8-1.6,1.6-3.2,2.4-4.8c0.9-1.8,1.7-3.7,2.5-5.6 c1.4-3.3,2.6-6.7,3.6-10.2c0.6-2.4,1.1-4.8,1.6-7.2c0.5-2.5,0.9-5,1.2-7.5c0.3-2.5,0.4-5,0.5-7.5c0.1-2.2,0.1-4.4,0-6.6 c-0.1-2.1-0.3-4.2-0.6-6.3c-0.3-2-0.7-4-1.2-6c-0.6-2.4-1.3-4.8-2.1-7.1c-0.8-2.3-1.7-4.6-2.7-6.9c-0.7-1.6-1.5-3.2-2.3-4.8 c-1.1-2.2-2.3-4.4-3.6-6.5c-0.9-1.5-1.8-2.9-2.8-4.3c-1.3-1.8-2.8-3.6-4.3-5.3c-1.4-1.6-2.8-3.1-4.3-4.6c-1-1-2.1-1.9-3.2-2.8 c-1.7-1.4-3.5-2.7-5.2-4c-1.5-1.1-3.1-2.1-4.7-3.1c-1.4-0.8-2.8-1.7-4.2-2.5c-1.6-0.9-3.3-1.8-5-2.8c-1.1-0.6-2.2-1.2-3.3-1.8 c-1.7-0.9-3.4-1.7-5.1-2.6c-2.2-1.1-4.5-2.1-6.8-3.1c-1.5-0.6-3-1.3-4.5-1.9c-1.7-0.7-3.4-1.4-5.1-2.1c0.3-0.7,0.7-1.4,1-2.1 c1-2.1,2-4.2,3-6.3c1.3-2.9,2.5-5.9,3.7-8.9c1.5-3.9,2.9-7.8,4.2-11.8c1-3.1,1.9-6.2,2.8-9.3c1.2-4.3,2.2-8.7,2.8-13.1 c0.4-3,0.6-6,0.7-9c0.1-2.8,0.1-5.6,0-8.4c-0.2-4.4-0.7-8.8-1.5-13.1c-0.5-2.9-1.2-5.8-2-8.7c-1.2-4.3-2.7-8.5-4.5-12.6 c-1.2-2.6-2.5-5.2-3.9-7.7c-0.9-1.6-1.8-3.1-2.7-4.6C228.7,30,227.5,28.2,226.4,26.4z"></path>
        </svg>

      {requests.map(req => renderPin(req))}
      {isRumorLayerVisible && rumors.map(rumor => renderRumor(rumor))}
    </div>
  );
};

export default CrisisMap;