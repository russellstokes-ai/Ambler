import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients } from '../../src/styles/theme';
import { signInWithProvider } from '../../src/features/auth/authService';
import { useAuthStore } from '../../src/stores/authStore';
import type { AuthProvider } from '../../src/types';

export default function Login() {
  const params = useLocalSearchParams<{ provider?: string }>();
  const insets = useSafeAreaInsets();
  const { error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.provider) {
      // No provider — redirect back to welcome
      router.replace('/(auth)/welcome');
      return;
    }

    const provider = params.provider as AuthProvider;
    let cancelled = false;

    (async () => {
      try {
        clearError();
        await signInWithProvider(provider);
        if (!cancelled) {
          // Navigation handled by _layout auth guard
        }
      } catch (err) {
        if (!cancelled) {
          setLocalError(err instanceof Error ? err.message : 'We could not sign you in. Try again.');
          setTimeout(() => {
            if (!cancelled) router.replace('/(auth)/welcome');
          }, 2000);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.provider]);

  const displayError = localError ?? error;

  return (
    <LinearGradient
      colors={gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        {displayError ? (
          <>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Sign-in did not work</Text>
            <Text style={styles.errorMessage}>{displayError}</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingTitle}>Signing you in...</Text>
            <Text style={styles.loadingSubtitle}>Getting Ambler ready</Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 16,
  },
  loadingSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
