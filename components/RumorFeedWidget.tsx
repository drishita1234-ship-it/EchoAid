import React, { useState } from 'react';
import { Rumor, RumorState } from '../types';
import RumorCard from './RumorCard';

interface RumorFeedWidgetProps {
    rumors: Rumor[];
}

const RumorFeedWidget: React.FC<RumorFeedWidgetProps> = ({ rumors }) => {
    const [activeTab, setActiveTab] = useState<RumorState>(RumorState.Investigating);

    const filteredRumors = rumors.filter(r => r.state === activeTab);

    const renderTab = (state: RumorState, label: string) => {
        const isActive = activeTab === state;
        const count = rumors.filter(r => r.state === state).length;
        
        return (
            <button
                onClick={() => setActiveTab(state)}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
                    isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
            >
                {label} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-gray-300 dark:bg-slate-600'}`}>{count}</span>
            </button>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    {renderTab(RumorState.Investigating, 'Investigating')}
                    {renderTab(RumorState.Confirmed, 'Confirmed')}
                    {renderTab(RumorState.Debunked, 'Debunked')}
                </div>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {filteredRumors.length > 0 ? (
                    filteredRumors.map(rumor => <RumorCard key={rumor.id} rumor={rumor} />)
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No {activeTab.toLowerCase()} rumors at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RumorFeedWidget;