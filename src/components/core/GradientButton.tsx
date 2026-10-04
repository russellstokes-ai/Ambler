import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { gradients } from '../../styles/theme';

export function GradientButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={styles.wrap}
    >
      <LinearGradient colors={gradients.vibe as [string, string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  wrap: { borderRadius: 24, overflow: 'hidden' },
  button: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: 24, alignItems: 'center' },
  text: { color: 'white', fontSize: 16, fontWeight: '900' },
});
