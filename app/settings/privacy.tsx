// Settings/Privacy Screen — Privacy information, location consent, data deletion

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/styles/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function PrivacySettings() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { deleteAccount, user } = useAuthStore();

  const contentOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const contentY = useSharedValue(reduceMotion ? 0 : 20);

  React.useEffect(() => {
    if (reduceMotion) return;
    contentOpacity.value = withTiming(1, { duration: 500 });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [reduceMotion]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, events, photos, and storybooks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      {/* Back button */}
      <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Animated.View style={contentStyle}>
        {/* Title */}
        <Text style={styles.title}>Privacy & Data</Text>
        <Text style={styles.subtitle}>
          A clear look at what Ambler keeps and when you share it.
        </Text>

        {/* Privacy Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your data</Text>
          <Text style={styles.cardBody}>
            Ambler keeps your events, photos, and storybooks private by default. They are shared only when you choose to share them.
          </Text>
        </View>

        {/* Location Consent */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Replay</Text>
          <Text style={styles.cardBody}>
            Route Replay uses your location only for events where you turn it on. It helps create the map in your storybook and stays private to the event unless you share it.
          </Text>
          <Text style={styles.cardNote}>
            You can change this in your device settings at any time.
          </Text>
        </View>

        {/* Media Permissions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photos and videos</Text>
          <Text style={styles.cardBody}>
            We ask for photo and video access so you can choose what to add. Only the media you select is added to an event.
          </Text>
        </View>

        {/* Data Deletion */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delete your data</Text>
          <Text style={styles.cardBody}>
            You can delete your account at any time. This removes your profile, events, photos, and storybooks permanently.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete account</Text>
          </Pressable>
        </View>

        {/* Account info */}
        {user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.cardBody}>
              Signed in as {user.displayName} via {user.provider}.
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Ambler is committed to protecting your privacy. This is a summary — full details are in our Privacy Policy.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.soft,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    color: colors.purple,
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  cardBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  cardNote: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  deleteButton: {
    backgroundColor: '#FFEAEA',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  deleteButtonPressed: {
    backgroundColor: '#FFDADA',
  },
  deleteButtonText: {
    color: '#D11A2A',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});
