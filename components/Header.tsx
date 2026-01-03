import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/map', label: 'Crisis Map' },
    { path: '/official-feed', label: 'Official Feed' },
    user && { path: '/dashboard', label: 'Dashboard' },
  ].filter(Boolean);

  const linkClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClass = "bg-primary-500 text-white";
  const inactiveLinkClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700";

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            <Logo className="h-8 w-8" />
            <span>EchoAid</span>
          </NavLink>
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(link => (
              <NavLink
                key={link!.path}
                to={link!.path}
                className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
              >
                {link!.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <NavLink to="/profile" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                   <User />
                </NavLink>
                <button onClick={logout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                   <LogOut />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <NavLink to="/login" className={`${linkClass} ${inactiveLinkClass}`}>Login</NavLink>
                <NavLink to="/signup" className={`${linkClass} ${activeLinkClass}`}>Sign Up</NavLink>
              </div>
            )}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
                 {navLinks.map(link => (
                    <NavLink
                        key={link!.path}
                        to={link!.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => `block ${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                    >
                        {link!.label}
                    </NavLink>
                ))}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4 flex items-center justify-between">
                    {user ? (
                        <>
                           <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className={`${linkClass} ${inactiveLinkClass}`}>Profile</NavLink>
                           <button onClick={() => { logout(); setIsMenuOpen(false); }} className={`${linkClass} ${inactiveLinkClass} w-full text-left`}>Logout</button>
                        </>
                    ) : (
                        <>
                           <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className={`${linkClass} ${inactiveLinkClass} w-full`}>Login</NavLink>
                           <NavLink to="/signup" onClick={() => setIsMenuOpen(false)} className={`${linkClass} ${activeLinkClass} w-full text-center`}>Sign Up</NavLink>
                        </>
                    )}
                </div>
            </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
