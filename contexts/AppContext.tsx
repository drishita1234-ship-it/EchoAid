import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { SOSRequest } from '../types';
import { RequestStatus } from '../types';
import { DUMMY_SOS_REQUESTS } from '../constants';
import { analyzeSOS } from '../services/geminiService';

const QUEUED_REQUESTS_KEY = 'echoaid-queued-requests';

interface AppContextType {
  sosRequests: SOSRequest[];
  submitSOSRequest: (request: Omit<SOSRequest, 'id' | 'timestamp' | 'status' | 'urgencyScore' | 'description' | 'lastPulseTimestamp'> & { description: string }) => Promise<SOSRequest>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  assignVolunteer: (requestId: string, volunteerId: string) => void;
  sendPulse: (requestId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>(() => {
      const queuedRequests: SOSRequest[] = JSON.parse(localStorage.getItem(QUEUED_REQUESTS_KEY) || '[]');
      return [...DUMMY_SOS_REQUESTS, ...queuedRequests];
  });

  const processQueue = useCallback(async () => {
    const queuedRequests: SOSRequest[] = JSON.parse(localStorage.getItem(QUEUED_REQUESTS_KEY) || '[]');
    if (queuedRequests.length === 0) return;

    console.log(`Processing ${queuedRequests.length} queued requests...`);
    const stillQueued: SOSRequest[] = [];
    
    for (const req of queuedRequests) {
        try {
            // Simulate resending by just updating its status. In a real app, you'd call the API here.
            setSosRequests(prev => prev.map(r => r.id === req.id ? {...r, status: RequestStatus.Pending} : r));
            console.log(`Request ${req.id} successfully sent.`);
        } catch (error) {
            console.warn(`Failed to send queued request ${req.id}. It will remain in the queue.`);
            stillQueued.push(req);
        }
    }
    localStorage.setItem(QUEUED_REQUESTS_KEY, JSON.stringify(stillQueued));

  }, []);

  useEffect(() => {
    window.addEventListener('online', processQueue);
    // Attempt to process queue on initial load in case we were offline
    if(navigator.onLine) {
        processQueue();
    }
    return () => {
      window.removeEventListener('online', processQueue);
    };
  }, [processQueue]);


  const submitSOSRequest = useCallback(async (request: Omit<SOSRequest, 'id' | 'timestamp' | 'status' | 'urgencyScore' | 'description' | 'lastPulseTimestamp'> & { description: string }): Promise<SOSRequest> => {
      const isOffline = !navigator.onLine;

      if (isOffline) {
          console.log("Offline mode detected. Queuing request.");
          const newRequest: SOSRequest = {
              ...request,
              id: `offline-${new Date().toISOString()}`,
              timestamp: new Date().toISOString(),
              status: RequestStatus.Queued,
              urgencyScore: 5, // Default score for offline
              description: request.description, // Use original description for queued
          };
          setSosRequests((prev) => [newRequest, ...prev]);
          const queued = JSON.parse(localStorage.getItem(QUEUED_REQUESTS_KEY) || '[]');
          localStorage.setItem(QUEUED_REQUESTS_KEY, JSON.stringify([...queued, newRequest]));
          return newRequest;
      }

      const { urgencyScore, summary } = await analyzeSOS(request.description, request.emergencyType);
      
      const newRequest: SOSRequest = {
          ...request,
          id: `online-${new Date().toISOString()}`,
          timestamp: new Date().toISOString(),
          status: RequestStatus.Pending,
          urgencyScore,
          description: summary,
      };

      setSosRequests((prevRequests) => [newRequest, ...prevRequests]);
      return newRequest;

  }, []);
  
  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus) => {
    setSosRequests(prev => prev.map(req => req.id === requestId ? {...req, status} : req));
  }, []);

  const assignVolunteer = useCallback((requestId: string, volunteerId: string) => {
    setSosRequests(prev => prev.map(req => req.id === requestId ? {...req, volunteerId, status: RequestStatus.InProgress} : req));
  }, []);

  const sendPulse = useCallback((requestId: string) => {
    setSosRequests(prev => 
        prev.map(req => 
            req.id === requestId 
            ? { ...req, lastPulseTimestamp: new Date().toISOString() } 
            : req
        )
    );
  }, []);


  return (
    <AppContext.Provider value={{ sosRequests, submitSOSRequest, updateRequestStatus, assignVolunteer, sendPulse }}>
      {children}
    </AppContext.Provider>
  );
};