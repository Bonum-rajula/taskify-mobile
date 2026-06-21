// src/constants/theme.ts

export const theme = {
  colors: {
    // Brand
    primary: '#4F46E5',         // Professional Indigo
    primaryPressed: '#4338CA',  // Darker Indigo for active states
    
    // Backgrounds
    background: '#F8FAFC',      // Very light slate for the main app background
    surface: '#FFFFFF',         // Pure white for cards, inputs, and bottom sheets
    
    // Typography
    text: '#0F172A',            // Deep slate for primary readability
    textMuted: '#64748B',       // Mid-slate for secondary text and placeholders
    
    // UI Elements
    border: '#E2E8F0',          // Subtle borders for dividers and inputs
    
    // Semantic States
    error: '#DC2626',           // Crimson for validation and destructive actions
    errorBackground: '#FEF2F2', // Light crimson for error message boxes
    success: '#10B981',         // Emerald for completed tasks
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,     // Standard padding for screen edges
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  radii: {
    sm: 4,      // Subtle rounding for inputs
    md: 8,      // Standard rounding for cards and buttons
    lg: 12,     // Larger rounding for modals or bottom sheets
    full: 9999, // For circular profile pictures
  },
  
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
      color: '#0F172A',
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      color: '#0F172A',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      color: '#0F172A',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      color: '#64748B',
    },
  },
} as const;

// This exports the exact shape of the theme so we can strongly type our component props
export type Theme = typeof theme;