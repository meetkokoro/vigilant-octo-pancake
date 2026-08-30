import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { DatingPreferences, DATING_INTENTS, Gender } from '../types/dating';
import {
  ArrowLeft,
  Ban,
  LogOut,
  Trash2,
  ShieldCheck,
  EyeOff,
  Undo2,
} from 'lucide-react';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'woman', label: 'Women' },
  { value: 'man', label: 'Men' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Everyone else' },
];

interface SettingsScreenProps {
  preferences: DatingPreferences;
  onChange: (prefs: DatingPreferences) => void;
  blockedProfiles: Profile[];
  onUnblock: (profileId: string) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onBack: () => void;
  authSummary: string;
}

export default function SettingsScreen({
  preferences,
  onChange,
  blockedProfiles,
  onUnblock,
  onSignOut,
  onDeleteAccount,
  onBack,
  authSummary,
}: SettingsScreenProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (next: Partial<DatingPreferences>) =>
    onChange({ ...preferences, ...next });

  const toggleGender = (value: Gender) => {
    const has = preferences.interestedIn.includes(value);
    const next = has
      ? preferences.interestedIn.filter((g) => g !== value)
      : [...preferences.interestedIn, value];
    if (next.length === 0) return; // at least one must stay selected
    patch({ interestedIn: next });
  };

  const toggleIntent = (value: string) => {
    const has = preferences.intents.includes(value);
    patch({
      intents: has
        ? preferences.intents.filter((i) => i !== value)
        : [...preferences.intents, value],
    });
  };

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
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Discovery</Text>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Age range</Text>
            <Text style={styles.value}>
              {preferences.minAge} – {preferences.maxAge}
            </Text>
          </View>
          <input
            type="range"
            min={18}
            max={preferences.maxAge}
            value={preferences.minAge}
            onChange={(e) => patch({ minAge: Number(e.target.value) })}
            style={rangeStyle}
            aria-label="Minimum age"
          />
          <input
            type="range"
            min={preferences.minAge}
            max={80}
            value={preferences.maxAge}
            onChange={(e) => patch({ maxAge: Number(e.target.value) })}
            style={rangeStyle}
            aria-label="Maximum age"
          />

          <View style={[styles.rowBetween, { marginTop: 16 }]}>
            <Text style={styles.label}>Maximum distance</Text>
            <Text style={styles.value}>{preferences.maxDistanceKm} km</Text>
          </View>
          <input
            type="range"
            min={1}
            max={100}
            value={preferences.maxDistanceKm}
            onChange={(e) => patch({ maxDistanceKm: Number(e.target.value) })}
            style={rangeStyle}
            aria-label="Maximum distance in kilometres"
          />

          <View style={[styles.rowBetween, { marginTop: 16 }]}>
            <Text style={styles.label}>Max connection degree</Text>
            <Text style={styles.value}>{preferences.maxConnectionDegree}°</Text>
          </View>
          <View style={styles.segmented}>
            {[1, 2, 3].map((degree) => (
              <TouchableOpacity
                key={degree}
                style={[
                  styles.segment,
                  preferences.maxConnectionDegree === degree &&
                    styles.segmentActive,
                ]}
                onPress={() =>
                  patch({ maxConnectionDegree: degree as 1 | 2 | 3 })
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    preferences.maxConnectionDegree === degree &&
                      styles.segmentTextActive,
                  ]}
                >
                  {degree}
                  {degree === 1 ? 'st' : degree === 2 ? 'nd' : 'rd'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Show me</Text>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  preferences.interestedIn.includes(option.value) &&
                    styles.chipActive,
                ]}
                onPress={() => toggleGender(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferences.interestedIn.includes(option.value) &&
                      styles.chipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Looking for</Text>
          <View style={styles.chipRow}>
            {DATING_INTENTS.map((intent) => (
              <TouchableOpacity
                key={intent}
                style={[
                  styles.chip,
                  preferences.intents.includes(intent) && styles.chipActive,
                ]}
                onPress={() => toggleIntent(intent)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferences.intents.includes(intent) &&
                      styles.chipTextActive,
                  ]}
                >
                  {intent}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Privacy & safety</Text>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <ShieldCheck
              size={18}
              color={COLORS.success}
              style={styles.toggleIcon}
            />
            <View style={styles.toggleText}>
              <Text style={styles.label}>Verified profiles only</Text>
              <Text style={styles.help}>
                Only show people who signed in with LinkedIn.
              </Text>
            </View>
            <Switch
              value={preferences.showVerifiedOnly}
              onValueChange={(v) => patch({ showVerifiedOnly: v })}
              trackColor={{ false: COLORS.border, true: COLORS.accentNeon }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <EyeOff
              size={18}
              color={COLORS.warning}
              style={styles.toggleIcon}
            />
            <View style={styles.toggleText}>
              <Text style={styles.label}>Incognito mode</Text>
              <Text style={styles.help}>
                Hide from the radar. You can still chat with existing matches.
              </Text>
            </View>
            <Switch
              value={preferences.incognito}
              onValueChange={(v) => patch({ incognito: v })}
              trackColor={{ false: COLORS.border, true: COLORS.warning }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowStart}>
              <Ban size={16} color={COLORS.heart} style={{ marginRight: 8 }} />
              <Text style={styles.label}>Blocked people</Text>
            </View>
            <Text style={styles.value}>{blockedProfiles.length}</Text>
          </View>

          {blockedProfiles.length === 0 ? (
            <Text style={[styles.help, { marginTop: 8 }]}>
              You haven't blocked anyone.
            </Text>
          ) : (
            blockedProfiles.map((profile) => (
              <View key={profile.id} style={styles.blockedRow}>
                <Text style={styles.blockedName}>{profile.name}</Text>
                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() => onUnblock(profile.id)}
                  activeOpacity={0.7}
                >
                  <Undo2
                    size={13}
                    color={COLORS.accentNeon}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.unblockText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.card}>
          <Text style={styles.help}>{authSummary}</Text>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <LogOut
              size={16}
              color={COLORS.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>

          {confirmDelete ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                This permanently deletes your profile, matches and messages. It
                cannot be undone.
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={styles.confirmCancel}
                  onPress={() => setConfirmDelete(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmCancelText}>Keep my account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDelete}
                  onPress={onDeleteAccount}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmDeleteText}>Delete forever</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setConfirmDelete(true)}
              activeOpacity={0.8}
            >
              <Trash2
                size={16}
                color={COLORS.heart}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.deleteText}>Delete account</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const rangeStyle: React.CSSProperties = {
  width: '100%',
  accentColor: COLORS.accentNeon,
  marginTop: 8,
  cursor: 'pointer',
};

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
    marginRight: 6,
    cursor: 'pointer',
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  value: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentNeon,
  },
  help: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgDark,
    borderRadius: 10,
    padding: 3,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    cursor: 'pointer',
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    cursor: 'pointer',
  },
  chipActive: {
    borderColor: COLORS.accentNeon,
    backgroundColor: 'rgba(6,182,212,0.12)',
  },
  chipText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    marginRight: 10,
  },
  toggleText: {
    flex: 1,
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  blockedName: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.35)',
    cursor: 'pointer',
  },
  unblockText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentNeon,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    cursor: 'pointer',
  },
  signOutText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.35)',
    cursor: 'pointer',
  },
  deleteText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.heart,
  },
  confirmBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.35)',
    backgroundColor: 'rgba(236,72,153,0.06)',
  },
  confirmText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  confirmActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginRight: 8,
    cursor: 'pointer',
  },
  confirmCancelText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmDelete: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.heart,
    alignItems: 'center',
    cursor: 'pointer',
  },
  confirmDeleteText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
