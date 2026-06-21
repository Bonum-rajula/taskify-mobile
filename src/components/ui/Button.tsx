import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Typography } from './Typography';
import { theme } from '@/constants/theme';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  title: string;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  title,
  isLoading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const isInteractionDisabled = disabled || isLoading;

  // Determine text color based on the variant
  const getTextColor = () => {
    if (variant === 'primary') return theme.colors.surface; // White text
    return theme.colors.primary; // Indigo text for secondary/ghost
  };

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        styles.base,
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
        <Typography
          variant="h2"
          color={getTextColor()}
          style={styles.text}
        >
          {title}
        </Typography>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Base structural styles for all buttons
  base: {
    height: 48,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
  },
  text: {
    fontSize: 16, // Slightly overriding H2 specifically for buttons
  },
  
  // Variant: Primary (Solid background)
  primary: {
    backgroundColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  
  // Variant: Secondary (Outline)
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.background,
  },
  
  // Variant: Ghost (Text only, no borders)
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: theme.colors.background, // Subtle highlight on tap
  },
  
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
});