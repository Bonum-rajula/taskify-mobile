// src/components/ui/DismissKeyboard.tsx
import React from 'react';
import { TouchableWithoutFeedback, Keyboard, Platform, View } from 'react-native';

export function DismissKeyboard({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
}