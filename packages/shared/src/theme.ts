/**
 * Shared design token constants — pure JS objects, no platform-specific imports.
 * Platform-specific StyleSheet.create() usage stays in each app's UI layer.
 */

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
  textOnPrimary: '#ffffff',
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #0077b5 0%, #3b82f6 100%)',
  radar:
    'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(11,15,25,0) 70%)',
  card: 'linear-gradient(180deg, rgba(21,28,46,0.8) 0%, rgba(11,15,25,0.95) 100%)',
  heart: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  neonBorder: 'linear-gradient(90deg, #0077b5, #06b6d4, #ec4899)',
};
