import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { joinEventAsGuest, joinEvent, VibeEventRecord } from '../features/events/eventService';
import { addEventCaption } from '../features/contributions/contributionService';
import { UploadButton } from '../components/media/UploadButton';
import { UploadProgress } from '../components/media/UploadProgress';
import { useMediaStore } from '../stores/mediaStore';
import { useAuthStore } from '../stores/authStore';

export default function GuestJoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const inviteCode = (code ?? '').toUpperCase();
  const currentUser = useAuthStore((state) => state.user);
  const [name, setName] = useState(currentUser?.displayName ?? '');
  const [event, setEvent] = useState<VibeEventRecord | null>(null);
  const [caption, setCaption] = useState('');
  const [joining, setJoining] = useState(false);
  const [savingCaption, setSavingCaption] = useState(false);
  const [uploadSheetVisible, setUploadSheetVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { uploadMedia, uploadQueue, initStore } = useMediaStore();
  const uploadsForEvent = useMemo(
    () => uploadQueue.filter((item) => item.status === 'uploaded').length,
    [uploadQueue],
  );

  useEffect(() => {
    initStore().catch(() => {});
  }, [initStore]);

  useEffect(() => {
    if (currentUser?.displayName && !name) setName(currentUser.displayName);
  }, [currentUser?.displayName, name]);

  const handleJoin = async () => {
    if (!inviteCode || joining) return;
    setJoining(true);
    setError(null);
    try {
      const joined = currentUser
        ? await joinEvent(inviteCode, name.trim() || currentUser.displayName)
        : await joinEventAsGuest(inviteCode, name);
      if (!joined) throw new Error('That invite code is not valid.');
      setEvent(joined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join this event.');
    } finally {
      setJoining(false);
    }
  };

  const handleUpload = async (items: Parameters<typeof uploadMedia>[1]) => {
    if (!event) return;
    setUploadSheetVisible(true);
    await uploadMedia(event.id, items);
  };

  const handleCaption = async () => {
    if (!event || !caption.trim() || savingCaption) return;
    setSavingCaption(true);
    try {
      await addEventCaption(event.id, caption);
      setCaption('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Added', 'Your note will be part of the event story.');
    } catch (err) {
      Alert.alert('Could not add note', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setSavingCaption(false);
    }
  };

  if (!event) {
    return (
      <LinearGradient colors={['#140B2F', '#35106E', '#5B2CFF']} style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <ScrollView contentContainerStyle={styles.joinContent} keyboardShouldPersistTaps="handled">
            <View style={styles.mark}><Text style={styles.markText}>A</Text></View>
            <Text style={styles.brand}>AMBLER</Text>
            <Text style={styles.hero}>You’ve been invited into the story.</Text>
            <Text style={styles.subhero}>
              No app download. Add your photos, clips and a note — Ambler will weave everyone’s moments together afterwards.
            </Text>

            <View style={styles.invitePill}>
              <Text style={styles.inviteLabel}>INVITE</Text>
              <Text style={styles.inviteCode}>{inviteCode || '—'}</Text>
            </View>

            <View style={styles.joinCard}>
              <Text style={styles.fieldLabel}>What should we call you?</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#8D84A5"
                autoCapitalize="words"
                maxLength={60}
                style={styles.nameInput}
                onSubmitEditing={handleJoin}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                disabled={joining || name.trim().length < 1}
                onPress={handleJoin}
                style={({ pressed }) => [styles.primaryButton, (joining || !name.trim()) && styles.buttonDisabled, pressed && styles.buttonPressed]}
              >
                {joining ? <ActivityIndicator color="white" /> : <>
                  <Text style={styles.primaryButtonText}>Join & add moments</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </>}
              </Pressable>
              <Text style={styles.privacyNote}>Only people with this event invite can contribute.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.contributeScreen}>
      <ScrollView contentContainerStyle={styles.contributeContent}>
        <View style={styles.readyBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#19C37D" />
          <Text style={styles.readyBadgeText}>You’re in</Text>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>{event.locationLabel}</Text>

        <View style={styles.actionCard}>
          <Text style={styles.actionEyebrow}>ADD TO THE STORY</Text>
          <Text style={styles.actionTitle}>Share the moments only you captured.</Text>
          <Text style={styles.actionBody}>Photos and videos stay inside this event and can be curated into the finished Ambler story.</Text>
          <View style={styles.uploadSlot}>
            <UploadButton mode="inline" onItemsSelected={handleUpload} />
          </View>
          {uploadsForEvent > 0 ? (
            <Text style={styles.uploadedText}>{uploadsForEvent} upload{uploadsForEvent === 1 ? '' : 's'} added</Text>
          ) : null}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.actionEyebrow}>LEAVE A LINE</Text>
          <Text style={styles.noteHelp}>A joke, quote, memory or context Ambler can place into the finished story.</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="‘This was right before we got completely lost…’"
            placeholderTextColor="#958BAA"
            multiline
            maxLength={500}
            style={styles.captionInput}
          />
          <Pressable disabled={!caption.trim() || savingCaption} onPress={handleCaption} style={styles.noteButton}>
            {savingCaption ? <ActivityIndicator color="#5B2CFF" /> : <Text style={styles.noteButtonText}>Add note</Text>}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push(`/event/${event.id}/gallery`)} style={styles.galleryButton}>
          <Ionicons name="images-outline" size={18} color="#5B2CFF" />
          <Text style={styles.galleryButtonText}>See the shared gallery</Text>
        </Pressable>

        {Platform.OS === 'web' ? <Text style={styles.webHint}>You can close this tab when you’re done.</Text> : null}
      </ScrollView>
      <UploadProgress visible={uploadSheetVisible} onClose={() => setUploadSheetVisible(false)} eventId={event.id} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  joinContent: { flexGrow: 1, padding: 24, paddingTop: 64, alignItems: 'center' },
  mark: { width: 52, height: 52, borderRadius: 17, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  markText: { color: '#5B2CFF', fontSize: 30, fontWeight: '900' },
  brand: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '900', letterSpacing: 3, marginBottom: 34 },
  hero: { color: 'white', fontSize: 38, lineHeight: 42, fontWeight: '900', textAlign: 'center', maxWidth: 520 },
  subhero: { color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 16, maxWidth: 560 },
  invitePill: { flexDirection: 'row', gap: 10, alignItems: 'center', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 26 },
  inviteLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  inviteCode: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  joinCard: { width: '100%', maxWidth: 520, backgroundColor: 'white', borderRadius: 28, padding: 22, marginTop: 26 },
  fieldLabel: { color: '#18122B', fontSize: 14, fontWeight: '900', marginBottom: 9 },
  nameInput: { minHeight: 54, borderRadius: 16, backgroundColor: '#F5F1FC', paddingHorizontal: 16, color: '#18122B', fontSize: 17, fontWeight: '700' },
  error: { color: '#B42318', marginTop: 10, fontSize: 13, fontWeight: '700' },
  primaryButton: { minHeight: 56, borderRadius: 18, backgroundColor: '#5B2CFF', marginTop: 16, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '900' },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { transform: [{ scale: 0.99 }] },
  privacyNote: { color: '#746B8C', fontSize: 11, textAlign: 'center', marginTop: 12 },
  contributeScreen: { flex: 1, backgroundColor: '#F7F4FF' },
  contributeContent: { padding: 22, paddingBottom: 120, alignItems: 'center' },
  readyBadge: { flexDirection: 'row', gap: 6, backgroundColor: '#EAFBF3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center' },
  readyBadgeText: { color: '#127A50', fontWeight: '900', fontSize: 12 },
  eventTitle: { fontSize: 32, lineHeight: 36, fontWeight: '900', color: '#18122B', textAlign: 'center', marginTop: 16 },
  eventMeta: { fontSize: 14, color: '#746B8C', fontWeight: '700', marginTop: 6, marginBottom: 24 },
  actionCard: { width: '100%', maxWidth: 640, backgroundColor: 'white', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#EBE4F7' },
  actionEyebrow: { color: '#5B2CFF', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  actionTitle: { color: '#18122B', fontSize: 24, lineHeight: 29, fontWeight: '900', marginTop: 8 },
  actionBody: { color: '#746B8C', fontSize: 14, lineHeight: 21, fontWeight: '600', marginTop: 8 },
  uploadSlot: { minHeight: 80, marginTop: 14, justifyContent: 'center', alignItems: 'center' },
  uploadedText: { color: '#127A50', textAlign: 'center', fontWeight: '800', marginTop: 8 },
  noteCard: { width: '100%', maxWidth: 640, backgroundColor: 'white', borderRadius: 26, padding: 22, borderWidth: 1, borderColor: '#EBE4F7', marginTop: 16 },
  noteHelp: { color: '#746B8C', fontSize: 14, lineHeight: 20, marginTop: 8 },
  captionInput: { minHeight: 108, borderRadius: 16, backgroundColor: '#F7F4FF', padding: 14, marginTop: 12, color: '#18122B', fontSize: 15, textAlignVertical: 'top' },
  noteButton: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, backgroundColor: '#F0E9FF', marginTop: 10 },
  noteButtonText: { color: '#5B2CFF', fontWeight: '900' },
  galleryButton: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 22, paddingVertical: 12, paddingHorizontal: 18 },
  galleryButtonText: { color: '#5B2CFF', fontWeight: '900' },
  webHint: { color: '#8D84A5', fontSize: 12, marginTop: 8 },
});
