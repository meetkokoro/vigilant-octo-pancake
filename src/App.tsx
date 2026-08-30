import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from './styles/theme';
import {
  Compass,
  MessageSquare,
  Users,
  User,
  Wifi,
  Battery,
  Signal,
  Flame,
} from 'lucide-react';
import LoginScreen from './screens/LoginScreen';
import RadarScreen from './screens/RadarScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LikesScreen from './screens/LikesScreen';
import SettingsScreen from './screens/SettingsScreen';
import MatchModal from './components/MatchModal';
import SafetySheet from './components/SafetySheet';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Profile,
  CURRENT_USER,
  MOCK_PROFILES,
  MOCK_INCOMING_LIKES,
} from './utils/mockData';
import {
  DatingPreferences,
  DEFAULT_PREFERENCES,
  IncomingLike,
  ReportReason,
  SwipeDirection,
} from './types/dating';
import {
  fetchDiscoveryFeed,
  filterProfilesLocally,
  fetchPreferences,
  savePreferences,
  deleteMyAccount,
} from './services/profileService';
import {
  recordSwipe,
  undoLastSwipe,
  fetchIncomingLikes,
  blockUser,
  unblockUser,
  fetchBlockedIds,
  reportUser,
} from './services/matchService';
import confetti from 'canvas-confetti';

