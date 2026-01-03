import React from 'react';
import type { SOSRequest } from '../types';
import { EmergencyType, RequestStatus, VerificationState } from '../types';
import { MapPin, ShieldCheck, HeartPulse, Flame, Waves, Zap, MoreHorizontal, Clock, Check, AlertTriangle, Search } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

interface EmergencyCardProps {
  request: SOSRequest;
  onAccept?: (requestId: string) => void;
  onViewVerification?: (request: SOSRequest) => void;
  onInvestigate?: (request: SOSRequest) => void;
  isVolunteer?: boolean;
  currentUserId?: string;
}

const getUrgencyInfo = (score: number) => {
  if (score > 8) return { label: 'CRITICAL PRIORITY', color: 'bg-critical-bg text-white', iconColor: 'bg-critical-bg' };
  if (score > 6) return { label: 'HIGH PRIORITY', color: 'bg-warning-bg text-white', iconColor: 'bg-warning-bg' };
  if (score > 3) return { label: 'MEDIUM PRIORITY', color: 'bg-medium-bg text-yellow-950 dark:text-yellow-100', iconColor: 'bg-medium-bg' };
  return { label: 'LOW PRIORITY', color: 'bg-low-bg text-white', iconColor: 'bg-low-bg' };
};


const emergencyIcons: Record<EmergencyType, React.ReactNode> = {
  [EmergencyType.Medical]: <HeartPulse className="h-5 w-5 text-white" />,
  [EmergencyType.Fire]: <Flame className="h-5 w-5 text-white" />,
  [EmergencyType.Flood]: <Waves className="h-5 w-5 text-white" />,
  [EmergencyType.Earthquake]: <Zap className="h-5 w-5 text-white" />,
  [EmergencyType.Other]: <MoreHorizontal className="h-5 w-5 text-white" />,
};

const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
        case RequestStatus.InProgress:
            return <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded">In Progress</span>;
        case RequestStatus.Resolved:
            return <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded">Resolved</span>;
        case RequestStatus.Queued:
            return <span className="text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-gray-200 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={12}/>Queued</span>;
        default:
            return null;
    }
}

const VerificationBadge: React.FC<{request: SOSRequest}> = ({ request }) => {
    if (request.verificationState === VerificationState.OfficiallyVerified) {
        return <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded flex items-center gap-1"><ShieldCheck size={12}/> Verified by {request.officialSource}</span>;
    }
    return null;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({ request, onAccept, onViewVerification, onInvestigate, isVolunteer = false, currentUserId }) => {
  const urgency = getUrgencyInfo(request.urgencyScore);
  const timeAgo = formatTimeAgo(request.timestamp);
  const statusBadge = getStatusBadge(request.status);

  const canInvestigate = isVolunteer && (
    request.verificationState === VerificationState.Unverified || 
    request.verificationState === VerificationState.ClusterVerified
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <div className={`p-2 font-bold text-center text-xs tracking-wider ${urgency.color}`}>
        {urgency.label}
      </div>
      
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${urgency.iconColor}`}>
                    {emergencyIcons[request.emergencyType]}
                </div>
                <div>
                    <h3 className="text-lg font-bold">{request.emergencyType}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{timeAgo}</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                {statusBadge}
                <VerificationBadge request={request} />
            </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <MapPin size={16} className="flex-shrink-0" /> 
            <span className="truncate">{request.location.address}</span>
        </div>
        
        {request.description && <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">{request.description}</p>}
        
        {request.volunteerId && isVolunteer && request.volunteerId === currentUserId && (
             <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
                <ShieldCheck size={16} /> 
                <span>Assigned to you</span>
             </div>
        )}
      </div>
      
      {isVolunteer && (
        <div className="bg-gray-50 dark:bg-slate-800/50 p-3 mt-auto space-y-2">
            {request.verificationState === VerificationState.AegisVerified && onViewVerification && (
                <button
                    onClick={() => onViewVerification(request)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-transform active:scale-95 min-h-[44px]"
                >
                    <ShieldCheck size={16} /> View Aegis Verification
                </button>
            )}
             {canInvestigate && onInvestigate && (
                <button
                    onClick={() => onInvestigate(request)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-transform active:scale-95 min-h-[44px]"
                >
                    <Search size={16} /> Investigate with AI
                </button>
            )}
            {onAccept && request.status === RequestStatus.Pending && (
                <button
                    onClick={() => onAccept(request.id)}
                    className="w-full flex items-center justify-center gap-2 bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition-transform active:scale-95 disabled:bg-primary-300 min-h-[44px]"
                >
                    <Check size={16} /> Accept Mission
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default EmergencyCard;
