// app/(app)/tasks/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarIcon, XCircle } from 'lucide-react-native';
import { format } from 'date-fns';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
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
  
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Hydrate form if editing
  useEffect(() => {
    if (isEditMode) {
      const cachedTasks = queryClient.getQueryData<Task[]>(TASK_QUERY_KEY);
      const taskToEdit = cachedTasks?.find((t) => t.id === id);
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        if (taskToEdit.dueDate) {
          setDueDate(new Date(taskToEdit.dueDate));
        }
      }
    } else {
      setTitle('');
      setDescription('');
      setDueDate(null);
      setError(null);
    }
  }, [id, isEditMode, queryClient]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Prepare the exact DTO required by the backend
    const payload = {
      title,
      description,
      dueDate: dueDate ? dueDate.toISOString() : null,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id as string, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.back(); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
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

              {/* TARGET COMPLETION DATE SELECTOR */}
              <View style={styles.dateGroup}>
                <Typography variant="body" style={styles.label}>Target Completion Date</Typography>

                {Platform.OS === 'web' ? (
                  /* WEB FALLBACK: Native HTML DOM Input */
                  <View style={styles.dateRow}>
                    <input
                      type="date"
                      value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                      onChange={(e: any) => {
                        if (e.target.value) {
                          // Appending T12:00:00 prevents nasty web timezone offset bugs
                          setDueDate(new Date(`${e.target.value}T12:00:00`)); 
                        } else {
                          setDueDate(null);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        fontSize: '14px',
                        color: dueDate ? '#0F172A' : '#94A3B8',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </View>
                ) : (
                  /* MOBILE: Native iOS/Android Pressable & Modal */
                  <View style={styles.dateRow}>
                    <Pressable
                      style={styles.dateSelector}
                      onPress={() => setShowDatePicker(true)}
                      disabled={isLoading}
                    >
                      <CalendarIcon color={theme.colors.primary} size={20} style={{ marginRight: 8 }} />
                      <Typography 
                        variant="body" 
                        color={dueDate ? '#0F172A' : theme.colors.textMuted}
                      >
                        {dueDate ? format(dueDate, 'MMM d, yyyy') : 'No deadline set'}
                      </Typography>
                    </Pressable>

                    {/* Clear Date Button */}
                    {dueDate && (
                      <Pressable onPress={() => setDueDate(null)} style={styles.clearDateBtn}>
                        <XCircle color={theme.colors.textMuted} size={20} />
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Only render the native modal if we are NOT on web */}
                {showDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>

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
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    color: '#0F172A',
  },
  dateGroup: {
    marginBottom: theme.spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  clearDateBtn: {
    padding: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});