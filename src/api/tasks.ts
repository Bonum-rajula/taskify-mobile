// src/api/tasks.ts
import { apiClient } from './client';
import { Task } from '@/types/models';

// ============================================================================
// DTOs (Data Transfer Objects)
// We define exactly what the backend expects for mutations.
// ============================================================================

export interface CreateTaskPayload {
  title: string;
  description: string;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string | null;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const tasksApi = {
  /**
   * Fetches all tasks for the currently authenticated user.
   */
  fetchTasks: async (): Promise<Task[]> => {
    // Note: Assuming the backend returns an array directly or wraps it in { tasks: [] }
    const response = await apiClient.get('/tasks');
    return response.data.tasks || response.data;
  },

  /**
   * Creates a new task.
   */
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await apiClient.post('/tasks', payload);
    return response.data.task || response.data;
  },

  /**
   * Updates an existing task's details.
   */
  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${id}`, payload);
    return response.data.task || response.data;
  },

  /**
   * Specifically handles the quick-toggle action for completions.
   * Separating this from updateTask keeps our UI swipe-gesture logic extremely clean.
   */
  toggleTask: async (id: string, completed: boolean): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${id}`, { completed });
    return response.data.task || response.data;
  },

  /**
   * Permanently deletes a task.
   */
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};