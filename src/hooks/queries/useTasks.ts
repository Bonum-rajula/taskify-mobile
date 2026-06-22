// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, CreateTaskPayload, UpdateTaskPayload } from '@/api/tasks';
import { Task } from '@/types/models';
import { notificationService } from '@/utils/notifications';


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
    onSuccess: (newTask) => {
      // Instantly marks the cached task list as stale, forcing UI synchronization
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });

      if (newTask.dueDate) {
        notificationService.scheduleTaskReminder(newTask.id, newTask.title, newTask.dueDate);
      }
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
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });

      if (updatedTask.dueDate && !updatedTask.completed) {
        notificationService.scheduleTaskReminder(updatedTask.id, updatedTask.title, updatedTask.dueDate);
      } else {
        notificationService.cancelTaskReminder(updatedTask.id);
      }
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
    onSuccess: (_, deletedTaskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY });

      notificationService.cancelTaskReminder(deletedTaskId);
    },
  });
}

