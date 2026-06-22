import { theme } from '@/constants/theme';
import { useState } from 'react';
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Intercept the native focus events to drive our UI state
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Determine the border color based on validation and interaction state
  let borderColor: string = theme.colors.border;
  if (error) {
    borderColor = theme.colors.error; 
  } else if (isFocused) {
    borderColor = theme.colors.primary;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Optional Label */}
      {label && (
        <Typography
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.label}
        >
          {label}
        </Typography>
      )}

      {/* The Native Input Field */}
      <TextInput
        style={[
          styles.input,
          { borderColor },
          style,
        ]}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      {/* Abstracted Error Message Rendering */}
      {error && (
        <Typography
          variant="caption"
          color={theme.colors.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
});