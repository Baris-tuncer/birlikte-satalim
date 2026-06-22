import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from './supabase';
import { getUserProfile } from './database';
import type { Session, User as AuthUser } from '@supabase/supabase-js';
import type { User as AppUser } from '@/types';

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  profile: AppUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  emailVerified: boolean;
  licenseStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

interface AuthContextType extends AuthState {
  signUp: (params: {
    email: string;
    password: string;
    name: string;
    companyName: string;
    phone: string;
  }) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  setLicenseStatus: (status: AuthState['licenseStatus']) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,
    emailVerified: false,
    licenseStatus: 'none',
  });

  // Kullanıcı profili çek (users tablosundan)
  const fetchProfile = useCallback(async (authId: string) => {
    const { data } = await getUserProfile(authId);
    if (data) {
      setState((prev) => ({
        ...prev,
        profile: data,
        licenseStatus: data.license_status,
      }));
    }
  }, []);

  // Supabase session dinle
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session,
        emailVerified: !!session?.user?.email_confirmed_at,
        isLoading: false,
      }));
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session,
        emailVerified: !!session?.user?.email_confirmed_at,
        isLoading: false,
      }));
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, profile: null, licenseStatus: 'none' }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      await fetchProfile(state.user.id);
    }
  }, [state.user, fetchProfile]);

  // E-posta ile kayıt ol
  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      name: string;
      companyName: string;
      phone: string;
    }): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              name: params.name,
              company_name: params.companyName,
              phone: params.phone,
            },
            emailRedirectTo: 'https://berabersatalim.com/auth/callback',
          },
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (e: any) {
        return { error: e.message || 'Bir hata oluştu' };
      }
    },
    []
  );

  // E-posta + şifre ile giriş
  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (e: any) {
        return { error: e.message || 'Bir hata oluştu' };
      }
    },
    []
  );

  // Şifre sıfırlama
  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://berabersatalim.com/auth/callback',
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch (e: any) {
        return { error: e.message || 'Bir hata oluştu' };
      }
    },
    []
  );

  // Hesap silme
  const deleteAccount = useCallback(
    async (): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.functions.invoke('delete-account');
        if (error) return { error: error.message || 'Hesap silinirken hata oluştu' };
        // Başarılı — oturumu kapat
        await supabase.auth.signOut();
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          profile: null,
          isLoading: false,
          isLoggedIn: false,
          emailVerified: false,
          licenseStatus: 'none',
        }));
        return { error: null };
      } catch (e: any) {
        return { error: e.message || 'Bir hata oluştu' };
      }
    },
    []
  );

  // Çıkış
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Hata olsa bile state'i sıfırla
    }
    setState((prev) => ({
      ...prev,
      session: null,
      user: null,
      profile: null,
      isLoading: false,
      isLoggedIn: false,
      emailVerified: false,
      licenseStatus: 'none',
    }));
  }, []);

  // Yetki belgesi durumunu güncelle
  const setLicenseStatus = useCallback(
    (status: AuthState['licenseStatus']) => {
      setState((prev) => ({ ...prev, licenseStatus: status }));
    },
    []
  );

  const value = useMemo(
    () => ({
      ...state,
      signUp,
      signIn,
      resetPassword,
      signOut,
      deleteAccount,
      setLicenseStatus,
      refreshProfile,
    }),
    [state, signUp, signIn, resetPassword, signOut, deleteAccount, setLicenseStatus, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
