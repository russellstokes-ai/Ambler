import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorybookPage } from '../../../types';
import { StorybookThemeConfig } from '../../../features/storybook/themeEngine';
import type { ThemePreset } from '../../../styles/themePresets';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { supabase } from '../../../lib/supabase';

interface FriendCaptionsPageProps {
  page: StorybookPage;
  themeConfig: StorybookThemeConfig;
  themePreset: ThemePreset;
}

interface Quote {
  userId?: string;
  name: string;
  text: string;
  reactions?: number;
  avatarUri?: string;
}

interface QuoteCardProps {
  quote: Quote;
  index: number;
  preset: ThemePreset;
  reduceMotion: boolean;
  avatarUri?: string;
}

function QuoteCard({ quote, index, preset, reduceMotion, avatarUri }: QuoteCardProps) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 30);
  const reactionScale = useSharedValue(reduceMotion ? 1 : 0);

  const delayMs = index * 100;

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    reactionScale.value = withDelay(delayMs + 200, withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const reactionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reactionScale.value }],
  }));

  const tc = preset.colors;

  return (
    <Animated.View
      style={[
        {
          backgroundColor: preset.preview.motif === 'neon' ? tc.primary : tc.surface,
          borderRadius: preset.card.borderRadius,
          padding: preset.preview.motif === 'columns' ? 22 : 18,
          borderWidth: preset.preview.motif === 'grain' ? 6 : preset.card.borderWidth,
          borderColor: preset.card.borderColor,
          shadowColor: preset.preview.motif === 'neon' ? tc.accent : tc.primary,
          shadowOpacity: preset.card.shadowOpacity,
          shadowRadius: preset.card.shadowRadius,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
        },
        cardStyle,
      ]}
    >
      <Text
        style={{
          color: preset.preview.motif === 'neon' ? '#FFFFFF' : tc.text,
          fontSize: 17,
          fontWeight: preset.preview.motif === 'columns' ? '500' : '600',
          lineHeight: 24,
          letterSpacing: 0,
          marginBottom: 14,
        }}
      >
        "{quote.text}"
      </Text>

      <View style={styles.attributionRow}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.initialsAvatar, { backgroundColor: tc.accent }]}>
            <Text style={[styles.avatarInitial, { color: tc.surface }]}>
              {quote.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: preset.preview.motif === 'neon' ? 'rgba(255,255,255,0.76)' : tc.textMuted,
            fontSize: 13,
            fontWeight: '800',
            flex: 1,
          }}
        >
          {quote.name}
        </Text>

        {quote.reactions !== undefined && quote.reactions > 0 && (
          <Animated.View
            style={[
              {
                backgroundColor: `${tc.accent}22`,
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              },
              reactionStyle,
            ]}
          >
            <Text style={{ fontSize: 12 }}>🔥</Text>
            <Text style={{ color: tc.accent, fontSize: 12, fontWeight: '900' }}>
              {quote.reactions}
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export function FriendCaptionsPage({ page, themePreset }: FriendCaptionsPageProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [avatarByUserId, setAvatarByUserId] = useState<Record<string, string>>({});

  const quotes =
    ((page.data.quotes as Quote[] | undefined) ??
      (page.data.captions as Quote[] | undefined) ??
      []);
  const userIds = useMemo(
    () => Array.from(new Set(quotes.map((quote) => quote.userId).filter((id): id is string => Boolean(id)))),
    [quotes],
  );
  const tc = themePreset.colors;

  useEffect(() => {
    if (userIds.length === 0) return;

    let isMounted = true;
    supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', userIds)
      .then(({ data }) => {
        if (!isMounted) return;
        const next: Record<string, string> = {};
        for (const profile of data ?? []) {
          if (profile.avatar_url) next[profile.id] = profile.avatar_url;
        }
        setAvatarByUserId(next);
      });

    return () => {
      isMounted = false;
    };
  }, [userIds]);

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            {
              color: tc.text,
              fontSize: themePreset.typography.titleSize * 0.75,
              fontWeight: themePreset.typography.titleWeight,
              letterSpacing: themePreset.typography.titleLetterSpacing,
              textTransform: themePreset.typography.titleTransform,
            },
          ]}
        >
          {page.title}
        </Text>
        <Text style={[styles.subtitle, { color: tc.textMuted }]}>
          {page.subtitle}
        </Text>

        <View style={styles.cards}>
          {quotes.length > 0 ? (
            quotes.map((quote, i) => (
              <QuoteCard
                key={i}
                quote={quote}
                index={i}
                preset={themePreset}
                reduceMotion={reduceMotion}
                avatarUri={quote.avatarUri ?? (quote.userId ? avatarByUserId[quote.userId] : undefined)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: tc.textMuted }]}>
              No captions yet. Be the first to add one.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  cards: {
    gap: 14,
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  initialsAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 40,
  },
});
