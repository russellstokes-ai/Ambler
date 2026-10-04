// Welcome Screen — Full-screen gradient with 3 login buttons
// Animated entrance: logo scales in, buttons stagger up from bottom

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, colors } from '../../src/styles/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import type { AuthProvider } from '../../src/types';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { loginWithProvider, isLoading, error, clearError } = useAuthStore();

  // Animation values
  const logoScale = useSharedValue(reduceMotion ? 1 : 0.3);
  const logoOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const taglineOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const taglineY = useSharedValue(reduceMotion ? 0 : 20);
  const buttonContainerY = useSharedValue(reduceMotion ? 0 : 60);
  const buttonContainerOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const termsOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;

    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withTiming(1, { duration: 600 });

    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    taglineY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    buttonContainerOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    buttonContainerY.value = withDelay(700, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    termsOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
  }, [reduceMotion]);

  const handleLogin = async (provider: AuthProvider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    clearError();
    await loginWithProvider(provider);
    // Navigation is handled by _layout based on auth state
  };

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    opacity: buttonContainerOpacity.value,
    transform: [{ translateY: buttonContainerY.value }],
  }));

  const termsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: termsOpacity.value,
  }));

  return (
    <LinearGradient
      colors={gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.screen, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}
    >
      {/* Logo / App Name */}
      <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
        <Text style={styles.logo}>Ambler</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineWrap, taglineAnimatedStyle]}>
        <Text style={styles.tagline}>Every event becomes a beautiful storybook. Start yours.</Text>
      </Animated.View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Login Buttons */}
      <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
        <LoginButton
          label="Continue with Google"
          icon="G"
          iconColor="#4285F4"
          onPress={() => handleLogin('google')}
          loading={isLoading}
        />
        <LoginButton
          label="Continue with Facebook"
          icon="f"
          iconColor="#1877F2"
          onPress={() => handleLogin('facebook')}
          loading={isLoading}
        />
        <LoginButton
          label="Continue with Apple"
          icon=""
          iconColor="#FFFFFF"
          onPress={() => handleLogin('apple')}
          loading={isLoading}
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </Animated.View>

      {/* Terms */}
      <Animated.View style={[styles.termsWrap, termsAnimatedStyle]}>
        <Text style={styles.terms}>
          By continuing you agree to our Terms and Privacy Policy
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ─── Login Button Component ───────────────────────────────────

interface LoginButtonProps {
  label: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  loading: boolean;
}

function LoginButton({ label, icon, iconColor, onPress, loading }: LoginButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
    >
      <View style={styles.loginButtonInner}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.ink} />
        ) : (
          <Text style={[styles.loginIcon, { color: iconColor }]}>{icon}</Text>
        )}
        <Text style={styles.loginText}>{label}</Text>
        <View style={styles.loginIconSpacer} />
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  taglineWrap: {
    alignItems: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loginButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    transform: [{ scale: 0.97 }],
  },
  loginButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginIcon: {
    fontSize: 22,
    fontWeight: '900',
    width: 28,
    textAlign: 'center',
  },
  loginText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },
  loginIconSpacer: {
    width: 28,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  termsWrap: {
    alignItems: 'center',
  },
  terms: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
