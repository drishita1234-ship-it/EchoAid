import React from 'react';
import type { SOSRequest } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface AegisVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SOSRequest;
}

const AegisVerificationModal: React.FC<AegisVerificationModalProps> = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request.verificationDetails) return null;

  const details = request.verificationDetails;
  
  const checklistItems = [
    details.clusterAnalysis && { text: details.clusterAnalysis, verified: true },
    details.socialMedia && { text: details.socialMedia.text, verified: true, thumbnail: details.socialMedia.thumbnail },
    details.sensorData && { text: details.sensorData, verified: true },
    details.userHistory && { text: details.userHistory, verified: true },
    details.seismicData && { text: details.seismicData, verified: false }, // Example of a negative check
  ].filter(Boolean);

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Aegis Verification Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered analysis for high-confidence response.</p>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 p-4 rounded-lg text-center">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Overall Score</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">Confidence: {request.confidenceScore}% (Aegis Verified)</p>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Verification Checklist:</h3>
                <ul className="space-y-3">
                    {checklistItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                           {item!.verified ? 
                             <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" /> : 
                             <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                           }
                           <div className="flex-1">
                             <p className="text-gray-700 dark:text-gray-300">{item!.text}</p>
                             {item!.thumbnail && (
                                <img src={item!.thumbnail} alt="Social media evidence" className="mt-2 w-24 h-24 object-cover rounded-md border-2 border-gray-300 dark:border-slate-600 filter blur-sm" />
                             )}
                           </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-b-2xl text-right">
             <button
                onClick={onClose}
                className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AegisVerificationModal;