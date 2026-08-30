import type { Gender, IncomingLike } from '../types/dating';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  company: string;
  location: string;
  distance: number; // in km
  localityName: string;
  commonConnections: string[];
  connectionDegree: 1 | 2 | 3;
  bio: string;
  interests: string[];
  datingIntent: string;
  // Polar coordinates for radar rendering: angle (0 to 360) and radius scale (0.1 to 0.9)
  radarAngle: number;
  radarDistance: number;
  icebreaker: string;
  age?: number;
  birthdate?: string;
  gender?: Gender;
  photos?: string[];
  verified?: boolean;
  lastActiveLabel?: string;
}

export const CURRENT_USER: Profile = {
  id: 'currentUser',
  name: 'Alex Chen',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  headline: 'Senior Software Engineer',
  company: 'Google',
  location: 'San Francisco, CA',
  distance: 0,
  localityName: 'Downtown / SoMa',
  commonConnections: [],
  connectionDegree: 1,
  bio: "Building cool things and looking for someone to explore SF's coffee shops and hiking trails with. Let's talk tech, design, or your favorite weekend getaway.",
  interests: ['Hiking', 'Coffee Roasting', 'AI', 'Indie Rock', 'Photography'],
  datingIntent: 'Long-term relationship',
  radarAngle: 0,
  radarDistance: 0,
  icebreaker:
    "Hey! Nice to connect. Always looking for new coffee spots in SoMa. What's your current go-to?",
  age: 31,
  birthdate: '1994-05-12',
  gender: 'man',
  verified: true,
  lastActiveLabel: 'Online now',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
  ],
};

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Elena Rostova',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    headline: 'Product Designer',
    company: 'Google',
    location: 'San Francisco, CA',
    distance: 0.4,
    localityName: 'SoMa',
    commonConnections: ['Sarah Jenkins (VP PM)', 'Marcus Aurelius (Tech Lead)'],
    connectionDegree: 1,
    bio: 'Design lead on Google Maps. Believer in form following function. Outside of Figma, I paint, ride my gravel bike, and try to make the perfect sourdough bread.',
    interests: ['Biking', 'Painting', 'Sourdough', 'Typography', 'Road Trips'],
    datingIntent: 'Dating & Romance',
    radarAngle: 45,
    radarDistance: 0.35,
    icebreaker:
      "Hey! Saw we both work at Google SF. Are you based in the Spear Tower or Howard? Let's grab lunch sometime!",
    age: 29,
    gender: 'woman',
    verified: true,
    lastActiveLabel: 'Online now',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: '2',
    name: 'Marcus Miller',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    headline: 'Staff Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    distance: 1.2,
    localityName: 'Mission District',
    commonConnections: ['Elena Rostova', 'Dave Wilson'],
    connectionDegree: 2,
    bio: 'Backend developer working on global payment infra. Cozy evening enthusiast. I spend my weekends running in Golden Gate Park, reading sci-fi, and cooking pasta.',
    interests: [
      'Running',
      'Sci-Fi',
      'Italian Cooking',
      'Bouldering',
      'Open Source',
    ],
    datingIntent: 'Connections & More',
    radarAngle: 135,
    radarDistance: 0.6,
    icebreaker:
      'Hey! Small world - looks like we both know Elena. How long have you been in SF?',
    age: 34,
    gender: 'man',
    verified: true,
    lastActiveLabel: 'Active 12m ago',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1502720705749-871143f0e671?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: '3',
    name: 'Sophia Martinez',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    headline: 'Product Marketing Manager',
    company: 'Meta',
    location: 'San Francisco, CA',
    distance: 0.8,
    localityName: 'SoMa',
    commonConnections: ['Sarah Jenkins (VP PM)'],
    connectionDegree: 2,
    bio: "Storyteller for virtual reality tech. Dog mom to a golden retriever named Rusty. Love exploring live jazz bars, modern art museums, and local farmer's markets.",
    interests: [
      'Jazz Music',
      'Modern Art',
      'Farmers Markets',
      'Dogs',
      'Wine Tasting',
    ],
    datingIntent: 'Long-term relationship',
    radarAngle: 280,
    radarDistance: 0.45,
    icebreaker:
      "Hey! I see you're connected with Sarah. I worked with her back at Google before moving to Meta. Small world!",
    age: 27,
    gender: 'woman',
    verified: true,
    lastActiveLabel: 'Active 1h ago',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: '4',
    name: 'Aidan Vance',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    headline: 'Founder / CEO',
    company: 'Lumina Labs (Y Combinator)',
    location: 'San Francisco, CA',
    distance: 2.1,
    localityName: 'Hayes Valley',
    commonConnections: ['Marcus Aurelius (Tech Lead)'],
    connectionDegree: 2,
    bio: 'Building the next generation of AI-driven developer platforms. Obsessed with mechanical keyboards, vinyl records, and double-shot espressos. Always down for deep discussions.',
    interests: ['Startups', 'AI', 'Vinyl Records', 'Espresso', 'Keyboards'],
    datingIntent: 'Casual & Fun',
    radarAngle: 220,
    radarDistance: 0.8,
    icebreaker:
      "Nice profile! lumina-labs.com is my current project. If you're ever in Hayes Valley, let's grab coffee and talk shop!",
    age: 36,
    gender: 'man',
    verified: false,
    lastActiveLabel: 'Active 3h ago',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: '5',
    name: 'Tariq Al-Fayed',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    headline: 'Investment Associate',
    company: 'Sequoia Capital',
    location: 'San Francisco, CA',
    distance: 3.5,
    localityName: 'Pacific Heights',
    commonConnections: ['Aidan Vance', 'Elena Rostova'],
    connectionDegree: 3,
    bio: "Looking for tech disruptors and great conversationalists. Lover of tennis, sailing, and high-altitude mountaineering. Let's travel and check out the best ramen spots.",
    interests: [
      'Tennis',
      'Sailing',
      'Mountaineering',
      'Ramen',
      'Angel Investing',
    ],
    datingIntent: 'Dating & Romance',
    radarAngle: 315,
    radarDistance: 0.9,
    icebreaker:
      "Hey Tariq here! I saw you are connected with Elena. Sequoia is looking at some very cool things in space. Let's connect!",
    age: 32,
    gender: 'man',
    verified: false,
    lastActiveLabel: 'Active yesterday',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
    ],
  },
  {
    id: '6',
    name: 'Chloe Zhao',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    headline: 'AI Research Scientist',
    company: 'Google',
    location: 'San Francisco, CA',
    distance: 0.2,
    localityName: 'SoMa',
    commonConnections: ['Sarah Jenkins (VP PM)', 'Elena Rostova'],
    connectionDegree: 1,
    bio: 'Working on large language models at Google DeepMind. Amateur violinist and sushi critic. I like stargazing on clear nights and playing chess in the park.',
    interests: ['Violin', 'Chess', 'Deep Learning', 'Sushi', 'Stargazing'],
    datingIntent: 'Dating & Connections',
    radarAngle: 85,
    radarDistance: 0.2,
    icebreaker:
      'Hello! Always great to meet another Googler in SoMa. Do you work on the search stack or cloud side?',
    age: 28,
    gender: 'woman',
    verified: true,
    lastActiveLabel: 'Online now',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=600',
    ],
  },
];

/** Demo-mode stand-in for the `incoming_likes()` SQL function. */
export const MOCK_INCOMING_LIKES: IncomingLike[] = [
  { profileId: '3', likedAt: '2026-08-27T18:20:00Z', isSuperLike: true },
  { profileId: '4', likedAt: '2026-08-27T09:05:00Z', isSuperLike: false },
  { profileId: '5', likedAt: '2026-08-26T21:40:00Z', isSuperLike: false },
];
