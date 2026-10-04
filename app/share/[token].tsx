import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StorybookPager } from '../../src/components/storybook/StorybookPager';
import { getPublicSharedStory } from '../../src/features/sharing/publicShareService';
import type { Storybook, ThemeKey } from '../../src/types';

export default function PublicSharedStoryScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>('cinematic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const link = await getPublicSharedStory(token);
      if (!link?.storybook) throw new Error('This story is unavailable or the link has expired.');
      setStorybook(link.storybook);
      setThemeKey((link.themeKey ?? 'cinematic') as ThemeKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this story.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  if (loading) {
    return (
      <LinearGradient colors={['#110724', '#2B0C5E', '#5B2CFF']} style={styles.center}>
        <ActivityIndicator color="white" size="large" />
        <Text style={styles.loadingTitle}>Opening this Ambler story…</Text>
      </LinearGradient>
    );
  }

  if (error || !storybook) {
    return (
      <SafeAreaView style={styles.errorScreen}>
        <View style={styles.errorCard}>
          <Text style={styles.brand}>AMBLER</Text>
          <Text style={styles.errorTitle}>This story can’t be opened.</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.sharedBadge} pointerEvents="none">
        <Text style={styles.sharedBadgeText}>SHARED WITH AMBLER</Text>
      </View>
      <StorybookPager storybook={storybook} themeKey={themeKey} publicMode />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 18 },
  errorScreen: { flex: 1, backgroundColor: '#F7F4FF', alignItems: 'center', justifyContent: 'center', padding: 22 },
  errorCard: { width: '100%', maxWidth: 520, backgroundColor: 'white', borderRadius: 28, padding: 28 },
  brand: { color: '#5B2CFF', fontSize: 11, fontWeight: '900', letterSpacing: 2.2 },
  errorTitle: { color: '#18122B', fontSize: 28, fontWeight: '900', marginTop: 12 },
  errorBody: { color: '#746B8C', fontSize: 15, lineHeight: 22, marginTop: 10 },
  retry: { backgroundColor: '#5B2CFF', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, alignSelf: 'flex-start', marginTop: 20 },
  retryText: { color: 'white', fontWeight: '900' },
  sharedBadge: { position: 'absolute', top: 12, alignSelf: 'center', zIndex: 20, backgroundColor: 'rgba(10,4,32,0.68)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sharedBadgeText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
});
