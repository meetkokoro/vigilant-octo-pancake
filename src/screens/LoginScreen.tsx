import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, GLOBAL_STYLES } from '../styles/theme';
import {
  Linkedin,
  Compass,
  Shield,
  Users,
  Building,
  MapPin,
  Chrome,
  Apple,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { CURRENT_USER, Profile } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { OAuthProvider } from '../lib/supabase';
import PhoneAuthSheet from '../components/PhoneAuthSheet';

interface LoginScreenProps {
  onLoginSuccess: (user: Profile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const {
    demoMode,
    authError,
    signInWithProvider,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [showPhoneSheet, setShowPhoneSheet] = useState(false);
  const [loadingSSO, setLoadingSSO] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null
  );
  const [ssoStep, setSSOStep] = useState<'prompt' | 'authorizing' | 'success'>(
    'prompt'
  );

  /**
   * With Supabase configured this hands off to the provider's real consent
   * screen. Without credentials it replays the scripted OAuth walkthrough so
   * the prototype still works offline.
   */
  const handleSignIn = async (provider: OAuthProvider) => {
    if (demoMode) {
      setShowSSOModal(true);
      setSSOStep('prompt');
      return;
    }

    setPendingProvider(provider);
    await signInWithProvider(provider);
    setPendingProvider(null);
  };

  const handleAuthorize = () => {
    setSSOStep('authorizing');
    setLoadingSSO(true);

    // Simulate LinkedIn OAuth 2.0 Auth Code & Access Token Swap
    setTimeout(() => {
      setSSOStep('success');
      setLoadingSSO(false);

      // Complete login after a short delay showing success screen
      setTimeout(() => {
        setShowSSOModal(false);
        onLoginSuccess(CURRENT_USER);
      }, 1500);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background Glowing Blobs */}
      <View style={[styles.glowBlob, styles.glowBlob1]} />
      <View style={[styles.glowBlob, styles.glowBlob2]} />

      <View style={styles.content}>
        {/* Branding header */}
        <View style={styles.brandContainer}>
          <View style={styles.radarLogo}>
            <Compass
              size={40}
              color={COLORS.accentNeon}
              style={styles.compassIcon}
            />
            <View style={styles.radarPulseRing} />
            <View
              style={[
                styles.radarPulseRing,
                { transform: [{ scale: 1.5 }], opacity: 0.15 },
              ]}
            />
          </View>
          <Text style={styles.appName}>LinkRadar</Text>
          <Text style={styles.appSubtitle}>Professional Proximity Dating</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Linkedin size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>LinkedIn Verification</Text>
              <Text style={styles.featureDesc}>
                Authenticate via LinkedIn. Zero spam, real professionals.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Building size={20} color={COLORS.accentNeon} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Corporate Filter</Text>
              <Text style={styles.featureDesc}>
                Discover matches within your corporation or partner network.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <MapPin size={20} color={COLORS.heart} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Hyper-local Radar</Text>
              <Text style={styles.featureDesc}>
                Identify matches nearby in real time with exact distance
                control.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.linkedinButton}
            onPress={() => handleSignIn('linkedin_oidc')}
            activeOpacity={0.8}
            disabled={pendingProvider !== null}
          >
            <Linkedin size={22} color="#ffffff" style={styles.btnIcon} />
            <Text style={styles.linkedinButtonText}>
              {pendingProvider === 'linkedin_oidc'
                ? 'Redirecting…'
                : 'Sign In with LinkedIn'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.phoneButton}
            onPress={() => setShowPhoneSheet(true)}
            activeOpacity={0.8}
          >
            <Smartphone
              size={20}
              color={COLORS.accentNeon}
              style={styles.btnIcon}
            />
            <Text style={styles.phoneButtonText}>
              Sign up with mobile number
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.providerRow}>
            <TouchableOpacity
              style={styles.providerButton}
              onPress={() => handleSignIn('google')}
              activeOpacity={0.8}
              disabled={pendingProvider !== null}
            >
              <Chrome
                size={18}
                color={COLORS.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.providerButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.providerButton}
              onPress={() => handleSignIn('apple')}
              activeOpacity={0.8}
              disabled={pendingProvider !== null}
            >
              <Apple
                size={18}
                color={COLORS.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.providerButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {authError && (
            <View style={styles.errorBanner}>
              <AlertTriangle
                size={14}
                color={COLORS.heart}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {demoMode && (
            <Text style={styles.demoNotice}>
              Demo mode — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to
              .env.local to enable real OAuth.
            </Text>
          )}

          <Text style={styles.disclaimerText}>
            We'll never post to your feed. You must be 18+. By signing in, you
            agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </View>

      {/* Simulated LinkedIn SSO OAuth Modal */}
      <Modal
        visible={showSSOModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSSOModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ssoWindow}>
            {/* Header simulating browser header */}
            <View style={styles.ssoBrowserHeader}>
              <View style={styles.browserDots}>
                <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
                <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
                <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
              </View>
              <View style={styles.ssoUrlBar}>
                <Lock size={12} color="#8e8e93" />
                <Text style={styles.ssoUrlText}>
                  api.linkedin.com/oauth/v2/authorization
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSSOModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {ssoStep === 'prompt' && (
              <View style={styles.ssoContent}>
                <View style={styles.ssoLogoRow}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
                    }}
                    style={styles.linkedinLogo}
                  />
                  <Text style={styles.connectPlus}>+</Text>
                  <View style={styles.appIconMini}>
                    <Compass size={24} color={COLORS.accentNeon} />
                  </View>
                </View>

                <Text style={styles.ssoHeadline}>
                  LinkRadar requests access to your LinkedIn profile:
                </Text>

                <View style={styles.permissionList}>
                  <View style={styles.permissionItem}>
                    <Users
                      size={16}
                      color={COLORS.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.permissionText}>
                      Use your name, profile photo, and headline.
                    </Text>
                  </View>
                  <View style={styles.permissionItem}>
                    <Building
                      size={16}
                      color={COLORS.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.permissionText}>
                      Use your current company, job title, and location.
                    </Text>
                  </View>
                </View>

                <Text style={styles.ssoSafetyInfo}>
                  Authorization does not permit LinkRadar to publish posts or
                  message connections on your behalf.
                </Text>

                <View style={styles.ssoActionButtons}>
                  <TouchableOpacity
                    style={[styles.ssoBtn, styles.ssoBtnCancel]}
                    onPress={() => setShowSSOModal(false)}
                  >
                    <Text style={styles.ssoBtnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.ssoBtn, styles.ssoBtnAllow]}
                    onPress={handleAuthorize}
                  >
                    <Text style={styles.ssoBtnAllowText}>Allow Access</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {ssoStep === 'authorizing' && (
              <View style={styles.ssoMiddleState}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.ssoStatusText}>
                  Securing OAuth token...
                </Text>
                <Text style={styles.ssoSubstatusText}>
                  Requesting access token & profile details from LinkedIn
                  Gateway
                </Text>

                <View style={styles.codeSnippetBox}>
                  <Text style={styles.codeSnippetHeader}>
                    OAuth 2.0 Integration Under the Hood:
                  </Text>
                  <Text style={styles.codeSnippetText}>
                    {`// Step 1: Redirect to authorize endpoint\nGET https://www.linkedin.com/oauth/v2/authorization\n?response_type=code&client_id=linkradar_client_id\n&redirect_uri=linkradar://oauth-callback&scope=openid%20profile%20email\n\n// Step 2: Swap authorization_code for token\nPOST https://www.linkedin.com/oauth/v2/accessToken\nheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }\nbody: { grant_type: 'authorization_code', code, client_id, client_secret }`}
                  </Text>
                </View>
              </View>
            )}

            {ssoStep === 'success' && (
              <View style={styles.ssoMiddleState}>
                <View style={styles.successBadge}>
                  <Shield size={40} color={COLORS.success} />
                </View>
                <Text style={[styles.ssoStatusText, { color: COLORS.success }]}>
                  Authentication Successful
                </Text>
                <Text style={styles.ssoSubstatusText}>
                  Welcome, {CURRENT_USER.name}! Importing your profile details
                  from {CURRENT_USER.company}...
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <PhoneAuthSheet
        visible={showPhoneSheet}
        demoMode={demoMode}
        onClose={() => setShowPhoneSheet(false)}
        onSendCode={sendPhoneOtp}
        onVerifyCode={verifyPhoneOtp}
      />
    </View>
  );
}

// Simple Helper to bypass lock icon import in standard lucide
function Lock({ size, color }: { size: number; color: string }) {
  return (
    <span
      style={{
        fontSize: size,
        color: color,
        marginRight: 4,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      🔒
    </span>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 200,
    filter: 'blur(80px)',
    opacity: 0.15,
  },
  glowBlob1: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    top: -50,
    left: -50,
  },
  glowBlob2: {
    width: 350,
    height: 350,
    backgroundColor: COLORS.accentNeon,
    bottom: -80,
    right: -80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  radarLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  compassIcon: {
    animation: 'spin 12s linear infinite',
  },
  radarPulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.accentNeon,
    opacity: 0.3,
    animation: 'pulse 2s infinite ease-out',
  },
  appName: {
    fontFamily: 'Outfit',
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    color: COLORS.accentNeon,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionContainer: {
    alignItems: 'center',
  },
  linkedinButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 119, 181, 0.35)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  linkedinButtonText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnIcon: {
    marginRight: 10,
  },
  disclaimerText: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ssoWindow: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: '#1b223c',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e3a5f',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  ssoBrowserHeader: {
    height: 48,
    backgroundColor: '#101628',
    borderBottomWidth: 1,
    borderBottomColor: '#2e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  browserDots: {
    flexDirection: 'row',
    gap: 6,
    width: 70,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ssoUrlBar: {
    flex: 1,
    height: 28,
    backgroundColor: '#0c101c',
    borderRadius: 6,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    maxWidth: 320,
  },
  ssoUrlText: {
    fontSize: 11,
    color: '#8e8e93',
    fontFamily: 'monospace',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    paddingHorizontal: 6,
  },
  closeButtonText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ssoContent: {
    padding: 30,
    alignItems: 'center',
  },
  ssoLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  linkedinLogo: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  connectPlus: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginHorizontal: 20,
  },
  appIconMini: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ssoHeadline: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  permissionList: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ssoSafetyInfo: {
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  ssoActionButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  ssoBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontFamily: 'Outfit',
    cursor: 'pointer',
  },
  ssoBtnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  ssoBtnCancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  ssoBtnAllow: {
    backgroundColor: COLORS.primary,
  },
  ssoBtnAllowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  ssoMiddleState: {
    padding: 40,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
  },
  ssoStatusText: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  ssoSubstatusText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 360,
    marginBottom: 20,
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  codeSnippetBox: {
    width: '100%',
    backgroundColor: '#0c101c',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2e3a5f',
  },
  codeSnippetHeader: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.accentNeon,
    marginBottom: 6,
  },
  codeSnippetText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#a1a1aa',
    lineHeight: 14,
    whiteSpace: 'pre-wrap',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 10,
  },
  providerRow: {
    flexDirection: 'row',
    width: '100%',
  },
  providerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
  },
  providerButtonText: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  demoNotice: {
    fontFamily: 'Outfit',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.warning,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
  phoneButton: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    backgroundColor: 'rgba(6,182,212,0.08)',
    cursor: 'pointer',
  },
  phoneButtonText: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accentNeon,
  },
} as any);
