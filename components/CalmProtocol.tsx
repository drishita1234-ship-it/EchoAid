
import React, { useState, useEffect, useContext } from 'react';
import { EmergencyType } from '../types';
import { AppContext } from '../contexts/AppContext';
import { Loader2, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { GroundedInfo } from '../services/geminiService';


interface CalmProtocolProps {
  emergencyType: EmergencyType;
  requestId: string;
  onClose: () => void;
  isFetchingGroundedInfo: boolean;
  groundedInfo: GroundedInfo | null;
}

type ProtocolStep = 'reassurance' | 'dangerCheck' | 'safetyTip' | 'localInfo' | 'breathing' | 'batteryTip' | 'monitoring';

const safetyTips: Record<EmergencyType, string> = {
  [EmergencyType.Flood]: 'If possible, move to higher ground immediately.',
  [EmergencyType.Earthquake]: 'Stay away from windows. Drop, Cover, and Hold On if you can.',
  [EmergencyType.Fire]: 'Stay low to the ground to avoid smoke. Cover your mouth.',
  [EmergencyType.Medical]: 'Focus on your breathing. Help is on the way.',
  [EmergencyType.Other]: 'Try to find a safe location and stay aware of your surroundings.'
};

const CalmProtocol: React.FC<CalmProtocolProps> = ({ emergencyType, requestId, onClose, isFetchingGroundedInfo, groundedInfo }) => {
  const { sendPulse } = useContext(AppContext)!;
  const [step, setStep] = useState<ProtocolStep>('reassurance');
  const [breathingText, setBreathingText] = useState<string>('Breathe in...');
  const [showContent, setShowContent] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const transitionTo = (nextStep: ProtocolStep) => {
    setShowContent(false);
    setTimeout(() => {
      setStep(nextStep);
      setShowContent(true);
    }, 500); // 500ms for fade-out transition
  };

  useEffect(() => {
    if (cooldown > 0) {
        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [cooldown]);
  
  const handleSendPulse = () => {
    if (cooldown > 0 || isPulsing) return;
    setIsPulsing(true);
    // Simulate network latency
    setTimeout(() => {
        sendPulse(requestId);
        setIsPulsing(false);
        setCooldown(30); // 30 second cooldown
    }, 1000);
  };
  
  useEffect(() => {
    if (step === 'reassurance') {
      const timer = setTimeout(() => transitionTo('dangerCheck'), 3000);
      return () => clearTimeout(timer);
    }
    if (step === 'dangerCheck') {
      const timer = setTimeout(() => transitionTo('safetyTip'), 5000);
      return () => clearTimeout(timer);
    }
    if (step === 'safetyTip') {
      const timer = setTimeout(() => transitionTo('localInfo'), 5000);
      return () => clearTimeout(timer);
    }
    // NOTE: Automatic transition from 'localInfo' is removed. User must click 'Continue'.
    if (step === 'breathing') {
        setBreathingText('Breathe in...');
        const timer1 = setTimeout(() => setBreathingText('Hold...'), 3000);
        const timer2 = setTimeout(() => setBreathingText('Breathe out...'), 6000);
        const timer3 = setTimeout(() => transitionTo('batteryTip'), 10000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }
    if (step === 'batteryTip') {
        const timer = setTimeout(() => transitionTo('monitoring'), 6000);
        return () => clearTimeout(timer);
    }
  }, [step]);

  const contentMap: Record<ProtocolStep, { title: string, description: React.ReactNode }> = {
    reassurance: {
      title: "Help is on the way.",
      description: "Your request has been received. Responders are being notified. Please try to stay calm."
    },
    dangerCheck: {
      title: "Assess Your Surroundings",
      description: "Is your immediate area safe? If you can move, find a place away from any obvious dangers."
    },
    safetyTip: {
      title: "Safety Tip",
      description: safetyTips[emergencyType]
    },
    localInfo: {
        title: "Local Information",
        description: (
            <>
                {isFetchingGroundedInfo ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" />
                        <span>Fetching relevant local data...</span>
                    </div>
                ) : groundedInfo ? (
                    <div className="text-left max-w-md mx-auto">
                        <p className="whitespace-pre-wrap">{groundedInfo.text}</p>
                        {groundedInfo.sources.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-sm">Information Sources:</h4>
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
                         <button 
                            onClick={() => transitionTo('breathing')} 
                            className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight size={18}/>
                        </button>
                    </div>
                ) : (
                    <div className="text-center max-w-md mx-auto">
                      <p>Could not retrieve local information at this time. Please focus on your immediate safety.</p>
                      <button 
                          onClick={() => transitionTo('breathing')} 
                          className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                      >
                           Continue <ArrowRight size={18}/>
                      </button>
                    </div>
                )}
            </>
        )
    },
    breathing: {
      title: "Focus on Your Breath",
      description: (
        <div className="text-3xl font-bold text-primary-500 transition-opacity duration-500">
          {breathingText}
        </div>
      )
    },
    batteryTip: {
        title: "Conserve Your Battery",
        description: "If possible, dim your screen and close unnecessary apps. We may need to contact you."
    },
    monitoring: {
      title: "We are Monitoring",
      description: "Stay where you are if it's safe. Use the pulse button to let us know you're still here."
    }
  };

  const currentContent = contentMap[step];
  
  return (
    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[500px] relative">
      <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-3xl font-bold mb-4">{currentContent.title}</h2>
        <div className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 min-h-[150px] flex items-center justify-center">
          {currentContent.description}
        </div>
      </div>
      
      {step === 'monitoring' && (
        <div className="mt-8 w-full flex flex-col items-center">
          <button 
            onClick={handleSendPulse}
            disabled={isPulsing || cooldown > 0}
            className="w-full max-w-sm mx-auto flex justify-center items-center gap-3 bg-blue-600 text-white font-extrabold py-4 px-4 text-xl rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed shadow-lg"
          >
            {isPulsing ? <Loader2 className="animate-spin" /> : 'Send "I\'m here" Pulse'}
          </button>
          {cooldown > 0 && <p className="text-sm mt-2 text-gray-500">Next pulse available in {cooldown}s</p>}
        </div>
      )}

      <div className="absolute bottom-8">
        <button onClick={onClose} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            View My Requests
        </button>
      </div>
    </div>
  );
};

export default CalmProtocol;
