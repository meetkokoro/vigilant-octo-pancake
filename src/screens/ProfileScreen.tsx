import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { DATING_INTENTS } from '../types/dating';
import PhotoCarousel from '../components/PhotoCarousel';
import {
  Settings,
  Pencil,
  Check,
  X,
  BadgeCheck,
  Landmark,
  MapPin,
} from 'lucide-react';

interface ProfileScreenProps {
  profile: Profile;
  onSave: (patch: Partial<Profile>) => void;
  onOpenSettings: () => void;
  verifiedProvider: string | null;
}

export default function ProfileScreen({
  profile,
  onSave,
  onOpenSettings,
  verifiedProvider,
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [headline, setHeadline] = useState(profile.headline);
  const [intent, setIntent] = useState(profile.datingIntent);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [interestDraft, setInterestDraft] = useState('');

  const photos =
    profile.photos && profile.photos.length > 0
      ? profile.photos
      : [profile.avatar];

  const startEditing = () => {
    setBio(profile.bio);
    setHeadline(profile.headline);
    setIntent(profile.datingIntent);
    setInterests(profile.interests);
    setEditing(true);
  };

  const save = () => {
    onSave({
      bio: bio.trim(),
      headline: headline.trim(),
      datingIntent: intent,
      interests,
    });
    setEditing(false);
  };

  const addInterest = () => {
    const value = interestDraft.trim();
    if (!value || interests.includes(value) || interests.length >= 6) return;
    setInterests((prev) => [...prev, value]);
    setInterestDraft('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My profile</Text>
        <View style={styles.headerActions}>
          {editing ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setEditing(false)}
              >
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.iconBtnPrimary]}
                onPress={save}
              >
                <Check size={18} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={startEditing}>
                <Pencil size={17} color={COLORS.accentNeon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
                <Settings size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.photoCard}>
          <PhotoCarousel photos={photos} height={280} />
          <View style={styles.photoOverlay}>
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
            <View style={styles.metaRow}>
              <Landmark
                size={13}
                color={COLORS.accentNeon}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaText}>{profile.company}</Text>
              <Text style={styles.metaDot}>•</Text>
              <MapPin
                size={13}
                color={COLORS.heart}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaText}>
                {profile.localityName || profile.location}
              </Text>
            </View>
          </View>
        </View>

        {verifiedProvider && (
          <View style={styles.verifiedBanner}>
            <BadgeCheck
              size={15}
              color={COLORS.success}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.verifiedText}>
              Identity verified via {verifiedProvider}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Headline</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={headline}
              onChangeText={setHeadline}
              maxLength={120}
              placeholder="Senior Software Engineer"
              placeholderTextColor={COLORS.textMuted}
            />
          ) : (
            <Text style={styles.sectionValue}>
              {profile.headline || 'Add a headline'}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>About me</Text>
          {editing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
              placeholder="Tell people what you're into"
              placeholderTextColor={COLORS.textMuted}
            />
          ) : (
            <Text style={styles.sectionValue}>
              {profile.bio || 'Add a short bio'}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Looking for</Text>
          {editing ? (
            <View style={styles.chipRow}>
              {DATING_INTENTS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.chip, intent === option && styles.chipActive]}
                  onPress={() => setIntent(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      intent === option && styles.chipTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.intentBadge}>
              <Text style={styles.intentBadgeText}>
                {profile.datingIntent || 'Not set'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipRow}>
            {(editing ? interests : profile.interests).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, styles.chipActive]}
                onPress={() =>
                  editing &&
                  setInterests((prev) => prev.filter((i) => i !== item))
                }
                activeOpacity={editing ? 0.7 : 1}
              >
                <Text style={[styles.chipText, styles.chipTextActive]}>
                  {item}
                </Text>
                {editing && (
                  <X
                    size={11}
                    color={COLORS.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {editing && interests.length < 6 && (
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={interestDraft}
                onChangeText={setInterestDraft}
                onSubmitEditing={addInterest}
                placeholder="Add an interest"
                placeholderTextColor={COLORS.textMuted}
                maxLength={24}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={addInterest}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    cursor: 'pointer',
  },
  iconBtnPrimary: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  body: {
    paddingHorizontal: 18,
    paddingBottom: 26,
  },
  photoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  photoOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    zIndex: 5,
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
    color: '#ffffff',
    marginRight: 6,
  },
  age: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  metaDot: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  verifiedText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 12,
  },
  sectionLabel: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  sectionValue: {
    fontFamily: 'Outfit',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
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
  intentBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(236,72,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.3)',
  },
  intentBadgeText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.heart,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  addBtn: {
    marginLeft: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    cursor: 'pointer',
  },
  addBtnText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
