import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeKey } from '../../types';
import { getThemePreset } from '../../styles/themePresets';

interface StorybookThemePreviewProps {
  themeKey: ThemeKey;
  sampleText: string;
  selected?: boolean;
}

export function StorybookThemePreview({ themeKey, sampleText, selected }: StorybookThemePreviewProps) {
  const preset = getThemePreset(themeKey);
  const tc = preset.colors;

  return (
    <View style={[styles.preview, { backgroundColor: tc.background }]}>
      <LinearGradient
        colors={preset.overlayGradient.colors}
        start={preset.overlayGradient.start}
        end={preset.overlayGradient.end}
        style={StyleSheet.absoluteFillObject}
      />

      {renderMotif(preset.preview.motif, preset)}

      <View
        style={[
          styles.cover,
          {
            backgroundColor: `${tc.surface}${Math.round(preset.card.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
            borderRadius: Math.min(18, preset.card.borderRadius),
            borderWidth: preset.card.borderWidth,
            borderColor: preset.card.borderColor,
          },
        ]}
      >
        <Text
          style={[
            styles.kicker,
            {
              color: tc.textMuted,
              letterSpacing: preset.typography.captionLetterSpacing,
            },
          ]}
        >
          {themeKey.replace('_', ' ')}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: tc.text,
              fontWeight: preset.typography.titleWeight,
              letterSpacing: preset.typography.titleLetterSpacing,
              textTransform: preset.typography.titleTransform,
            },
          ]}
          numberOfLines={3}
        >
          {sampleText}
        </Text>
      </View>

      <View style={styles.pageRail}>
        {[tc.primary, tc.secondary, tc.accent].map((color, index) => (
          <View
            key={`${color}-${index}`}
            style={[
              styles.pageDot,
              {
                backgroundColor: color,
                width: index === 0 ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {selected && <View style={[styles.selectedRing, { borderColor: tc.accent }]} />}
    </View>
  );
}

function renderMotif(motif: ReturnType<typeof getThemePreset>['preview']['motif'], preset: ReturnType<typeof getThemePreset>) {
  const tc = preset.colors;

  switch (motif) {
    case 'film':
      return (
        <View style={styles.filmBars}>
          <View style={[styles.filmBar, { backgroundColor: `${tc.text}24` }]} />
          <View style={[styles.filmBar, { backgroundColor: `${tc.text}24` }]} />
        </View>
      );
    case 'stickers':
      return (
        <>
          <View style={[styles.sticker, styles.stickerOne, { backgroundColor: tc.accent }]} />
          <View style={[styles.sticker, styles.stickerTwo, { backgroundColor: tc.primary }]} />
        </>
      );
    case 'stats':
      return (
        <View style={styles.statStack}>
          <Text style={[styles.bigNumber, { color: tc.accent }]}>24</Text>
          <View style={[styles.statLine, { backgroundColor: tc.primary }]} />
          <View style={[styles.statLine, { width: 36, backgroundColor: tc.secondary }]} />
        </View>
      );
    case 'route':
      return (
        <View style={styles.routeMotif}>
          <View style={[styles.routeLine, { backgroundColor: preset.mapPalette.route }]} />
          <View style={[styles.routePin, styles.routePinStart, { backgroundColor: preset.mapPalette.pin }]} />
          <View style={[styles.routePin, styles.routePinEnd, { backgroundColor: preset.mapPalette.route }]} />
        </View>
      );
    case 'gold':
      return <View style={[styles.goldRule, { backgroundColor: tc.accent }]} />;
    case 'grain':
      return (
        <View style={styles.filmStrip}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.filmFrame, { borderColor: tc.accent }]} />
          ))}
        </View>
      );
    case 'columns':
      return (
        <View style={styles.columns}>
          <View style={[styles.columnBlock, { backgroundColor: tc.primary }]} />
          <View style={[styles.columnBlock, { backgroundColor: tc.secondary }]} />
        </View>
      );
    case 'neon':
      return (
        <>
          <View style={[styles.neonSlash, { backgroundColor: tc.primary }]} />
          <View style={[styles.neonSlashAlt, { backgroundColor: tc.accent }]} />
        </>
      );
    case 'keepsake':
      return (
        <View style={[styles.keepsakeFrame, { borderColor: tc.secondary }]}>
          <View style={[styles.keepsakePhoto, { backgroundColor: tc.accent }]} />
        </View>
      );
    case 'whitespace':
    default:
      return <View style={[styles.minimalRule, { backgroundColor: tc.text }]} />;
  }
}

const styles = StyleSheet.create({
  preview: {
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
    justifyContent: 'flex-end',
  },
  cover: {
    minHeight: 78,
    padding: 10,
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    lineHeight: 15,
  },
  pageRail: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  pageDot: {
    height: 5,
    borderRadius: 99,
  },
  selectedRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderRadius: 12,
  },
  filmBars: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  filmBar: {
    height: 12,
  },
  sticker: {
    position: 'absolute',
    borderRadius: 99,
  },
  stickerOne: {
    width: 34,
    height: 34,
    top: 18,
    right: 16,
  },
  stickerTwo: {
    width: 22,
    height: 22,
    top: 48,
    left: 16,
  },
  statStack: {
    position: 'absolute',
    top: 18,
    left: 12,
  },
  bigNumber: {
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 40,
  },
  statLine: {
    width: 54,
    height: 7,
    borderRadius: 2,
    marginTop: 5,
  },
  routeMotif: {
    ...StyleSheet.absoluteFillObject,
  },
  routeLine: {
    position: 'absolute',
    left: 24,
    top: 28,
    width: 72,
    height: 5,
    borderRadius: 99,
    transform: [{ rotate: '32deg' }],
  },
  routePin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  routePinStart: {
    left: 22,
    top: 35,
  },
  routePinEnd: {
    right: 24,
    top: 72,
  },
  goldRule: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 34,
    height: 1,
  },
  filmStrip: {
    position: 'absolute',
    top: 14,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  filmFrame: {
    width: 20,
    height: 28,
    borderWidth: 2,
  },
  columns: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  columnBlock: {
    flex: 1,
    height: 58,
  },
  neonSlash: {
    position: 'absolute',
    width: 92,
    height: 18,
    top: 32,
    left: -8,
    transform: [{ rotate: '-18deg' }],
  },
  neonSlashAlt: {
    position: 'absolute',
    width: 76,
    height: 12,
    top: 64,
    right: -10,
    transform: [{ rotate: '18deg' }],
  },
  keepsakeFrame: {
    position: 'absolute',
    top: 18,
    left: 20,
    width: 54,
    height: 62,
    borderWidth: 3,
    transform: [{ rotate: '-4deg' }],
    padding: 5,
  },
  keepsakePhoto: {
    flex: 1,
  },
  minimalRule: {
    position: 'absolute',
    top: 34,
    left: 28,
    width: 44,
    height: 1,
  },
});
