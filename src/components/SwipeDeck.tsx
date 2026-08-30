import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { SwipeDirection } from '../types/dating';
import PhotoCarousel from './PhotoCarousel';
import {
  X,
  Heart,
  Star,
  RotateCcw,
  Flag,
  BadgeCheck,
  MapPin,
  Landmark,
  Users,
} from 'lucide-react';

const SWIPE_THRESHOLD = 110;
const CARD_HEIGHT = 470;

interface SwipeDeckProps {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: SwipeDirection) => void;
  onUndo: () => void;
  canUndo: boolean;
  onReport: (profile: Profile) => void;
  onEmpty?: React.ReactNode;
}

export default function SwipeDeck({
  profiles,
  onSwipe,
  onUndo,
  canUndo,
  onReport,
  onEmpty,
}: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [profiles, position]);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => {
      const profile = profiles[indexRef.current];
      if (!profile) return;
      onSwipe(profile, direction);
      position.setValue({ x: 0, y: 0 });
      setIndex((prev) => prev + 1);
    },
    [profiles, onSwipe, position]
  );

  const animateOut = useCallback(
    (direction: SwipeDirection) => {
      const toX = direction === 'pass' ? -600 : 600;
      const toY = direction === 'super' ? -600 : 0;
      Animated.timing(position, {
        toValue: { x: direction === 'super' ? 0 : toX, y: toY },
        duration: 220,
        useNativeDriver: false,
      }).start(() => finishSwipe(direction));
    },
    [position, finishSwipe]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_evt, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy < -SWIPE_THRESHOLD && Math.abs(gesture.dx) < 80) {
          animateOut('super');
        } else if (gesture.dx > SWIPE_THRESHOLD) {
          animateOut('like');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateOut('pass');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleUndo = () => {
    if (!canUndo || index === 0) return;
    onUndo();
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const current = profiles[index];
  const next = profiles[index + 1];

  if (!current) {
    return (
      <View style={styles.emptyWrapper}>
        {onEmpty ?? <DefaultEmptyState />}
      </View>
    );
  }

  const rotate = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-16deg', '0deg', '16deg'],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [30, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const superOpacity = position.y.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.deck}>
        {next && (
          <View style={[styles.card, styles.cardBehind]} pointerEvents="none">
            <CardContent profile={next} onReport={onReport} />
          </View>
        )}

        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
          >
            <Text style={[styles.stampText, { color: COLORS.success }]}>
              CONNECT
            </Text>
          </Animated.View>
          <Animated.View
            style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}
          >
            <Text style={[styles.stampText, { color: COLORS.textSecondary }]}>
              PASS
            </Text>
          </Animated.View>
          <Animated.View
            style={[styles.stamp, styles.stampSuper, { opacity: superOpacity }]}
          >
            <Text style={[styles.stampText, { color: COLORS.accentNeon }]}>
              SUPER
            </Text>
          </Animated.View>

          <CardContent profile={current} onReport={onReport} />
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.undoBtn,
            (!canUndo || index === 0) && styles.actionDisabled,
          ]}
          onPress={handleUndo}
          disabled={!canUndo || index === 0}
          activeOpacity={0.7}
        >
          <RotateCcw size={18} color={COLORS.warning} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => animateOut('pass')}
          activeOpacity={0.7}
        >
          <X size={26} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.superBtn]}
          onPress={() => animateOut('super')}
          activeOpacity={0.7}
        >
          <Star size={20} color={COLORS.accentNeon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => animateOut('like')}
          activeOpacity={0.7}
        >
          <Heart size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Drag the card · left to pass, right to connect, up to super-like
      </Text>
    </View>
  );
}

