import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarLink {
    path: string;
    label: string;
    icon: ReactNode;
}

interface DashboardLayoutProps {
    sidebarLinks: SidebarLink[];
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebarLinks, children }) => {
    const location = useLocation();

    const navLinkClass = (path: string) => {
        const isActive = location.pathname.includes(path);
        return `flex items-center w-full px-4 py-3 rounded-lg transition-colors text-lg ${
        isActive
            ? 'bg-primary-500 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`;
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-200px)]">
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                    <nav className="flex flex-row md:flex-col gap-2">
                        {sidebarLinks.map(link => (
                            <NavLink to={link.path} key={link.path} className={navLinkClass(link.path)}>
                                {link.icon}
                                <span className="ml-3 hidden md:inline">{link.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
