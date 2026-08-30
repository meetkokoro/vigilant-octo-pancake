import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { DATING_INTENTS, Gender } from '../types/dating';
import {
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Prefer to self-describe' },
];

const SUGGESTED_INTERESTS = [
  'Hiking',
  'Coffee',
  'Running',
  'Live Music',
  'Photography',
  'Cooking',
  'Travel',
  'Reading',
  'Climbing',
  'Cycling',
  'Art',
  'Startups',
  'Yoga',
  'Dogs',
  'Wine',
  'Board Games',
];

const MIN_AGE = 18;
const STEPS = ['Photos', 'About you', 'Your vibe', 'Intent'];

interface OnboardingScreenProps {
  seed: Profile;
  onComplete: (patch: Partial<Profile>) => void;
  onSkip?: () => void;
}

function ageFromBirthdate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor(
    (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
}

export default function OnboardingScreen({
  seed,
  onComplete,
  onSkip,
}: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>(
    seed.photos ?? (seed.avatar ? [seed.avatar] : [])
  );
  const [photoDraft, setPhotoDraft] = useState('');
  const [name, setName] = useState(seed.name === 'New member' ? '' : seed.name);
  const [birthdate, setBirthdate] = useState(seed.birthdate ?? '');
  const [gender, setGender] = useState<Gender | null>(seed.gender ?? null);
  const [bio, setBio] = useState(seed.bio ?? '');
  const [interests, setInterests] = useState<string[]>(seed.interests ?? []);
  const [intent, setIntent] = useState<string>(seed.datingIntent ?? '');
  const [error, setError] = useState<string | null>(null);

  const age = useMemo(() => ageFromBirthdate(birthdate), [birthdate]);

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : prev.length >= 6
        ? prev
        : [...prev, value]
    );
  };

  const addPhoto = () => {
    const url = photoDraft.trim();
    if (!url) return;
    if (!/^https:\/\/\S+$/i.test(url)) {
      setError('Photo links must start with https://');
      return;
    }
    setPhotos((prev) => (prev.length >= 6 ? prev : [...prev, url]));
    setPhotoDraft('');
    setError(null);
  };

  const validateStep = (): string | null => {
    if (step === 0 && photos.length === 0)
      return 'Add at least one photo to continue.';
    if (step === 1) {
      if (name.trim().length < 2)
        return 'Enter the name you want shown on your profile.';
      if (age === null) return 'Enter your date of birth as YYYY-MM-DD.';
      if (age < MIN_AGE) return 'You must be 18 or older to use LinkRadar.';
      if (!gender) return 'Select how you identify.';
    }
    if (step === 2 && bio.trim().length < 20)
      return 'Write at least 20 characters so matches know you.';
    if (step === 3 && !intent) return 'Pick what you are looking for.';
    return null;
  };

  const next = () => {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    onComplete({
      photos,
      avatar: photos[0],
      name: name.trim(),
      birthdate,
      age: age ?? undefined,
      gender: gender ?? undefined,
      bio: bio.trim(),
      interests,
      datingIntent: intent,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          Step {step + 1} of {STEPS.length}
        </Text>
        <Text style={styles.title}>{STEPS[step]}</Text>
        <View style={styles.progressTrack}>
          {STEPS.map((label, i) => (
            <View
              key={label}
              style={[
                styles.progressSegment,
                i <= step && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        {step === 0 && (
          <>
            <Text style={styles.help}>
              Your first photo is your main profile picture. Matches see up to
              six.
            </Text>
            <View style={styles.photoGrid}>
              {photos.map((url, i) => (
                <View key={`${url}-${i}`} style={styles.photoTile}>
                  <Image source={{ uri: url }} style={styles.photoImage} />
                  {i === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>MAIN</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() =>
                      setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <X size={12} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 6 && (
                <View style={[styles.photoTile, styles.photoPlaceholder]}>
                  <Camera size={22} color={COLORS.textMuted} />
                </View>
              )}
            </View>

            <View style={styles.inlineInputRow}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="https://image-url.jpg"
                placeholderTextColor={COLORS.textMuted}
                value={photoDraft}
                onChangeText={setPhotoDraft}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={addPhoto}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={60}
            />
            <Text style={styles.help}>
              This is how you'll appear to matches.
            </Text>

            <Text style={[styles.label, { marginTop: 22 }]}>Date of birth</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={birthdate}
              onChangeText={setBirthdate}
              autoCapitalize="none"
            />
            <Text style={styles.help}>
              {age !== null ? `You'll appear as ${age}. ` : ''}Only your age is
              shown, never your birth date.
            </Text>

            <Text style={[styles.label, { marginTop: 22 }]}>I am a</Text>
            <View style={styles.chipRow}>
              {GENDERS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    gender === option.value && styles.chipActive,
                  ]}
                  onPress={() => setGender(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      gender === option.value && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>About you</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What do you do outside work? What are you looking for?"
              placeholderTextColor={COLORS.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
            />
            <Text style={styles.help}>{bio.length}/500</Text>

            <Text style={[styles.label, { marginTop: 22 }]}>
              Interests{' '}
              <Text style={styles.labelHint}>({interests.length}/6)</Text>
            </Text>
            <View style={styles.chipRow}>
              {Array.from(new Set([...interests, ...SUGGESTED_INTERESTS])).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      interests.includes(item) && styles.chipActive,
                    ]}
                    onPress={() => toggleInterest(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        interests.includes(item) && styles.chipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.help}>
              Shown on your card so people know what you're here for. You can
              change it any time.
            </Text>
            {DATING_INTENTS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.intentRow,
                  intent === option && styles.intentRowActive,
                ]}
                onPress={() => setIntent(option)}
                activeOpacity={0.7}
              >
                <Sparkles
                  size={16}
                  color={intent === option ? COLORS.heart : COLORS.textMuted}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.intentText,
                    intent === option && styles.intentTextActive,
                  ]}
                >
                  {option}
                </Text>
                {intent === option && <Check size={16} color={COLORS.heart} />}
              </TouchableOpacity>
            ))}
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          >
            <ArrowLeft size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : (
          onSkip && (
            <TouchableOpacity style={styles.backBtn} onPress={onSkip}>
              <Text style={styles.skipText}>Later</Text>
            </TouchableOpacity>
          )
        )}

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={next}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {step === STEPS.length - 1 ? 'Start scanning' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepLabel: {
    fontFamily: 'Outfit',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.accentNeon,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  progressTrack: {
    flexDirection: 'row',
    marginTop: 14,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: COLORS.border,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.accentNeon,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  label: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  labelHint: {
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  help: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  inlineInput: {
    flex: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoTile: {
    width: '31%',
    aspectRatio: 0.78,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: '3.5%',
    marginBottom: 10,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(6,182,212,0.9)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  mainBadgeText: {
    fontFamily: 'Outfit',
    fontSize: 8,
    fontWeight: '800',
    color: '#03121a',
    letterSpacing: 0.5,
  },
  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  intentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    marginBottom: 10,
    cursor: 'pointer',
  },
  intentRowActive: {
    borderColor: COLORS.heart,
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  intentText: {
    flex: 1,
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  intentTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  error: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.heart,
    marginTop: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    cursor: 'pointer',
  },
  skipText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    boxShadow: '0 4px 18px rgba(0,119,181,0.35)',
    cursor: 'pointer',
  },
  nextBtnText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
