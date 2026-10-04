import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { gradients } from '../../src/styles/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase } from '../../src/lib/supabase';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function ProfileSetup() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { user, completeProfile, isLoading, error } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Entrance animations
  const headerOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const headerY = useSharedValue(reduceMotion ? 0 : 20);
  const avatarOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const avatarScale = useSharedValue(reduceMotion ? 1 : 0.5);
  const inputOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const inputY = useSharedValue(reduceMotion ? 0 : 20);
  const buttonOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const buttonY = useSharedValue(reduceMotion ? 0 : 20);

  React.useEffect(() => {
    if (reduceMotion) return;
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    avatarOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    avatarScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    inputOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    inputY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    buttonY.value = withDelay(600, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [reduceMotion]);

  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const handleChooseAvatar = async () => {
    setAvatarError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError('Photo access is needed to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0]?.uri ?? null);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!user || !avatarUri || avatarUri === user.avatarUrl) return avatarUri;

    const response = await fetch(avatarUri);
    const blob = await response.blob();
    const extension = avatarUri.split('.').pop()?.split('?')[0] || 'jpg';
    const storagePath = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setAvatarError(null);
    try {
      const avatarUrl = await uploadAvatar();
      await completeProfile(displayName.trim() || user?.displayName || 'Ambler User', avatarUrl);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Avatar upload failed');
    }
    // Navigation handled by _layout auth guard
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));
  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ translateY: inputY.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  return (
    <LinearGradient
      colors={gradients.hero as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Header */}
        <Animated.View style={[styles.headerWrap, headerStyle]}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>This is how guests will see you in storybooks.</Text>
        </Animated.View>

        <Animated.View style={[styles.avatarWrap, avatarStyle]}>
          <Pressable onPress={handleChooseAvatar} style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </Pressable>
          <Pressable onPress={handleChooseAvatar}>
            <Text style={styles.avatarHint}>Choose photo</Text>
          </Pressable>
        </Animated.View>

        {/* Display Name Input */}
        <Animated.View style={[styles.inputWrap, inputStyle]}>
          <Text style={styles.inputLabel}>Display name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </Animated.View>

        {(error || avatarError) && <Text style={styles.errorText}>{avatarError ?? error}</Text>}

        {/* Start Button */}
        <Animated.View style={[styles.buttonWrap, buttonStyle]}>
          <Pressable
            onPress={handleStart}
            disabled={isLoading}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <LinearGradient
              colors={gradients.vibe as [string, string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : 'Start creating'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  headerWrap: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
  },
  avatarHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrap: {
    gap: 8,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonWrap: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
});
