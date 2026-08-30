import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, CURRENT_USER, MOCK_PROFILES } from '../utils/mockData';
import { DatingPreferences, DEFAULT_PREFERENCES } from '../types/dating';

interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  company: string | null;
  location: string | null;
  locality_name: string | null;
  bio: string | null;
  interests: string[] | null;
  photos: string[] | null;
  dating_intent: string | null;
  birthdate: string | null;
  gender: string | null;
  verified: boolean | null;
  distance_km: number | null;
  connection_degree: number | null;
  common_connections: string[] | null;
  icebreaker: string | null;
  radar_angle: number | null;
  radar_distance: number | null;
  onboarding_completed: boolean | null;
}

function ageFromBirthdate(birthdate: string | null): number | undefined {
  if (!birthdate) return undefined;
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return undefined;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.full_name ?? 'New member',
    avatar: row.avatar_url ?? '',
    headline: row.headline ?? '',
    company: row.company ?? '',
    location: row.location ?? '',
    distance: row.distance_km ?? 0,
    localityName: row.locality_name ?? '',
    commonConnections: row.common_connections ?? [],
    connectionDegree: (row.connection_degree as 1 | 2 | 3) ?? 3,
    bio: row.bio ?? '',
    interests: row.interests ?? [],
    datingIntent: row.dating_intent ?? '',
    radarAngle: row.radar_angle ?? Math.random() * 360,
    radarDistance: row.radar_distance ?? 0.5,
    icebreaker: row.icebreaker ?? '',
    age: ageFromBirthdate(row.birthdate),
    birthdate: row.birthdate ?? undefined,
    gender: (row.gender as Profile['gender']) ?? undefined,
    photos: row.photos ?? undefined,
    verified: row.verified ?? false,
  };
}

function profileToRow(patch: Partial<Profile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.full_name = patch.name;
  if (patch.avatar !== undefined) row.avatar_url = patch.avatar;
  if (patch.headline !== undefined) row.headline = patch.headline;
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.location !== undefined) row.location = patch.location;
  if (patch.localityName !== undefined) row.locality_name = patch.localityName;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.interests !== undefined) row.interests = patch.interests;
  if (patch.photos !== undefined) row.photos = patch.photos;
  if (patch.datingIntent !== undefined) row.dating_intent = patch.datingIntent;
  if (patch.birthdate !== undefined) row.birthdate = patch.birthdate;
  if (patch.gender !== undefined) row.gender = patch.gender;
  if (patch.icebreaker !== undefined) row.icebreaker = patch.icebreaker;
  return row;
}

/**
 * Reads the signed-in user's profile row, seeding it from the OAuth identity
 * (LinkedIn / Google / Apple) the first time they sign in.
 */
export async function fetchMyProfile(
  user: User
): Promise<{ profile: Profile | null; onboardingCompleted: boolean }> {
  if (!supabase) return { profile: CURRENT_USER, onboardingCompleted: true };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error('[profileService] fetchMyProfile', error.message);
    return { profile: null, onboardingCompleted: false };
  }

  if (data) {
    return {
      profile: rowToProfile(data),
      onboardingCompleted: Boolean(data.onboarding_completed),
    };
  }

  const identity = user.user_metadata ?? {};
  const seeded = {
    id: user.id,
    full_name:
      identity.full_name ??
      identity.name ??
      user.email?.split('@')[0] ??
      'New member',
    avatar_url: identity.avatar_url ?? identity.picture ?? null,
    headline: identity.headline ?? null,
    verified: Boolean(user.app_metadata?.provider === 'linkedin_oidc'),
  };

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert(seeded)
    .select('*')
    .single<ProfileRow>();

  if (insertError) {
    console.error('[profileService] seed profile', insertError.message);
    return { profile: null, onboardingCompleted: false };
  }

  return { profile: rowToProfile(created), onboardingCompleted: false };
}

