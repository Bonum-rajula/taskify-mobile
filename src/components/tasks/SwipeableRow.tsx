// src/components/tasks/SwipeableRow.tsx
import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Check, Trash2, Undo2 } from 'lucide-react-native'; // Added Undo2
import { theme } from '@/constants/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onToggle: () => void;
  onDelete: () => void;
  isCompleted: boolean; // NEW: Tell the row what state it's in
}

export function SwipeableRow({ children, onToggle, onDelete, isCompleted }: SwipeableRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  // Dynamic Toggle UI based on state
  const ToggleIcon = isCompleted ? Undo2 : Check;
  const toggleColor = isCompleted ? theme.colors.primary : theme.colors.success;

  const renderLeftActions = () => (
    <View style={[styles.swipeActionLeft, { backgroundColor: toggleColor }]}>
      <ToggleIcon color={theme.colors.surface} size={28} />
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.swipeActionRight}>
      <Trash2 color={theme.colors.surface} size={28} />
    </View>
  );

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      onToggle();
      swipeableRef.current?.close();
    } else if (direction === 'right') {
      onDelete();
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.webCardContent}>{children}</View>
        <View style={styles.webActionPanel}>
          <Pressable
            style={[styles.webBtn, { backgroundColor: toggleColor }]}
            onPress={onToggle}
          >
            <ToggleIcon color={theme.colors.surface} size={20} />
          </Pressable>
          <Pressable
            style={[styles.webBtn, { backgroundColor: theme.colors.error }]}
            onPress={onDelete}
          >
            <Trash2 color={theme.colors.surface} size={20} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  // Swipe Action Styles (Mobile)
  swipeActionLeft: {
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.xl,
    flex: 1,
  },
  swipeActionRight: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.xl,
    flex: 1,
  },

  // Web Layout Styles
  webWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  webCardContent: {
    flex: 1,
  },
  webActionPanel: {
    flexDirection: 'row',
    paddingRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  webBtn: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});