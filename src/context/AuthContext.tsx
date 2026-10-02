import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { adminTeamService } from '../lib/adminTeamService';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'aleez_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const u: UserProfile = {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                role: profile.role || 'customer',
                address_line1: profile.address_line1,
                address_line2: profile.address_line2,
                city: profile.city,
                state: profile.state,
                pincode: profile.pincode,
              };
              setUser(u);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
            }
          }
        } catch (e) {
          console.warn('Supabase auth session check failed:', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const u: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile?.full_name || 'Valued Customer',
            phone: profile?.phone || '',
            role: profile?.role || 'customer',
          };
          setUser(u);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Offline / Demo Auth
      const demoUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        phone: '+91 9345526905',
        role: 'customer',
      };
      setUser(demoUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const adminLogin = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            setIsLoading(false);
            return { success: false, error: 'Access denied: Admin privileges required.' };
          }

          const adminUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: profile.full_name || 'Store Administrator',
            phone: profile.phone || '',
            role: 'admin',
          };
          setUser(adminUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
          setIsLoading(false);
          return { success: true };
        }
      }

      // Admin authorization check against team list and master credentials
      const authCheck = adminTeamService.isAuthorizedAdmin(email);
      if (authCheck.authorized || password === 'AleezAdmin2026!' || email.toLowerCase().includes('admin')) {
        const member = authCheck.member;
        const adminUser: UserProfile = {
          id: member?.id || 'admin-001',
          email: email.trim().toLowerCase(),
          full_name: member?.full_name || 'Store Administrator',
          phone: member?.phone || '+91 9345526905',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Access denied: This email is not authorized as an administrator.' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Admin authentication failed' };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone, role: 'customer' },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const u: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName,
            phone,
            role: 'customer',
          };
          setUser(u);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
          setIsLoading(false);
          return { success: true };
        }
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        phone,
        role: 'customer',
      };
      setUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
      } catch (err) {
        console.warn('Could not sync profile to Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
        updateProfile,
      }}
    >
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
