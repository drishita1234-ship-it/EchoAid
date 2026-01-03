import React from 'react';
import { DUMMY_OFFICIAL_ALERTS } from '../constants';
import type { OfficialAlert } from '../types';
import { formatTimeAgo } from '../utils/formatters';
import { AlertTriangle, CloudRain, Waves, Zap } from 'lucide-react';

const getSourceInfo = (source: OfficialAlert['source']) => {
    switch(source) {
        case 'IMD': return { name: 'India Meteorological Dept.', icon: <CloudRain className="h-6 w-6 text-blue-500" />, color: 'border-blue-500' };
        case 'CWC': return { name: 'Central Water Commission', icon: <Waves className="h-6 w-6 text-cyan-500" />, color: 'border-cyan-500' };
        case 'NCS': return { name: 'National Center for Seismology', icon: <Zap className="h-6 w-6 text-purple-500" />, color: 'border-purple-500' };
        default: return { name: 'Official Source', icon: <AlertTriangle className="h-6 w-6 text-gray-500" />, color: 'border-gray-500' };
    }
}

const getSeverityClass = (severity: OfficialAlert['severity']) => {
    switch(severity) {
        case 'Red Alert': return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
        case 'Orange Alert': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
        case 'Danger Level': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300';
        case 'Warning': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
        default: return 'bg-gray-100 dark:bg-gray-700';
    }
}

const OfficialAlertCard: React.FC<{ alert: OfficialAlert }> = ({ alert }) => {
    const sourceInfo = getSourceInfo(alert.source);
    const severityClass = getSeverityClass(alert.severity);

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border-l-8 ${sourceInfo.color} p-6`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    {sourceInfo.icon}
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{sourceInfo.name}</span>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${severityClass}`}>{alert.severity}</span>
            </div>
            <h3 className="text-xl font-bold mt-4">{alert.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{alert.description}</p>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-4">
                <span>{alert.affectedArea} - {formatTimeAgo(alert.timestamp)}</span>
            </div>
        </div>
    );
};


const OfficialDisasterFeedPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Official Disaster Feed</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Live alerts from official Indian government agencies. This is the single source of truth.
            </p>
        </div>

        <div className="space-y-6">
            {DUMMY_OFFICIAL_ALERTS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(alert => (
                <OfficialAlertCard key={alert.id} alert={alert} />
            ))}
        </div>
    </div>
  );
};

export default OfficialDisasterFeedPage;
