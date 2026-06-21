import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface TypographyProps extends TextProps {
  variant?: keyof typeof theme.typography;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  // Extract the base styles from our theme dictionary
  const baseStyle = theme.typography[variant];

  return (
    <Text
      style={[
        baseStyle,
        { textAlign: align },
        color && { color }, // Override color if explicitly passed
        style,              // Allow local overrides when absolutely necessary
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}