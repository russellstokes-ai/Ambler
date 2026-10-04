import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { supabase } from '../../lib/supabase';

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'failed' | 'cancelled';

export type MediaType = 'photo' | 'video';

export interface MediaAsset {
  id: string;
  eventId: string;
  uri: string;
  thumbnailUri: string;
  mediaType: MediaType;
  width: number;
  height: number;
  durationSeconds?: number;
  uploaderId: string;
  uploaderName: string;
  capturedAt: string;
  uploadedAt: string;
  reactions: number;
  storagePath?: string;
  thumbnailPath?: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface UploadQueueItem {
  mediaId: string;
  uri: string;
  thumbnailUri?: string;
  mediaType: MediaType;
  width?: number;
  height?: number;
  durationSeconds?: number;
  capturedAt?: string;
  status: UploadStatus;
  progress: number;
  filename: string;
  mimeType?: string;
  exif?: Record<string, unknown> | null;
}

export interface EXIFData {
  capturedAt: string;
  gpsLat?: number;
  gpsLng?: number;
  orientation?: number;
}

interface DbMediaAsset {
  id: string;
  event_id: string;
  uploader_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  media_type: string;
  captured_at: string | null;
  uploaded_at: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  profiles?: { display_name?: string | null } | { display_name?: string | null }[] | null;
  media_reactions?: { id: string }[] | null;
}

const BUCKET = 'event-media';
const IMAGE_MAX_WIDTH = 2048;
const THUMBNAIL_WIDTH = 400;

export function generateMediaId(): string {
  return `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function pickMedia(maxSelection: number = 20): Promise<ImagePicker.ImagePickerAsset[] | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    allowsMultipleSelection: true,
    selectionLimit: maxSelection,
    quality: 0.85,
    allowsEditing: false,
    exif: true,
  });

  if (result.canceled || !result.assets) return null;
  return result.assets;
}

export function assetsToQueueItems(assets: ImagePicker.ImagePickerAsset[]): UploadQueueItem[] {
  return assets.map((asset) => {
    const mediaType: MediaType = asset.type === 'video' ? 'video' : 'photo';
    return {
      mediaId: generateMediaId(),
      uri: asset.uri,
      thumbnailUri: asset.uri,
      mediaType,
      width: asset.width,
      height: asset.height,
      durationSeconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
      capturedAt: readCapturedAtFromExif(asset.exif) ?? new Date().toISOString(),
      status: 'queued',
      progress: 0,
      filename: asset.fileName ?? `${mediaType}_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`,
      mimeType: asset.mimeType,
      exif: asset.exif,
    };
  });
}

export async function uploadMedia(
  eventId: string,
  item: UploadQueueItem,
  onProgress?: (progress: number) => void,
): Promise<MediaAsset> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData.user;
  if (!user) throw new Error('You must be signed in to upload media.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const mediaType = item.mediaType;
  const isPhoto = mediaType === 'photo';
  const preparedUri = isPhoto ? await compressImage(item.uri, 0.85, item.width, item.height) : item.uri;
  const thumbUri = isPhoto ? await generateThumbnail(preparedUri) : await generateVideoThumbnail(item.uri);
  const exif = isPhoto ? await extractEXIF(item.uri, item.exif) : { capturedAt: item.capturedAt ?? new Date().toISOString() };

  const mediaExt = extensionFor(item.filename, item.mimeType, isPhoto ? 'jpg' : 'mp4');
  const thumbExt = 'jpg';
  const mediaPath = `${eventId}/${user.id}/${item.mediaId}.${mediaExt}`;
  const thumbPath = `${eventId}/${user.id}/${item.mediaId}_thumb.${thumbExt}`;

  onProgress?.(1);
  await uploadFileWithProgress(mediaPath, preparedUri, item.mimeType ?? mimeForExtension(mediaExt), (progress) => {
    onProgress?.(Math.min(90, progress * 0.9));
  });
  await uploadFileWithProgress(thumbPath, thumbUri, 'image/jpeg', (progress) => {
    onProgress?.(90 + progress * 0.1);
  });

  const row = {
    event_id: eventId,
    uploader_id: user.id,
    storage_path: mediaPath,
    thumbnail_path: thumbPath,
    media_type: mediaType,
    captured_at: exif.capturedAt,
    width: item.width ?? null,
    height: item.height ?? null,
    duration_seconds: item.durationSeconds ?? null,
    upload_status: 'uploaded',
    gps_lat: exif.gpsLat ?? null,
    gps_lng: exif.gpsLng ?? null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from('media_assets')
    .insert(row)
    .select('*, profiles(display_name)')
    .single();
  if (insertError) throw insertError;

  onProgress?.(100);
  return mapDbMediaAssetWithSignedUrls(inserted as DbMediaAsset, profile?.display_name ?? user.user_metadata?.name ?? 'Guest');
}

export async function deleteMedia(mediaId: string, storagePath?: string, thumbnailPath?: string): Promise<boolean> {
  let paths = [storagePath, thumbnailPath].filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('storage_path, thumbnail_path')
      .eq('id', mediaId)
      .maybeSingle();
    if (error) throw error;
    paths = [data?.storage_path, data?.thumbnail_path].filter((path): path is string => Boolean(path));
  }

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) throw storageError;
  }

  const { error: dbError } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', mediaId);
  if (dbError) throw dbError;

  return true;
}

export async function extractEXIF(
  uri: string,
  pickerExif?: Record<string, unknown> | null,
): Promise<EXIFData> {
  const fromPicker = exifFromRecord(pickerExif);
  if (fromPicker.gpsLat != null || fromPicker.gpsLng != null || fromPicker.capturedAt) {
    return {
      capturedAt: fromPicker.capturedAt ?? new Date().toISOString(),
      gpsLat: fromPicker.gpsLat,
      gpsLng: fromPicker.gpsLng,
      orientation: fromPicker.orientation,
    };
  }

  try {
    await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const parsed = parseJpegExif(base64);
    return {
      capturedAt: parsed.capturedAt ?? new Date().toISOString(),
      gpsLat: parsed.gpsLat,
      gpsLng: parsed.gpsLng,
      orientation: parsed.orientation,
    };
  } catch {
    return { capturedAt: new Date().toISOString() };
  }
}

export async function compressImage(
  uri: string,
  quality: number = 0.85,
  width?: number,
  height?: number,
): Promise<string> {
  const maxSide = Math.max(width ?? 0, height ?? 0);
  const resize =
    maxSide > IMAGE_MAX_WIDTH
      ? width && height && height > width
        ? { height: IMAGE_MAX_WIDTH }
        : { width: IMAGE_MAX_WIDTH }
      : undefined;
  const result = await ImageManipulator.manipulateAsync(
    uri,
    resize ? [{ resize }] : [],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export async function generateThumbnail(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: THUMBNAIL_WIDTH } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export async function generateVideoThumbnail(uri: string): Promise<string> {
  const result = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 1000,
    quality: 0.8,
  });
  return result.uri;
}

export function mapDbMediaAsset(row: DbMediaAsset, fallbackUploaderName?: string): MediaAsset {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const mediaUrl = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path).data.publicUrl;
  const thumbUrl = row.thumbnail_path
    ? supabase.storage.from(BUCKET).getPublicUrl(row.thumbnail_path).data.publicUrl
    : mediaUrl;

  return {
    id: row.id,
    eventId: row.event_id,
    uri: mediaUrl,
    thumbnailUri: thumbUrl,
    mediaType: row.media_type === 'video' ? 'video' : 'photo',
    width: row.width ?? 1080,
    height: row.height ?? 1080,
    durationSeconds: row.duration_seconds == null ? undefined : Math.round(Number(row.duration_seconds)),
    uploaderId: row.uploader_id,
    uploaderName: profile?.display_name ?? fallbackUploaderName ?? 'Guest',
    capturedAt: row.captured_at ?? row.uploaded_at ?? new Date().toISOString(),
    uploadedAt: row.uploaded_at ?? new Date().toISOString(),
    reactions: row.media_reactions?.length ?? 0,
    storagePath: row.storage_path,
    thumbnailPath: row.thumbnail_path ?? undefined,
    gpsLat: row.gps_lat == null ? undefined : Number(row.gps_lat),
    gpsLng: row.gps_lng == null ? undefined : Number(row.gps_lng),
  };
}

export async function mapDbMediaAssetWithSignedUrls(row: DbMediaAsset, fallbackUploaderName?: string): Promise<MediaAsset> {
  const mapped = mapDbMediaAsset(row, fallbackUploaderName);
  const [mediaSigned, thumbSigned] = await Promise.all([
    supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 60 * 60 * 6),
    row.thumbnail_path
      ? supabase.storage.from(BUCKET).createSignedUrl(row.thumbnail_path, 60 * 60 * 6)
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    ...mapped,
    uri: mediaSigned.data?.signedUrl ?? mapped.uri,
    thumbnailUri: thumbSigned.data?.signedUrl ?? mediaSigned.data?.signedUrl ?? mapped.thumbnailUri,
  };
}

export function getUploaderColor(uploaderId: string): string {
  const palette = ['#5B2CFF', '#EC3FA4', '#18C7D5', '#19C37D', '#FFB020', '#FF6B6B'];
  let hash = 0;
  for (let i = 0; i < uploaderId.length; i++) hash = (hash * 31 + uploaderId.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length]!;
}

async function uploadFileWithProgress(
  path: string,
  uri: string,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Missing session for upload.');

  const endpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponentPath(path)}`;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.((event.loaded / event.total) * 100);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Storage upload failed.'));
    xhr.send(blob);
  });
}

function encodeURIComponentPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function extensionFor(filename: string, mimeType: string | undefined, fallback: string): string {
  const fromName = filename.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('heic')) return 'heic';
  if (mimeType?.includes('quicktime')) return 'mov';
  if (mimeType?.includes('mp4')) return 'mp4';
  return fallback;
}

function mimeForExtension(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'mp4') return 'video/mp4';
  return 'image/jpeg';
}

function readCapturedAtFromExif(exif?: Record<string, unknown> | null): string | undefined {
  return exifFromRecord(exif).capturedAt;
}

function exifFromRecord(exif?: Record<string, unknown> | null): Partial<EXIFData> {
  if (!exif) return {};
  const capturedAt = parseExifDate(
    readString(exif.DateTimeOriginal) ??
      readString(exif.DateTimeDigitized) ??
      readString(exif.DateTime),
  );
  const lat = readGpsCoordinate(exif.GPSLatitude, exif.GPSLatitudeRef);
  const lng = readGpsCoordinate(exif.GPSLongitude, exif.GPSLongitudeRef);
  const orientation = typeof exif.Orientation === 'number' ? exif.Orientation : undefined;
  return { capturedAt, gpsLat: lat, gpsLng: lng, orientation };
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readGpsCoordinate(value: unknown, refValue: unknown): number | undefined {
  const ref = typeof refValue === 'string' ? refValue : '';
  let decimal: number | undefined;

  if (typeof value === 'number') {
    decimal = value;
  } else if (Array.isArray(value) && value.length >= 3) {
    const [degrees, minutes, seconds] = value.map(Number);
    decimal = degrees + minutes / 60 + seconds / 3600;
  }

  if (decimal == null || Number.isNaN(decimal)) return undefined;
  return ref === 'S' || ref === 'W' ? -Math.abs(decimal) : decimal;
}

function parseExifDate(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d, h, min, s] = match;
  return new Date(`${y}-${m}-${d}T${h}:${min}:${s}Z`).toISOString();
}

