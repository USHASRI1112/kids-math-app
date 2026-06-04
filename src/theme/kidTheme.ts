import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const kidColors = {
  background: '#FFF8FC',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF2FA',
  primary: '#FF6B9E',
  primaryDark: '#7E2D6A',
  primarySoft: '#FFD2EA',
  accent: '#FFD36E',
  accentSoft: '#FFF0C2',
  text: '#7E2D6A',
  textMuted: '#704D66',
  success: '#55C47A',
  successSoft: '#E9FAF0',
  error: '#F56C8B',
  errorSoft: '#FFF0F7',
};

export const kidTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 28,
  colors: {
    ...MD3LightTheme.colors,
    primary: kidColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: kidColors.primarySoft,
    onPrimaryContainer: kidColors.primaryDark,
    secondary: kidColors.accent,
    onSecondary: '#5B4300',
    secondaryContainer: kidColors.accentSoft,
    onSecondaryContainer: '#5B4300',
    surface: kidColors.surface,
    surfaceVariant: kidColors.surfaceSoft,
    onSurface: kidColors.text,
    onSurfaceVariant: kidColors.textMuted,
    background: kidColors.background,
    error: kidColors.error,
    errorContainer: kidColors.errorSoft,
    onError: '#FFFFFF',
    onErrorContainer: '#8C1E41',
  },
};
