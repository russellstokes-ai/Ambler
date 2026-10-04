import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { joinEvent, joinEventAsGuest, type VibeEventRecord } from '../features/events/eventService';
import { addEventCaption } from '../features/contributions/contributionService';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 20;

export default function GuestJoinScreenWeb() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const inviteCode = (code ?? '').toUpperCase();
  const currentUser = useAuthStore((state) => state.user);
  const [name, setName] = useState(currentUser?.displayName ?? '');
  const [event, setEvent] = useState<VibeEventRecord | null>(null);
  const [caption, setCaption] = useState('');
  const [joining, setJoining] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentUser?.displayName && !name) setName(currentUser.displayName);
  }, [currentUser?.displayName, name]);

  const handleJoin = async () => {
    if (!inviteCode || !name.trim() || joining) return;
    setJoining(true);
    setError(null);
    try {
      const joined = currentUser
        ? await joinEvent(inviteCode, name.trim() || currentUser.displayName)
        : await joinEventAsGuest(inviteCode, name);
      if (!joined) throw new Error('That invite code is not valid.');
      setEvent(joined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join this event.');
    } finally {
      setJoining(false);
    }
  };

  const chooseFiles = () => {
    if (!event || uploading) return;
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      input.style.display = 'none';
      document.body.appendChild(input);
      inputRef.current = input;
      input.addEventListener('change', async () => {
        const files = Array.from(input.files ?? []).slice(0, MAX_FILES);
        input.value = '';
        if (files.length) await uploadFiles(files);
      });
    }
    inputRef.current.click();
  };

  const uploadFiles = async (files: File[]) => {
    if (!event) return;
    setUploading(true);
    setError(null);
    let added = 0;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Guest session was lost. Refresh the invite and join again.');

      const valid = files.filter((file) => file.size <= MAX_FILE_BYTES);
      if (valid.length !== files.length) {
        setError('Some files were over 50 MB and were skipped.');
      }

      for (let i = 0; i < valid.length; i += 1) {
        const file = valid[i]!;
        setUploadProgress(`Uploading ${i + 1} of ${valid.length}…`);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-100) || `moment-${Date.now()}`;
        const mediaId = crypto.randomUUID();
        const path = `${event.id}/${authData.user.id}/${mediaId}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('event-media').upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
        const { error: insertError } = await supabase.from('media_assets').insert({
          id: mediaId,
          event_id: event.id,
          uploader_id: authData.user.id,
          storage_path: path,
          thumbnail_path: null,
          media_type: mediaType,
          captured_at: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
          uploaded_at: new Date().toISOString(),
          upload_status: 'uploaded',
        });
        if (insertError) {
          await supabase.storage.from('event-media').remove([path]);
          throw insertError;
        }
        added += 1;
      }

      setUploadedCount((count) => count + added);
      setUploadProgress(added ? `${added} moment${added === 1 ? '' : 's'} added` : 'No files added');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const addNote = async () => {
    if (!event || !caption.trim()) return;
    try {
      await addEventCaption(event.id, caption);
      setCaption('');
      setUploadProgress('Your note was added to the story');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add your note.');
    }
  };

  if (!event) {
    return (
      <LinearGradient colors={['#140B2F', '#35106E', '#5B2CFF']} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.joinContent}>
          <View style={styles.mark}><Text style={styles.markText}>A</Text></View>
          <Text style={styles.brand}>AMBLER</Text>
          <Text style={styles.hero}>You’ve been invited into the story.</Text>
          <Text style={styles.subhero}>No app. No account form. Add the moments only you captured and Ambler will bring everyone’s view of the event together.</Text>
          <View style={styles.codePill}><Text style={styles.codeText}>{inviteCode || 'INVITE'}</Text></View>
          <View style={styles.card}>
            <Text style={styles.label}>Your name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} onSubmitEditing={handleJoin} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable onPress={handleJoin} disabled={joining || !name.trim()} style={[styles.primary, (joining || !name.trim()) && styles.disabled]}>
              {joining ? <ActivityIndicator color="white" /> : <><Text style={styles.primaryText}>Join & contribute</Text><Ionicons name="arrow-forward" size={18} color="white" /></>}
            </Pressable>
            <Text style={styles.privacy}>Your uploads stay inside this invited event unless its organiser shares the finished story.</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  const closed = event.status === 'ended' || event.status === 'cancelled';
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.contributeContent}>
        <Text style={styles.brandPurple}>AMBLER</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>{event.locationLabel}</Text>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>{closed ? 'STORY CLOSED' : 'ADD TO THE STORY'}</Text>
          <Text style={styles.actionTitle}>{closed ? 'This event has finished.' : 'Share your side of it.'}</Text>
          <Text style={styles.body}>{closed ? 'Uploads are closed, but you can still enjoy the finished story when the organiser shares it.' : 'Choose up to 20 photos or videos from this device. No app installation required.'}</Text>
          {!closed ? (
            <Pressable onPress={chooseFiles} disabled={uploading} style={[styles.primary, uploading && styles.disabled]}>
              {uploading ? <ActivityIndicator color="white" /> : <Ionicons name="cloud-upload-outline" size={20} color="white" />}
              <Text style={styles.primaryText}>{uploading ? uploadProgress || 'Uploading…' : 'Choose photos & videos'}</Text>
            </Pressable>
          ) : null}
          {uploadedCount > 0 ? <Text style={styles.success}>{uploadedCount} moment{uploadedCount === 1 ? '' : 's'} contributed</Text> : null}
        </View>

        {!closed ? (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>LEAVE A LINE</Text>
            <Text style={styles.body}>Add a quote, joke or bit of context for the finished story.</Text>
            <TextInput value={caption} onChangeText={setCaption} placeholder="‘This was right before we got completely lost…’" multiline maxLength={500} style={[styles.input, styles.noteInput]} />
            <Pressable onPress={addNote} disabled={!caption.trim()} style={[styles.secondary, !caption.trim() && styles.disabled]}>
              <Text style={styles.secondaryText}>Add note</Text>
            </Pressable>
          </View>
        ) : null}

        {uploadProgress ? <Text style={styles.status}>{uploadProgress}</Text> : null}
        {error ? <Text style={styles.errorBottom}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: '100vh' as any },
  page: { flex: 1, minHeight: '100vh' as any, backgroundColor: '#F7F4FF' },
  joinContent: { flexGrow: 1, alignItems: 'center', padding: 32, paddingTop: 72 },
  contributeContent: { alignItems: 'center', padding: 32, paddingTop: 64, paddingBottom: 100, gap: 18 },
  mark: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 32, fontWeight: '900', color: '#5B2CFF' },
  brand: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 3, fontWeight: '900', marginTop: 12 },
  brandPurple: { color: '#5B2CFF', fontSize: 11, letterSpacing: 3, fontWeight: '900' },
  hero: { color: 'white', fontSize: 44, lineHeight: 48, textAlign: 'center', fontWeight: '900', maxWidth: 700, marginTop: 30 },
  subhero: { color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 25, textAlign: 'center', maxWidth: 650, marginTop: 16 },
  codePill: { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, marginTop: 22 },
  codeText: { color: 'white', fontSize: 15, letterSpacing: 2.5, fontWeight: '900' },
  card: { width: '100%', maxWidth: 620, backgroundColor: 'white', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#E9E2F7', marginTop: 18 },
  label: { color: '#18122B', fontSize: 13, fontWeight: '900', marginBottom: 8 },
  input: { backgroundColor: '#F6F2FC', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 15, fontSize: 16, color: '#18122B', outlineStyle: 'none' as any },
  noteInput: { minHeight: 108, textAlignVertical: 'top', marginTop: 14 },
  primary: { minHeight: 56, borderRadius: 18, paddingHorizontal: 18, backgroundColor: '#5B2CFF', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryText: { color: 'white', fontSize: 15, fontWeight: '900' },
  secondary: { alignSelf: 'flex-end', borderRadius: 999, backgroundColor: '#EEE7FF', paddingHorizontal: 18, paddingVertical: 11, marginTop: 10 },
  secondaryText: { color: '#5B2CFF', fontWeight: '900' },
  disabled: { opacity: 0.48 },
  privacy: { color: '#746B8C', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 12 },
  error: { color: '#B42318', marginTop: 10, fontWeight: '700' },
  errorBottom: { color: '#B42318', fontWeight: '700', maxWidth: 620, textAlign: 'center' },
  eventTitle: { color: '#18122B', fontSize: 38, lineHeight: 42, fontWeight: '900', textAlign: 'center', maxWidth: 700 },
  eventMeta: { color: '#746B8C', fontSize: 14, fontWeight: '700' },
  eyebrow: { color: '#5B2CFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  actionTitle: { color: '#18122B', fontSize: 26, lineHeight: 31, fontWeight: '900', marginTop: 8 },
  body: { color: '#746B8C', fontSize: 15, lineHeight: 22, marginTop: 8 },
  success: { color: '#127A50', fontWeight: '800', textAlign: 'center', marginTop: 12 },
  status: { color: '#5B2CFF', fontWeight: '800', textAlign: 'center' },
});
