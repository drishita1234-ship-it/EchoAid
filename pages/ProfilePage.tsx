
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, ShieldCheck, Edit3 } from 'lucide-react';
import { UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { ListChecks, Send, Compass, Map as MapIcon, UserCircle, HeartHandshake } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const requesterLinks = [
        { path: '/requester/requests', label: 'My Requests', icon: <ListChecks size={24}/> },
        { path: '/requester/new-sos', label: 'New SOS', icon: <Send size={24}/> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
    ];

    const volunteerLinks = [
        { path: '/volunteer/nearby', label: 'Dashboard', icon: <Compass size={24}/> },
        { path: '/volunteer/missions', label: 'My Missions', icon: <MapIcon size={24}/> },
        { path: '/profile', label: 'Profile', icon: <UserCircle size={24}/> }
    ];
    
    const safeLinks = [
        { path: '/safe/dashboard', label: 'Dashboard', icon: <HeartHandshake size={24}/> },
        { path: '/profile', label: 'My Profile', icon: <UserCircle size={24}/> },
    ];

    const getSidebarLinks = () => {
        switch(user.role) {
            case UserRole.Requester: return requesterLinks;
            case UserRole.Volunteer: return volunteerLinks;
            case UserRole.Safe: return safeLinks;
            default: return [];
        }
    };
    
    const sidebarLinks = getSidebarLinks();

    return (
        <DashboardLayout sidebarLinks={sidebarLinks}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
                    <div className="relative">
                        <img 
                            src={user.profilePhoto || `https://i.pravatar.cc/150?u=${user.id}`} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full border-4 border-primary-500"
                        />
                        <button className="absolute bottom-0 right-0 bg-primary-700 text-white p-2 rounded-full hover:bg-primary-800">
                            <Edit3 size={16} />
                        </button>
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-left">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                           <ShieldCheck size={16} className="mr-1.5"/> {user.role === 'Safe' ? 'Safe Helper' : user.role}
                        </span>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-4">
                       <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                            <p className="mt-1 text-lg">{user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                            <p className="mt-1 text-lg">{user.email}</p>
                        </div>
                        {user.role === UserRole.Volunteer && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Skills</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {user.skills?.map(skill => (
                                        <span key={skill} className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">{skill}</span>
                                    )) || <p className="text-lg">No skills listed.</p>}
                                </div>
                            </div>
                        )}
                         <button className="mt-6 bg-primary-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-800 transition">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