type TabType = 'radar' | 'discover' | 'connections' | 'chat' | 'profile';
type Overlay = 'none' | 'likes' | 'settings';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const TABS: { key: TabType; label: string; icon: React.ComponentType<any> }[] =
  [
    { key: 'radar', label: 'Radar', icon: Compass },
    { key: 'discover', label: 'Discover', icon: Flame },
    { key: 'connections', label: 'Matches', icon: Users },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
    { key: 'profile', label: 'Profile', icon: User },
  ];

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LinkRadar() {
  const {
    profile,
    user,
    loading,
    demoMode,
    needsOnboarding,
    signInAsDemoUser,
    signOut,
    saveProfile,
    completeOnboarding,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [overlay, setOverlay] = useState<Overlay>('none');

  const [likes, setLikes] = useState<string[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>(['1']);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [incomingLikes, setIncomingLikes] =
    useState<IncomingLike[]>(MOCK_INCOMING_LIKES);

  const [preferences, setPreferences] =
    useState<DatingPreferences>(DEFAULT_PREFERENCES);
  const [feed, setFeed] = useState<Profile[]>(MOCK_PROFILES);

  const [chatProfiles, setChatProfiles] = useState<Profile[]>(
    MOCK_PROFILES.filter((p) => p.id === '1')
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    '1': [
      {
        id: 'm1',
        senderId: '1',
        text: "Hey! Nice to connect. Always looking for new coffee spots in SoMa. What's your current go-to?",
        timestamp: '10:34 AM',
      },
      {
        id: 'm2',
        senderId: 'currentUser',
        text: 'Hey Elena! Definitely "Sextant Coffee Roasters" on Folsom. They roast their own beans and have a great patio.',
        timestamp: '10:37 AM',
      },
      {
        id: 'm3',
        senderId: '1',
        text: "Oh, I love Sextant! Their Ethiopian pour-over is amazing. Let's grab coffee there this week!",
        timestamp: '10:39 AM',
      },
    ],
  });

  const [matchModalProfile, setMatchModalProfile] = useState<Profile | null>(
    null
  );
  const [safetyProfile, setSafetyProfile] = useState<Profile | null>(null);

  const profilesById = useMemo(() => {
    const map: Record<string, Profile> = {};
    [...MOCK_PROFILES, ...feed, ...chatProfiles].forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [feed, chatProfiles]);

  // Server-side state is only meaningful once a real Supabase session exists.
  useEffect(() => {
    if (demoMode || !user) return;
    let alive = true;

    Promise.all([
      fetchPreferences(user.id),
      fetchBlockedIds(),
      fetchIncomingLikes(),
    ]).then(([prefs, blocked, incoming]) => {
      if (!alive) return;
      setPreferences(prefs);
      setBlockedIds(blocked);
      setIncomingLikes(incoming);
    });

    return () => {
      alive = false;
    };
  }, [demoMode, user]);

  useEffect(() => {
    if (demoMode) {
      setFeed(MOCK_PROFILES);
      return;
    }
    let alive = true;
    fetchDiscoveryFeed(preferences).then((rows) => {
      if (alive) setFeed(rows);
    });
    return () => {
      alive = false;
    };
  }, [demoMode, preferences]);

  const deckProfiles = useMemo(() => {
    const seen = new Set([...likes, ...passes, ...blockedIds]);
    const base = demoMode ? filterProfilesLocally(feed, preferences) : feed;
    return base.filter((p) => !seen.has(p.id));
  }, [feed, preferences, likes, passes, blockedIds, demoMode]);

  const visibleIncomingLikes = useMemo(
    () => incomingLikes.filter((like) => !blockedIds.includes(like.profileId)),
    [incomingLikes, blockedIds]
  );

  const registerMatch = useCallback((target: Profile) => {
    setMatches((prev) =>
      prev.includes(target.id) ? prev : [...prev, target.id]
    );
    setChatProfiles((prev) =>
      prev.some((p) => p.id === target.id) ? prev : [target, ...prev]
    );
    setMessages((prev) =>
      prev[target.id]
        ? prev
        : {
            ...prev,
            [target.id]: [
              {
                id: `init-${target.id}`,
                senderId: target.id,
                text: target.icebreaker,
                timestamp: nowLabel(),
              },
            ],
          }
    );
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setMatchModalProfile(target);
  }, []);

  const handleSwipe = useCallback(
    async (target: Profile, direction: SwipeDirection) => {
      setSwipeHistory((prev) => [...prev, target.id]);
      setIncomingLikes((prev) =>
        prev.filter((like) => like.profileId !== target.id)
      );

      if (direction === 'pass') {
        setPasses((prev) =>
          prev.includes(target.id) ? prev : [...prev, target.id]
        );
        return;
      }

      setLikes((prev) =>
        prev.includes(target.id) ? prev : [...prev, target.id]
      );

      const likedBack = visibleIncomingLikes.some(
        (like) => like.profileId === target.id
      );
      const isMatch = demoMode
        ? direction === 'super' || likedBack || target.connectionDegree <= 2
        : (await recordSwipe(target.id, direction)).isMatch;

      if (isMatch) {
        registerMatch(target);
      } else {
        showToast(`Request sent to ${target.name.split(' ')[0]}`, 'info');
      }
    },
    [demoMode, visibleIncomingLikes, registerMatch, showToast]
  );

  const handleUndo = useCallback(async () => {
    const lastId = swipeHistory[swipeHistory.length - 1];
    if (!lastId) return;
    setSwipeHistory((prev) => prev.slice(0, -1));
    setLikes((prev) => prev.filter((id) => id !== lastId));
    setPasses((prev) => prev.filter((id) => id !== lastId));
    if (!demoMode) await undoLastSwipe();
  }, [swipeHistory, demoMode]);

  const handleReport = useCallback(
    async (target: Profile, reason: ReportReason, details: string) => {
      setSafetyProfile(null);
      if (!demoMode) await reportUser(target.id, reason, details);
      showToast('Report sent to our safety team. Thank you.', 'success');
    },
    [demoMode, showToast]
  );

  const handleBlock = useCallback(
    async (target: Profile) => {
      setSafetyProfile(null);
      setBlockedIds((prev) =>
        prev.includes(target.id) ? prev : [...prev, target.id]
      );
      setMatches((prev) => prev.filter((id) => id !== target.id));
      setChatProfiles((prev) => prev.filter((p) => p.id !== target.id));
      setIncomingLikes((prev) =>
        prev.filter((like) => like.profileId !== target.id)
      );
      setMessages((prev) => {
        const next = { ...prev };
        delete next[target.id];
        return next;
      });
      setActiveChatId((prev) => (prev === target.id ? null : prev));
      if (!demoMode) await blockUser(target.id);
      showToast(`${target.name.split(' ')[0]} has been blocked.`, 'success');
    },
    [demoMode, showToast]
  );

  const handleUnblock = useCallback(
    async (profileId: string) => {
      setBlockedIds((prev) => prev.filter((id) => id !== profileId));
      if (!demoMode) await unblockUser(profileId);
      showToast('Unblocked. They can appear on your radar again.', 'info');
    },
    [demoMode, showToast]
  );

  const handlePreferencesChange = useCallback(
    (next: DatingPreferences) => {
      setPreferences(next);
      if (!demoMode && user) void savePreferences(user.id, next);
    },
    [demoMode, user]
  );

  const handleDeleteAccount = useCallback(async () => {
    if (await deleteMyAccount()) {
      await signOut();
      setOverlay('none');
      showToast('Your account and data have been deleted.', 'success');
    } else {
      showToast('Could not delete the account. Please try again.', 'error');
    }
  }, [signOut, showToast]);

  const sendMessage = useCallback((profileId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => ({
      ...prev,
      [profileId]: [
        ...(prev[profileId] || []),
        {
          id: Math.random().toString(36).slice(2),
          senderId: 'currentUser',
          text: trimmed,
          timestamp: nowLabel(),
        },
      ],
    }));

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [profileId]: [
          ...(prev[profileId] || []),
          {
            id: Math.random().toString(36).slice(2),
            senderId: profileId,
            text: "That sounds interesting! Let's talk more details. What days work best for you?",
            timestamp: nowLabel(),
          },
        ],
      }));
    }, 2000);
  }, []);

  const openChatWith = useCallback((profileId: string) => {
    setActiveChatId(profileId);
    setActiveTab('chat');
    setOverlay('none');
  }, []);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.accentNeon} />
        <Text style={styles.splashText}>Restoring your session…</Text>
      </View>
    );
  }

  if (!profile) {
    return <LoginScreen onLoginSuccess={signInAsDemoUser} />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen seed={profile} onComplete={completeOnboarding} />;
  }

  if (overlay === 'likes') {
    return (
      <LikesScreen
        likes={visibleIncomingLikes}
        profilesById={profilesById}
        onLikeBack={(target) => {
          setOverlay('none');
          void handleSwipe(target, 'like');
        }}
        onPass={(target) => void handleSwipe(target, 'pass')}
        onBack={() => setOverlay('none')}
      />
    );
  }

  if (overlay === 'settings') {
    return (
      <SettingsScreen
        preferences={preferences}
        onChange={handlePreferencesChange}
        blockedProfiles={blockedIds
          .map((id) => profilesById[id])
          .filter(Boolean)}
        onUnblock={handleUnblock}
        onSignOut={() => {
          setOverlay('none');
          setActiveTab('radar');
          void signOut();
        }}
        onDeleteAccount={() => void handleDeleteAccount()}
        onBack={() => setOverlay('none')}
        authSummary={
          demoMode
            ? 'Demo mode — no Supabase project connected.'
            : `Signed in with ${user?.app_metadata?.provider ?? 'OAuth'} as ${
                user?.email ?? profile.name
              }.`
        }
      />
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'radar':
        return (
          <RadarScreen
            onLike={(target) => void handleSwipe(target, 'like')}
            likedIds={likes}
            matchesIds={matches}
          />
        );
      case 'discover':
        return (
          <DiscoverScreen
            profiles={deckProfiles}
            onSwipe={(target, direction) => void handleSwipe(target, direction)}
            onUndo={() => void handleUndo()}
            canUndo={swipeHistory.length > 0}
            onReport={setSafetyProfile}
            onOpenFilters={() => setOverlay('settings')}
          />
        );
      case 'connections':
        return (
          <ConnectionsScreen
            matches={matches.map((id) => profilesById[id]).filter(Boolean)}
            onChatPress={openChatWith}
            likesCount={visibleIncomingLikes.length}
            onOpenLikes={() => setOverlay('likes')}
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
          <ProfileScreen
            profile={profile}
            onSave={(patch) => void saveProfile(patch)}
            onOpenSettings={() => setOverlay('settings')}
            verifiedProvider={profile.verified ? 'LinkedIn' : null}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.screenContent}>{renderActiveScreen()}</View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const badgeCount =
            tab.key === 'connections'
              ? matches.length + visibleIncomingLikes.length
              : 0;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => {
                setActiveTab(tab.key);
                if (tab.key !== 'chat') setActiveChatId(null);
              }}
            >
              <Icon
                size={20}
                color={isActive ? COLORS.accentNeon : COLORS.textSecondary}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <MatchModal
        visible={matchModalProfile !== null}
        match={matchModalProfile}
        currentUserAvatar={profile.avatar || CURRENT_USER.avatar}
        onSendMessage={() => {
          const target = matchModalProfile;
          setMatchModalProfile(null);
          if (target) openChatWith(target.id);
        }}
        onKeepSwiping={() => setMatchModalProfile(null)}
      />

      <SafetySheet
        visible={safetyProfile !== null}
        profile={safetyProfile}
        onClose={() => setSafetyProfile(null)}
        onReport={(target, reason, details) =>
          void handleReport(target, reason, details)
        }
        onBlock={(target) => void handleBlock(target)}
      />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.desktopShell}>
        {/* Sleek Mobile Frame */}
        <View style={styles.phoneFrame}>
          <View style={styles.statusBar}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.statusBarIcons}>
              <Signal size={14} color="#ffffff" style={styles.statusIcon} />
              <Wifi size={14} color="#ffffff" style={styles.statusIcon} />
              <Battery size={16} color="#ffffff" style={styles.statusIcon} />
            </View>
          </View>

          <View style={styles.screenArea}>
            <ToastProvider>
              <LinkRadar />
            </ToastProvider>
          </View>

          {/* iPhone Home Indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </AuthProvider>
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
    boxShadow:
      '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.1)',
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
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },
  splashText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 14,
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
    cursor: 'pointer',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.accentNeon,
    marginTop: -2,
  },
  tabLabel: {
    fontSize: 10,
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
    top: 8,
    right: '18%',
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
});
