import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { COLORS, Profile } from '@linkradar/shared';
import { X, Heart, MessageSquare, Linkedin, Landmark, MapPin } from 'lucide-react';

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
  isAlreadyMatched
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      {/* Top Banner showing connection level */}
      <View style={[
        styles.degreeBanner, 
        profile.connectionDegree === 1 ? styles.degreeBanner1 : styles.degreeBannerOther
      ]}>
        <Linkedin size={12} color="#ffffff" style={{ marginRight: 5 }} />
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
              <Landmark size={14} color={COLORS.accentNeon} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{profile.company}</Text>
              
              <Text style={styles.metaDot}>•</Text>
              
              <MapPin size={14} color={COLORS.heart} style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{profile.distance} km ({profile.localityName})</Text>
            </View>
          </View>
        </View>

        {/* Mutual Connections Box */}
        {profile.commonConnections.length > 0 && (
          <View style={styles.mutualBox}>
            <Text style={styles.mutualLabel}>Mutual Connections:</Text>
            <Text style={styles.mutualNames}>
              {profile.commonConnections.join(', ')}
            </Text>
          </View>
        )}

        {/* Bio */}
        <Text style={styles.bio}>{profile.bio}</Text>

        {/* Interests */}
        <View style={styles.interestsRow}>
          {profile.interests.map(interest => (
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
              <TouchableOpacity
                onPress={onPass}
                style={[styles.actionBtn, styles.passBtn]}
                activeOpacity={0.7}
              >
                <X size={20} color={COLORS.textSecondary} />
                <Text style={styles.passBtnText}>Pass</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onLike}
                style={[styles.actionBtn, styles.connectBtn]}
                activeOpacity={0.7}
              >
                <Heart size={20} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.connectBtnText}>Connect</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles: any = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
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
    fontFamily: 'Outfit',
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
    fontFamily: 'Outfit',
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headline: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentNeon,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontFamily: 'Outfit',
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
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mutualNames: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bio: {
    fontFamily: 'Outfit',
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
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  intentLabel: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  intentValue: {
    fontFamily: 'Outfit',
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
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  passBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passBtnText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  connectBtn: {
    backgroundColor: COLORS.heart,
    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
  },
  connectBtnText: {
    fontFamily: 'Outfit',
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
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentNeon,
  },
  matchedStatusSubtext: {
    fontFamily: 'Outfit',
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
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.warning,
  },
  likedStatusSubtext: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  }
});
