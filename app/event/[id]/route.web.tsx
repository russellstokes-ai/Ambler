import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocationStore } from '../../../src/stores/locationStore';
import { useEventStore } from '../../../src/stores/eventStore';
import { RouteSummaryCard } from '../../../src/components/location/RouteSummaryCard';
import { colors } from '../../../src/styles/theme';

export default function RouteCaptureWebScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const route = useLocationStore((state) => state.routeByEvent[id ?? ''] ?? []);
  const activeEvent = useEventStore((state) => state.activeEvent);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={21} color={colors.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>ROUTE REPLAY</Text>
            <Text style={styles.title}>Route capture lives in the Ambler app.</Text>
            <Text style={styles.subtitle}>
              Web stories can replay and explore routes, but live GPS recording stays on your phone for reliability, privacy and battery control.
            </Text>
          </View>
        </View>

        <LinearGradient colors={['#061822','#0F4C55','#5B2CFF']} style={styles.hero}>
          <View style={styles.glow} />
          <View style={styles.routeA} /><View style={styles.routeB} /><View style={styles.routeDot} />
          <View style={styles.heroIcon}><Ionicons name="navigate-outline" size={31} color="#FFFFFF" /></View>
          <View>
            <Text style={styles.heroEyebrow}>{activeEvent?.title ?? 'THIS EVENT'}</Text>
            <Text style={styles.heroTitle}>{route.length ? 'Your captured route is available here.' : 'Open this event on your phone to start Route Replay.'}</Text>
            <Text style={styles.heroMeta}>{route.length ? `${route.length} route marks saved` : 'Private event route · mobile capture only'}</Text>
          </View>
        </LinearGradient>

        {route.length ? (
          <RouteSummaryCard route={route} />
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}><Ionicons name="phone-portrait-outline" size={23} color={colors.purple} /></View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Continue on your phone</Text>
              <Text style={styles.infoText}>Open Ambler, enter this event and choose Route Replay. Your browser remains useful for shared story viewing and editing.</Text>
            </View>
          </View>
        )}

        <View style={styles.privacyCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.purple} />
          <Text style={styles.privacyText}>Ambler never starts browser location tracking automatically. Route capture requires an explicit mobile event action.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6FC' },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', padding: 24, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  backButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E1F8', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, gap: 5 },
  eyebrow: { color: colors.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: '600', maxWidth: 700 },
  hero: { minHeight: 260, borderRadius: 30, padding: 22, overflow: 'hidden', justifyContent: 'space-between' },
  glow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, right: -80, top: -100, backgroundColor: 'rgba(24,199,213,0.16)' },
  routeA: { position: 'absolute', width: 190, height: 4, borderRadius: 2, right: 28, top: 118, backgroundColor: 'rgba(255,255,255,0.18)', transform: [{ rotate: '-22deg' }] },
  routeB: { position: 'absolute', width: 120, height: 4, borderRadius: 2, right: 86, top: 163, backgroundColor: '#18C7D5', transform: [{ rotate: '15deg' }] },
  routeDot: { position: 'absolute', right: 100, top: 141, width: 15, height: 15, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#18C7D5' },
  heroIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.11)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  heroEyebrow: { color: 'rgba(255,255,255,0.52)', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 6 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 30, fontWeight: '900', maxWidth: 560 },
  heroMeta: { color: 'rgba(255,255,255,0.66)', fontSize: 11, fontWeight: '700', marginTop: 7 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E8E1F8', padding: 18, flexDirection: 'row', gap: 14, alignItems: 'center' },
  infoIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1, gap: 3 },
  infoTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  privacyCard: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: '#F2EDFF', borderWidth: 1, borderColor: '#E5DAFF' },
  privacyText: { flex: 1, color: '#5D4D79', fontSize: 11, lineHeight: 17, fontWeight: '700' },
});
