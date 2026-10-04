// Profile Screen — User info, settings link, logout button

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Image,
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

export default function Profile() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { user, logout, isLoading } = useAuthStore();

  const headerOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const headerY = useSharedValue(reduceMotion ? 0 : 20);
  const settingsOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const settingsY = useSharedValue(reduceMotion ? 0 : 20);
  const logoutOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const logoutY = useSharedValue(reduceMotion ? 0 : 20);

  React.useEffect(() => {
    if (reduceMotion) return;
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    settingsOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    settingsY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    logoutOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    logoutY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion]);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/settings/privacy');
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const settingsStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    transform: [{ translateY: settingsY.value }],
  }));
  const logoutStyle = useAnimatedStyle(() => ({
    opacity: logoutOpacity.value,
    transform: [{ translateY: logoutY.value }],
  }));

  const initials = user?.displayName
    ?.split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
    >
      {/* User Info */}
      <Animated.View style={[styles.headerCard, headerStyle]}>
        <View style={styles.avatarCircle}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>{initials}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName ?? 'Ambler User'}</Text>
          <Text style={styles.userProvider}>
            Signed in with {user?.provider ?? 'unknown'}
          </Text>
        </View>
      </Animated.View>

      {/* Settings Links */}
      <Animated.View style={[styles.settingsSection, settingsStyle]}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable
          style={({ pressed }) => [styles.settingsItem, pressed && styles.settingsItemPressed]}
          onPress={handleSettings}
        >
          <Text style={styles.settingsIcon}>🔒</Text>
          <Text style={styles.settingsLabel}>Privacy & Data</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </Pressable>
        <View style={styles.settingsDivider} />
        <Pressable
          style={({ pressed }) => [styles.settingsItem, pressed && styles.settingsItemPressed]}
          onPress={() => router.push('/settings/notifications')}
        >
          <Text style={styles.settingsIcon}>🔔</Text>
          <Text style={styles.settingsLabel}>Notifications</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </Pressable>
        <View style={styles.settingsDivider} />
        <Pressable
          style={({ pressed }) => [styles.settingsItem, pressed && styles.settingsItemPressed]}
          onPress={() => router.push('/settings/about')}
        >
          <Text style={styles.settingsIcon}>ℹ️</Text>
          <Text style={styles.settingsLabel}>About</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </Pressable>
      </Animated.View>

      {/* Logout */}
      <Animated.View style={logoutStyle}>
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutText}>
            {isLoading ? 'Logging out...' : 'Log out'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>Ambler v0.3.0</Text>
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
    paddingBottom: 32,
    gap: 24,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarInitials: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  userProvider: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingsSection: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  settingsItemPressed: {
    backgroundColor: colors.soft,
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsLabel: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  settingsArrow: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '700',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  logoutButtonPressed: {
    backgroundColor: colors.soft,
  },
  logoutText: {
    color: '#FF3B6B',
    fontSize: 16,
    fontWeight: '900',
  },
  version: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.6,
  },
});
