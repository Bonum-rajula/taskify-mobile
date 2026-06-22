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
  
  const baseStyle = theme.typography[variant];

  return (
    <Text
      style={[
        baseStyle,
        { textAlign: align },
        color && { color }, 
        style,             
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}