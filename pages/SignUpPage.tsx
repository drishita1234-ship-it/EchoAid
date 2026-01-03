import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Loader2, UserPlus, LifeBuoy, Shield, HeartHandshake } from 'lucide-react';

interface RoleButtonProps {
    label: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
    disabled: boolean;
}

const RoleButton: React.FC<RoleButtonProps> = ({ label, description, icon, selected, onClick, disabled }) => (
    <button 
        type="button" 
        onClick={onClick} 
        disabled={disabled} 
        className={`flex items-center text-left w-full p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            selected 
                ? 'bg-primary-500 text-white border-primary-600 shadow-lg scale-105' 
                : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-600'
        }`}
    >
        <div className="mr-4">{icon}</div>
        <div>
            <span className="font-bold">{label}</span>
            <span className="block text-xs">{description}</span>
        </div>
    </button>
);


const SignUpPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Requester);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signup(name, email, password, role);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold text-center mb-6">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="mt-1 block w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="mt-1 block w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="mt-1 block w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I want to:</label>
                        <div className="space-y-3">
                             <RoleButton
                                label="Request Help"
                                description="I am in distress or reporting an emergency."
                                icon={<LifeBuoy size={24} className={role === UserRole.Requester ? 'text-white' : 'text-primary-500'} />}
                                selected={role === UserRole.Requester}
                                onClick={() => setRole(UserRole.Requester)}
                                disabled={isLoading}
                            />
                            <RoleButton
                                label="Volunteer"
                                description="I am a professional responder."
                                icon={<Shield size={24} className={role === UserRole.Volunteer ? 'text-white' : 'text-primary-500'} />}
                                selected={role === UserRole.Volunteer}
                                onClick={() => setRole(UserRole.Volunteer)}
                                disabled={isLoading}
                            />
                            <RoleButton
                                label="Be a Safe Helper (सुरक्षित सहायक)"
                                description="I am safe and can provide community assistance."
                                icon={<HeartHandshake size={24} className={role === UserRole.Safe ? 'text-white' : 'text-primary-500'} />}
                                selected={role === UserRole.Safe}
                                onClick={() => setRole(UserRole.Safe)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-primary-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-800 transition disabled:bg-primary-300">
                        {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;