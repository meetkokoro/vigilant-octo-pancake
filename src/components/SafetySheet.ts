import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS } from '../styles/theme';
import { Profile } from '../utils/mockData';
import { REPORT_REASONS, ReportReason } from '../types/dating';
import { ShieldAlert, Ban, X, Check } from 'lucide-react';

interface SafetySheetProps {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
  onReport: (profile: Profile, reason: ReportReason, details: string) => void;
  onBlock: (profile: Profile) => void;
}

export default function SafetySheet({
  visible,
  profile,
  onClose,
  onReport,
  onBlock,
}: SafetySheetProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  if (!profile) return null;

  const reset = () => {
    setReason(null);
    setDetails('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) return;
    onReport(profile, reason, details.trim());
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <ShieldAlert size={20} color={COLORS.heart} />
            <Text style={styles.title}>Safety options</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Reports about {profile.name} are confidential — they are never
            notified.
          </Text>

          <ScrollView
            style={styles.reasonList}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {REPORT_REASONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.reasonRow,
                  reason === item && styles.reasonRowActive,
                ]}
                onPress={() => setReason(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.reasonText,
                    reason === item && styles.reasonTextActive,
                  ]}
                >
                  {item}
                </Text>
                {reason === item && (
                  <Check size={16} color={COLORS.accentNeon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.detailsInput}
            placeholder="Add details (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.submitBtn, !reason && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!reason}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Submit report</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.blockBtn}
            onPress={() => {
              onBlock(profile);
              reset();
            }}
            activeOpacity={0.8}
          >
            <Ban size={16} color={COLORS.heart} style={{ marginRight: 8 }} />
            <Text style={styles.blockBtnText}>
              Block {profile.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
          <Text style={styles.blockHint}>
            Blocking removes the match, hides both profiles and deletes the
            conversation.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles: any = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#151c2e',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Outfit',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  closeBtn: {
    padding: 6,
    cursor: 'pointer',
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  reasonList: {
    maxHeight: 220,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 8,
    cursor: 'pointer',
  },
  reasonRowActive: {
    borderColor: COLORS.accentNeon,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  reasonText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  reasonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  detailsInput: {
    marginTop: 10,
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 13,
    padding: 12,
  },
  submitBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.heart,
    alignItems: 'center',
    cursor: 'pointer',
  },
  submitBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  submitBtnText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  blockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.4)',
    backgroundColor: 'rgba(236,72,153,0.08)',
    cursor: 'pointer',
  },
  blockBtnText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.heart,
  },
  blockHint: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
});
