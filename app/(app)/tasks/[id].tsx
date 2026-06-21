// app/(app)/tasks/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DismissKeyboard } from '@/components/ui/DismissKeyboard';
import { theme } from '@/constants/theme';
import { useCreateTaskMutation, useUpdateTaskMutation, TASK_QUERY_KEY } from '@/hooks/queries/useTasks';
import { Task } from '@/types/models';

export default function TaskModalRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isEditMode = id !== 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Hydrate form if editing, PURGE form if creating
  useEffect(() => {
    if (isEditMode) {
      const cachedTasks = queryClient.getQueryData<Task[]>(TASK_QUERY_KEY);
      const taskToEdit = cachedTasks?.find((t) => t.id === id);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
      }
    } else {
      // Actively clear previous state when opening as "New Task"
      setTitle('');
      setDescription('');
      setError(null);
    }
  }, [id, isEditMode, queryClient]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id as string, payload: { title, description } });
      } else {
        await createMutation.mutateAsync({ title, description });
      }
      router.back(); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task.');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          presentation: 'modal', 
          title: isEditMode ? 'Edit Task' : 'New Task',
          headerShown: true 
        }} 
      />
      
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <DismissKeyboard>
          <View style={styles.inner}>
            <View style={styles.form}>
              <Input
                label="Task Title"
                placeholder="Buy groceries"
                value={title}
                onChangeText={(text) => { setTitle(text); if (error) setError(null); }}
                editable={!isLoading}
                error={error || undefined}
              />

              <Input
                label="Description (Optional)"
                placeholder="Milk, eggs, and bread..."
                value={description}
                onChangeText={setDescription}
                editable={!isLoading}
                multiline
                style={styles.textArea}
              />

              {/* Side-by-Side Action Buttons */}
              <View style={styles.actionRow}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => router.back()}
                  style={styles.actionButton}
                  disabled={isLoading}
                />
                <Button
                  title={isEditMode ? 'Save Changes' : 'Create Task'}
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  style={styles.actionButton}
                />
              </View>

            </View>
          </View>
        </DismissKeyboard>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});