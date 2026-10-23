import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthResponse {
  success: boolean;
  error?: string;
  emailConfirmationRequired?: boolean;
  user?: UserProfile;
  role?: 'customer' | 'admin';
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  adminLogin: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, fullName: string, phone: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (newPassword: string) => Promise<AuthResponse>;
  changePassword: (newPassword: string) => Promise<AuthResponse>;
  resendVerificationEmail: (email: string) => Promise<AuthResponse>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'aleez_auth_user';

// Clean, user-friendly error translation
function mapAuthError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred.';
  const msg = err.message || String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid email address or password. Please check your credentials.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet. Please verify your email via the link sent to your inbox.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account is already registered with this email address. Please sign in instead.';
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Password must contain at least 8 characters for security.';
  }
  if (lower.includes('rate limit') || lower.includes('once every') || lower.includes('too many requests')) {
    return 'Too many attempts. For your security, please wait 60 seconds before trying again.';
  }
  if (lower.includes('expired') || lower.includes('token is invalid') || lower.includes('otp expired')) {
    return 'The verification or recovery link has expired or is invalid. Please request a new link.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network connectivity issue. Please check your connection and try again.';
  }
  return msg;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to fetch and resolve verified profile from Supabase public.profiles
  const fetchVerifiedProfile = useCallback(async (authUser: User): Promise<UserProfile> => {
    if (!supabase) {
      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || '',
        phone: authUser.user_metadata?.phone || '',
        role: 'customer',
      };
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!error && profile) {
        return {
          id: profile.id,
          email: profile.email || authUser.email || '',
          full_name: profile.full_name || authUser.user_metadata?.full_name || '',
          phone: profile.phone || authUser.user_metadata?.phone || '',
          role: profile.role === 'admin' ? 'admin' : 'customer', // Strict: only DB 'admin' is recognized
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          created_at: profile.created_at,
        };
      }
    } catch (err) {
      console.warn('Error querying verified profile, defaulting to customer:', err);
    }

    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || '',
      phone: authUser.user_metadata?.phone || '',
      role: 'customer',
    };
  }, []);

  // Listen to official Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);

      if (initialSession?.user) {
        const verifiedProfile = await fetchVerifiedProfile(initialSession.user);
        if (isMounted) {
          setUser(verifiedProfile);
          try {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedProfile));
          } catch (e) {
            console.error('Failed to cache user session:', e);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.warn('Session restoration warning:', err);
      if (isMounted) setIsLoading(false);
    });

    // 2. Real-time Auth Event Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            const verifiedProfile = await fetchVerifiedProfile(newSession.user);
            if (isMounted) {
              setUser(verifiedProfile);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedProfile));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          // Handled on /reset-password route
          console.info('Supabase password recovery session detected.');
        }

        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchVerifiedProfile]);

  // Unified Login (handles both Customers and Admins securely)
  const login = async (email: string, password = ''): Promise<AuthResponse> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setIsLoading(false);
      return { success: false, error: 'Email and password are required.' };
    }

    if (!supabase) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is not configured. Please verify your Supabase credentials in .env.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, error: mapAuthError(error) };
      }

      if (!data.user) {
        return { success: false, error: 'Unable to establish authenticated session.' };
      }

      const verifiedProfile = await fetchVerifiedProfile(data.user);
      setUser(verifiedProfile);
      setSession(data.session);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedProfile));

      return {
        success: true,
        user: verifiedProfile,
        role: verifiedProfile.role,
      };
    } catch (err: any) {
      return { success: false, error: mapAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Admin Login (verifies database 'admin' role)
  const adminLogin = async (email: string, password = ''): Promise<AuthResponse> => {
    const res = await login(email, password);

    if (!res.success) {
      return res;
    }

    // Role check: Only allow users with verified 'admin' role
    if (res.role !== 'admin') {
      // Immediately terminate the session if not an administrator
      await logout();
      return {
        success: false,
        error: 'Access denied: You do not possess store administrator privileges.',
      };
    }

    return res;
  };

  // Registration flow with email verification support
  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail || !password || !cleanName) {
      setIsLoading(false);
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (password.length < 8) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    if (!supabase) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is not configured. Please check Supabase setup.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            // Role is strictly hardcoded to 'customer' in DB trigger
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: mapAuthError(error) };
      }

      if (!data.user) {
        return { success: false, error: 'Sign up failed. Please try again.' };
      }

      // If email confirmation is enabled on Supabase, session is null initially
      const confirmationRequired = !data.session;

      if (!confirmationRequired && data.user) {
        const verifiedProfile = await fetchVerifiedProfile(data.user);
        setUser(verifiedProfile);
        setSession(data.session);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedProfile));
      }

      return {
        success: true,
        emailConfirmationRequired: confirmationRequired,
      };
    } catch (err: any) {
      return { success: false, error: mapAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password flow (account enumeration protected)
  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your email address.' };
    }

    if (!supabase) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is currently unavailable.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Log for monitoring but show user-safe message
        console.warn('Password recovery error:', error.message);
        if (error.message.toLowerCase().includes('rate limit')) {
          return { success: false, error: mapAuthError(error) };
        }
      }

      // Always return success to protect against account enumeration
      return { success: true };
    } catch (err: any) {
      console.warn('Password recovery error:', err);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password using recovery session
  const resetPassword = async (newPassword: string): Promise<AuthResponse> => {
    setIsLoading(true);

    if (!newPassword || newPassword.length < 8) {
      setIsLoading(false);
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    if (!supabase) {
      setIsLoading(false);
      return { success: false, error: 'Authentication service is unavailable.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: mapAuthError(error) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: mapAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Change password for an authenticated user
  const changePassword = async (newPassword: string): Promise<AuthResponse> => {
    return resetPassword(newPassword);
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, error: 'Email address is required.' };
    }

    if (!supabase) {
      setIsLoading(false);
      return { success: false, error: 'Authentication service is unavailable.' };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: mapAuthError(error) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: mapAuthError(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out cleanly
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      setIsLoading(false);
    }
  };

  // Update profile attributes (role changes strictly forbidden on client)
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active session.' };

    // Strip protected fields so client can never attempt role escalation
    const { role, id, email, created_at, ...permittedUpdates } = updates as any;

    const updatedUser: UserProfile = { ...user, ...permittedUpdates };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    if (supabase) {
      try {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update(permittedUpdates)
          .eq('id', user.id);

        if (profileErr) {
          console.warn('Profile sync error in Supabase:', profileErr);
          return { success: false, error: profileErr.message };
        }

        // Also update auth user metadata if name or phone changed
        if (permittedUpdates.full_name || permittedUpdates.phone) {
          await supabase.auth.updateUser({
            data: {
              full_name: permittedUpdates.full_name || user.full_name,
              phone: permittedUpdates.phone || user.phone,
            },
          }).catch(() => {});
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update profile.' };
      }
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        resendVerificationEmail,
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
