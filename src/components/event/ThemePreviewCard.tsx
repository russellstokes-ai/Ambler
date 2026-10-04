import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ThemeKey } from '../../types';
import { StorybookThemePreview } from '../storybook/StorybookThemePreview';

// ─── Theme Preview Data ───────────────────────────────────────

export interface ThemePreviewData {
  key: string;
  label: string;
  premium: boolean;
  description: string;
  preview: {
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
    sampleText: string;
    layout: string;
    typography: string;
  };
}

interface ThemePreviewCardProps {
  theme: ThemePreviewData;
  selected: boolean;
  recommended?: boolean;
  onSelect: (key: string) => void;
}

// ─── Component ────────────────────────────────────────────────

export function ThemePreviewCard({ theme, selected, recommended = false, onSelect }: ThemePreviewCardProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withTiming(0.95, { duration: 150, easing: Easing.out(Easing.cubic) });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(theme.key);
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.container,
          selected && styles.containerSelected,
          animatedStyle,
        ]}
      >
        <View style={styles.previewWrap}>
          <StorybookThemePreview
            themeKey={theme.key as ThemeKey}
            sampleText={theme.preview.sampleText}
            selected={selected}
          />
          {selected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            </View>
          )}
          {recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>

        {/* Theme info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{theme.label}</Text>
            {theme.premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {theme.description}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const PREVIEW_WIDTH = 120;
const PREVIEW_HEIGHT = 180;

const styles = StyleSheet.create({
  container: {
    width: PREVIEW_WIDTH + 24,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 12,
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: '#5B2CFF',
    shadowColor: '#5B2CFF',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  previewWrap: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  recommendedBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFB02055',
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8A5A00',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5B2CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18122B',
  },
  premiumBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  premiumText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFB74D',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 10,
    color: '#746B8C',
    marginTop: 4,
    lineHeight: 14,
    fontWeight: '600',
  },
});
