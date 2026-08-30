import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import {
  MessageSquare,
  Landmark,
  MapPin,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react';

interface ConnectionsScreenProps {
  matches: Profile[];
  onChatPress: (profileId: string) => void;
  likesCount?: number;
  onOpenLikes?: () => void;
}

export default function ConnectionsScreen({
  matches,
  onChatPress,
  likesCount = 0,
  onOpenLikes,
}: ConnectionsScreenProps) {
  const renderItem = ({ item }: { item: Profile }) => {
    return (
      <View style={styles.matchCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.headline}>{item.headline}</Text>

            <View style={styles.companyRow}>
              <Landmark
                size={12}
                color={COLORS.accentNeon}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.companyText}>{item.company}</Text>
              <Text style={styles.dot}>•</Text>
              <MapPin
                size={12}
                color={COLORS.heart}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.companyText}>{item.localityName}</Text>
            </View>
          </View>
        </View>

        {/* Highlight overlapping connection reason */}
        <View style={styles.overlapBanner}>
          <Sparkles
            size={12}
            color={COLORS.accentNeon}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.overlapText}>
            {item.company === 'Google'
              ? 'Shared corporate network (Google SF)'
              : `Connected via LinkedIn (${item.connectionDegree}nd Degree)`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => onChatPress(item.id)}
          activeOpacity={0.7}
        >
          <MessageSquare size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.chatBtnText}>Open Chat</Text>
          <ArrowRight
            size={14}
            color="#ffffff"
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Linked Matches</Text>
        <Text style={styles.subtitle}>
          Mutual connections from LinkedIn SSO & Proximity Radar
        </Text>
      </View>

      {onOpenLikes && (
        <TouchableOpacity
          style={styles.likesBanner}
          onPress={onOpenLikes}
          activeOpacity={0.75}
        >
          <View style={styles.likesIcon}>
            <Heart size={16} color={COLORS.heart} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.likesTitle}>
              {likesCount > 0 ? `${likesCount} people like you` : 'Likes you'}
            </Text>
            <Text style={styles.likesSubtitle}>
              {likesCount > 0
                ? 'Like them back to start chatting'
                : 'New likes from your network land here'}
            </Text>
          </View>
          <ArrowRight size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyTitle}>Scanning for Matches</Text>
          <Text style={styles.emptyDesc}>
            No active connections found. Toggle back to the Radar screen and
            send connection requests to colleagues in your locality.
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item: Profile) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  likesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)',
    backgroundColor: 'rgba(236,72,153,0.07)',
    cursor: 'pointer',
  },
  likesIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(236,72,153,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  likesTitle: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  likesSubtitle: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  matchCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headline: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.accentNeon,
    marginTop: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  companyText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
    fontSize: 11,
  },
  overlapBanner: {
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overlapText: {
    fontFamily: 'Outfit',
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.accentNeon,
  },
  chatBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  chatBtnText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
