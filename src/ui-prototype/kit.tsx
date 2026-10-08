import React, { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
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
import { useReducedMotion } from '../hooks/useReducedMotion';

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
  white: '#FFFFFF',
  lavender: '#B8A8FF',
  mist: '#EEEAF7',
  shadow: '#23104F',
  orange: '#F97316',
};

export function MotionReveal({
  children,
  delay = 0,
  distance = 14,
  scaleFrom = 0.985,
  resetKey,
  style,
}: PropsWithChildren<{
  delay?: number;
  distance?: number;
  scaleFrom?: number;
  resetKey?: string | number;
  style?: StyleProp<ViewStyle>;
}>) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : distance)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : scaleFrom)).current;

  useEffect(() => {
    opacity.stopAnimation();
    translateY.stopAnimation();
    scale.stopAnimation();

    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(1);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(distance);
    scale.setValue(scaleFrom);

    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 560,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => animation.stop();
  }, [delay, distance, opacity, reduceMotion, resetKey, scale, scaleFrom, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}

export function MotionDrift({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const reduceMotion = useReducedMotion();
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      drift.setValue(0.5);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 6800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        style,
        {
          transform: [
            { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-3, 4] }) },
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [2, -3] }) },
            { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.015, 1.035] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function RouteTraceSegment({
  style,
  rotate = '0deg',
  delay = 0,
  duration = 720,
}: {
  style: StyleProp<ViewStyle>;
  rotate?: string;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    progress.stopAnimation();

    if (reduceMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress, reduceMotion]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 1] }),
          transform: [{ rotate }, { scaleX: progress }],
        },
      ]}
    />
  );
}

export function PulseDot({
  color = '#53E69C',
  size = 8,
  style,
}: {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.18] }) }],
        },
        style,
      ]}
    />
  );
}

