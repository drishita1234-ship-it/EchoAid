
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { SOSRequest } from '../types';
import { getMapGroundedInfo } from '../services/geminiService';
import type { GroundedInfo } from '../services/geminiService';
import { Loader2, Send, MapPin, AlertTriangle, HeartPulse, Flame, Waves, Zap, MoreHorizontal, Link as LinkIcon, Pin } from 'lucide-react';

const emergencyIcons: Record<string, React.ReactNode> = {
  Medical: <HeartPulse className="h-5 w-5 text-white" />,
  Fire: <Flame className="h-5 w-5 text-white" />,
  Flood: <Waves className="h-5 w-5 text-white" />,
  Earthquake: <Zap className="h-5 w-5 text-white" />,
  Other: <MoreHorizontal className="h-5 w-5 text-white" />,
};

const getUrgencyColor = (score: number) => {
  if (score > 8) return 'bg-red-500';
  if (score > 6) return 'bg-amber-500';
  if (score > 3) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Map India's geography to a square view box for pin placement
const convertLatLngToPercent = (lat: number, lng: number) => {
  const latMin = 8.0, latMax = 37.0; // Approx lat range for India
  const lngMin = 68.0, lngMax = 98.0; // Approx lng range for India

  const left = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const top = ((latMax - lat) / (latMax - latMin)) * 100;

  return { left: `${left}%`, top: `${top}%` };
};

const IndiaCrisisMap: React.FC<{ requests: SOSRequest[] }> = ({ requests }) => (
  <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden border border-gray-300 dark:border-slate-600">
    {/* Simplified SVG of India as a background */}
    <svg viewBox="0 0 400 450" className="absolute inset-0 w-full h-full text-gray-300 dark:text-slate-600" fill="currentColor">
        <path d="M213.9,1.5c-2.3,1.3-4.5,2.6-6.6,4.1c-1.3,0.9-2.5,1.9-3.7,2.9c-4,3.2-7.8,6.8-11.2,10.7c-2.8,3.2-5.3,6.6-7.5,10.2 c-1.5,2.5-2.9,5.1-4.2,7.7c-2.5,5.1-4.5,10.5-5.9,15.9c-0.8,3.1-1.5,6.3-2,9.5c-1,5.9-1.6,11.9-1.6,17.9c0.1,3.4,0.1,6.8,0.4,10.2 c0.5,6.5,1.5,12.9,2.9,19.2c0.9,3.8,1.9,7.5,3.1,11.2c1.7,5.2,3.7,10.3,5.9,15.3c1.7,3.9,3.5,7.7,5.3,11.5 c2,4.1,4.1,8.1,6.2,12.1c1.5,2.8,2.9,5.6,4.3,8.4c-3.1,1.5-6.2,3-9.2,4.6c-2,1.1-4,2.2-6,3.3c-2.1,1.2-4.2,2.4-6.3,3.6 c-2.3,1.3-4.6,2.6-6.8,3.9c-3.4,2-6.7,3.9-9.9,5.9c-2.1,1.3-4.2,2.6-6.2,4c-1.8,1.2-3.6,2.5-5.4,3.7c-1,0.7-2,1.4-3,2.1 c-2.6,1.9-5.1,3.9-7.5,6c-1,0.9-2,1.8-3,2.7c-2.2,2-4.4,4.1-6.4,6.3c-2.4,2.7-4.7,5.5-6.8,8.4c-1.6,2.2-3.2,4.4-4.6,6.7 c-2,3.2-3.9,6.4-5.6,9.8c-1,2-1.9,3.9-2.8,5.9c-1.5,3.2-2.8,6.4-4,9.7c-1.2,3.3-2.3,6.6-3.2,10c-0.9,3.2-1.7,6.4-2.3,9.7 c-0.6,3.1-1.1,6.3-1.4,9.4c-0.3,3.4-0.4,6.8-0.3,10.2c0,2.1,0.1,4.2,0.3,6.3c0.2,2.3,0.5,4.6,0.9,6.8c0.4,2.3,1,4.6,1.6,6.9 c0.6,2.3,1.3,4.6,2.1,6.8c1.3,3.7,2.8,7.3,4.6,10.8c1.1,2.2,2.2,4.4,3.5,6.5c1.1,1.8,2.2,3.6,3.4,5.4c1,1.5,2,3,3,4.4 c0.7,1,1.4,2,2.1,2.9c0.9,1.2,1.8,2.4,2.7,3.5c1.4,1.8,2.9,3.5,4.4,5.1c0.8,0.8,1.6,1.6,2.4,2.4c1.1,1,2.2,2,3.3,2.9 c-0.2,2-0.4,3.9-0.5,5.9c-0.1,1.2-0.2,2.4-0.2,3.6c-0.1,2.6-0.1,5.2-0.1,7.8c0,1.5,0,3,0,4.4c0.1,2.1,0.2,4.2,0.3,6.3 c0.2,2.6,0.5,5.2,0.8,7.8c0.1,1.1,0.3,2.2,0.4,3.3c0.2,1.8,0.4,3.6,0.7,5.4c0.3,1.9,0.7,3.8,1.1,5.7c0.2,1,0.5,2,0.8,3 c0.3,1.1,0.7,2.2,1.1,3.3c0.4,1.1,0.9,2.2,1.4,3.3c0.5,1,1,2,1.6,3c0.8,1.3,1.6,2.6,2.5,3.9c0.9,1.3,1.8,2.6,2.8,3.8 c1,1.2,2,2.4,3,3.6c2.8,3.2,5.7,6.2,8.6,9.1c1,1,2,2,3,3c1.2,1.2,2.4,2.4,3.6,3.6c1,1,2,1.9,3,2.9c0.7,0.7,1.4,1.4,2.1,2 c0.7,0.7,1.5,1.3,2.2,2c0.7,0.6,1.4,1.2,2.1,1.8c1.7,1.4,3.4,2.7,5.2,3.9c1,0.7,2,1.4,3,2c1.4,0.9,2.8,1.7,4.2,2.5 c1.5,0.9,3,1.7,4.5,2.5c2.9,1.6,5.8,3,8.7,4.3c3.1,1.4,6.2,2.6,9.4,3.6c3.2,1,6.4,1.9,9.6,2.6c1.6,0.4,3.2,0.7,4.8,1 c3.4,0.7,6.8,1.1,10.2,1.4c3.4,0.3,6.8,0.4,10.2,0.4c3.4,0,6.8-0.1,10.2-0.4c3.4-0.3,6.8-0.7,10.2-1.4c1.6-0.3,3.2-0.7,4.8-1 c3.2-0.7,6.4-1.6,9.6-2.6c3.2-1,6.3-2.2,9.4-3.6c2.9-1.3,5.8-2.7,8.7-4.3c1.5-0.8,3-1.6,4.5-2.5c1.4-0.8,2.8-1.6,4.2-2.5 c1-0.6,2-1.3,3-2c1.8-1.2,3.5-2.5,5.2-3.9c0.7-0.6,1.4-1.2,2.1-1.8c0.7-0.6,1.5-1.3,2.2-2c0.7-0.6,1.4-1.3,2.1-2 c1-1,2-1.9,3-2.9c1.2-1.2,2.4-2.4,3.6-3.6c1-1,2-2,3-3c2.9-2.9,5.8-5.9,8.6-9.1c1-1.2,2-2.4,3-3.6c1-1.2,1.9-2.5,2.8-3.8 c0.9-1.3,1.7-2.6,2.5-3.9c0.6-1,1.1-2,1.6-3c0.5-1.1,1-2.2,1.4-3.3c0.4-1.1,0.8-2.2,1.1-3.3c0.3-1,0.6-2,0.8-3 c0.4-1.9,0.8-3.8,1.1-5.7c0.3-1.8,0.5-3.6,0.7-5.4c0.1-1.1,0.3-2.2,0.4-3.3c0.3-2.6,0.6-5.2,0.8-7.8c0.1-2.1,0.2-4.2,0.3-6.3 c0-1.5,0-3,0-4.4c0-2.6,0-5.2-0.1-7.8c-0.1-1.2-0.1-2.4-0.2-3.6c-0.1-2-0.3-3.9-0.5-5.9c1.1-0.9,2.2-1.9,3.3-2.9 c0.8-0.8,1.6-1.6,2.4-2.4c1.5-1.6,3-3.3,4.4-5.1c0.9-1.1,1.8-2.3,2.7-3.5c0.7-0.9,1.4-1.9,2.1-2.9c0.7-1,1.4-2,2.1-2.9 c1.2-1.8,2.3-3.6,3.4-5.4c1.3-2.1,2.4-4.3,3.5-6.5c1.8-3.5,3.3-7.1,4.6-10.8c0.8-2.2,1.5-4.5,2.1-6.8c0.6-2.3,1.2-4.6,1.6-6.9 c0.4-2.3,0.7-4.6,0.9-6.8c0.2-2.1,0.3-4.2,0.3-6.3c0.1-3.4,0-6.8-0.3-10.2c-0.3-3.1-0.8-6.3-1.4-9.4c-0.6-3.3-1.4-6.5-2.3-9.7 c-0.9-3.4-2-6.7-3.2-10c-1.2-3.3-2.5-6.5-4-9.7c-0.9-2-1.8-3.9-2.8-5.9c-1.7-3.4-3.6-6.6-5.6-9.8c-1.4-2.3-3-4.5-4.6-6.7 c-2.1-2.9-4.4-5.7-6.8-8.4c-2-2.2-4-4.3-6.4-6.3c-1-0.9-2-1.8-3-2.7c-2.4-2.1-4.9-4.1-7.5-6c-1-0.7-2-1.4-3-2.1 c-1.8-1.2-3.6-2.5-5.4-3.7c-2-1.4-4.1-2.7-6.2-4c-3.2-2-6.5-3.9-9.9-5.9c-2.2-1.3-4.5-2.6-6.8-3.9c-2.1-1.2-4.2-2.4-6.3-3.6 c-2-1.1-4-2.2-6-3.3c-3-1.6-6.1-3.1-9.2-4.6c1.4-2.8,2.8-5.6,4.3-8.4c2.1-4,4.2-8,6.2-12.1c2-3.8,3.8-7.6,5.3-11.5 c2.2-5,4.2-10.1,5.9-15.3c1.2-3.7,2.2-7.4,3.1-11.2c1.4-6.3,2.4-12.7,2.9-19.2c0.3-3.4,0.3-6.8,0.4-10.2 c-0.1-6-0.6-12-1.6-17.9c-0.5-3.2-1.2-6.4-2-9.5c-1.4-5.4-3.4-10.8-5.9-15.9c-1.3-2.6-2.7-5.2-4.2-7.7c-2.2-3.6-4.7-7-7.5-10.2 c-3.4-3.9-7.2-7.5-11.2-10.7c-1.2-1-2.4-2-3.7-2.9C218.4,4.1,216.2,2.8,213.9,1.5z M226.4,26.4c-1.1,1.8-2.3,3.6-3.4,5.4 c-0.9,1.5-1.8,3-2.7,4.6c-1.4,2.5-2.7,5.1-3.9,7.7c-1.8,4.1-3.3,8.3-4.5,12.6c-0.8,2.9-1.5,5.8-2,8.7c-0.8,4.3-1.3,8.7-1.5,13.1 c-0.1,2.8-0.1,5.6,0,8.4c0.1,3,0.3,6,0.7,9c0.6,4.4,1.6,8.8,2.8,13.1c0.9,3.1,1.8,6.2,2.8,9.3c1.3,4,2.7,7.9,4.2,11.8 c1.2,3,2.4,6,3.7,8.9c1,2.1,2,4.2,3,6.3c0.3,0.7,0.7,1.4,1,2.1c-1.7,0.7-3.4,1.4-5.1,2.1c-1.5,0.6-3,1.3-4.5,1.9 c-2.3,1-4.6,2-6.8,3.1c-1.7,0.9-3.4,1.7-5.1,2.6c-1.1,0.6-2.2,1.2-3.3,1.8c-1.7,0.9-3.4,1.9-5,2.8c-1.4,0.8-2.8,1.7-4.2,2.5 c-1.6,1-3.2,2-4.7,3.1c-1.8,1.3-3.5,2.6-5.2,4c-1.1,0.9-2.2,1.8-3.2,2.8c-1.5,1.5-2.9,3-4.3,4.6c-1.5,1.7-3,3.5-4.3,5.3 c-1,1.4-1.9,2.8-2.8,4.3c-1.3,2.1-2.5,4.3-3.6,6.5c-0.8,1.6-1.6,3.2-2.3,4.8c-1,2.3-1.9,4.6-2.7,6.9c-0.8,2.3-1.5,4.7-2.1,7.1 c-0.5,2-0.9,4-1.2,6c-0.3,2.1-0.5,4.2-0.6,6.3c-0.1,2.2-0.1,4.4,0,6.6c0.1,2.5,0.2,5,0.5,7.5c0.3,2.5,0.7,5,1.2,7.5 c0.5,2.4,1,4.8,1.6,7.2c1,3.5,2.2,6.9,3.6,10.2c0.8,1.9,1.6,3.8,2.5,5.6c0.8,1.6,1.6,3.2,2.4,4.8c0.6,1.2,1.2,2.4,1.8,3.6 c0.7,1.4,1.4,2.8,2.1,4.1c1.2,2.1,2.4,4.1,3.7,6.1c0.7,1,1.4,2,2.1,3c0.8,1.1,1.6,2.2,2.4,3.3c1,1.3,2,2.6,3,3.9 c-0.1,1.1-0.2,2.2-0.3,3.3c-0.1,1.4-0.1,2.8-0.1,4.2c0,1.8,0,3.6,0.1,5.4c0.1,2.1,0.2,4.2,0.4,6.3c0.1,1.3,0.3,2.6,0.4,3.9 c0.2,1.5,0.4,3,0.7,4.5c0.2,1.3,0.5,2.6,0.8,3.9c0.3,1.2,0.6,2.4,0.9,3.6c0.1,0.6,0.3,1.2,0.4,1.8c0.8,2.3,1.6,4.6,2.5,6.8 c0.7,1.7,1.4,3.4,2.1,5.1c0.9,2,1.8,3.9,2.8,5.8c1,1.9,2,3.8,3,5.6c1.8,3.3,3.7,6.4,5.6,9.4c1.1,1.7,2.2,3.4,3.3,5.1 c0.8,1.2,1.6,2.4,2.4,3.6c0.7,1,1.4,2,2.1,2.9c1,1.2,2,2.4,3,3.6c1.1,1.3,2.2,2.6,3.3,3.8c1.3,1.4,2.6,2.8,3.9,4.1 c1,1,2,2,3,3c1.7,1.6,3.4,3.1,5.1,4.6c2.4,2,4.8,3.9,7.2,5.6c1.7,1.2,3.4,2.3,5.1,3.3c1.9,1.1,3.8,2.1,5.7,3 c2,0.9,4,1.7,6,2.4c2.8,1,5.6,1.8,8.4,2.4c2.9,0.6,5.8,1,8.7,1.2c2.9,0.2,5.8,0.2,8.7,0c2.9-0.2,5.8-0.6,8.7-1.2 c2.8-0.6,5.6-1.4,8.4-2.4c2-0.7,4-1.5,6-2.4c1.9-0.9,3.8-1.9,5.7-3c1.7-1,3.4-2.1,5.1-3.3c2.4-1.7,4.8-3.6,7.2-5.6 c1.7-1.5,3.4-3,5.1-4.6c1-1,2-2,3-3c1.3-1.3,2.6-2.7,3.9-4.1c1.1-1.2,2.2-2.5,3.3-3.8c1-1.2,2-2.4,3-3.6 c0.7-1,1.4-1.9,2.1-2.9c0.8-1.2,1.6-2.4,2.4-3.6c1.1-1.7,2.2-3.4,3.3-5.1c1.9-2.9,3.8-6,5.6-9.4c1-1.8,2-3.7,3-5.6 c1-1.9,1.9-3.8,2.8-5.8c0.7-1.7,1.4-3.4,2.1-5.1c0.9-2.2,1.7-4.5,2.5-6.8c0.1-0.6,0.3-1.2,0.4-1.8c0.3-1.2,0.6-2.4,0.9-3.6 c0.3-1.3,0.5-2.6,0.8-3.9c0.2-1.5,0.4-3,0.7-4.5c0.2-1.3,0.3-2.6,0.4-3.9c0.2-2.1,0.3-4.2,0.4-6.3c0.1-1.8,0.1-3.6,0.1-5.4 c0-1.4,0-2.8-0.1-4.2c-0.1-1.1-0.2-2.2-0.3-3.3c1-1.3,2-2.6,3-3.9c0.8-1.1,1.6-2.2,2.4-3.3c0.7-1,1.4-2,2.1-3 c1.3-2,2.5-4,3.7-6.1c0.7-1.3,1.4-2.7,2.1-4.1c0.6-1.2,1.2-2.4,1.8-3.6c0.8-1.6,1.6-3.2,2.4-4.8c0.9-1.8,1.7-3.7,2.5-5.6 c1.4-3.3,2.6-6.7,3.6-10.2c0.6-2.4,1.1-4.8,1.6-7.2c0.5-2.5,0.9-5,1.2-7.5c0.3-2.5,0.4-5,0.5-7.5c0.1-2.2,0.1-4.4,0-6.6 c-0.1-2.1-0.3-4.2-0.6-6.3c-0.3-2-0.7-4-1.2-6c-0.6-2.4-1.3-4.8-2.1-7.1c-0.8-2.3-1.7-4.6-2.7-6.9c-0.7-1.6-1.5-3.2-2.3-4.8 c-1.1-2.2-2.3-4.4-3.6-6.5c-0.9-1.5-1.8-2.9-2.8-4.3c-1.3-1.8-2.8-3.6-4.3-5.3c-1.4-1.6-2.8-3.1-4.3-4.6c-1-1-2.1-1.9-3.2-2.8 c-1.7-1.4-3.5-2.7-5.2-4c-1.5-1.1-3.1-2.1-4.7-3.1c-1.4-0.8-2.8-1.7-4.2-2.5c-1.6-0.9-3.3-1.8-5-2.8c-1.1-0.6-2.2-1.2-3.3-1.8 c-1.7-0.9-3.4-1.7-5.1-2.6c-2.2-1.1-4.5-2.1-6.8-3.1c-1.5-0.6-3-1.3-4.5-1.9c-1.7-0.7-3.4-1.4-5.1-2.1c0.3-0.7,0.7-1.4,1-2.1 c1-2.1,2-4.2,3-6.3c1.3-2.9,2.5-5.9,3.7-8.9c1.5-3.9,2.9-7.8,4.2-11.8c1-3.1,1.9-6.2,2.8-9.3c1.2-4.3,2.2-8.7,2.8-13.1 c0.4-3,0.6-6,0.7-9c0.1-2.8,0.1-5.6,0-8.4c-0.2-4.4-0.7-8.8-1.5-13.1c-0.5-2.9-1.2-5.8-2-8.7c-1.2-4.3-2.7-8.5-4.5-12.6 c-1.2-2.6-2.5-5.2-3.9-7.7c-0.9-1.6-1.8-3.1-2.7-4.6C228.7,30,227.5,28.2,226.4,26.4z"></path>
    </svg>
    {requests.map(req => {
        const { left, top } = convertLatLngToPercent(req.location.lat, req.location.lng);
        const color = getUrgencyColor(req.urgencyScore);
        return (
            <div 
                key={req.id} 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ top, left }}
            >
                <div className={`w-5 h-5 rounded-full ${color} ring-2 ring-white dark:ring-slate-700 shadow-lg`}></div>
                 <div className="absolute bottom-full mb-2 w-48 p-2 text-xs bg-white dark:bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-200 dark:border-slate-600 z-10">
                    <p className="font-bold flex items-center gap-1">{emergencyIcons[req.emergencyType]} {req.emergencyType}</p>
                    <p className="text-gray-500 dark:text-gray-400">{req.location.address}</p>
                 </div>
            </div>
        )
    })}
  </div>
);

