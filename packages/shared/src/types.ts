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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export type TabType = 'radar' | 'connections' | 'chat' | 'profile';
