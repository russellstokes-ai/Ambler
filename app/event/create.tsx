import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';

import { GradientButton } from '../../src/components/core/GradientButton';
import { EventTypeSelector } from '../../src/components/event/EventTypeSelector';
import { ThemePicker } from '../../src/components/event/ThemePicker';
import {
  EventTypeKey,
  ThemeKey,
  getEventTypeDef,
  getRecommendedThemes,
  categoryMeta,
} from '../../src/features/events/eventTypes';
import { useEventStore } from '../../src/stores/eventStore';
import { colors } from '../../src/styles/theme';

// ─── Step Definitions ────────────────────────────────────────

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'Name',
  'Type',
  'Theme',
  'Date & Place',
  'Review',
];

const SMART_THEME_BY_TYPE: Partial<Record<EventTypeKey, ThemeKey>> = {
  road_trip: 'route_replay',
  wedding: 'luxe',
  birthday: 'confetti',
  festival: 'neon_pulse',
  club_event: 'neon_pulse',
  night_out: 'neon_pulse',
  weekend_away: 'warm_gold',
  house_party: 'warm_gold',
  custom: 'warm_gold',
};

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getNextSaturday(): Date {
  const next = new Date();
  const day = next.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  next.setDate(next.getDate() + daysUntilSaturday);
  next.setHours(18, 0, 0, 0);
  return next;
}

function getSmartDefaultEventType(): EventTypeKey {
  const now = new Date();
  const day = now.getDay();
  if (day === 5 || day === 6 || day === 0) return 'weekend_away';
  if (now.getHours() >= 17) return 'house_party';
  return 'custom';
}

function getSmartEventName(type: EventTypeKey): string {
  const names: Partial<Record<EventTypeKey, string>> = {
    weekend_away: 'Your Weekend Loop',
    house_party: 'Your Social Loop',
    road_trip: 'Your Road Trip Loop',
    wedding: 'Your Wedding Story',
    birthday: 'Your Birthday Loop',
    festival: 'Your Festival Loop',
    club_event: 'Your Night Out Loop',
    night_out: 'Your Night Out Loop',
  };
  return names[type] ?? (type === 'custom' ? 'Your Story' : 'Your Event Story');
}

function getSmartTheme(type: EventTypeKey): ThemeKey {
  return SMART_THEME_BY_TYPE[type] ?? getRecommendedThemes(type)[0] ?? 'warm_gold';
}

