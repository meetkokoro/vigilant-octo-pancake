import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CURRENT_USER, Profile } from '@linkradar/shared';

interface LoginScreenProps {
  onLoginSuccess: (user: Profile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [loadingSSO, setLoadingSSO] = useState(false);
  const [ssoStep, setSSOStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');

  const handleLinkedInSSO = () => {
    setShowSSOModal(true);
    setSSOStep('prompt');
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      <View style={styles.content}>
        {/* Branding header */}
        <View style={styles.brandContainer}>
          <View style={styles.radarLogo}>
            <Ionicons name="compass" size={40} color={COLORS.accentNeon} />
            <View style={styles.radarPulseRing} />
          </View>
          <Text style={styles.appName}>LinkRadar</Text>
          <Text style={styles.appSubtitle}>Professional Proximity Dating</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="logo-linkedin" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>LinkedIn Verification</Text>
              <Text style={styles.featureDesc}>Authenticate via LinkedIn. Zero spam, real professionals.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="business" size={20} color={COLORS.accentNeon} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Corporate Filter</Text>
              <Text style={styles.featureDesc}>Discover matches within your corporation or partner network.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="location" size={20} color={COLORS.heart} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Hyper-local Radar</Text>
              <Text style={styles.featureDesc}>Identify matches nearby in real time with exact distance control.</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.linkedinButton}
            onPress={handleLinkedInSSO}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-linkedin" size={22} color="#ffffff" style={{ marginRight: 10 }} />
            <Text style={styles.linkedinButtonText}>Sign In with LinkedIn</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            We'll never post to your feed. By signing in, you agree to our Terms and Privacy Policy.
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
              <View style={styles.ssoUrlBar}>
                <Ionicons name="lock-closed" size={12} color="#8e8e93" style={{ marginRight: 4 }} />
                <Text style={styles.ssoUrlText} numberOfLines={1}>
                  api.linkedin.com/oauth/v2/authorization
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSSOModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {ssoStep === 'prompt' && (
              <View style={styles.ssoContent}>
                <View style={styles.ssoLogoRow}>
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174857.png' }}
                    style={styles.linkedinLogo}
                  />
                  <Text style={styles.connectPlus}>+</Text>
                  <View style={styles.appIconMini}>
                    <Ionicons name="compass" size={24} color={COLORS.accentNeon} />
                  </View>
                </View>

                <Text style={styles.ssoHeadline}>LinkRadar requests access to your LinkedIn profile:</Text>

                <View style={styles.permissionList}>
                  <View style={styles.permissionItem}>
                    <Ionicons name="people" size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.permissionText}>Use your name, profile photo, and headline.</Text>
                  </View>
                  <View style={styles.permissionItem}>
                    <Ionicons name="business" size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                    <Text style={styles.permissionText}>Use your current company, job title, and location.</Text>
                  </View>
                </View>

                <Text style={styles.ssoSafetyInfo}>
                  Authorization does not permit LinkRadar to publish posts or message connections on your behalf.
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
                <Text style={styles.ssoStatusText}>Securing OAuth token...</Text>
                <Text style={styles.ssoSubstatusText}>
                  Requesting access token & profile details from LinkedIn Gateway
                </Text>

                <View style={styles.codeSnippetBox}>
                  <Text style={styles.codeSnippetHeader}>OAuth 2.0 Integration Under the Hood:</Text>
                  <Text style={styles.codeSnippetText}>
                    {`// Step 1: Redirect to authorize endpoint\nGET https://www.linkedin.com/oauth/v2/authorization\n?response_type=code&client_id=linkradar\n&redirect_uri=linkradar://oauth-callback\n\n// Step 2: Swap authorization_code for token\nPOST .../accessToken\nbody: { grant_type, code, client_id }`}
                  </Text>
                </View>
              </View>
            )}

            {ssoStep === 'success' && (
              <View style={styles.ssoMiddleState}>
                <View style={styles.successBadge}>
                  <Ionicons name="shield-checkmark" size={40} color={COLORS.success} />
                </View>
                <Text style={[styles.ssoStatusText, { color: COLORS.success }]}>Authentication Successful</Text>
                <Text style={styles.ssoSubstatusText}>
                  Welcome, {CURRENT_USER.name}! Importing your profile details from {CURRENT_USER.company}...
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 50,
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
    marginBottom: 20,
  },
  radarPulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: COLORS.accentNeon,
    opacity: 0.3,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  appSubtitle: {
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  linkedinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  disclaimerText: {
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
  ssoUrlBar: {
    flex: 1,
    height: 28,
    backgroundColor: '#0c101c',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 12,
  },
  ssoUrlText: {
    fontSize: 11,
    color: '#8e8e93',
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 6,
  },
  closeButtonText: {
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
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ssoSafetyInfo: {
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  ssoSubstatusText: {
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
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.accentNeon,
    marginBottom: 6,
  },
  codeSnippetText: {
    fontSize: 10,
    color: '#a1a1aa',
    lineHeight: 14,
  },
});
