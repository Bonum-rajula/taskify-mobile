// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Securely requests native OS permissions for push notifications.
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false; // YAGNI: Web push is outside assessment scope

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /**
   * Calculates the trigger time and lodges the notification with the OS.
   */
  async scheduleTaskReminder(taskId: string, title: string, dueDate: string) {
    if (Platform.OS === 'web') return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await this.cancelTaskReminder(taskId);

    const deadline = new Date(dueDate);
    const reminderTime = new Date(deadline.getTime() - 60 * 60 * 1000);

    if (reminderTime <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Deadline Approaching! ⏰',
        body: `Your task "${title}" is due in less than an hour.`,
        data: { taskId }, 
      },
       
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
      identifier: `task-${taskId}`, 
    });
  },

  /**
   * Silently removes a scheduled notification from the OS queue.
   */
  async cancelTaskReminder(taskId: string) {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
  }
};