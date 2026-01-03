import React from 'react';
import type { User } from '../types';
import { ShieldCheck } from 'lucide-react';

interface SafeApproachBannerProps {
  responder: User;
  verificationCode: string;
  onDismiss: () => void;
}

const SafeApproachBanner: React.FC<SafeApproachBannerProps> = ({ responder, verificationCode, onDismiss }) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900/80 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="banner-headline"
      aria-describedby="banner-description"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border-4 border-primary-500 transform transition-all text-center p-6 sm:p-8 animate-fade-in-up">
        <ShieldCheck className="h-20 w-20 text-primary-500 mx-auto mb-4" />
        <h1 id="banner-headline" className="text-3xl font-extrabold text-gray-900 dark:text-white">
          An Aegis Verified Responder is Here.
        </h1>
        <div id="banner-description" className="mt-6">
          <img
            src={responder.profilePhoto || `https://i.pravatar.cc/150?u=${responder.id}`}
            alt={`Photo of ${responder.name}`}
            className="w-24 h-24 rounded-full mx-auto border-4 border-gray-200 dark:border-slate-600"
          />
          <p className="text-xl font-bold mt-4">{responder.name}</p>
          <p className="text-md text-gray-500 dark:text-gray-400">{responder.affiliation}</p>
        </div>
        <div className="mt-8 bg-gray-100 dark:bg-slate-700 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            To confirm their identity, ask for their code. Your code is:
          </p>
          <p className="text-4xl font-mono font-bold tracking-widest text-primary-600 dark:text-primary-400 mt-2">
            {verificationCode}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="mt-8 w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-800 transition"
        >
          Dismiss
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SafeApproachBanner;
