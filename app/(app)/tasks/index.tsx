// app/(app)/tasks/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TaskCard } from '@/components/tasks/TaskCard';
import { SwipeableRow } from '@/components/tasks/SwipeableRow';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

import { useTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '@/hooks/queries/useTasks';
import { emailDigestService } from '@/utils/emailDigest';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import { Task } from '@/types/models';

type TabState = 'pending' | 'completed';

export default function TasksDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabState>('pending');
  
  const insets = useSafeAreaInsets();

  const { data: tasks = [], isLoading, isRefetching, refetch } = useTasksQuery();
  const { user } = useAuthStore();
  const toggleMutation = useToggleTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  const handleSendEmailDigest = async () => {
    if (!user) return;
    await emailDigestService.sendDigest(user.email, user.name, tasks);
  };

  const filteredTasks = tasks.filter((task) =>
    activeTab === 'completed' ? task.completed : !task.completed
  );

  const handleToggle = (id: string, completed: boolean) => toggleMutation.mutate({ id, completed });
  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const handleEdit = (task: Task) => router.push(`/(app)/tasks/${task.id}`);
  const openCreateModal = () => router.push('/(app)/tasks/new');

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="h2" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.sm }}>
          {activeTab === 'pending' ? 'All caught up!' : 'No completed tasks yet.'}
        </Typography>
        <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center' }}>
          {activeTab === 'pending'
            ? 'Tap the + button below to create a new task.'
            : 'Check off some pending tasks to see them here.'}
        </Typography>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, theme.spacing.xl) }]}>
        <View style={styles.titleRow}>
          <Typography variant="h1" style={styles.headerTitle}>Your Tasks</Typography>
          
          <Button
            title="Digest"
            variant="outline"
            size="sm"
            icon={<Mail size={16} color={theme.colors.primary} />}
            onPress={handleSendEmailDigest}
            disabled={isLoading}
            style={styles.digestButton}
          />
        </View>

        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Typography
              variant="body"
              color={activeTab === 'pending' ? theme.colors.surface : theme.colors.textMuted}
              style={{ fontWeight: activeTab === 'pending' ? '600' : '400' }}
            >
              Pending
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Typography
              variant="body"
              color={activeTab === 'completed' ? theme.colors.surface : theme.colors.textMuted}
              style={{ fontWeight: activeTab === 'completed' ? '600' : '400' }}
            >
              Completed
            </Typography>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SwipeableRow
              onToggle={() => handleToggle(item.id, !item.completed)}
              onDelete={() => handleDelete(item.id)}
              isCompleted={item.completed}
            >
              <TaskCard task={item} onPress={() => handleEdit(item)} />
            </SwipeableRow>
          )}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor={theme.colors.primary} />
          }
        />
      )}

      <Pressable style={styles.fab} onPress={openCreateModal}>
        <Plus color={theme.colors.surface} size={32} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {},
  digestButton: {
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Segmented Control Styles
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radii.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // List Styles
  listContent: {
    flexGrow: 1,
    paddingBottom: 100, 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 60,
    height: 60,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});