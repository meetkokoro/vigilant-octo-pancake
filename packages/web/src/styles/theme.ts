import { StyleSheet } from 'react-native';
import { COLORS } from '@linkradar/shared';

// Re-export shared constants for convenience
export { COLORS, GRADIENTS } from '@linkradar/shared';

// Platform-specific styles using StyleSheet.create (requires react-native-web)
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