function CardContent({
  profile,
  onReport,
}: {
  profile: Profile;
  onReport: (profile: Profile) => void;
}) {
  const photos =
    profile.photos && profile.photos.length > 0
      ? profile.photos
      : [profile.avatar];

  return (
    <View style={styles.cardInner}>
      <PhotoCarousel photos={photos} height={260} />

      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => onReport(profile)}
        activeOpacity={0.7}
        accessibilityLabel={`Report or block ${profile.name}`}
      >
        <Flag size={14} color="#ffffff" />
      </TouchableOpacity>

      <ScrollView
        style={styles.details}
        contentContainerStyle={styles.detailsContent}
      >
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {profile.name}
            {profile.age ? (
              <Text style={styles.age}>, {profile.age}</Text>
            ) : null}
          </Text>
          {profile.verified && (
            <BadgeCheck size={18} color={COLORS.accentNeon} />
          )}
        </View>

        <Text style={styles.headline}>{profile.headline}</Text>

        <View style={styles.metaRow}>
          <Landmark
            size={13}
            color={COLORS.accentNeon}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.metaText}>{profile.company}</Text>
          <Text style={styles.metaDot}>•</Text>
          <MapPin size={13} color={COLORS.heart} style={{ marginRight: 4 }} />
          <Text style={styles.metaText}>
            {profile.distance} km · {profile.localityName}
          </Text>
        </View>

        {profile.commonConnections.length > 0 && (
          <View style={styles.mutualRow}>
            <Users
              size={13}
              color={COLORS.primaryLight}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.mutualText}>
              {profile.commonConnections.length} mutual ·{' '}
              {profile.commonConnections[0]}
            </Text>
          </View>
        )}

        <Text style={styles.bio} numberOfLines={3}>
          {profile.bio}
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.intentTag}>
            <Text style={styles.intentTagText}>{profile.datingIntent}</Text>
          </View>
          {profile.interests.slice(0, 3).map((interest) => (
            <View key={interest} style={styles.interestTag}>
              <Text style={styles.interestTagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function DefaultEmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>🛰️</Text>
      <Text style={styles.emptyTitle}>You're all caught up</Text>
      <Text style={styles.emptyDesc}>
        No more profiles match your filters right now. Widen your distance or
        intent filters in Settings, or check back after the next radar sweep.
      </Text>
    </View>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  deck: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
    cursor: 'grab',
    userSelect: 'none',
  },
  cardBehind: {
    transform: [{ scale: 0.95 }, { translateY: 12 }],
    opacity: 0.6,
  },
  cardInner: {
    flex: 1,
  },
  reportBtn: {
    position: 'absolute',
    top: 26,
    left: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
    cursor: 'pointer',
  },
  details: {
    flex: 1,
  },
  detailsContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: 'Outfit',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  age: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  headline: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaDot: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
  },
  mutualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  mutualText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  bio: {
    fontFamily: 'Outfit',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  intentTag: {
    backgroundColor: 'rgba(236,72,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  intentTagText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.heart,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  interestTagText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  stamp: {
    position: 'absolute',
    top: 90,
    zIndex: 10,
    borderWidth: 3,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  stampLike: {
    left: 20,
    borderColor: COLORS.success,
    transform: [{ rotate: '-14deg' }],
  },
  stampPass: {
    right: 20,
    borderColor: COLORS.textSecondary,
    transform: [{ rotate: '14deg' }],
  },
  stampSuper: {
    alignSelf: 'center',
    left: '30%',
    borderColor: COLORS.accentNeon,
  },
  stampText: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    marginHorizontal: 8,
    borderWidth: 1,
    cursor: 'pointer',
  },
  undoBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  passBtn: {
    width: 58,
    height: 58,
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
  },
  superBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderColor: 'rgba(6,182,212,0.35)',
  },
  likeBtn: {
    width: 58,
    height: 58,
    backgroundColor: COLORS.heart,
    borderColor: 'rgba(255,255,255,0.15)',
    boxShadow: '0 6px 20px rgba(236,72,153,0.35)',
  },
  actionDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  hint: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 14,
    textAlign: 'center',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  emptyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: 'Outfit',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
