import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { SwipeDirection } from '../types/dating';
import SwipeDeck from '../components/SwipeDeck';
import { SlidersHorizontal, Flame } from 'lucide-react';

interface DiscoverScreenProps {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
  onReport: (profile: Profile) => void;
  onOpenFilters: () => void;
}

export default function DiscoverScreen({
  profiles,
  onSwipe,
  onUndo,
  canUndo,
  onReport,
  onOpenFilters,
}: DiscoverScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Discover</Text>
          <View style={styles.countRow}>
            <Flame size={13} color={COLORS.heart} style={{ marginRight: 5 }} />
            <Text style={styles.subtitle}>
              {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}{' '}
              match your filters
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={onOpenFilters}
          activeOpacity={0.75}
        >
          <SlidersHorizontal size={18} color={COLORS.accentNeon} />
        </TouchableOpacity>
      </View>

      <View style={styles.deckArea}>
        <SwipeDeck
          profiles={profiles}
          onSwipe={onSwipe}
          onUndo={onUndo}
          canUndo={canUndo}
          onReport={onReport}
        />
      </View>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
});
