export type Gender = 'woman' | 'man' | 'non-binary' | 'other';

export type SwipeDirection = 'like' | 'pass' | 'super';

export const DATING_INTENTS = [
  'Long-term relationship',
  'Dating & Romance',
  'Connections & More',
  'Casual & Fun',
  'New Friends',
] as const;

export type DatingIntent = (typeof DATING_INTENTS)[number];

export interface DatingPreferences {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  interestedIn: Gender[];
  intents: string[];
  maxConnectionDegree: 1 | 2 | 3;
  sameCompanyOnly: boolean;
  /** Hides the profile from the radar while still allowing chat with matches. */
  incognito: boolean;
  showVerifiedOnly: boolean;
}

export const DEFAULT_PREFERENCES: DatingPreferences = {
  minAge: 24,
  maxAge: 45,
  maxDistanceKm: 25,
  interestedIn: ['woman', 'man', 'non-binary'],
  intents: [...DATING_INTENTS],
  maxConnectionDegree: 3,
  sameCompanyOnly: false,
  incognito: false,
  showVerifiedOnly: false,
};

export const REPORT_REASONS = [
  'Fake or impersonated profile',
  'Inappropriate photos or messages',
  'Harassment or hate speech',
  'Scam, spam or solicitation',
  'Underage user',
  'Something else',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface IncomingLike {
  profileId: string;
  likedAt: string;
  isSuperLike: boolean;
}
