export const Colors = {
  primary: '#4A90D9',
  primaryLight: '#6BA3E0',
  primaryDark: '#3A7BC8',
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  success: '#4CAF50',
  successLight: '#81C784',
  danger: '#F44336',
  dangerLight: '#E57373',
  warning: '#FF9800',
  background: '#f5f7fa',
  backgroundDark: '#e8ecf4',
  card: '#fff',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#f0f0f0',
  borderLight: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const Gradients = {
  primary: ['#4A90D9', '#357ABD'] as const,
  secondary: ['#FF9800', '#F57C00'] as const,
  success: ['#4CAF50', '#388E3C'] as const,
  danger: ['#F44336', '#D32F2F'] as const,
  card: ['#fff', '#f8f9ff'] as const,
  background: ['#f5f7fa', '#e8ecf4'] as const,
} as const;

export const Shadows = {
  sm: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    elevation: 2,
  },
  md: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  lg: {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    elevation: 6,
  },
  xl: {
    boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
    elevation: 8,
  },
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Fonts = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
