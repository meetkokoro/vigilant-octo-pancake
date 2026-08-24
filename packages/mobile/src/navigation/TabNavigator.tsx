import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@linkradar/shared';
import type { Profile, ChatMessage } from '@linkradar/shared';

import RadarScreen from '../screens/RadarScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  Radar: undefined;
  Matches: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  onLike: (profile: Profile) => void;
  likedIds: string[];
  matchesIds: string[];
  matchedProfiles: Profile[];
  chatProfiles: Profile[];
  messages: Record<string, ChatMessage[]>;
  activeChatId: string | null;
  onSelectChat: (id: string | null) => void;
  onSendMessage: (profileId: string, text: string) => void;
  onBack: () => void;
  onLogout: () => void;
}

export default function TabNavigator({
  onLike,
  likedIds,
  matchesIds,
  matchedProfiles,
  chatProfiles,
  messages,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onBack,
  onLogout,
}: TabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Radar':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Matches':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accentNeon,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: '#0f1424',
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen name="Radar">
        {() => (
          <RadarScreen
            onLike={onLike}
            likedIds={likedIds}
            matchesIds={matchesIds}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Matches"
        options={{
          tabBarBadge: matchesIds.length > 0 ? matchesIds.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.heart,
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      >
        {() => (
          <ConnectionsScreen
            matches={matchedProfiles}
            onChatPress={(profileId) => {
              onSelectChat(profileId);
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Chat">
        {() => (
          <ChatScreen
            chatProfiles={chatProfiles}
            messages={messages}
            activeChatId={activeChatId}
            onSelectChat={onSelectChat}
            onSendMessage={onSendMessage}
            onBack={onBack}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
