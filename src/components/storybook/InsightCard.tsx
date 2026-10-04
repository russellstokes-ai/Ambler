import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../../styles/theme';
import { StoryInsight } from '../../types';

export function InsightCard({ insight }: { insight: StoryInsight }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{insight.value}</Text>
      <Text style={styles.label}>{insight.label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, width: '47%', borderWidth: 1, borderColor: colors.line, ...shadow },
  value: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: 0 },
  label: { color: colors.muted, marginTop: 6, fontSize: 12, fontWeight: '800' },
});
