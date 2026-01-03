import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Users, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
    const { user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/login';
        return user.role === UserRole.Requester ? '/requester/requests' : '/volunteer/nearby';
    };

    return (
        <div className="text-center">
            <section className="py-20">
                <Logo className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-6" />
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                    EchoAid: Connecting Those in Need with Those Who Can Help.
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                    A real-time platform for reporting emergencies and mobilizing community volunteers. Fast, efficient, and AI-powered.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to={getDashboardLink()} className="bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition flex items-center gap-2">
                        {user ? 'Go to Dashboard' : 'Get Help / Volunteer'} <ArrowRight size={20} />
                    </Link>
                    <Link to="/map" className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        View Global Crisis Map
                    </Link>
                </div>
            </section>

            <section className="py-20 bg-gray-100 dark:bg-slate-800 -mx-4 px-4">
                 <h2 className="text-3xl font-bold mb-12">How It Works</h2>
                 <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                        <LifeBuoy className="text-primary-500 mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-semibold mb-2">1. Report an Emergency</h3>
                        <p className="text-gray-600 dark:text-gray-400">Quickly submit an SOS request with your location and needs. Our AI analyzes the urgency to prioritize.</p>
                    </div>
                     <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                        <Users className="text-primary-500 mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-semibold mb-2">2. Mobilize Volunteers</h3>
                        <p className="text-gray-600 dark:text-gray-400">Nearby volunteers are alerted. Those with the right skills can accept the mission.</p>
                    </div>
                     <div className="p-8 bg-white dark:bg-slate-900 rounded-xl shadow-md">
                        <Map className="text-primary-500 mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-semibold mb-2">3. Track in Real-Time</h3>
                        <p className="text-gray-600 dark:text-gray-400">Monitor the status of your request and see volunteers en route on the crisis map.</p>
                    </div>
                 </div>
            </section>
        </div>
    );
};

export default LandingPage;