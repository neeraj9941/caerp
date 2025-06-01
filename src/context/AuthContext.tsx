import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'intern';
  status: 'active' | 'inactive';
  department: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchProfile = async (userId: string, isNewUserContext: boolean = false): Promise<Profile | null> => {
    try {
      let { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile (attempt 1):', fetchError);
        throw fetchError;
      }

      if (profileData) {
        setProfile(profileData as Profile);
        return profileData as Profile;
      }

      if (isNewUserContext) {
        console.log(`Profile for ${userId} not found initially, waiting for server-side creation (trigger)...`);
        await new Promise(resolve => setTimeout(resolve, 2500));

        const { data: profileAfterWait, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (retryError) {
          console.error('Error fetching profile after wait (attempt 2):', retryError);
          if (retryError.code === 'PGRST116') {
            toast.error('Your profile is still being set up. Please try refreshing the page in a moment or log in again.');
            throw new Error('Profile not available after trigger execution period.');
          }
          throw retryError;
        }
        
        setProfile(profileAfterWait as Profile);
        toast.success('Profile successfully loaded!');
        return profileAfterWait as Profile;
      } else {
        console.warn(`Profile for ${userId} not found unexpectedly (not a new user context).`);
        setProfile(null);
        toast.error('Your profile could not be loaded. Please try logging out and then logging back in.');
        throw new Error('Existing profile became unavailable.');
      }
    } catch (error: any) {
      console.error('fetchProfile failed:', error.message);
      setProfile(null);
      if (error.message !== 'Profile not available after trigger execution period.' && error.message !== 'Existing profile became unavailable.') {
         toast.error('An issue occurred while loading your profile.');
      }
      throw error;
    }
  };

  useEffect(() => {
    setAuthLoading(true);
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setProfile(null);
        toast.error('Failed to initialize session.');
      } else if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, true)
          .catch(err => {
            console.error("Failed to fetch profile during initial session load:", err.message);
          })
          .finally(() => {
            setAuthLoading(false);
          });
        return;
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`, session?.user?.email);
        setAuthLoading(true);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          try {
            await fetchProfile(session.user.id, true);
          } catch (err: any) {
            console.error("Failed to fetch profile on SIGNED_IN:", err.message);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
          if (!profile || profile.id !== session.user.id) {
            try {
              await fetchProfile(session.user.id, false);
            } catch (err: any) {
              console.error("Failed to fetch profile on USER_UPDATED:", err.message);
            }
          }
        } else if (session?.user && (!user || user.id !== session.user.id)) {
          setUser(session.user);
          try {
            await fetchProfile(session.user.id, true);
          } catch (err: any) {
            console.error("Failed to fetch profile on new session user:", err.message);
          }
        } else if (!session?.user) {
           setUser(null);
           setProfile(null);
        }
        setAuthLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('No user data received after sign in attempt.');
      
      toast.success('Login successful! Finalizing your session...');
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.');
        throw new Error('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Please verify your email address to log in.');
        throw new Error('Please verify your email address');
      } else {
        toast.error('Failed to sign in. Please try again.');
        throw new Error('Failed to sign in: ' + error.message);
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("You've been signed out successfully.");
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error('Error signing out: ' + error.message);
      throw error;
    } 
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const value = {
    user,
    profile,
    signIn,
    signOut,
    loading: authLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};