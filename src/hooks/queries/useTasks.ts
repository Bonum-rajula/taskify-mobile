// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, CreateTaskPayload, UpdateTaskPayload } from '@/api/tasks';
import { Task } from '@/types/models';

// ============================================================================
// SINGLE CHOICE PRINCIPLE (SCR)
// The Master Query Key. Every single cache read/write references this exact array.
// ============================================================================
export const TASK_QUERY_KEY = ['tasks'] as const;

/**
 * 1. Fetches and automatically caches the user's task list.
 */
export function useTasksQuery() {
  return useQuery<Task[]>({
    queryKey: TASK_QUERY_KEY,
    queryFn: tasksApi.fetchTasks,
  });
}

/**
 * 2. Creates a new task and triggers a background refetch of the list.
 */
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.createTask(payload),
    onSuccess: () => {
      // Instantly marks the cached task list as stale, forcing UI synchronization
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
    },
  });
}

/**
 * 3. Updates general task details (Title, Description, Due Date).
 */
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      tasksApi.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
    },
  });
}

/**
 * 4. Dedicated quick-toggle for completions (Optimized for swipe gestures).
 */
export function useToggleTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      tasksApi.toggleTask(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
    },
  });
}

/**
 * 5. Permanently deletes a task from the database.
 */
export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });
    },
  });
}