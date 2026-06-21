// src/components/tasks/TaskCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';
import { Task } from '@/types/models';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <Pressable
      style={[styles.card, task.completed && styles.cardCompleted]}
      onPress={onPress}
      disabled={task.completed}
    >
      <View style={styles.contentContainer}>
        <Typography
          variant="h2"
          style={[styles.title, task.completed && styles.textStrikethrough]}
        >
          {task.title}
        </Typography>

        {task.description ? (
          <Typography
            variant="body"
            color={theme.colors.textMuted}
            style={styles.description}
            numberOfLines={2}
          >
            {task.description}
          </Typography>
        ) : null}

        {task.dueDate && (
          <View style={styles.dateContainer}>
            <Clock color={theme.colors.textMuted} size={14} />
            <Typography variant="caption" color={theme.colors.textMuted} style={styles.dateText}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Typography>
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
    minHeight: 80,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardCompleted: {
    backgroundColor: theme.colors.background,
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  description: {
    marginBottom: theme.spacing.sm,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  dateText: {
    marginLeft: theme.spacing.xs,
  },
});