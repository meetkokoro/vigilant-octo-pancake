import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * When credentials are absent the app falls back to a fully local demo mode
 * instead of crashing, so the prototype still runs without a backend.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        // PKCE keeps the OAuth code exchange safe in a public browser client.
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const OAUTH_REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;

export type OAuthProvider = 'linkedin_oidc' | 'google' | 'apple';

export const OAUTH_SCOPES: Record<OAuthProvider, string> = {
  linkedin_oidc: 'openid profile email',
  google: 'openid email profile',
  apple: 'name email',
};

/** Strips `?code=...` / `#access_token=...` from the URL after a successful login. */
export function cleanOAuthParamsFromUrl(): void {
  const { search, hash, origin, pathname } = window.location;
  if (
    !/[?&](code|error|error_description)=/.test(search) &&
    !/access_token|error=/.test(hash)
  ) {
    return;
  }
  window.history.replaceState({}, document.title, `${origin}${pathname}`);
}
