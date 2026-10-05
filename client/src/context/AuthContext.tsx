import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (mobile: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: Role) => Promise<void>;
}

const DEMO_CREDENTIALS: Record<Role, { mobile: string; pass: string }> = {
  DONOR: { mobile: '9000000001', pass: 'pass1234' },
  SEEKER: { mobile: '9100000001', pass: 'pass1234' },
  VERIFIER: { mobile: '9200000001', pass: 'pass1234' },
  ADMIN: { mobile: '9300000001', pass: 'pass1234' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('divyasetu_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data.user);
      } catch (e) {
        console.error('Failed to load user', e);
        localStorage.removeItem('divyasetu_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (mobile: string, password: string = 'pass1234') => {
    setLoading(true);
    try {
      const res = await authApi.login({ mobile, password });
      const { user: authedUser, token: authToken } = res.data;
      localStorage.setItem('divyasetu_token', authToken);
      setToken(authToken);
      setUser(authedUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('divyasetu_token', authToken);
      setToken(authToken);
      setUser(registeredUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('divyasetu_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (role: Role) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.mobile, creds.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