// ─── Progress Indicator ───────────────────────────────────────

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.progressContainer}>
      {STEP_LABELS.map((label, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <View key={i} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                isComplete && styles.progressDotComplete,
                isCurrent && styles.progressDotCurrent,
              ]}
            >
              {isComplete ? (
                <Ionicons name="checkmark" size={14} color="white" />
              ) : (
                <Text
                  style={[
                    styles.progressNum,
                    isCurrent && styles.progressNumCurrent,
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  isComplete && styles.progressLineComplete,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Create Event Screen ────────────────────────────────

export default function CreateEventScreen() {
  const reduceMotion = useReducedMotion();
  const { createEvent } = useEventStore();
  const defaultEventType = useMemo(() => getSmartDefaultEventType(), []);
  const defaultTitle = useMemo(() => getSmartEventName(defaultEventType), [defaultEventType]);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventTypeKey | null>(defaultEventType);
  const [theme, setTheme] = useState<ThemeKey | null>(getSmartTheme(defaultEventType));
  const [date, setDate] = useState(formatDateInput(getNextSaturday()));
  const [time, setTime] = useState('18:00');
  const [locationLabel, setLocationLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const recommendedThemes: ThemeKey[] = eventType
    ? getRecommendedThemes(eventType)
    : [];
  const storybookTitle = `${title.trim() || defaultTitle} Storybook`;

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 0: return title.trim().length >= 2;
      case 1: return eventType !== null;
      case 2: return theme !== null;
      case 3: return date.trim().length > 0;
      case 4: return true; // review
      default: return false;
    }
  }, [step, title, eventType, theme, date]);

  const handleNext = () => {
    if (!canProceed()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleCreate = async () => {
    if (!eventType || !theme || isCreating) return;
    setIsCreating(true);

    // Validate date/time before converting to ISO. Invalid free-text input must
    // never escape the error boundary and crash the create screen.
    const dateStr = date.trim();
    const timeStr = time.trim() || '18:00';
    const parsedStart = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(parsedStart.getTime())) {
      setIsCreating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Check the date and time', 'Use a valid date and time before creating the event.');
      return;
    }

    try {
      const startsAt = parsedStart.toISOString();
      const event = await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        type: eventType,
        theme,
        startsAt,
        locationLabel: locationLabel.trim() || 'Location TBD',
        privacy: getEventTypeDef(eventType).defaultPrivacy,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCreatedEventId(event.id);
      setTimeout(() => {
        router.replace(`/event/${event.id}/lobby`);
      }, 500);
    } catch (err) {
      setIsCreating(false);
      setCreatedEventId(null);
      Alert.alert('We could not create this event', 'Check the details and try again.');
    }
  };

  const handleEventTypeSelect = (type: EventTypeKey) => {
    setEventType(type);
    setTheme(getSmartTheme(type));
    if (title.trim() === defaultTitle || title.trim().length === 0) {
      setTitle(getSmartEventName(type));
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#18122B" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <ProgressIndicator currentStep={step} />
        <Text style={styles.stepLabel}>
          Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
        </Text>
      </View>

      {/* Step Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <Animated.View
              entering={reduceMotion ? FadeIn : SlideInRight.springify()}
              style={styles.stepContainer}
            >
              <Text style={styles.stepHeading}>Name your event</Text>
              <Text style={styles.stepSubtext}>
                We started with a name you can keep or make your own.
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                autoFocus
                maxLength={60}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{title.length}/60</Text>
              <Text style={styles.smartHint}>
                Storybook title: {storybookTitle}
              </Text>
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View
              entering={reduceMotion ? FadeIn : SlideInRight.springify()}
              style={styles.stepContainer}
            >
              <Text style={styles.stepHeading}>What kind of event?</Text>
              <Text style={styles.stepSubtext}>
                We picked a likely match from the date and time. Change it if another template fits better.
              </Text>
              <EventTypeSelector
                selectedType={eventType}
                onSelect={handleEventTypeSelect}
              />
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              entering={reduceMotion ? FadeIn : SlideInRight.springify()}
              style={styles.stepContainer}
            >
              <Text style={styles.stepHeading}>Pick a theme</Text>
              <Text style={styles.stepSubtext}>
                Your storybook is taking shape. This sets the look, rhythm, captions, and music.
              </Text>
              <ThemePicker
                recommendedThemeKeys={recommendedThemes}
                selectedTheme={theme}
                onSelect={(t) => {
                  Haptics.selectionAsync().catch(() => {});
                  setTheme(t);
                }}
              />
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View
              entering={reduceMotion ? FadeIn : SlideInRight.springify()}
              style={styles.stepContainer}
            >
              <Text style={styles.stepHeading}>When and where?</Text>
              <Text style={styles.stepSubtext}>
                Add the date, time, and place guests will recognise.
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Place</Text>
                <TextInput
                  style={styles.input}
                  value={locationLabel}
                  onChangeText={setLocationLabel}
                  maxLength={80}
                />
              </View>
            </Animated.View>
          )}

          {step === 4 && (
            <Animated.View
              entering={reduceMotion ? FadeIn : SlideInRight.springify()}
              style={styles.stepContainer}
            >
              <Text style={styles.stepHeading}>Review and create</Text>
              <Text style={styles.stepSubtext}>
                Check everything looks right. You can edit details after creation.
              </Text>

              <View style={styles.reviewCard}>
                <ReviewRow label="Name" value={title} />
                {description ? <ReviewRow label="Description" value={description} /> : null}
                {eventType && (
                  <ReviewRow
                    label="Type"
                    value={getEventTypeDef(eventType).label}
                  />
                )}
                {theme && (
                  <ReviewRow label="Theme" value={theme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                )}
                <ReviewRow label="Storybook" value={storybookTitle} />
                <ReviewRow label="Date" value={date} />
                {time ? <ReviewRow label="Time" value={time} /> : null}
                <ReviewRow label="Place" value={locationLabel || 'Place TBD'} />
                {eventType && (
                  <ReviewRow
                    label="Privacy"
                    value={getEventTypeDef(eventType).defaultPrivacy}
                  />
                )}
              </View>

              <Text style={styles.creatingNote}>
                Once it is created, you will get an invite code so guests can start saving the moments.
              </Text>

              {createdEventId && (
                <Animated.View entering={FadeIn.duration(180)} style={styles.successFlash}>
                  <Ionicons name="checkmark-circle" size={24} color="#19C37D" />
                  <Text style={styles.successFlashText}>Event created</Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          {step < TOTAL_STEPS - 1 ? (
            <GradientButton
              label={canProceed() ? 'Continue' : 'Add details to continue'}
              onPress={handleNext}
            />
          ) : (
            <GradientButton
              label={createdEventId ? 'Event created' : isCreating ? 'Creating...' : 'Create Event'}
              onPress={isCreating ? undefined : handleCreate}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Review Row Helper ────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#18122B',
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E1F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotComplete: {
    backgroundColor: '#19C37D',
  },
  progressDotCurrent: {
    backgroundColor: '#5B2CFF',
  },
  progressNum: {
    fontSize: 12,
    fontWeight: '900',
    color: '#746B8C',
  },
  progressNumCurrent: {
    color: 'white',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8E1F8',
    marginHorizontal: 4,
  },
  progressLineComplete: {
    backgroundColor: '#19C37D',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#746B8C',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    gap: 12,
  },
  stepHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#18122B',
    letterSpacing: -0.8,
  },
  stepSubtext: {
    fontSize: 15,
    color: '#746B8C',
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#18122B',
    borderWidth: 1.5,
    borderColor: '#E8E1F8',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#A0A0B8',
    fontWeight: '600',
    textAlign: 'right',
  },
  smartHint: {
    fontSize: 13,
    color: '#5B2CFF',
    fontWeight: '800',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#746B8C',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E8E1F8',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#746B8C',
    flex: 0.4,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18122B',
    flex: 0.6,
    textAlign: 'right',
  },
  creatingNote: {
    fontSize: 13,
    color: '#746B8C',
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 8,
  },
  successFlash: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#19C37D15',
    borderColor: '#19C37D44',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 8,
  },
  successFlashText: {
    color: '#137A52',
    fontSize: 15,
    fontWeight: '900',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
});
