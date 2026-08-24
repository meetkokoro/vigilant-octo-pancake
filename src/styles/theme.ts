import { StyleSheet } from 'react-native';

export const COLORS = {
  bgDark: '#0b0f19',
  bgCard: '#151c2e',
  bgCardHover: '#1e293b',
  primary: '#0077b5', // LinkedIn Blue
  primaryLight: '#3b82f6',
  accentNeon: '#06b6d4', // Cyan Radar
  heart: '#ec4899', // Pink Match
  success: '#10b981',
  warning: '#f59e0b',
  border: '#1e293b',
  
  // Text colors
  textPrimary: '#f3f4f6',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textOnPrimary: '#ffffff'
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #0077b5 0%, #3b82f6 100%)',
  radar: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(11,15,25,0) 70%)',
  card: 'linear-gradient(180deg, rgba(21,28,46,0.8) 0%, rgba(11,15,25,0.95) 100%)',
  heart: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  neonBorder: 'linear-gradient(90deg, #0077b5, #06b6d4, #ec4899)'
};

export const GLOBAL_STYLES: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
  },
  heading2: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: 'Outfit',
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
    fontFamily: 'Outfit',
  }
});
