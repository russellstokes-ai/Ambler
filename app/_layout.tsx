// Root Layout — Auth Guard + Navigation Structure
// Checks auth state on mount and routes appropriately:
// - Not authenticated → welcome
// - Authenticated but no profile → profile-setup
// - Authenticated with profile → main app (tabs)

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-gesture-handler';
import { useAuthStore, hasSeenOnboarding } from '../src/stores/authStore';
import { gradients } from '../src/styles/theme';
import { AppErrorBoundary } from '../src/components/core/AppErrorBoundary';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate auth state on mount
  useEffect(() => {
    (async () => {
      await hydrate();
      const seenOnboarding = await hasSeenOnboarding();
      setShowOnboarding(!seenOnboarding);
      setIsHydrated(true);
    })();
  }, [hydrate]);

  // Auth guard — route based on auth state
  useEffect(() => {
    let cancelled = false;

    if (!isHydrated || isLoading || showOnboarding === null) return;

    const allSegments = segments as readonly string[];
    const inAuthGroup = allSegments[0] === '(auth)';
    const inOnboardingGroup = allSegments[0] === 'onboarding';
    const inPublicGuestRoute = allSegments[0] === 'join' || allSegments[0] === 'share' || allSegments[0] === 'ui-preview';

    // QR invites and token-gated shared stories must work without onboarding/login.
    if (inPublicGuestRoute) {
      return;
    }

    // Show onboarding on first launch
    if (showOnboarding) {
      if (!inOnboardingGroup) {
        hasSeenOnboarding().then((seenOnboarding) => {
          if (cancelled) return;

          if (seenOnboarding) {
            setShowOnboarding(false);
            return;
          }

          router.replace('/onboarding');
        });
      }

      return () => {
        cancelled = true;
      };
    }

    if (inOnboardingGroup) {
      return;
    }

    // Not authenticated → welcome
    if (!isAuthenticated) {
      if (!inAuthGroup && !inOnboardingGroup) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // Authenticated but profile not completed → profile-setup
    if (isAuthenticated && user && !user.profileCompleted) {
      const authRoute = allSegments.length > 1 ? allSegments[1] : '';
      if (inAuthGroup && authRoute !== 'profile-setup') {
        router.replace('/(auth)/profile-setup');
      } else if (!inAuthGroup && !inOnboardingGroup) {
        router.replace('/(auth)/profile-setup');
      }
      return;
    }

    // Authenticated with profile → main app
    if (isAuthenticated && user && user.profileCompleted) {
      if (inAuthGroup) {
        router.replace('/(tabs)/home');
      }
      return;
    }

    return () => {
      cancelled = true;
    };
  }, [isHydrated, isLoading, isAuthenticated, user, showOnboarding, segments, router]);

  // Loading splash
  if (!isHydrated || showOnboarding === null) {
    return (
      <LinearGradient
        colors={gradients.hero as [string, string, string]}
        style={styles.splash}
      >
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.splashTitle}>Ambler</Text>
      </LinearGradient>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="storybook" />
      <Stack.Screen name="join" />
      <Stack.Screen name="share" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="ui-preview" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 0.4,
  },
});

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <RootLayoutContent />
    </AppErrorBoundary>
  );
}
