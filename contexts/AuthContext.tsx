import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { User, UserRole } from '../types';
import { DUMMY_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  signup: (name: string, email: string, pass: string, role: UserRole) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('echoaid-user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
  });

  useEffect(() => {
    if (user) {
        localStorage.setItem('echoaid-user', JSON.stringify(user));
    } else {
        localStorage.removeItem('echoaid-user');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<User> => {
    // Mock API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = DUMMY_USERS.find(u => u.email === email);
        if (foundUser) {
          setUser(foundUser);
          resolve(foundUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };
  
  const signup = async (name: string, email: string, pass: string, role: UserRole): Promise<User> => {
     // Mock API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingUser = DUMMY_USERS.find(u => u.email === email);
            if(existingUser) {
                return reject(new Error('User with this email already exists'));
            }
            const newUser: User = { id: `user-${Date.now()}`, name, email, role };
            // In a real app, you'd add this user to your DB. Here we just set them in state.
            DUMMY_USERS.push(newUser); // For demo purposes
            setUser(newUser);
            resolve(newUser);
        }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
