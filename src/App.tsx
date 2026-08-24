import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { COLORS } from './styles/theme';
import { Compass, MessageSquare, Users, User, Wifi, Battery, Signal } from 'lucide-react';
import LoginScreen from './screens/LoginScreen';
import RadarScreen from './screens/RadarScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import ChatScreen from './screens/ChatScreen';
import { Profile, CURRENT_USER, MOCK_PROFILES } from './utils/mockData';
import confetti from 'canvas-confetti';

type TabType = 'radar' | 'connections' | 'chat' | 'profile';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [likes, setLikes] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>(['1']); // Start with Elena matched for immediate chat demo
  const [chatProfiles, setChatProfiles] = useState<Profile[]>(
    MOCK_PROFILES.filter(p => p.id === '1')
  );
  
  // Seed initial messages with Elena
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    '1': [
      {
        id: 'm1',
        senderId: '1',
        text: 'Hey! Nice to connect. Always looking for new coffee spots in SoMa. What\'s your current go-to?',
        timestamp: '10:34 AM'
      },
      {
        id: 'm2',
        senderId: 'currentUser',
        text: 'Hey Elena! Definitely "Sextant Coffee Roasters" on Folsom. They roast their own beans and have a great patio.',
        timestamp: '10:37 AM'
      },
      {
        id: 'm3',
        senderId: '1',
        text: 'Oh, I love Sextant! Their Ethiopian pour-over is amazing. Let\'s grab coffee there this week!',
        timestamp: '10:39 AM'
      }
    ]
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleLogin = (authenticatedUser: Profile) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('radar');
    setLikes([]);
    setMatches(['1']);
    setActiveChatId(null);
  };

  const handleLike = (targetProfile: Profile) => {
    if (likes.includes(targetProfile.id)) return;
    
    const newLikes = [...likes, targetProfile.id];
    setLikes(newLikes);

    // Let's make every 1st and 2nd degree match automatically for the demo to make it engaging
    if (targetProfile.connectionDegree <= 2) {
      // Trigger a match!
      const newMatches = [...matches, targetProfile.id];
      setMatches(newMatches);
      
      // Add profile to chat profiles list
      if (!chatProfiles.some(p => p.id === targetProfile.id)) {
        setChatProfiles([targetProfile, ...chatProfiles]);
      }

      // Add initial icebreaker from match
      setMessages(prev => ({
        ...prev,
        [targetProfile.id]: [
          {
            id: `init-${targetProfile.id}`,
            senderId: targetProfile.id,
            text: targetProfile.icebreaker,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));

      // Celebrate with confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      // Navigate to chat/connections or show prompt
      alert(`It's a Match! You and ${targetProfile.name} are now connected via LinkedIn. Go chat!`);
    }
  };

  const sendMessage = (profileId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      senderId: 'currentUser',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), newMsg]
    }));

    // Trigger simulated reply from connection after a short delay
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        senderId: profileId,
        text: `That sounds interesting! Let's talk more details. What days work best for you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [profileId]: [...(prev[profileId] || []), replyMsg]
      }));
    }, 2000);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'radar':
        return <RadarScreen onLike={handleLike} likedIds={likes} matchesIds={matches} />;
      case 'connections':
        return (
          <ConnectionsScreen
            matches={MOCK_PROFILES.filter(p => matches.includes(p.id))}
            onChatPress={(profileId) => {
              setActiveChatId(profileId);
              setActiveTab('chat');
            }}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            chatProfiles={chatProfiles}
            messages={messages}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onSendMessage={sendMessage}
            onBack={() => setActiveChatId(null)}
          />
        );
      case 'profile':
        return (
          <SafeAreaView style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>My LinkedIn Identity</Text>
            </View>
            <View style={styles.profileContent}>
              <Image source={{ uri: CURRENT_USER.avatar }} style={styles.profileAvatar} />
              <Text style={styles.profileName}>{CURRENT_USER.name}</Text>
              <Text style={styles.profileHeadline}>{CURRENT_USER.headline}</Text>
              <Text style={styles.profileCompany}>{CURRENT_USER.company} • {CURRENT_USER.location}</Text>
              
              <View style={styles.profileDivider} />
              
              <View style={styles.profileInfoBox}>
                <Text style={styles.infoLabel}>Bio</Text>
                <Text style={styles.infoValue}>{CURRENT_USER.bio}</Text>
              </View>

              <View style={styles.profileInfoBox}>
                <Text style={styles.infoLabel}>Interests</Text>
                <View style={styles.interestsContainer}>
                  {CURRENT_USER.interests.map(interest => (
                    <View key={interest} style={styles.interestTag}>
                      <Text style={styles.interestTagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Disconnect LinkedIn SSO</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        );
    }
  };

  return (
    <View style={styles.desktopShell}>
      {/* Sleek Mobile Frame */}
      <View style={styles.phoneFrame}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusBarTime}>9:41</Text>
          <View style={styles.statusBarIcons}>
            <Signal size={14} color="#ffffff" style={styles.statusIcon} />
            <Wifi size={14} color="#ffffff" style={styles.statusIcon} />
            <Battery size={16} color="#ffffff" style={styles.statusIcon} />
          </View>
        </View>

        {/* Screen Area */}
        <View style={styles.screenArea}>
          {!user ? (
            <LoginScreen onLoginSuccess={handleLogin} />
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.screenContent}>
                {renderActiveScreen()}
              </View>

              {/* Bottom Tab Bar */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'radar' && styles.tabItemActive]}
                  onPress={() => {
                    setActiveTab('radar');
                    setActiveChatId(null);
                  }}
                >
                  <Compass size={22} color={activeTab === 'radar' ? COLORS.accentNeon : COLORS.textSecondary} />
                  <Text style={[styles.tabLabel, activeTab === 'radar' && styles.tabLabelActive]}>Radar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'connections' && styles.tabItemActive]}
                  onPress={() => {
                    setActiveTab('connections');
                    setActiveChatId(null);
                  }}
                >
                  <Users size={22} color={activeTab === 'connections' ? COLORS.accentNeon : COLORS.textSecondary} />
                  <Text style={[styles.tabLabel, activeTab === 'connections' && styles.tabLabelActive]}>Matches</Text>
                  {matches.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{matches.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'chat' && styles.tabItemActive]}
                  onPress={() => setActiveTab('chat')}
                >
                  <MessageSquare size={22} color={activeTab === 'chat' ? COLORS.accentNeon : COLORS.textSecondary} />
                  <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
                  onPress={() => {
                    setActiveTab('profile');
                    setActiveChatId(null);
                  }}
                >
                  <User size={22} color={activeTab === 'profile' ? COLORS.accentNeon : COLORS.textSecondary} />
                  <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* iPhone Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles: any = StyleSheet.create({
  desktopShell: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at top, #111827 0%, #030712 100%)',
    position: 'relative',
  },
  phoneFrame: {
    width: 412,
    height: 840,
    backgroundColor: COLORS.bgDark,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#1e293b',
    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Outfit',
  },
  statusBar: {
    height: 48,
    backgroundColor: COLORS.bgDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    zIndex: 99,
  },
  statusBarTime: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Outfit',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 6,
  },
  screenArea: {
    flex: 1,
    position: 'relative',
  },
  screenContent: {
    flex: 1,
    paddingBottom: 0,
  },
  tabBar: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#0f1424',
    flexDirection: 'row',
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.accentNeon,
    marginTop: -2,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'Outfit',
  },
  tabLabelActive: {
    color: COLORS.accentNeon,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: '25%',
    backgroundColor: COLORS.heart,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#64748b',
    zIndex: 99,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  profileHeader: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
  },
  profileTitle: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 16,
    boxShadow: '0 0 20px rgba(0, 119, 181, 0.4)',
  },
  profileName: {
    fontFamily: 'Outfit',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileHeadline: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accentNeon,
    marginTop: 4,
  },
  profileCompany: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  profileInfoBox: {
    width: '100%',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  infoLabel: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  interestTagText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.accentNeon,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  logoutButtonText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  }
});
