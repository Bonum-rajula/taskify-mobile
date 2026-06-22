// src/components/ui/Button.tsx
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  View,
} from 'react-native';
import { Typography } from './Typography';
import { theme } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  icon,
  isLoading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const isInteractionDisabled = disabled || isLoading;

  // 1. Resolve Text & Icon Color
  const getTextColor = () => {
    if (variant === 'primary') return theme.colors.surface;
    return theme.colors.primary; 
  };

  // 2. Resolve Dynamic Sizing
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { height: 36, paddingHorizontal: theme.spacing.md, borderRadius: theme.radii.sm };
      case 'lg':
        return { height: 56, paddingHorizontal: theme.spacing.xl, borderRadius: theme.radii.lg };
      case 'md':
      default:
        return { height: 48, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radii.md };
    }
  };

  const typographyVariant = size === 'sm' ? 'body' : 'h2';

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        styles.base,
        getSizeStyle(),
        styles[variant],
        pressed && !isInteractionDisabled && styles[`${variant}Pressed`],
        isInteractionDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Typography
            variant={typographyVariant}
            color={getTextColor()}
            style={[styles.text, size === 'sm' && styles.textSmall]}
          >
            {title}
          </Typography>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: theme.spacing.xs,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 13,
  },
  
  // --- VARIANTS ---
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed || '#312E81',
  },
  
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.background,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  outlinePressed: {
    backgroundColor: `${theme.colors.primary}10`,
  },

  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: theme.colors.background,
  },

  disabled: {
    opacity: 0.5,
  },
});