import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  cleanOAuthParamsFromUrl,
  OAUTH_REDIRECT_URL,
  OAUTH_SCOPES,
  OAuthProvider,
} from '../lib/supabase';
import { Profile, CURRENT_USER } from '../utils/mockData';
import { fetchMyProfile, upsertMyProfile } from '../services/profileService';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  /** True when no Supabase credentials are present and mock data is used. */
  demoMode: boolean;
  /** Signed in but profile setup has not been completed yet. */
  needsOnboarding: boolean;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<AuthActionResult>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthActionResult>;
  signInAsDemoUser: () => void;
  signOut: () => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  completeOnboarding: (patch: Partial<Profile>) => Promise<void>;
}

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  const loadProfile = useCallback(async (currentUser: User) => {
    const existing = await fetchMyProfile(currentUser);
    setProfile(existing.profile);
    setOnboarded(existing.onboardingCompleted);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(error.message);
        setSession(data.session ?? null);
        if (data.session?.user) await loadProfile(data.session.user);
        cleanOAuthParamsFromUrl();
      })
      .finally(() => active && setLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setOnboarded(false);
          return;
        }
        if (nextSession?.user) {
          await loadProfile(nextSession.user);
          cleanOAuthParamsFromUrl();
        }
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithProvider = useCallback(async (provider: OAuthProvider) => {
    setAuthError(null);

    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key.'
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: OAUTH_REDIRECT_URL,
        scopes: OAUTH_SCOPES[provider],
      },
    });

    if (error) setAuthError(error.message);
  }, []);

  const signInAsDemoUser = useCallback(() => {
    setProfile(CURRENT_USER);
    setOnboarded(true);
  }, []);

  /** Sends (or re-sends) an SMS one-time code, creating the account if new. */
  const sendPhoneOtp = useCallback(
    async (phone: string): Promise<AuthActionResult> => {
      setAuthError(null);

      if (!supabase) return { ok: true };

      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: 'sms', shouldCreateUser: true },
      });

      if (error) {
        setAuthError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    },
    []
  );

  const verifyPhoneOtp = useCallback(
    async (phone: string, token: string): Promise<AuthActionResult> => {
      setAuthError(null);

      if (!supabase) {
        signInAsDemoUser();
        return { ok: true };
      }

      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) {
        setAuthError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    },
    [signInAsDemoUser]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setOnboarded(false);
  }, []);

  const saveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      if (session?.user) await upsertMyProfile(session.user, patch);
    },
    [session]
  );

  const completeOnboarding = useCallback(
    async (patch: Partial<Profile>) => {
      setProfile((prev) =>
        prev
          ? { ...prev, ...patch }
          : ({ ...CURRENT_USER, ...patch } as Profile)
      );
      if (session?.user)
        await upsertMyProfile(session.user, patch, {
          onboardingCompleted: true,
        });
      setOnboarded(true);
    },
    [session]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      authError,
      demoMode: !isSupabaseConfigured,
      needsOnboarding: Boolean(profile) && !onboarded,
      signInWithProvider,
      sendPhoneOtp,
      verifyPhoneOtp,
      signInAsDemoUser,
      signOut,
      saveProfile,
      completeOnboarding,
    }),
    [
      session,
      profile,
      loading,
      authError,
      onboarded,
      signInWithProvider,
      sendPhoneOtp,
      verifyPhoneOtp,
      signInAsDemoUser,
      signOut,
      saveProfile,
      completeOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
