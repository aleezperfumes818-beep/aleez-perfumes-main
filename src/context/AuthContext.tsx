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
    let isMounted = true;

    const initAuth = async () => {
      if (supabase) {
        try {
          const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 1500)
          );
          const sessionPromise = supabase.auth.getSession().catch(() => ({ data: { session: null } }));

          const result = await Promise.race([sessionPromise, timeoutPromise]);
          const session = result?.data?.session;

          if (isMounted && session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profile && isMounted) {
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
            } catch (pErr) {
              console.warn('Could not fetch user profile:', pErr);
            }
          }
        } catch (e) {
          console.warn('Supabase auth session check failed:', e);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. Master Passcode & Authorized Admin Team verification
      const authCheck = adminTeamService.isAuthorizedAdmin(cleanEmail);
      const isMasterPass = cleanPass === 'AleezAdmin2026!';
      const isOwnerEmail = cleanEmail === 'aleez.perfumes818@gmail.com';

      if (isMasterPass || (authCheck.authorized && (isMasterPass || !cleanPass || cleanPass.length >= 6))) {
        const member = authCheck.member;
        const adminUser: UserProfile = {
          id: member?.id || (isOwnerEmail ? 'admin-primary-001' : `admin-${Date.now()}`),
          email: cleanEmail,
          full_name: member?.full_name || (isOwnerEmail ? 'Aleez Perfumes Owner' : 'Store Administrator'),
          phone: member?.phone || '+91 9345526905',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        return { success: true };
      }

      // 2. Supabase Auth verification
      if (supabase && cleanPass) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });

          if (!error && data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile?.role === 'admin' || authCheck.authorized || isOwnerEmail) {
              const adminUser: UserProfile = {
                id: data.user.id,
                email: data.user.email || cleanEmail,
                full_name: profile?.full_name || 'Store Administrator',
                phone: profile?.phone || '',
                role: 'admin',
              };
              setUser(adminUser);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
              return { success: true };
            } else {
              await supabase.auth.signOut().catch(() => {});
              return { success: false, error: 'Access denied: Admin privileges required.' };
            }
          }
        } catch (supabaseErr) {
          console.warn('Supabase admin login attempt:', supabaseErr);
        }
      }

      return {
        success: false,
        error: 'Access denied: Invalid administrator email or secret key.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
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
