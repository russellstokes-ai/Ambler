import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/styles/theme';
import { defaultNotificationPreferences, loadNotificationPreferences, NotificationPreferences, saveNotificationPreferences } from '../../src/features/preferences/preferencesService';

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultNotificationPreferences);
  useEffect(() => { loadNotificationPreferences().then(setPrefs).catch(() => {}); }, []);

  const set = (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveNotificationPreferences(next).catch(() => {});
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable><Text style={styles.title}>Notifications</Text></View>
      <Text style={styles.intro}>Choose which Ambler moments should get your attention. These preferences are ready for push delivery when the production notification channel is enabled.</Text>
      <View style={styles.card}>
        <Row title="Story ready" body="When Ambler has finished building an event story." value={prefs.storyReady} onValueChange={(v) => set('storyReady', v)} />
        <Row title="New contributions" body="When guests add moments to an event you organise." value={prefs.newContributions} onValueChange={(v) => set('newContributions', v)} />
        <Row title="Event reminders" body="Useful prompts around upcoming and active events." value={prefs.eventReminders} onValueChange={(v) => set('eventReminders', v)} />
      </View>
    </View>
  );
}

function Row({ title, body, value, onValueChange }: { title: string; body: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return <View style={styles.row}><View style={styles.rowText}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowBody}>{body}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.purple }} /></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.soft, paddingHorizontal: 20 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 }, back: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }, title: { color: colors.ink, fontSize: 28, fontWeight: '900' }, intro: { color: colors.muted, fontSize: 14, lineHeight: 21, fontWeight: '600', marginBottom: 18 }, card: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 22, overflow: 'hidden' }, row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 17, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, rowText: { flex: 1, gap: 4 }, rowTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' }, rowBody: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: '600' } });
