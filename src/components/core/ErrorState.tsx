// ErrorState — Reusable error display with friendly message + retry button
// Used for async operation failures (storybook generation, media loading, etc.)

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../styles/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ErrorState({
  title = 'That did not work',
  message,
  retryLabel = 'Try again',
  onRetry,
  icon = 'alert-circle-outline',
}: ErrorStateProps) {
  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onRetry?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={44} color={colors.purple} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={handleRetry}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.purple} />
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 12,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.purple + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.purple + '15',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
  },
  retryButtonPressed: {
    backgroundColor: colors.purple + '25',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.purple,
  },
});
