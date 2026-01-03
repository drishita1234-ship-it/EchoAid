import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { UserCircle, HeartHandshake } from 'lucide-react';

const SafeUserDashboardPage: React.FC = () => {
    const sidebarLinks = [
        { path: '/safe/dashboard', label: 'Dashboard', icon: <HeartHandshake size={24}/> },
        { path: '/profile', label: 'My Profile', icon: <UserCircle size={24}/> },
    ];

    return (
        <DashboardLayout sidebarLinks={sidebarLinks}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold">Safe Helper Dashboard</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Welcome, Surakshit Sahayak. This is your hub for viewing community tasks and managing your available resources.
                </p>
                <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                     <p className="font-semibold text-blue-800 dark:text-blue-300">
                        Future features like 'Nearby Tasks' and 'My Inventory' will appear here soon.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SafeUserDashboardPage;
