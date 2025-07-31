import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  pair_code: string | null;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  connectWithPartner: (pairCode: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Fetch user profile after successful login
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email
        }
      }
    });

    if (error) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const connectWithPartner = async (pairCode: string) => {
    if (!user || !profile) {
      return { error: { message: "Please sign in first" } };
    }

    try {
      // Find partner by pair code
      const { data: partnerProfile, error: partnerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('pair_code', pairCode.toUpperCase())
        .single();

      if (partnerError || !partnerProfile) {
        return { error: { message: "Invalid pair code" } };
      }

      if (partnerProfile.user_id === user.id) {
        return { error: { message: "You cannot pair with yourself" } };
      }

      // Update both profiles to link them
      const { error: updateError1 } = await supabase
        .from('profiles')
        .update({ partner_id: partnerProfile.id })
        .eq('id', profile.id);

      const { error: updateError2 } = await supabase
        .from('profiles')
        .update({ partner_id: profile.id })
        .eq('id', partnerProfile.id);

      if (updateError1 || updateError2) {
        return { error: { message: "Failed to connect profiles" } };
      }

      // Create couple relationship
      const { error: coupleError } = await supabase
        .from('couples')
        .insert({
          partner1_id: profile.id,
          partner2_id: partnerProfile.id,
          relationship_status: 'active'
        });

      if (coupleError) {
        return { error: { message: "Failed to create couple relationship" } };
      }

      // Refresh profile
      await fetchProfile(user.id);

      toast({
        title: "Connected!",
        description: `You are now connected with ${partnerProfile.display_name}`,
      });

      return { error: null };
    } catch (error) {
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    connectWithPartner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};