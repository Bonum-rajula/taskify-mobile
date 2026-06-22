// src/utils/emailDigest.ts
import * as MailComposer from 'expo-mail-composer';
import { Platform, Linking } from 'react-native';
import { Task } from '@/types/models';

export const emailDigestService = {
  /**
   * Compiles pending tasks into a gorgeous HTML summary and launches the native Mail client.
   */
  async sendDigest(userEmail: string, userName: string, allTasks: Task[]): Promise<boolean> {
    const pendingTasks = allTasks.filter(t => !t.completed);
    const subject = `📋 Outstanding Tasks Digest for ${userName || 'User'}`;
    const htmlBody = this.generateHtmlReport(pendingTasks, userName);

    // 1. Web Fallback Handler
    if (Platform.OS === 'web') {
      const plainText = this.generatePlainTextReport(pendingTasks, userName);
      const mailtoUrl = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
      window.open(mailtoUrl, '_blank');
      return true;
    }

    // 2. Native iOS/Android Handler
    const isComposerAvailable = await MailComposer.isAvailableAsync();

    if (isComposerAvailable) {
      try {
        const result = await MailComposer.composeAsync({
          recipients: [userEmail],
          subject,
          body: htmlBody,
          isHtml: true, // Render our rich HTML layout
        });
        return result.status === 'sent';
      } catch (err) {
        console.warn('Native composer rejected, falling back to deep link protocol...');
      }
    }

    // 3. Bare Simulator Fallback (Catches emulators with no mail accounts configured)
    const plainText = this.generatePlainTextReport(pendingTasks, userName);
    const fallbackUrl = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
    await Linking.openURL(fallbackUrl);
    return true;
  },

  /**
   * Generates a clean, mobile-responsive HTML document for modern mail viewports.
   */
  generateHtmlReport(tasks: Task[], userName: string): string {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' 
    });

    if (tasks.length === 0) {
      return `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2>🎉 All Caught Up!</h2>
          <p>Hello ${userName}, you have <strong>0</strong> pending tasks scheduled for ${today}. Enjoy your day!</p>
        </div>
      `;
    }

    const taskRows = tasks.map(t => {
      const due = t.dueDate ? `⏰ Due: ${new Date(t.dueDate).toLocaleDateString()}` : '⏳ No deadline';
      const desc = t.description ? `<p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">${t.description}</p>` : '';
      return `
        <li style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0;">
          <strong style="color: #0F172A; font-size: 16px;">${t.title}</strong>
          ${desc}
          <div style="color: #DC2626; font-size: 12px; font-weight: bold; margin-top: 8px;">${due}</div>
        </li>
      `;
    }).join('');

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 16px;">
        <h2 style="color: #4338CA; margin-bottom: 4px;">Taskify Executive Digest</h2>
        <p style="color: #475569; font-size: 14px; margin-top: 0;">Generated for <strong>${userName}</strong> on ${today}</p>
        <hr style="border: none; border-top: 1px solid #CBD5E1; margin: 20px 0;">
        <p style="color: #334155; font-size: 15px;">You have <strong>${tasks.length}</strong> outstanding task(s) requiring your attention:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          ${taskRows}
        </ul>
        <p style="font-size: 12px; color: #94A3B8; margin-top: 32px; text-align: center;">Sent securely from your Taskify Mobile Client.</p>
      </div>
    `;
  },

  /**
   * Generates a strictly formatted Markdown plain-text string for fallback mail dispatcher.
   */
  generatePlainTextReport(tasks: Task[], userName: string): string {
    let report = `# Taskify Executive Digest\nGenerated for ${userName}\n\n`;
    if (tasks.length === 0) return report + "🎉 You have 0 pending tasks!";

    tasks.forEach((t, i) => {
      const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline';
      report += `${i + 1}. [ ] **${t.title}** (Due: ${due})\n`;
      if (t.description) report += `    > ${t.description}\n`;
    });
    return report;
  }
};