export function PrototypePage({
  children,
  dark = false,
  scroll = true,
  action,
}: PropsWithChildren<{ dark?: boolean; scroll?: boolean; action?: ReactNode }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translate]);

  const body = (
    <Animated.View style={[styles.pageInner, dark && styles.pageInnerDark, { opacity, transform: [{ translateY: translate }] }]}>
      {children}
      {action ? <View style={styles.bottomAction}>{action}</View> : null}
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>{body}</ScrollView> : body}
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
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  inverse?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryButtonOuter, style, pressed && styles.pressed]}>
      {inverse ? (
        <View style={[styles.primaryButton, styles.inverseButton]}>
          {icon ? <Ionicons name={icon} size={18} color={ui.violet} /> : null}
          <Text style={[styles.primaryButtonText, styles.inverseButtonText]}>{label}</Text>
        </View>
      ) : (
        <LinearGradient colors={['#6B3CFF', '#5B2CFF', '#4A24E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
          <View style={styles.buttonSheen} />
          {icon ? <Ionicons name={icon} size={18} color="#FFFFFF" /> : null}
          <Text style={styles.primaryButtonText}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
  dark = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, dark && styles.secondaryDark, style, pressed && styles.pressed]}>
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

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        onAction ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
            <Text style={styles.sectionAction}>{action}</Text>
          </Pressable>
        ) : <Text style={styles.sectionAction}>{action}</Text>
      ) : null}
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
    <LinearGradient colors={['#0B0424', '#32177A', '#5B2CFF', '#C533A0']} locations={[0,0.35,0.68,1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.storyArt, compact && styles.storyArtCompact]}>
      <View style={styles.artHalo} />
      <View style={styles.artHaloTwo} />
      <View style={styles.artRouteOne} />
      <View style={styles.artRouteTwo} />
      <View style={styles.artTopline}>
        <Text style={styles.artEyebrow}>AMBLER STORY</Text>
        <View style={styles.artIconWrap}><Ionicons name={icon} size={compact ? 20 : 26} color="#FFFFFF" /></View>
      </View>
      <View style={styles.artCopy}>
        <Text style={[styles.artTitle, compact && styles.artTitleCompact]} numberOfLines={2}>{title}</Text>
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
  chevron = false,
  tone = 'violet',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  chevron?: boolean;
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
      {trailing ?? (chevron ? <Ionicons name="chevron-forward" size={18} color={ui.muted} /> : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F6FC' },
  safeDark: { backgroundColor: '#0B041F' },
  scroll: { flexGrow: 1 },
  pageInner: { flex: 1, width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, gap: 24, backgroundColor: '#F8F6FC' },
  pageInnerDark: { backgroundColor: '#0B041F' },
  bottomAction: { marginTop: 'auto', paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 5 },
  eyebrow: { color: ui.violet, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, textTransform: 'uppercase' },
  eyebrowDark: { color: '#C8B7FF' },
  h1: { color: ui.ink, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1.25 },
  subtitle: { color: '#716883', fontSize: 15, lineHeight: 22, fontWeight: '600', maxWidth: 720 },
  subtitleDark: { color: 'rgba(255,255,255,0.66)' },
  textOnDark: { color: '#FFFFFF' },
  primaryButtonOuter: { minHeight: 54, borderRadius: 19, flexShrink: 1, shadowColor: ui.violet, shadowOpacity: 0.24, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  primaryButton: { minHeight: 54, minWidth: 44, borderRadius: 19, paddingHorizontal: 19, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 1, overflow: 'hidden' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: -0.1 },
  inverseButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(91,44,255,0.10)' },
  inverseButtonText: { color: ui.violet },
  buttonSheen: { position: 'absolute', top: 0, left: 14, right: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.34)' },
  secondaryButton: { minHeight: 50, minWidth: 44, borderRadius: 17, paddingHorizontal: 17, borderWidth: 1, borderColor: '#E5DFF1', backgroundColor: 'rgba(255,255,255,0.96)', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 1, shadowColor: ui.shadow, shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  secondaryDark: { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.18)' },
  secondaryButtonText: { color: ui.ink, fontSize: 14, fontWeight: '800' },
  surface: { backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 24, padding: 17, borderWidth: 1, borderColor: 'rgba(232,225,248,0.86)', gap: 12, shadowColor: ui.shadow, shadowOpacity: 0.055, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  tint: { backgroundColor: '#FBF9FF' },
  darkSurface: { backgroundColor: '#1B1237', borderColor: 'rgba(255,255,255,0.10)' },
  successSurface: { backgroundColor: '#ECFFF6', borderColor: '#C9F2DD' },
  chip: { minHeight: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: '#F1EDF7', borderWidth: 1, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  chipActive: { backgroundColor: ui.violet, borderColor: '#7A59FF', shadowColor: ui.violet, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 },
  chipText: { color: ui.muted, fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: ui.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.45 },
  sectionAction: { color: ui.violet, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.992 }] },
  stat: { flex: 1, minWidth: 70, gap: 2 },
  statValue: { color: ui.ink, fontSize: 20, fontWeight: '900' },
  statLabel: { color: ui.muted, fontSize: 11, fontWeight: '700' },
  badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.2 },
  storyArt: { minHeight: 238, borderRadius: 30, padding: 20, overflow: 'hidden', justifyContent: 'space-between', shadowColor: '#16083D', shadowOpacity: 0.30, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 7 },
  storyArtCompact: { minHeight: 158, borderRadius: 24, padding: 16 },
  artHalo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -54, top: -72, backgroundColor: 'rgba(24,199,213,0.18)' },
  artHaloTwo: { position: 'absolute', width: 150, height: 150, borderRadius: 75, left: -45, bottom: -60, backgroundColor: 'rgba(236,63,164,0.14)' },
  artRouteOne: { position: 'absolute', width: 140, height: 2, backgroundColor: 'rgba(255,255,255,0.20)', right: 18, top: 72, transform: [{ rotate: '-18deg' }] },
  artRouteTwo: { position: 'absolute', width: 88, height: 2, backgroundColor: 'rgba(24,199,213,0.70)', right: 40, top: 102, transform: [{ rotate: '13deg' }] },
  artTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  artEyebrow: { color: 'rgba(255,255,255,0.52)', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  artIconWrap: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  artCopy: { gap: 5 },
  artTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 31, fontWeight: '900', letterSpacing: -0.75 },
  artTitleCompact: { fontSize: 18, lineHeight: 21 },
  artSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 17, fontWeight: '700' },
  stack: { gap: 16 },
  twoPane: { flexDirection: 'row', gap: 18, alignItems: 'stretch' },
  pane: { flex: 1, minWidth: 0 },
  progressWrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 },
  progressItem: { flex: 1, alignItems: 'center', gap: 6 },
  progressDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E9E4F2', borderWidth: 1, borderColor: '#DED6EC', alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: ui.violet },
  progressLabel: { color: ui.muted, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  progressLabelActive: { color: ui.ink },
  iconRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconCopy: { flex: 1, gap: 2 },
  iconTitle: { color: ui.ink, fontSize: 14, fontWeight: '900' },
  iconSubtitle: { color: ui.muted, fontSize: 11, lineHeight: 16, fontWeight: '600' },
});
