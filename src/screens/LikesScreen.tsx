import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { IncomingLike } from '../types/dating';
import { Heart, X, Star, ArrowLeft, BadgeCheck } from 'lucide-react';

interface LikesScreenProps {
  likes: IncomingLike[];
  profilesById: Record<string, Profile>;
  onLikeBack: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
  onBack: () => void;
}

export default function LikesScreen({
  likes,
  profilesById,
  onLikeBack,
  onPass,
  onBack,
}: LikesScreenProps) {
  const visible = likes.filter((like) => profilesById[like.profileId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Likes you</Text>
          <Text style={styles.subtitle}>
            {visible.length} {visible.length === 1 ? 'person is' : 'people are'}{' '}
            waiting on your move
          </Text>
        </View>
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💫</Text>
          <Text style={styles.emptyTitle}>No new likes yet</Text>
          <Text style={styles.emptyDesc}>
            Keep swiping in Discover — likes from people in your network land
            here first.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {visible.map((like) => {
            const profile = profilesById[like.profileId];
            return (
              <View key={like.profileId} style={styles.card}>
                <View style={styles.photoWrap}>
                  <Image
                    source={{ uri: profile.avatar }}
                    style={styles.photo}
                  />
                  {like.isSuperLike && (
                    <View style={styles.superBadge}>
                      <Star size={11} color="#03121a" />
                      <Text style={styles.superBadgeText}>SUPER</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {profile.name.split(' ')[0]}
                      {profile.age ? `, ${profile.age}` : ''}
                    </Text>
                    {profile.verified && (
                      <BadgeCheck size={14} color={COLORS.accentNeon} />
                    )}
                  </View>
                  <Text style={styles.headline} numberOfLines={1}>
                    {profile.headline}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {profile.distance} km · {profile.connectionDegree}
                    {profile.connectionDegree === 1
                      ? 'st'
                      : profile.connectionDegree === 2
                      ? 'nd'
                      : 'rd'}{' '}
                    degree
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.passBtn]}
                      onPress={() => onPass(profile)}
                      activeOpacity={0.7}
                    >
                      <X size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.likeBtn]}
                      onPress={() => onLikeBack(profile)}
                      activeOpacity={0.7}
                    >
                      <Heart size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    cursor: 'pointer',
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
  },
  card: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  photoWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  superBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentNeon,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  superBadgeText: {
    fontFamily: 'Outfit',
    fontSize: 8,
    fontWeight: '800',
    color: '#03121a',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  headline: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontFamily: 'Outfit',
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    cursor: 'pointer',
  },
  passBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: COLORS.border,
    marginRight: 6,
  },
  likeBtn: {
    backgroundColor: COLORS.heart,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
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
