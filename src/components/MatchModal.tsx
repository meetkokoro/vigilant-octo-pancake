import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { MessageSquare, Compass, Linkedin } from 'lucide-react';

interface MatchModalProps {
  visible: boolean;
  match: Profile | null;
  currentUserAvatar: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export default function MatchModal({
  visible,
  match,
  currentUserAvatar,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  if (!match) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeepSwiping}
    >
      <View style={styles.overlay}>
        <View style={styles.glow} />

        <Text style={styles.eyebrow}>It's a Match</Text>
        <Text style={styles.title}>
          You and {match.name.split(' ')[0]} connected
        </Text>

        <View style={styles.avatarRow}>
          <Image
            source={{ uri: currentUserAvatar }}
            style={[styles.avatar, styles.avatarLeft]}
          />
          <View style={styles.heartBubble}>
            <Text style={styles.heartEmoji}>💗</Text>
          </View>
          <Image
            source={{ uri: match.avatar }}
            style={[styles.avatar, styles.avatarRight]}
          />
        </View>

        <View style={styles.reasonPill}>
          <Linkedin
            size={12}
            color={COLORS.primaryLight}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.reasonText}>
            {match.connectionDegree === 1
              ? '1st degree connection'
              : `${match.connectionDegree}nd degree`}{' '}
            · {match.distance} km away
          </Text>
        </View>

        <Text style={styles.icebreakerLabel}>Suggested icebreaker</Text>
        <View style={styles.icebreakerBox}>
          <Text style={styles.icebreakerText}>{match.icebreaker}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onSendMessage}
          activeOpacity={0.85}
        >
          <MessageSquare size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Send a message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onKeepSwiping}
          activeOpacity={0.7}
        >
          <Compass
            size={16}
            color={COLORS.textSecondary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.secondaryBtnText}>Keep scanning</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles: any = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.heart,
    opacity: 0.18,
    filter: 'blur(90px)',
  },
  eyebrow: {
    fontFamily: 'Outfit',
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.heart,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.heart,
  },
  avatarLeft: {
    marginRight: -18,
    transform: [{ rotate: '-6deg' }],
  },
  avatarRight: {
    marginLeft: -18,
    borderColor: COLORS.accentNeon,
    transform: [{ rotate: '6deg' }],
  },
  heartBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1b223c',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  heartEmoji: {
    fontSize: 20,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reasonText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  icebreakerLabel: {
    fontFamily: 'Outfit',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginTop: 22,
    marginBottom: 8,
  },
  icebreakerBox: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    width: '100%',
  },
  icebreakerText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 22,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.heart,
    boxShadow: '0 6px 22px rgba(236, 72, 153, 0.35)',
    cursor: 'pointer',
  },
  primaryBtnText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    cursor: 'pointer',
  },
  secondaryBtnText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
