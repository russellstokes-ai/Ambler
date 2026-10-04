import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Storybook, StorybookPage } from '../../../src/types';
import { colors } from '../../../src/styles/theme';
import { ThemeKey, universalThemeKeys } from '../../../src/features/events/eventTypes';
import {
  EditableStorybookRecord,
  hideLocationFromStory,
  hidePersonFromStory,
  loadEditableStorybook,
  movePage,
  promoteMediaToCover,
  removeMediaFromStory,
  saveEditableStorybook,
  updatePageCopy,
  updateRenderedCaption,
  updateStoryMusic,
  regenerateStorySection,
  replaceStorySection,
} from '../../../src/features/storybook/storybookEditor';
import { musicService } from '../../../src/features/music/musicService';

const THEME_LABELS: Record<ThemeKey, string> = {
  cinematic: 'Cinematic', social_story: 'Social', wrapped: 'Wrapped', route_replay: 'Route', luxe: 'Luxe',
  confetti: 'Confetti', neon_pulse: 'Neon', warm_gold: 'Warm', retro_film: 'Retro', magazine: 'Magazine',
  chaos: 'Chaos', family_keepsake: 'Keepsake', minimal: 'Minimal',
};

type MediaRef = { id: string; uri?: string; uploaderName?: string; [key: string]: unknown };

