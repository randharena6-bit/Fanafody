import { Platform } from 'react-native';
import { Medication } from './api';

let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
} catch {}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const isSupported = Platform.OS !== 'web' && Notifications;

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isWithinDateRange(start_date: string, end_date: string): boolean {
  const today = todayDateString();
  if (today < start_date) return false;
  if (end_date && today > end_date) return false;
  return true;
}

export async function requestPermissions(): Promise<boolean> {
  if (!isSupported) return true;
  const { status: existing } = await Notifications!.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications!.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleMedicationReminder(medication: Medication): Promise<void> {
  if (!isSupported) return;
  await cancelMedicationReminder(medication.id);

  if (!isWithinDateRange(medication.start_date, medication.end_date)) return;

  const [hours, minutes] = medication.time.split(':').map(Number);

  await Notifications!.scheduleNotificationAsync({
    content: {
      title: 'Rappel Fanafody',
      body: `Il est temps de prendre ${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''}`,
      data: { medicationId: medication.id },
      sound: true,
    },
    trigger: {
      type: Notifications!.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function cancelMedicationReminder(medicationId: number): Promise<void> {
  if (!isSupported) return;
  const scheduled = await Notifications!.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.medicationId === medicationId) {
      await Notifications!.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (!isSupported) return;
  await Notifications!.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAllReminders(medications: Medication[]): Promise<void> {
  if (!isSupported) return;
  for (const med of medications) {
    await scheduleMedicationReminder(med);
  }
}

export async function setupNotificationCategories(): Promise<void> {
  if (!isSupported) return;
  await Notifications!.setNotificationCategoryAsync('medication_actions', [
    {
      identifier: 'taken',
      buttonTitle: 'Pris',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'skipped',
      buttonTitle: 'Ignoré',
      options: { opensAppToForeground: false },
    },
  ]);
}
