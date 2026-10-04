// ─── Consent Modal ────────────────────────────────────────────
// Privacy-first location sharing consent flow.
// Slides up from bottom with animated entrance.

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  Modal,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ConsentModalProps {
  visible: boolean;
  eventTitle: string;
  onAllow: () => void;
  onDismiss: () => void;
}

// Privacy bullet points for event-only route sharing.
const PRIVACY_POINTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'location-outline', text: 'Route Replay adds places only for this event' },
  { icon: 'pause-circle-outline', text: 'You can pause or stop whenever you like' },
  { icon: 'lock-closed-outline', text: 'Your full route stays inside the event' },
  { icon: 'people-outline', text: 'Only the organiser can view the full route' },
];

export function ConsentModal({ visible, eventTitle, onAllow, onDismiss }: ConsentModalProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [toggleValue, setToggleValue] = React.useState(false);

  const slideY = useSharedValue(reduceMotion ? 0 : 400);
  const overlayOpacity = useSharedValue(reduceMotion ? 1 : 0);

  // Animate in when visible changes
  React.useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      slideY.value = withSpring(0, {
        damping: 28,
        stiffness: 280,
        mass: 0.8,
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      slideY.value = withTiming(400, { duration: 250, easing: Easing.in(Easing.cubic) });
      setToggleValue(false);
    }
  }, [visible, reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const handleAllow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onAllow();
  }, [onAllow]);

  const handleDismiss = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onDismiss();
  }, [onDismiss]);

  const handleToggle = useCallback((value: boolean) => {
    setToggleValue(value);
    Haptics.selectionAsync().catch(() => {});
  }, []);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Grab handle */}
          <View style={styles.grabHandle} />

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="location" size={32} color="#5B2CFF" />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Add Route Replay for {eventTitle}
          </Text>

          <Text style={styles.subtitle}>
            Add the places you visit so the storybook can include a beautiful map.
          </Text>

          {/* Privacy points */}
          <View style={styles.privacyList}>
            {PRIVACY_POINTS.map((point, i) => (
              <View key={i} style={styles.privacyRow}>
                <View style={styles.privacyIconWrap}>
                  <Ionicons name={point.icon} size={18} color="#5B2CFF" />
                </View>
                <Text style={styles.privacyText}>{point.text}</Text>
              </View>
            ))}
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              Use my location for this event
            </Text>
            <Switch
              value={toggleValue}
              onValueChange={handleToggle}
              trackColor={{ false: '#E8E1F8', true: '#5B2CFF' }}
              thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E8E1F8"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleDismiss}
            >
              <Text style={styles.secondaryButtonText}>Not now</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                !toggleValue && styles.primaryButtonDisabled,
              ]}
              onPress={handleAllow}
              disabled={!toggleValue}
            >
              <Text style={styles.primaryButtonText}>Start Route Replay</Text>
            </Pressable>
          </View>

          {/* Fine print */}
          <Text style={styles.finePrint}>
            Route Replay only runs for this event and stops when the event ends.
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 6, 44, 0.55)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  grabHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8E1F8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#5B2CFF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#746B8C',
    fontWeight: '600',
    marginBottom: 24,
  },
  privacyList: {
    gap: 14,
    marginBottom: 28,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  privacyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5B2CFF10',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#18122B',
    fontWeight: '600',
    lineHeight: 20,
    paddingTop: 7,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F4FF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#18122B',
    marginRight: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F7F4FF',
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#746B8C',
  },
  primaryButton: {
    backgroundColor: '#5B2CFF',
  },
  primaryButtonDisabled: {
    backgroundColor: '#5B2CFF55',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  finePrint: {
    fontSize: 12,
    color: '#746B8C',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
});
