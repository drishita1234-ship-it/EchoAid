
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SOSRequest } from '../../types';
import { EmergencyType } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface RequestsBarChartProps {
  data: SOSRequest[];
}

const RequestsBarChart: React.FC<RequestsBarChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const processData = () => {
        const counts = {
            [EmergencyType.Medical]: 0,
            [EmergencyType.Fire]: 0,
            [EmergencyType.Flood]: 0,
            [EmergencyType.Earthquake]: 0,
            [EmergencyType.Other]: 0,
        };
        data.forEach(req => {
            if (req.emergencyType in counts) {
                counts[req.emergencyType]++;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, requests: value }));
    };

    const chartData = processData();
    const tickColor = isDarkMode ? '#94a3b8' : '#6b7280';

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 h-96">
            <h3 className="text-xl font-semibold mb-4">Requests by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="name" tick={{ fill: tickColor }} />
                    <YAxis tick={{ fill: tickColor }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                            borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="requests" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RequestsBarChart;