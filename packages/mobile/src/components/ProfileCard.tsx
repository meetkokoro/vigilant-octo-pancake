import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Profile } from '@linkradar/shared';

interface ProfileCardProps {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  isAlreadyLiked: boolean;
  isAlreadyMatched: boolean;
}

export default function ProfileCard({
  profile,
  onLike,
  onPass,
  isAlreadyLiked,
  isAlreadyMatched,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      {/* Top Banner showing connection level */}
      <View
        style={[
          styles.degreeBanner,
          profile.connectionDegree === 1 ? styles.degreeBanner1 : styles.degreeBannerOther,
        ]}
      >
        <Ionicons name="logo-linkedin" size={12} color="#ffffff" style={{ marginRight: 5 }} />
        <Text style={styles.degreeBannerText}>
          {profile.connectionDegree === 1
            ? '1st Degree Connection on LinkedIn'
            : `${profile.connectionDegree}nd Degree Connection`}
        </Text>
      </View>

      <View style={styles.bodyContent}>
        {/* Profile Info Header */}
        <View style={styles.row}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />

          <View style={styles.headerText}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.headline}>{profile.headline}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="business-outline" size={14} color={COLORS.accentNeon} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{profile.company}</Text>

              <Text style={styles.metaDot}>•</Text>

              <Ionicons name="location-outline" size={14} color={COLORS.heart} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>
                {profile.distance} km ({profile.localityName})
              </Text>
            </View>
          </View>
        </View>

        {/* Mutual Connections Box */}
        {profile.commonConnections.length > 0 && (
          <View style={styles.mutualBox}>
            <Text style={styles.mutualLabel}>Mutual Connections:</Text>
            <Text style={styles.mutualNames}>{profile.commonConnections.join(', ')}</Text>
          </View>
        )}

        {/* Bio */}
        <Text style={styles.bio}>{profile.bio}</Text>

        {/* Interests */}
        <View style={styles.interestsRow}>
          {profile.interests.map((interest) => (
            <View key={interest} style={styles.interestTag}>
              <Text style={styles.interestTagText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Intent Badge */}
        <View style={styles.intentBadge}>
          <Text style={styles.intentLabel}>Intent: </Text>
          <Text style={styles.intentValue}>{profile.datingIntent}</Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.actionRow}>
          {isAlreadyMatched ? (
            <View style={styles.matchedStatusContainer}>
              <Text style={styles.matchedStatusText}>🎉 Linked Match!</Text>
              <Text style={styles.matchedStatusSubtext}>You are connected. Send a message in Chat.</Text>
            </View>
          ) : isAlreadyLiked ? (
            <View style={styles.likedStatusContainer}>
              <Text style={styles.likedStatusText}>Pending Response...</Text>
              <Text style={styles.likedStatusSubtext}>Connection request sent via LinkedIn SSO</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={onPass} style={[styles.actionBtn, styles.passBtn]} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                <Text style={styles.passBtnText}>Pass</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onLike} style={[styles.actionBtn, styles.connectBtn]} activeOpacity={0.7}>
                <Ionicons name="heart" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  degreeBanner: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  degreeBanner1: {
    backgroundColor: COLORS.primary,
  },
  degreeBannerOther: {
    backgroundColor: '#334155',
  },
  degreeBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyContent: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headline: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentNeon,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaDot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
    fontSize: 12,
  },
  mutualBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  mutualLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mutualNames: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bio: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  interestTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  intentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  intentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  passBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  connectBtn: {
    backgroundColor: COLORS.heart,
    shadowColor: COLORS.heart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  connectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  matchedStatusContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  matchedStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentNeon,
  },
  matchedStatusSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  likedStatusContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  likedStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.warning,
  },
  likedStatusSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