function parseJpegExif(base64: string): Partial<EXIFData> {
  const bytes = base64ToBytes(base64);
  if (bytes.length < 4) return {};

  for (let offset = 2; offset + 4 < bytes.length;) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const size = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if (marker === 0xe1 && ascii(bytes, offset + 4, 6) === 'Exif\0\0') {
      return parseTiffExif(bytes, offset + 10, size - 8);
    }
    offset += 2 + size;
  }

  return {};
}

function parseTiffExif(bytes: Uint8Array, start: number, length: number): Partial<EXIFData> {
  const little = ascii(bytes, start, 2) === 'II';
  const read16 = (pos: number) => little ? bytes[pos] + (bytes[pos + 1] << 8) : (bytes[pos] << 8) + bytes[pos + 1];
  const read32 = (pos: number) => little
    ? bytes[pos] + (bytes[pos + 1] << 8) + (bytes[pos + 2] << 16) + (bytes[pos + 3] << 24)
    : (bytes[pos] << 24) + (bytes[pos + 1] << 16) + (bytes[pos + 2] << 8) + bytes[pos + 3];
  const readRational = (pos: number) => {
    const numerator = read32(pos);
    const denominator = read32(pos + 4);
    return denominator ? numerator / denominator : 0;
  };
  const max = start + length;

  const parseIfd = (ifdOffset: number) => {
    const entries = new Map<number, { type: number; count: number; valueOffset: number; entryPos: number }>();
    const pos = start + ifdOffset;
    if (pos < start || pos + 2 > max) return entries;
    const count = read16(pos);
    for (let i = 0; i < count; i++) {
      const entryPos = pos + 2 + i * 12;
      if (entryPos + 12 > max) break;
      entries.set(read16(entryPos), {
        type: read16(entryPos + 2),
        count: read32(entryPos + 4),
        valueOffset: read32(entryPos + 8),
        entryPos,
      });
    }
    return entries;
  };

  const ifd0 = parseIfd(read32(start + 4));
  const exifPointer = ifd0.get(0x8769)?.valueOffset;
  const gpsPointer = ifd0.get(0x8825)?.valueOffset;
  const exif = exifPointer ? parseIfd(exifPointer) : new Map();
  const gps = gpsPointer ? parseIfd(gpsPointer) : new Map();

  const capturedEntry = exif.get(0x9003) ?? exif.get(0x9004) ?? ifd0.get(0x0132);
  const capturedAt = capturedEntry ? parseExifDate(readAsciiValue(bytes, start, capturedEntry.valueOffset, capturedEntry.count)) : undefined;
  const orientation = ifd0.get(0x0112)?.valueOffset;
  const lat = readGpsValue(gps, 0x0002, 0x0001, start, bytes, readRational);
  const lng = readGpsValue(gps, 0x0004, 0x0003, start, bytes, readRational);

  return { capturedAt, gpsLat: lat, gpsLng: lng, orientation };
}

function readGpsValue(
  gps: Map<number, { valueOffset: number; count: number }>,
  coordTag: number,
  refTag: number,
  start: number,
  bytes: Uint8Array,
  readRational: (pos: number) => number,
): number | undefined {
  const coord = gps.get(coordTag);
  const ref = gps.get(refTag);
  if (!coord || coord.count < 3) return undefined;
  const pos = start + coord.valueOffset;
  const decimal = readRational(pos) + readRational(pos + 8) / 60 + readRational(pos + 16) / 3600;
  const refChar = ref ? String.fromCharCode(ref.valueOffset & 0xff) : '';
  return refChar === 'S' || refChar === 'W' ? -decimal : decimal;
}

function readAsciiValue(bytes: Uint8Array, start: number, offset: number, count: number): string {
  return ascii(bytes, start + offset, count).replace(/\0+$/, '');
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = '';
  for (let i = 0; i < length && start + i < bytes.length; i++) {
    out += String.fromCharCode(bytes[start + i]);
  }
  return out;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = globalThis.atob?.(base64);
  if (!binary) return new Uint8Array();
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
