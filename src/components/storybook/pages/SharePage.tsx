import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
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
import { Storybook, StorybookPage } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { saveStorybookCardToCameraRoll, sharePrivateStorybook } from '../../../features/sharing/shareService';
import { exportStorybookPdf } from '../../../features/sharing/storyExportService';

interface SharePageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
  storybookId?: string;
  publicMode?: boolean;
  storybook: Storybook;
}

interface ShareButtonProps {
  label: string;
  icon: string;
  disabled?: boolean;
  showSoon?: boolean;
  index: number;
  preset: ThemePreset;
  reduceMotion: boolean;
  onPress?: () => void;
}

function ShareButton({ label, icon, disabled, showSoon = false, index, preset, reduceMotion, onPress }: ShareButtonProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 24);

  const delayMs = 600 + index * 80;

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const tc = preset.colors;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPress={() => {
          if (disabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        style={[
          styles.shareButton,
          {
            backgroundColor: disabled ? `${tc.surface}55` : tc.surface,
            borderRadius: preset.card.borderRadius,
            borderWidth: preset.card.borderWidth,
            borderColor: disabled ? `${preset.card.borderColor}33` : preset.card.borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.shareIcon, { color: disabled ? tc.textMuted : tc.accent }]}>
          {icon}
        </Text>
        <Text
          style={[
            styles.shareLabel,
            { color: disabled ? tc.textMuted : tc.text },
          ]}
        >
          {label}
        </Text>
        {disabled && showSoon && (
          <Text style={[styles.disabledBadge, { color: tc.textMuted }]}>
            SOON
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function SharePage({ page, themePreset, storybookId, publicMode = false, storybook }: SharePageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handlePrivateLink = async () => {
    if (!storybookId || isSharing) {
      if (!storybookId) Alert.alert('Story is still finishing', 'Try sharing again in a moment.');
      return;
    }
    setIsSharing(true);
    try {
      await sharePrivateStorybook(storybookId);
    } catch (err) {
      Alert.alert('Could not share', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current || isSaving) return;
    setIsSaving(true);
    try {
      await saveStorybookCardToCameraRoll(cardRef.current);
      Alert.alert('Saved', 'The Ambler story card was saved to your photos.');
    } catch (err) {
      Alert.alert('Could not save image', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportStorybookPdf(storybook);
    } catch (err) {
      Alert.alert('Could not export PDF', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Card scale-in
  const cardScale = useSharedValue(reduceMotion ? 1 : 0.9);
  const cardOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    cardScale.value = 0.9;
    cardOpacity.value = 0;
    cardScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // "Your story is ready" fade
  const readyOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const readyScale = useSharedValue(reduceMotion ? 1 : 0.96);
  useEffect(() => {
    if (reduceMotion) return;
    readyOpacity.value = withDelay(900, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    readyScale.value = withDelay(900, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) }));
    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const readyStyle = useAnimatedStyle(() => ({
    opacity: readyOpacity.value,
    transform: [{ scale: readyScale.value }],
  }));

  const tc = themePreset.colors;
  const exportFormats = (page.data.exportFormats as string[]) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]}>
        {/* Share card preview */}
        <Animated.View
          ref={cardRef as any}
          style={[
            {
              backgroundColor: tc.surface,
              borderRadius: themePreset.card.borderRadius + 4,
              padding: 28,
              borderWidth: themePreset.card.borderWidth,
              borderColor: themePreset.card.borderColor,
              shadowColor: tc.primary,
              shadowOpacity: themePreset.card.shadowOpacity * 1.5,
              shadowRadius: themePreset.card.shadowRadius,
              shadowOffset: { width: 0, height: 16 },
              elevation: 8,
            },
            cardAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={themePreset.overlayGradient.colors}
            start={themePreset.overlayGradient.start}
            end={themePreset.overlayGradient.end}
            style={[styles.cardGradient, { borderRadius: themePreset.card.borderRadius }]}
          >
            <Text style={[styles.cardKicker, { letterSpacing: themePreset.typography.captionLetterSpacing + 1 }]}>AMBLER</Text>
            <Text
              style={[
                styles.cardEventTitle,
                {
                  fontSize: Math.min(36, themePreset.typography.titleSize * 0.68),
                  fontWeight: themePreset.typography.titleWeight,
                  letterSpacing: themePreset.typography.titleLetterSpacing,
                  textTransform: themePreset.typography.titleTransform,
                },
              ]}
            >
              {page.title}
            </Text>
            <Text style={[styles.cardSubtitle, { fontWeight: themePreset.typography.bodyWeight }]}>{page.subtitle}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Your story is ready */}
        <Animated.Text
          style={[
            styles.readyText,
            { color: tc.text },
            readyStyle,
          ]}
        >
          Your storybook is ready
        </Animated.Text>

        <Text style={[styles.sharePrompt, { color: tc.textMuted }]}>
          Your memories are saved. Share before they are forgotten.
        </Text>

        {/* Share buttons */}
        {publicMode ? (
          <View style={styles.publicNote}>
            <Text style={[styles.publicNoteTitle, { color: tc.text }]}>A shared Ambler story</Text>
            <Text style={[styles.publicNoteBody, { color: tc.textMuted }]}>This private link opens the story without requiring an account.</Text>
          </View>
        ) : (
          <View style={styles.shareButtons}>
            <ShareButton
              label={isSharing ? 'Creating link…' : 'Private link'}
              icon="🔗"
              index={0}
              preset={themePreset}
              reduceMotion={reduceMotion}
              disabled={isSharing}
              onPress={handlePrivateLink}
            />
            <ShareButton
              label={isSaving ? 'Saving…' : 'Save image'}
              icon="📸"
              index={1}
              preset={themePreset}
              reduceMotion={reduceMotion}
              disabled={isSaving}
              onPress={handleSaveImage}
            />
            <ShareButton
              label={isExporting ? "Building PDF…" : "Export PDF"}
              icon="📄"
              disabled={isExporting}
              index={2}
              preset={themePreset}
              reduceMotion={reduceMotion}
              onPress={handleExportPdf}
            />
          </View>
        )}

        {exportFormats.length > 0 && (
          <Text style={[styles.formats, { color: tc.textMuted }]}>
            Formats: {exportFormats.join(' · ')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    gap: 20,
  },
  cardGradient: {
    borderRadius: 24,
    padding: 28,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardKicker: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  cardEventTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  readyText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  sharePrompt: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareButtons: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    gap: 14,
  },
  shareIcon: {
    fontSize: 20,
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  disabledBadge: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  publicNote: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    gap: 6,
  },
  publicNoteTitle: { fontSize: 15, fontWeight: '900' },
  publicNoteBody: { fontSize: 12, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
  formats: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.6,
  },
});
