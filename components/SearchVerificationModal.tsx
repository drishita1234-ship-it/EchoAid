import React from 'react';
import type { SOSRequest } from '../types';
import { Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { GroundedInfo } from '../services/geminiService';

interface SearchVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SOSRequest;
  isLoading: boolean;
  result: GroundedInfo | null;
  error: string;
}

const SearchVerificationModal: React.FC<SearchVerificationModalProps> = ({ isOpen, onClose, request, isLoading, result, error }) => {
  if (!isOpen) return null;

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
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">AI News Investigation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Searching for real-time news about this SOS request.</p>
        </div>
        
        <div className="p-6 min-h-[300px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary-500" size={48} />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Searching for recent news and reports...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertTriangle className="text-red-500" size={48} />
              <p className="mt-4 font-semibold text-red-600 dark:text-red-400">Investigation Failed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          )}
          
          {result && (
            <div>
              <h3 className="font-bold text-lg mb-2">AI Summary:</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-slate-700/50 p-4 rounded-md">
                {result.text || "No specific information found in recent news."}
              </p>
              
              {result.sources.length > 0 && (
                  <div className="mt-4">
                      <h4 className="font-semibold text-sm">Sources Found:</h4>
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {result.sources.map((source, index) => (
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

export default SearchVerificationModal;
