import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { Storybook, StorybookPage } from '../../../types';
import type { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';

interface SharePageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
  storybookId?: string;
  publicMode?: boolean;
  storybook: Storybook;
}

export function SharePage({ page, themePreset, publicMode = false, storybook }: SharePageProps) {
  const tc = themePreset.colors;
  const exportFormats = (page.data.exportFormats as string[]) ?? [];

  const printStory = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const downloadStorySummary = () => {
    if (typeof window === 'undefined') return;
    const lines = [storybook.title, '', ...storybook.pages.flatMap((storyPage, index) => [
      `${index + 1}. ${storyPage.title}`,
      storyPage.subtitle ?? '',
      '',
    ])];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href; anchor.download = `${storybook.title || 'ambler-story'}.txt`; anchor.click();
    URL.revokeObjectURL(href);
  };

  const shareCurrentPage = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: page.title || 'Ambler story', text: 'Relive this Ambler story', url });
        return;
      }
      await navigator.clipboard?.writeText(url);
      window.alert('Story link copied.');
    } catch {
      // Native browser share sheets can be cancelled; that is not an error state.
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}> 
      <View style={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: tc.surface,
              borderRadius: themePreset.card.borderRadius + 4,
              borderWidth: themePreset.card.borderWidth,
              borderColor: themePreset.card.borderColor,
            },
          ]}
        >
          <LinearGradient
            colors={themePreset.overlayGradient.colors}
            start={themePreset.overlayGradient.start}
            end={themePreset.overlayGradient.end}
            style={[styles.cardGradient, { borderRadius: themePreset.card.borderRadius }]}
          >
            <Text style={styles.cardKicker}>AMBLER</Text>
            <Text style={[styles.cardTitle, { fontWeight: themePreset.typography.titleWeight }]}>{page.title}</Text>
            <Text style={styles.cardSubtitle}>{page.subtitle}</Text>
          </LinearGradient>
        </View>

        <Text style={[styles.readyText, { color: tc.text }]}>Your storybook is ready</Text>
        <Text style={[styles.prompt, { color: tc.textMuted }]}>
          {publicMode
            ? 'A private Ambler story, shared with you by someone who was there.'
            : 'Your memories are saved. Open the Ambler app to manage private links and exports.'}
        </Text>

        <View style={styles.buttonStack}>
          {publicMode ? (
            <Pressable onPress={shareCurrentPage} style={[styles.shareButton, { backgroundColor: tc.surface, borderColor: themePreset.card.borderColor }]}>
              <Text style={[styles.shareButtonText, { color: tc.text }]}>Share this story</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={printStory} style={[styles.shareButton, { backgroundColor: tc.surface, borderColor: themePreset.card.borderColor }]}>
            <Text style={[styles.shareButtonText, { color: tc.text }]}>Print / Save as PDF</Text>
          </Pressable>
          {!publicMode ? (
            <Pressable onPress={downloadStorySummary} style={[styles.shareButton, { backgroundColor: tc.surface, borderColor: themePreset.card.borderColor }]}>
              <Text style={[styles.shareButtonText, { color: tc.text }]}>Download story summary</Text>
            </Pressable>
          ) : null}
        </View>

        {exportFormats.length > 0 ? (
          <Text style={[styles.formats, { color: tc.textMuted }]}>Formats: {exportFormats.join(' · ')}</Text>
        ) : null}
        <Text style={[styles.footer, { color: tc.textMuted }]}>AMBLER · EVERYONE’S VIEW OF THE STORY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 44, justifyContent: 'center', gap: 20 },
  card: { padding: 10 },
  cardGradient: { minHeight: 210, padding: 32, justifyContent: 'center', alignItems: 'center' },
  cardKicker: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 2.5, marginBottom: 14 },
  cardTitle: { color: 'white', fontSize: 38, lineHeight: 42, textAlign: 'center' },
  cardSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  readyText: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  prompt: { fontSize: 14, lineHeight: 21, fontWeight: '600', textAlign: 'center' },
  buttonStack: { gap: 10 },
  shareButton: { minHeight: 54, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  shareButtonText: { fontSize: 15, fontWeight: '900' },
  formats: { fontSize: 12, textAlign: 'center', opacity: 0.7 },
  footer: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center', marginTop: 12 },
});
