export const PRIMITIVES = {
  primary: '#00426B', // Pantone 7694 C / 541 U
  secondary: '#4197CB', // Pantone 7688 C / 7688 U
  tertiary: '#0775AB', // Action Blue
  accent: '#F26178', // Pantone 709 C / 709 U
  beige: '#E0C5AC', // Pantone 4685 C / 4685 U
  yellow: '#F9C311',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#CFD2D3', // Pantone 427 C / Cool Grey 1 U
  charcoal: {
    950: '#0D0D0D',
    900: '#171717',
    800: '#212121',
    700: '#2F2F2F',
    600: '#424242',
    500: '#676767',
  },
  neutral: {
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    500: '#6B7280',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F7F8F9',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
} as const;

export const SEMANTICS = {
  light: {
    background: {
      page: PRIMITIVES.neutral[50], // #F9FAFB
      surface: PRIMITIVES.white,
      subtle: PRIMITIVES.neutral[100],
      brand: PRIMITIVES.secondary,
    },
    text: {
      primary: PRIMITIVES.neutral[900],
      secondary: PRIMITIVES.neutral[700],
      muted: PRIMITIVES.neutral[500],
      inverse: PRIMITIVES.white,
      brand: PRIMITIVES.primary,
    },
    border: {
      subtle: PRIMITIVES.neutral[200],
      focus: PRIMITIVES.secondary,
    }
  },
  dark: {
    background: {
      page: '#171717', // PRIMITIVES.charcoal[900]
      surface: '#212121', // PRIMITIVES.charcoal[800]
      subtle: '#2F2F2F', // PRIMITIVES.charcoal[700]
      brand: PRIMITIVES.primary,
    },
    text: {
      primary: '#ECECEC', // Primary text
      secondary: '#B4B4B4', // Secondary text
      muted: '#676767', // Muted text
      inverse: PRIMITIVES.white,
      brand: PRIMITIVES.secondary,
    },
    border: {
      subtle: '#424242', // PRIMITIVES.charcoal[600]
      focus: PRIMITIVES.secondary,
    }
  }
} as const;

// Keep THEME for backward compatibility if needed, but mark as legacy
export const THEME = {
  colors: {
    primary: PRIMITIVES.primary,
    secondary: PRIMITIVES.secondary,
    tertiary: PRIMITIVES.tertiary,
    accent: PRIMITIVES.accent,
    beige: PRIMITIVES.beige,
    yellow: PRIMITIVES.yellow,
    white: PRIMITIVES.white,
    black: PRIMITIVES.black,
    gray: PRIMITIVES.gray,
    background: PRIMITIVES.neutral[50],
    surface: PRIMITIVES.white,
    bgGray: '#F2F2F3', // Specific value from previous version
    secondaryBg: '#EAEFF2', // Specific value from previous version
    text: {
      primary: PRIMITIVES.neutral[900],
      secondary: PRIMITIVES.neutral[700],
      muted: PRIMITIVES.neutral[500],
      white: PRIMITIVES.white,
      brand: PRIMITIVES.primary
    },
    success: PRIMITIVES.success,
    warning: PRIMITIVES.warning,
    error: PRIMITIVES.error,
    info: PRIMITIVES.info
  },
  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'Inter, sans-serif'
  }
} as const;

