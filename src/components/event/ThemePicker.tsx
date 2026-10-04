import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { ThemePreviewCard, ThemePreviewData } from './ThemePreviewCard';
import { ThemeKey, universalThemeKeys } from '../../features/events/eventTypes';
import themeMatrix from '../../features/events/eventThemeMatrix.json';

// ─── Build theme lookup from matrix ───────────────────────────

const themeMap: Record<string, ThemePreviewData> = themeMatrix.themes.reduce(
  (acc, t) => {
    acc[t.key] = t as ThemePreviewData;
    return acc;
  },
  {} as Record<string, ThemePreviewData>
);

// ─── Props ────────────────────────────────────────────────────

interface ThemePickerProps {
  recommendedThemeKeys: ThemeKey[];
  selectedTheme: ThemeKey | null;
  onSelect: (theme: ThemeKey) => void;
}

// ─── Component ────────────────────────────────────────────────

export function ThemePicker({ recommendedThemeKeys, selectedTheme, onSelect }: ThemePickerProps) {
  const [showAll, setShowAll] = useState(false);
  const recommendedTheme = recommendedThemeKeys[0];

  const themesToShow: ThemeKey[] = useMemo(() => {
    if (showAll) return universalThemeKeys;
    return recommendedThemeKeys;
  }, [showAll, recommendedThemeKeys]);

  const handleSelect = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(key as ThemeKey);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>
          {showAll ? 'All themes' : 'Recommended themes'}
        </Text>
        <Pressable
          style={styles.toggle}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setShowAll(!showAll);
          }}
        >
          <Text style={styles.toggleText}>
            {showAll ? 'Show recommended' : 'See all themes'}
          </Text>
          <Ionicons
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#5B2CFF"
          />
        </Pressable>
      </View>

      {!showAll && (
        <Text style={styles.hint}>
          We picked the first theme for this event. You can change it anytime.
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {themesToShow.map((key) => {
          const data = themeMap[key];
          if (!data) return null;
          return (
            <ThemePreviewCard
              key={key}
              theme={data}
              selected={selectedTheme === key}
              recommended={key === recommendedTheme}
              onSelect={handleSelect}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#18122B',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5B2CFF',
  },
  hint: {
    fontSize: 13,
    color: '#746B8C',
    fontWeight: '600',
    lineHeight: 18,
  },
  scrollContent: {
    paddingRight: 20,
    paddingVertical: 4,
  },
});
