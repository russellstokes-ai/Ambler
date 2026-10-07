import React, { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ui = {
  violet: '#5B2CFF',
  night: '#0F062C',
  ink: '#18122B',
  pink: '#EC3FA4',
  aqua: '#18C7D5',
  soft: '#F7F4FF',
  cream: '#FFF9F2',
  card: '#FFFFFF',
  muted: '#746B8C',
  line: '#E8E1F8',
  success: '#19C37D',
  warning: '#FFB020',
  danger: '#D92D4C',
};

export function PrototypePage({
  children,
  dark = false,
  scroll = true,
  action,
}: PropsWithChildren<{ dark?: boolean; scroll?: boolean; action?: ReactNode }>) {
  const body = (
    <View style={[styles.pageInner, dark && styles.pageInnerDark]}>
      {children}
      {action ? <View style={styles.bottomAction}>{action}</View> : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function PrototypeHeader({
  eyebrow,
  title,
  subtitle,
  dark = false,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        {eyebrow ? <Text style={[styles.eyebrow, dark && styles.eyebrowDark]}>{eyebrow}</Text> : null}
        <Text style={[styles.h1, dark && styles.textOnDark]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  inverse = false,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  inverse?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, inverse && styles.inverseButton, pressed && { opacity: 0.82 }]}>
      {icon ? <Ionicons name={icon} size={18} color={inverse ? ui.violet : '#FFFFFF'} /> : null}
      <Text style={[styles.primaryButtonText, inverse && styles.inverseButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  dark = false,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  dark?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, dark && styles.secondaryDark, pressed && { opacity: 0.8 }]}>
      {icon ? <Ionicons name={icon} size={18} color={dark ? '#FFFFFF' : ui.ink} /> : null}
      <Text style={[styles.secondaryButtonText, dark && styles.textOnDark]}>{label}</Text>
    </Pressable>
  );
}

export function Surface({
  children,
  style,
  tone = 'light',
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; tone?: 'light' | 'tint' | 'dark' | 'success' }>) {
  return <View style={[styles.surface, tone === 'tint' && styles.tint, tone === 'dark' && styles.darkSurface, tone === 'success' && styles.successSurface, style]}>{children}</View>;
}

export function Chip({
  label,
  active = false,
  icon,
}: {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? '#FFFFFF' : ui.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Stat({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, dark && styles.textOnDark]}>{value}</Text>
      <Text style={[styles.statLabel, dark && styles.subtitleDark]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ label, tone = 'violet' }: { label: string; tone?: 'violet' | 'green' | 'aqua' | 'gold' | 'gray' }) {
  const background =
    tone === 'green' ? '#E9FFF4' :
    tone === 'aqua' ? '#E8FBFD' :
    tone === 'gold' ? '#FFF6DE' :
    tone === 'gray' ? '#F0EDF5' :
    '#EFE9FF';
  const color =
    tone === 'green' ? '#147A4D' :
    tone === 'aqua' ? '#087B86' :
    tone === 'gold' ? '#9C6500' :
    tone === 'gray' ? '#5C536F' :
    ui.violet;
  return <View style={[styles.badge, { backgroundColor: background }]}><Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}

export function StoryArtwork({
  title,
  subtitle,
  icon,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) {
  return (
    <LinearGradient colors={['#0F062C', '#5B2CFF', '#EC3FA4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.storyArt, compact && styles.storyArtCompact]}>
      <View style={styles.artHalo} />
      <Ionicons name={icon} size={compact ? 28 : 42} color="rgba(255,255,255,0.92)" />
      <View style={styles.artCopy}>
        <Text style={[styles.artTitle, compact && { fontSize: 16 }]} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.artSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
    </LinearGradient>
  );
}

export function TwoPane({
  primary,
  secondary,
  reverse = false,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  reverse?: boolean;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  if (!wide) return <View style={styles.stack}>{primary}{secondary}</View>;
  return (
    <View style={[styles.twoPane, reverse && { flexDirection: 'row-reverse' }]}>
      <View style={styles.pane}>{primary}</View>
      <View style={styles.pane}>{secondary}</View>
    </View>
  );
}

export function ProgressSteps({ current, labels }: { current: number; labels: string[] }) {
  return (
    <View style={styles.progressWrap}>
      {labels.map((label, index) => (
        <View key={label} style={styles.progressItem}>
          <View style={[styles.progressDot, index <= current && styles.progressDotActive]}>
            {index < current ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
          </View>
          <Text style={[styles.progressLabel, index <= current && styles.progressLabelActive]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export function IconRow({
  icon,
  title,
  subtitle,
  trailing,
  tone = 'violet',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  tone?: 'violet' | 'aqua' | 'pink' | 'gold';
}) {
  const bg = tone === 'aqua' ? '#E8FBFD' : tone === 'pink' ? '#FDEBF5' : tone === 'gold' ? '#FFF5DF' : '#EFE9FF';
  const fg = tone === 'aqua' ? '#087B86' : tone === 'pink' ? '#B12F76' : tone === 'gold' ? '#9C6500' : ui.violet;
  return (
    <View style={styles.iconRow}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}><Ionicons name={icon} size={20} color={fg} /></View>
      <View style={styles.iconCopy}>
        <Text style={styles.iconTitle}>{title}</Text>
        {subtitle ? <Text style={styles.iconSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={ui.muted} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.soft },
  safeDark: { backgroundColor: ui.night },
  scroll: { flexGrow: 1 },
  pageInner: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34, gap: 22, backgroundColor: ui.soft },
  pageInnerDark: { backgroundColor: ui.night },
  bottomAction: { marginTop: 'auto', paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 5 },
  eyebrow: { color: ui.violet, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  eyebrowDark: { color: '#C8B7FF' },
  h1: { color: ui.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1.1 },
  subtitle: { color: ui.muted, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  subtitleDark: { color: 'rgba(255,255,255,0.66)' },
  textOnDark: { color: '#FFFFFF' },
  primaryButton: { minHeight: 52, borderRadius: 18, paddingHorizontal: 18, backgroundColor: ui.violet, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  inverseButton: { backgroundColor: '#FFFFFF' },
  inverseButtonText: { color: ui.violet },
  secondaryButton: { minHeight: 48, borderRadius: 16, paddingHorizontal: 17, borderWidth: 1, borderColor: ui.line, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryDark: { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.18)' },
  secondaryButtonText: { color: ui.ink, fontSize: 14, fontWeight: '800' },
  surface: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: ui.line, gap: 12 },
  tint: { backgroundColor: '#FBF9FF' },
  darkSurface: { backgroundColor: '#1B1237', borderColor: 'rgba(255,255,255,0.10)' },
  successSurface: { backgroundColor: '#ECFFF6', borderColor: '#C9F2DD' },
  chip: { minHeight: 34, paddingHorizontal: 12, borderRadius: 17, backgroundColor: '#F0EDF5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  chipActive: { backgroundColor: ui.violet },
  chipText: { color: ui.muted, fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: ui.ink, fontSize: 19, fontWeight: '900', letterSpacing: -0.3 },
  sectionAction: { color: ui.violet, fontSize: 12, fontWeight: '900' },
  stat: { flex: 1, minWidth: 70, gap: 2 },
  statValue: { color: ui.ink, fontSize: 20, fontWeight: '900' },
  statLabel: { color: ui.muted, fontSize: 11, fontWeight: '700' },
  badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.2 },
  storyArt: { minHeight: 230, borderRadius: 28, padding: 20, overflow: 'hidden', justifyContent: 'space-between' },
  storyArtCompact: { minHeight: 150, borderRadius: 22, padding: 16 },
  artHalo: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -40, top: -50, backgroundColor: 'rgba(24,199,213,0.18)' },
  artCopy: { gap: 4 },
  artTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 29, fontWeight: '900', letterSpacing: -0.6 },
  artSubtitle: { color: 'rgba(255,255,255,0.76)', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  stack: { gap: 16 },
  twoPane: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  pane: { flex: 1, minWidth: 0 },
  progressWrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 },
  progressItem: { flex: 1, alignItems: 'center', gap: 6 },
  progressDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E6E0ED', alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: ui.violet },
  progressLabel: { color: ui.muted, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  progressLabelActive: { color: ui.ink },
  iconRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconCopy: { flex: 1, gap: 2 },
  iconTitle: { color: ui.ink, fontSize: 14, fontWeight: '900' },
  iconSubtitle: { color: ui.muted, fontSize: 11, lineHeight: 16, fontWeight: '600' },
});
