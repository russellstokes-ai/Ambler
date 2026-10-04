// Index — redirects based on onboarding and auth state.

import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, hasSeenOnboarding } from '../src/stores/authStore';
import { gradients } from '../src/styles/theme';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    hasSeenOnboarding().then((hasSeen) => {
      if (mounted) {
        setSeenOnboarding(hasSeen);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (seenOnboarding === null) {
    return (
      <LinearGradient
        colors={gradients.hero as [string, string, string]}
        style={styles.splash}
      >
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  if (!seenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isAuthenticated && user && !user.profileCompleted) {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
