import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { COLORS, Profile, MOCK_PROFILES, CURRENT_USER } from '@linkradar/shared';
import RadarView from '../components/RadarView';
import ProfileCard from '../components/ProfileCard';
import { Building2, Compass } from 'lucide-react';

interface RadarScreenProps {
  onLike: (profile: Profile) => void;
  likedIds: string[];
  matchesIds: string[];
}

export default function RadarScreen({ onLike, likedIds, matchesIds }: RadarScreenProps) {
  const [mode, setMode] = useState<'locality' | 'corporation'>('corporation');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Filter profiles based on the mode
  // 1. Corporation mode: co-workers (same company) or closely-linked connection degrees (1st & 2nd)
  // 2. Locality mode: all nearby users sorted by proximity (distance)
  const filteredProfiles = mode === 'corporation'
    ? MOCK_PROFILES.filter(p => p.company === CURRENT_USER.company || p.connectionDegree <= 2)
    : [...MOCK_PROFILES].sort((a, b) => a.distance - b.distance);

  const selectedProfile = MOCK_PROFILES.find(p => p.id === selectedProfileId);

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfileId(profile.id);
  };

  const handleCloseCard = () => {
    setSelectedProfileId(null);
  };

  const handleLikePress = (profile: Profile) => {
    onLike(profile);
    handleCloseCard();
  };

  const handlePassPress = () => {
    handleCloseCard();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Radar</Text>
        <Text style={styles.subtitle}>Find connections surrounding you</Text>
      </View>

      {/* Mode Selector Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'corporation' && styles.toggleBtnActive]}
          onPress={() => {
            setMode('corporation');
            setSelectedProfileId(null); // Reset selection when mode changes
          }}
          activeOpacity={0.8}
        >
          <Building2 size={16} color={mode === 'corporation' ? '#ffffff' : COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.toggleText, mode === 'corporation' && styles.toggleTextActive]}>Corporation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'locality' && styles.toggleBtnActive]}
          onPress={() => {
            setMode('locality');
            setSelectedProfileId(null);
          }}
          activeOpacity={0.8}
        >
          <Compass size={16} color={mode === 'locality' ? '#ffffff' : COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.toggleText, mode === 'locality' && styles.toggleTextActive]}>Locality</Text>
        </TouchableOpacity>
      </View>

      {/* Radar Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.radarWrapper}>
          <RadarView
            profiles={filteredProfiles}
            mode={mode}
            onSelectProfile={handleSelectProfile}
            selectedProfileId={selectedProfileId}
          />
        </View>

        {/* Selected Profile Card drawer or landing info */}
        <View style={styles.cardContainer}>
          {selectedProfile ? (
            <ProfileCard
              profile={selectedProfile}
              onLike={() => handleLikePress(selectedProfile)}
              onPass={handlePassPress}
              isAlreadyLiked={likedIds.includes(selectedProfile.id)}
              isAlreadyMatched={matchesIds.includes(selectedProfile.id)}
            />
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderEmoji}>📡</Text>
              <Text style={styles.placeholderTitle}>Radar scanning active</Text>
              <Text style={styles.placeholderDesc}>
                {mode === 'corporation'
                  ? 'Showing professionals in SoMa affiliated with Google, Meta, Stripe, and VC networks.'
                  : 'Showing connections in downtown San Francisco ranked by physical proximity.'}
              </Text>
              <Text style={styles.placeholderInstruction}>Tap any profile on the radar above to explore identity</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0c101c',
    borderRadius: 14,
    marginHorizontal: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    boxShadow: '0 4px 12px rgba(0, 119, 181, 0.25)',
  },
  toggleText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  radarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  placeholderCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  placeholderEmoji: {
    fontSize: 28,
    marginBottom: 8,
    animation: 'pulse 2s infinite',
  },
  placeholderTitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  placeholderDesc: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  placeholderInstruction: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentNeon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
