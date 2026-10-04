import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ambler.notification-preferences.v1';

export interface NotificationPreferences {
  storyReady: boolean;
  newContributions: boolean;
  eventReminders: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  storyReady: true,
  newContributions: true,
  eventReminders: true,
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultNotificationPreferences;
  try {
    return { ...defaultNotificationPreferences, ...(JSON.parse(raw) as Partial<NotificationPreferences>) };
  } catch {
    return defaultNotificationPreferences;
  }
}

export async function saveNotificationPreferences(value: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}
