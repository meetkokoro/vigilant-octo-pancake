import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../styles/theme';
import {
  Smartphone,
  ArrowLeft,
  X,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+49', '+33', '+81'];

export interface PhoneAuthSheetProps {
  visible: boolean;
  demoMode: boolean;
  onClose: () => void;
  onSendCode: (phone: string) => Promise<{ ok: boolean; error?: string }>;
  onVerifyCode: (
    phone: string,
    token: string
  ) => Promise<{ ok: boolean; error?: string }>;
}

/** E.164: a leading `+`, a non-zero country digit, then 7–14 more digits. */
function toE164(dialCode: string, nationalNumber: string): string | null {
  const digits = nationalNumber.replace(/\D/g, '').replace(/^0+/, '');
  const candidate = `${dialCode}${digits}`;
  return /^\+[1-9]\d{7,14}$/.test(candidate) ? candidate : null;
}

export default function PhoneAuthSheet({
  visible,
  demoMode,
  onClose,
  onSendCode,
  onVerifyCode,
}: PhoneAuthSheetProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [dialCode, setDialCode] = useState('+1');
  const [nationalNumber, setNationalNumber] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<TextInput>(null);

  const e164 = useMemo(
    () => toE164(dialCode, nationalNumber),
    [dialCode, nationalNumber]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!visible) {
      setStep('phone');
      setNationalNumber('');
      setCode('');
      setError(null);
      setBusy(false);
      setCooldown(0);
    }
  }, [visible]);

  const sendCode = async () => {
    if (!e164) {
      setError('Enter a valid mobile number, including area code.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await onSendCode(e164);
    setBusy(false);

    if (!result.ok) {
      setError(result.error ?? 'We could not send the code. Please try again.');
      return;
    }
    setStep('code');
    setCooldown(RESEND_SECONDS);
    setTimeout(() => codeInputRef.current?.focus(), 120);
  };

  const verifyCode = async (value: string) => {
    if (!e164 || value.length !== OTP_LENGTH) return;
    setBusy(true);
    setError(null);
    const result = await onVerifyCode(e164, value);
    setBusy(false);

    if (!result.ok) {
      setError(result.error ?? 'That code is incorrect or has expired.');
      setCode('');
      return;
    }
    onClose();
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    if (digits.length === OTP_LENGTH) void verifyCode(digits);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            {step === 'code' ? (
              <TouchableOpacity
                onPress={() => setStep('phone')}
                style={styles.headerBtn}
              >
                <ArrowLeft size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerIcon}>
                <Smartphone size={18} color={COLORS.accentNeon} />
              </View>
            )}

            <Text style={styles.title}>
              {step === 'phone'
                ? 'Sign up with your mobile'
                : 'Enter your code'}
            </Text>

            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {step === 'phone' ? (
            <>
              <Text style={styles.subtitle}>
                We'll text you a 6-digit code. No password to remember, and your
                number is never shown on your profile.
              </Text>

              <View style={styles.countryRow}>
                {COUNTRY_CODES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.countryChip,
                      dialCode === item && styles.countryChipActive,
                    ]}
                    onPress={() => setDialCode(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.countryChipText,
                        dialCode === item && styles.countryChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.phoneRow}>
                <View style={styles.dialBox}>
                  <Text style={styles.dialText}>{dialCode}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="555 123 4567"
                  placeholderTextColor={COLORS.textMuted}
                  value={nationalNumber}
                  onChangeText={(value) =>
                    setNationalNumber(value.replace(/[^\d\s-]/g, ''))
                  }
                  onSubmitEditing={() => void sendCode()}
                  keyboardType="phone-pad"
                  maxLength={18}
                  autoComplete="tel"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!e164 || busy) && styles.primaryBtnDisabled,
                ]}
                onPress={() => void sendCode()}
                disabled={!e164 || busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send code</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.legal}>
                Message and data rates may apply. You must be 18+ to sign up.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Sent to <Text style={styles.phoneHighlight}>{e164}</Text>
              </Text>

              <View style={styles.otpRow}>
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      i === code.length && styles.otpBoxActive,
                      code[i] !== undefined && styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={styles.otpDigit}>{code[i] ?? ''}</Text>
                  </View>
                ))}

                <TextInput
                  ref={codeInputRef}
                  style={styles.otpInput}
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoComplete="sms-otp"
                  autoFocus
                />
              </View>

              {busy && (
                <View style={styles.verifyingRow}>
                  <ActivityIndicator size="small" color={COLORS.accentNeon} />
                  <Text style={styles.verifyingText}>Verifying…</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (code.length !== OTP_LENGTH || busy) &&
                    styles.primaryBtnDisabled,
                ]}
                onPress={() => void verifyCode(code)}
                disabled={code.length !== OTP_LENGTH || busy}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Verify &amp; continue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => void sendCode()}
                disabled={cooldown > 0 || busy}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendText,
                    cooldown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </Text>
              </TouchableOpacity>

              {demoMode && (
                <View style={styles.demoHint}>
                  <ShieldCheck
                    size={13}
                    color={COLORS.warning}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.demoHintText}>
                    Demo mode — no SMS is sent. Enter any 6 digits to continue.
                  </Text>
                </View>
              )}
            </>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <AlertTriangle
                size={14}
                color={COLORS.heart}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles: any = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
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
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(6,182,212,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  title: {
    flex: 1,
    fontFamily: 'Outfit',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 10,
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 16,
  },
  phoneHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  countryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
    cursor: 'pointer',
  },
  countryChipActive: {
    borderColor: COLORS.accentNeon,
    backgroundColor: 'rgba(6,182,212,0.12)',
  },
  countryChipText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  countryChipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialBox: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    marginRight: 8,
  },
  dialText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 15,
    letterSpacing: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  otpBox: {
    flex: 1,
    height: 56,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: COLORS.accentNeon,
  },
  otpBoxFilled: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  otpDigit: {
    fontFamily: 'Outfit',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  otpInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    opacity: 0,
    color: 'transparent',
    cursor: 'pointer',
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  verifyingText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  primaryBtn: {
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(0,119,181,0.35)',
    cursor: 'pointer',
  },
  primaryBtnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  primaryBtnText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    cursor: 'pointer',
  },
  resendText: {
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentNeon,
  },
  resendTextDisabled: {
    color: COLORS.textMuted,
  },
  legal: {
    fontFamily: 'Outfit',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  demoHintText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.warning,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.35)',
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  errorText: {
    flex: 1,
    fontFamily: 'Outfit',
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.heart,
  },
});
