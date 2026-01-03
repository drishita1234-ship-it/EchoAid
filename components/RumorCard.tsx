import React from 'react';
import type { Rumor } from '../types';
import { RumorState } from '../types';
import { formatTimeAgo } from '../utils/formatters';
import { HelpCircle, ShieldAlert, XCircle, CheckCircle } from 'lucide-react';

interface RumorCardProps {
    rumor: Rumor;
}

const getRumorStateInfo = (state: RumorState) => {
    switch (state) {
        case RumorState.Investigating:
            return {
                label: 'INVESTIGATING',
                icon: <HelpCircle className="h-4 w-4" />,
                colorClasses: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
            };
        case RumorState.Confirmed:
             return {
                label: 'CONFIRMED',
                icon: <ShieldAlert className="h-4 w-4" />,
                colorClasses: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
            };
        case RumorState.Debunked:
            return {
                label: 'DEBUNKED',
                icon: <XCircle className="h-4 w-4" />,
                colorClasses: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
            };
        default:
            return { label: 'UNKNOWN', icon: null, colorClasses: 'bg-gray-100 text-gray-800' };
    }
};


const RumorCard: React.FC<RumorCardProps> = ({ rumor }) => {
    const stateInfo = getRumorStateInfo(rumor.state);
    const timeAgo = formatTimeAgo(rumor.timestamp);
    const timePrefix = rumor.state === RumorState.Debunked ? 'Debunked' : 'Updated';

    return (
        <div className={`p-4 rounded-lg border-l-4 ${stateInfo.colorClasses.replace('bg-', 'border-')}`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 flex-1 pr-2">{rumor.title}</h4>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${stateInfo.colorClasses}`}>
                    {stateInfo.icon}
                    <span>{stateInfo.label}</span>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">{rumor.details.description}</p>
            
            <div className="flex flex-col sm:flex-row justify-between items-start text-xs text-gray-500 dark:text-gray-400 gap-2">
                {rumor.details.sourceOfTruth && (
                     <div className="font-semibold flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle size={14} />
                        <span>Source: {rumor.details.sourceOfTruth}</span>
                     </div>
                )}
                <span className="font-medium text-right sm:ml-auto">{timePrefix} {timeAgo}</span>
            </div>
        </div>
    );
};

export default RumorCard;