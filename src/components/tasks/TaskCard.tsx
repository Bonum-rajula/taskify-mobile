// src/components/tasks/TaskCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Clock, Bell, AlertCircle } from 'lucide-react-native';
import { format, isBefore, startOfDay } from 'date-fns';

import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';
import { Task } from '@/types/models';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const hasDueDate = !!task.dueDate;
  
  const isOverdue = hasDueDate && !task.completed && isBefore(
    startOfDay(new Date(task.dueDate!)), 
    startOfDay(new Date())
  );

  const hasActiveReminder = hasDueDate && !task.completed && !isOverdue;

  const getPillTheme = () => {
    if (task.completed) {
      return { bg: theme.colors.background, text: theme.colors.textMuted, icon: theme.colors.textMuted };
    }
    if (isOverdue) {
      return { bg: `${theme.colors.error}15`, text: theme.colors.error, icon: theme.colors.error };
    }
    return { bg: `${theme.colors.primary}15`, text: theme.colors.primary, icon: theme.colors.primary };
  };

  const pill = getPillTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        task.completed && styles.cardCompleted,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentContainer}>
        
        {/* 1. TITLE */}
        <Typography
          variant="h2"
          style={[styles.title, task.completed && styles.textStrikethrough]}
        >
          {task.title}
        </Typography>

        {/* 2. DESCRIPTION */}
        {task.description ? (
          <Typography
            variant="body"
            color={task.completed ? theme.colors.textMuted : '#475569'}
            style={styles.description}
            numberOfLines={2}
          >
            {task.description}
          </Typography>
        ) : null}

        {/* 3. METADATA FOOTER (The Status Pill) */}
        {hasDueDate && (
          <View style={styles.footer}>
            <View style={[styles.datePill, { backgroundColor: pill.bg }]}>
              
              {/* Contextual Micro-Iconography */}
              {isOverdue ? (
                <AlertCircle color={pill.icon} size={12} style={styles.pillIcon} />
              ) : hasActiveReminder ? (
                <Bell color={pill.icon} size={12} style={styles.pillIcon} />
              ) : (
                <Clock color={pill.icon} size={12} style={styles.pillIcon} />
              )}
              
              <Typography variant="caption" color={pill.text} style={styles.pillText}>
                {isOverdue ? 'Overdue: ' : ''}{format(new Date(task.dueDate!), 'MMM d, yyyy')}
              </Typography>

            </View>
          </View>
        )}

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    minHeight: 84,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardCompleted: {
    backgroundColor: `${theme.colors.surface}70`,
  },
  cardPressed: {
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  description: {
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  pillIcon: {
    marginRight: 4,
  },
  pillText: {
    fontWeight: '600',
  },
});