export async function upsertMyProfile(
  user: User,
  patch: Partial<Profile>,
  extra: { onboardingCompleted?: boolean } = {}
): Promise<void> {
  if (!supabase) return;

  const row = profileToRow(patch);
  if (extra.onboardingCompleted !== undefined)
    row.onboarding_completed = extra.onboardingCompleted;
  if (Object.keys(row).length === 0) return;

  const { error } = await supabase
    .from('profiles')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) console.error('[profileService] upsertMyProfile', error.message);
}

/** Candidates the user has not swiped on or blocked yet. */
export async function fetchDiscoveryFeed(
  prefs: DatingPreferences
): Promise<Profile[]> {
  if (!supabase) return filterProfilesLocally(MOCK_PROFILES, prefs);

  const { data, error } = await supabase.rpc('discovery_feed', {
    min_age: prefs.minAge,
    max_age: prefs.maxAge,
    max_distance_km: prefs.maxDistanceKm,
    interested_in: prefs.interestedIn,
    intents: prefs.intents,
    max_connection_degree: prefs.maxConnectionDegree,
    same_company_only: prefs.sameCompanyOnly,
    verified_only: prefs.showVerifiedOnly,
  });

  if (error) {
    console.error('[profileService] fetchDiscoveryFeed', error.message);
    return [];
  }

  return ((data ?? []) as ProfileRow[]).map(rowToProfile);
}

/** Same predicate as the SQL feed, applied to mock data in demo mode. */
export function filterProfilesLocally(
  profiles: Profile[],
  prefs: DatingPreferences
): Profile[] {
  return profiles.filter((p) => {
    if (p.distance > prefs.maxDistanceKm) return false;
    if (p.connectionDegree > prefs.maxConnectionDegree) return false;
    if (prefs.sameCompanyOnly && p.company !== CURRENT_USER.company)
      return false;
    if (prefs.showVerifiedOnly && !p.verified) return false;
    if (p.age !== undefined && (p.age < prefs.minAge || p.age > prefs.maxAge))
      return false;
    if (p.gender && !prefs.interestedIn.includes(p.gender)) return false;
    if (prefs.intents.length > 0 && !prefs.intents.includes(p.datingIntent))
      return false;
    return true;
  });
}

export async function fetchPreferences(
  userId: string
): Promise<DatingPreferences> {
  if (!supabase) return DEFAULT_PREFERENCES;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_PREFERENCES;

  return {
    minAge: data.min_age ?? DEFAULT_PREFERENCES.minAge,
    maxAge: data.max_age ?? DEFAULT_PREFERENCES.maxAge,
    maxDistanceKm: data.max_distance_km ?? DEFAULT_PREFERENCES.maxDistanceKm,
    interestedIn: data.interested_in ?? DEFAULT_PREFERENCES.interestedIn,
    intents: data.intents ?? DEFAULT_PREFERENCES.intents,
    maxConnectionDegree:
      data.max_connection_degree ?? DEFAULT_PREFERENCES.maxConnectionDegree,
    sameCompanyOnly:
      data.same_company_only ?? DEFAULT_PREFERENCES.sameCompanyOnly,
    incognito: data.incognito ?? DEFAULT_PREFERENCES.incognito,
    showVerifiedOnly:
      data.verified_only ?? DEFAULT_PREFERENCES.showVerifiedOnly,
  };
}

export async function savePreferences(
  userId: string,
  prefs: DatingPreferences
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: userId,
    min_age: prefs.minAge,
    max_age: prefs.maxAge,
    max_distance_km: prefs.maxDistanceKm,
    interested_in: prefs.interestedIn,
    intents: prefs.intents,
    max_connection_degree: prefs.maxConnectionDegree,
    same_company_only: prefs.sameCompanyOnly,
    incognito: prefs.incognito,
    verified_only: prefs.showVerifiedOnly,
    updated_at: new Date().toISOString(),
  });

  if (error) console.error('[profileService] savePreferences', error.message);
}

export async function deleteMyAccount(): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.rpc('delete_my_account');
  if (error) {
    console.error('[profileService] deleteMyAccount', error.message);
    return false;
  }
  await supabase.auth.signOut();
  return true;
}