const GlobalCrisisMapPage: React.FC = () => {
    const { sosRequests } = useContext(AppContext)!;
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [groundedInfo, setGroundedInfo] = useState<GroundedInfo | null>(null);
    const [geminiError, setGeminiError] = useState('');
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              () => {
                setLocationError('Could not get your location. Please enable location services. Grounded search will be less accurate.');
              }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
        }
    }, []);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !userLocation) {
            setGeminiError("Please enter a query and allow location access.");
            return;
        }
        setIsLoading(true);
        setGeminiError('');
        setGroundedInfo(null);
        try {
            const result = await getMapGroundedInfo(query, userLocation);
            setGroundedInfo(result);
        } catch (error) {
            setGeminiError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">India Crisis Map</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                    Visualizing active emergency requests on a Bhuvan (ISRO) base map.
                </p>
            </div>
            
            <IndiaCrisisMap requests={sosRequests} />
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">Map Data &copy; Bhuvan (ISRO). For demonstration purposes only.</p>

            <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Pin /> Ask About an Area
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Need details about a location? Ask here for up-to-date information, powered by Gemini with Google Maps. For example: "Are there any open shelters near Connaught Place, Delhi?"
                    </p>
                    
                    {locationError && !userLocation && <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">{locationError}</p>}
                    
                    <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., 'What are the nearest hospitals to Bandra, Mumbai?'"
                            className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !userLocation}
                            className="flex justify-center items-center gap-2 bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition disabled:bg-primary-300"
                        >
                            {isLoading ? <Loader2 className="animate-spin"/> : <Send/>}
                            {isLoading ? 'Asking...' : 'Ask'}
                        </button>
                    </form>

                    {geminiError && <p className="text-red-500 mt-4">{geminiError}</p>}

                    {groundedInfo && (
                        <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                            <h3 className="font-bold text-lg">Answer:</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{groundedInfo.text}</p>
                            
                            {groundedInfo.sources.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-sm">Sources from Google Maps:</h4>
                                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                        {groundedInfo.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center gap-1">
                                                    <LinkIcon size={12}/> {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalCrisisMapPage;