export default function StorybookEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<EditableStorybookRecord | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>('cover');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [hideLocation, setHideLocation] = useState('');
  const [hidePerson, setHidePerson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadEditableStorybook(id)
      .then((loaded) => {
        setRecord(loaded);
        const first = loaded.storybook.pages[0];
        if (first) {
          setSelectedPageId(first.id);
          setTitle(first.title);
          setSubtitle(first.subtitle ?? '');
        }
      })
      .catch((error) => Alert.alert('Could not edit story', error instanceof Error ? error.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedPage = record?.storybook.pages.find((page) => page.id === selectedPageId) ?? null;
  const media = useMemo(() => selectedPage ? extractMedia(selectedPage) : [], [selectedPage]);
  const tracks = useMemo(() => musicService.getAvailableTracks(), []);
  const renderedCaptions = useMemo(() => selectedPage?.type === 'friend_captions' && Array.isArray(selectedPage.data.captions)
    ? selectedPage.data.captions as Array<{ name?: string; text?: string }>
    : [], [selectedPage]);

  const selectPage = (page: StorybookPage) => {
    setSelectedPageId(page.id);
    setTitle(page.title);
    setSubtitle(page.subtitle ?? '');
  };

  const commitCopy = () => {
    if (!record || !selectedPage) return;
    const storybook = updatePageCopy(record.storybook, selectedPage.id, title.trim() || selectedPage.title, subtitle);
    setRecord({ ...record, storybook });
  };

  const updateStory = (storybook: Storybook) => record && setRecord({ ...record, storybook });

  const regenerateSelected = async () => {
    if (!record || !selectedPage || selectedPage.type === 'cover' || selectedPage.type === 'share') return;
    setRegenerating(true);
    try {
      const replacement = await regenerateStorySection(record.eventId, selectedPage.id);
      const storybook = replaceStorySection(record.storybook, selectedPage.id, replacement);
      setRecord({ ...record, storybook });
      setTitle(replacement.title);
      setSubtitle(replacement.subtitle ?? '');
      Alert.alert('Section refreshed', 'Ambler rebuilt this section from the original event data.');
    } catch (error) {
      Alert.alert('Could not refresh section', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const save = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const storybook = selectedPage ? updatePageCopy(record.storybook, selectedPage.id, title.trim() || selectedPage.title, subtitle) : record.storybook;
      const nextRecord = { ...record, storybook };
      await saveEditableStorybook(nextRecord, 'page_copy', { editedPage: selectedPageId });
      setRecord(nextRecord);
      Alert.alert('Saved', 'Your story changes are live.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !record) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={colors.purple} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}><Ionicons name="close" size={22} color={colors.ink} /></Pressable>
        <View style={styles.headerText}><Text style={styles.headerTitle}>Edit story</Text><Text style={styles.headerSubtitle}>Refine it — don’t rebuild it.</Text></View>
        <Pressable style={styles.saveButton} onPress={save} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={styles.sectionLabel}>STYLE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
          {universalThemeKeys.map((theme) => (
            <Pressable key={theme} style={[styles.themeChip, record.themeKey === theme && styles.themeChipActive]} onPress={() => setRecord({ ...record, themeKey: theme })}>
              <Text style={[styles.themeText, record.themeKey === theme && styles.themeTextActive]}>{THEME_LABELS[theme]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>MUSIC</Text>
        {tracks.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Soundtrack pack</Text>
            <Text style={styles.musicUnavailable}>Music is disabled in this build until commercially cleared tracks are bundled.</Text>
          </View>
        ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
          {tracks.map((track) => {
            const active = record.storybook.musicSelection?.trackId === track.id;
            return (
              <Pressable
                key={track.id}
                style={[styles.musicChip, active && styles.musicChipActive]}
                onPress={() => {
                  const selection = musicService.selectionForTrack(track.id);
                  if (selection) updateStory(updateStoryMusic(record.storybook, selection));
                }}
              >
                <Ionicons name="musical-note" size={14} color={active ? 'white' : colors.purple} />
                <View><Text style={[styles.musicTitle, active && styles.musicTitleActive]}>{track.trackName}</Text><Text style={[styles.musicMeta, active && styles.musicMetaActive]}>{track.category} · {track.bpm} BPM</Text></View>
              </Pressable>
            );
          })}
        </ScrollView>
        )}

        <Text style={styles.sectionLabel}>STORY ORDER</Text>
        <View style={styles.pageList}>
          {record.storybook.pages.map((page, index) => (
            <Pressable key={page.id} style={[styles.pageRow, selectedPageId === page.id && styles.pageRowActive]} onPress={() => selectPage(page)}>
              <View style={styles.pageNumber}><Text style={styles.pageNumberText}>{index + 1}</Text></View>
              <View style={styles.pageText}><Text style={styles.pageTitle} numberOfLines={1}>{page.title}</Text><Text style={styles.pageType}>{page.type.replaceAll('_', ' ')}</Text></View>
              <Pressable hitSlop={8} onPress={() => updateStory(movePage(record.storybook, page.id, -1))} disabled={index <= 1}><Ionicons name="chevron-up" size={20} color={index <= 1 ? '#CCC5D8' : colors.purple} /></Pressable>
              <Pressable hitSlop={8} onPress={() => updateStory(movePage(record.storybook, page.id, 1))} disabled={index >= record.storybook.pages.length - 2}><Ionicons name="chevron-down" size={20} color={index >= record.storybook.pages.length - 2 ? '#CCC5D8' : colors.purple} /></Pressable>
            </Pressable>
          ))}
        </View>

        {selectedPage ? (
          <>
            <Text style={styles.sectionLabel}>PAGE COPY</Text>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} onBlur={commitCopy} maxLength={90} />
              <Text style={styles.inputLabel}>Subtitle</Text>
              <TextInput style={[styles.input, styles.multiline]} value={subtitle} onChangeText={setSubtitle} onBlur={commitCopy} multiline maxLength={180} />
            </View>

            {selectedPage.type !== 'cover' && selectedPage.type !== 'share' ? (
              <Pressable style={styles.regenerateButton} onPress={regenerateSelected} disabled={regenerating}>
                <Ionicons name="sparkles" size={17} color={colors.purple} />
                <View style={styles.flex}><Text style={styles.regenerateTitle}>{regenerating ? 'Refreshing section…' : 'Regenerate this section'}</Text><Text style={styles.regenerateMeta}>Rebuild from the original event data; your other edits stay untouched.</Text></View>
              </Pressable>
            ) : null}

            {renderedCaptions.length ? (
              <>
                <Text style={styles.sectionLabel}>CAPTIONS IN THIS STORY</Text>
                <View style={styles.card}>
                  {renderedCaptions.map((caption, index) => (
                    <View key={`${caption.name ?? 'caption'}-${index}`} style={styles.captionEdit}>
                      <Text style={styles.inputLabel}>{caption.name || `Caption ${index + 1}`}</Text>
                      <TextInput
                        style={[styles.input, styles.multiline]}
                        value={caption.text ?? ''}
                        onChangeText={(text) => updateStory(updateRenderedCaption(record.storybook, selectedPage.id, index, text))}
                        multiline
                        maxLength={240}
                      />
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            {media.length ? (
              <>
                <Text style={styles.sectionLabel}>MOMENTS ON THIS PAGE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
                  {media.slice(0, 16).map((item) => (
                    <View key={item.id} style={styles.mediaCard}>
                      {item.uri ? <Image source={{ uri: item.uri }} style={styles.thumb} /> : <View style={[styles.thumb, styles.thumbFallback]} />}
                      <View style={styles.mediaActions}>
                        <Pressable onPress={() => updateStory(promoteMediaToCover(record.storybook, item))}><Text style={styles.mediaAction}>Cover</Text></Pressable>
                        <Pressable onPress={() => updateStory(removeMediaFromStory(record.storybook, item.id))}><Text style={[styles.mediaAction, styles.removeAction]}>Remove</Text></Pressable>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : null}

        <Text style={styles.sectionLabel}>PRIVACY EDITS</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Hide a location by its displayed name</Text>
          <View style={styles.inline}><TextInput style={[styles.input, styles.flex]} value={hideLocation} onChangeText={setHideLocation} placeholder="e.g. Home" /><Pressable style={styles.smallButton} onPress={() => { updateStory(hideLocationFromStory(record.storybook, hideLocation)); setHideLocation(''); }}><Text style={styles.smallButtonText}>Hide</Text></Pressable></View>
          <Text style={styles.inputLabel}>Hide a contributor from the finished story</Text>
          <View style={styles.inline}><TextInput style={[styles.input, styles.flex]} value={hidePerson} onChangeText={setHidePerson} placeholder="Name" /><Pressable style={styles.smallButton} onPress={() => { updateStory(hidePersonFromStory(record.storybook, hidePerson)); setHidePerson(''); }}><Text style={styles.smallButtonText}>Hide</Text></Pressable></View>
        </View>
      </ScrollView>
    </View>
  );
}

function extractMedia(page: StorybookPage): MediaRef[] {
  const found = new Map<string, MediaRef>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (typeof record.id === 'string' && (typeof record.uri === 'string' || typeof record.storagePath === 'string')) {
      found.set(record.id, record as MediaRef);
    }
    Object.values(record).forEach(walk);
  };
  walk(page.data);
  return [...found.values()];
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.soft },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: colors.line },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  headerText: { flex: 1 }, headerTitle: { fontSize: 20, fontWeight: '900', color: colors.ink }, headerSubtitle: { fontSize: 12, fontWeight: '600', color: colors.muted, marginTop: 2 },
  saveButton: { backgroundColor: colors.purple, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 }, saveText: { color: 'white', fontWeight: '900' },
  content: { padding: 18, gap: 12 }, sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginTop: 10 },
  themeRow: { gap: 8, paddingVertical: 4 }, themeChip: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 }, themeChipActive: { backgroundColor: colors.purple, borderColor: colors.purple }, themeText: { color: colors.ink, fontWeight: '800', fontSize: 12 }, themeTextActive: { color: 'white' },
  pageList: { gap: 8 }, pageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line }, pageRowActive: { borderColor: colors.purple, backgroundColor: '#F0EAFF' }, pageNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EDE7FA', alignItems: 'center', justifyContent: 'center' }, pageNumberText: { color: colors.purple, fontWeight: '900', fontSize: 11 }, pageText: { flex: 1 }, pageTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 }, pageType: { color: colors.muted, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: colors.line, gap: 8 }, inputLabel: { color: colors.muted, fontSize: 11, fontWeight: '800' }, input: { backgroundColor: colors.soft, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 11, color: colors.ink, fontWeight: '700' }, multiline: { minHeight: 76, textAlignVertical: 'top' },
  musicChip: { minWidth: 158, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  musicChipActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  musicTitle: { color: colors.ink, fontSize: 12, fontWeight: '900' }, musicTitleActive: { color: 'white' },
  musicMeta: { color: colors.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }, musicMetaActive: { color: 'rgba(255,255,255,0.72)' },
  regenerateButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0EAFE', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#D9CCFA' },
  regenerateTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 }, regenerateMeta: { color: colors.muted, fontWeight: '600', fontSize: 10, marginTop: 2 },
  captionEdit: { gap: 6, marginBottom: 8 },
  mediaRow: { gap: 10, paddingVertical: 4 }, mediaCard: { width: 120, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.line }, thumb: { width: 120, height: 110 }, thumbFallback: { backgroundColor: '#EDE7FA' }, mediaActions: { flexDirection: 'row', justifyContent: 'space-between', padding: 9 }, mediaAction: { color: colors.purple, fontSize: 11, fontWeight: '900' }, removeAction: { color: '#C93C5B' },
  inline: { flexDirection: 'row', gap: 8, alignItems: 'center' }, flex: { flex: 1 }, smallButton: { backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14 }, smallButtonText: { color: 'white', fontWeight: '900', fontSize: 12 },

  musicUnavailable: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
