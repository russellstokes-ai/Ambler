import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/styles/theme';

export default function AboutAmbler() {
  const insets = useSafeAreaInsets();
  return <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30, paddingHorizontal: 20 }}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable><Text style={styles.title}>About Ambler</Text></View>
    <View style={styles.hero}><Text style={styles.brand}>AMBLER</Text><Text style={styles.tagline}>Capture · Build · Relive</Text><Text style={styles.body}>Ambler brings everyone’s view of an event, trip, trail or shared activity into one finished story. It uses real moments, route data, captions and event context; generative narration is not required.</Text></View>
    <View style={styles.card}><Line label="Version" value="0.3.0" /><Line label="Story engine" value="Deterministic + data-driven" /><Line label="Sharing" value="Private token links" /><Line label="Guest contribution" value="QR / browser / no app required" /></View>
    <Text style={styles.footer}>Private-first storytelling for the scenic route.</Text>
  </ScrollView>;
}
function Line({ label, value }: { label: string; value: string }) { return <View style={styles.line}><Text style={styles.lineLabel}>{label}</Text><Text style={styles.lineValue}>{value}</Text></View>; }
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.soft }, header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }, back: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }, title: { color: colors.ink, fontSize: 28, fontWeight: '900' }, hero: { backgroundColor: colors.ink, borderRadius: 28, padding: 24, gap: 9, marginBottom: 18 }, brand: { color: 'white', fontSize: 34, fontWeight: '900', letterSpacing: 2 }, tagline: { color: '#CDBDFF', fontSize: 13, fontWeight: '900', letterSpacing: 1.2 }, body: { color: 'rgba(255,255,255,.78)', fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 8 }, card: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 22, overflow: 'hidden' }, line: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, lineLabel: { color: colors.muted, fontSize: 12, fontWeight: '800' }, lineValue: { color: colors.ink, fontSize: 12, fontWeight: '900', textAlign: 'right', flex: 1 }, footer: { color: colors.muted, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 18 } });
