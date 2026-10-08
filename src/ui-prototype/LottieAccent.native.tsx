import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';

export type AmblerLottieKind = 'story-building' | 'server-discovery' | 'completion';

type Palette = {
  violet?: string;
  aqua?: string;
  white?: string;
};

type Props = {
  kind: AmblerLottieKind;
  size?: number;
  loop?: boolean;
  speed?: number;
  palette?: Palette;
  style?: StyleProp<ViewStyle>;
};

const sources = {
  'story-building': require('../../assets/lottie/story-building.json'),
  'server-discovery': require('../../assets/lottie/server-discovery.json'),
  completion: require('../../assets/lottie/completion.json'),
};

const staticIcon: Record<AmblerLottieKind, keyof typeof Ionicons.glyphMap> = {
  'story-building': 'sparkles-outline',
  'server-discovery': 'server-outline',
  completion: 'checkmark',
};

function colorFilters(kind: AmblerLottieKind, palette: Palette) {
  const violet = palette.violet ?? '#5B2CFF';
  const aqua = palette.aqua ?? '#18C7D5';
  const white = palette.white ?? '#FFFFFF';

  if (kind === 'story-building') {
    return [
      { keypath: 'Ambler Aqua Orbit', color: aqua },
      { keypath: 'Ambler Violet Orbit', color: violet },
      { keypath: 'Ambler White Orbit', color: white },
      { keypath: 'Ambler Violet Story Card', color: violet },
      { keypath: 'Ambler Aqua Story Page', color: aqua },
    ];
  }

  if (kind === 'server-discovery') {
    return [
      { keypath: 'Ambler Aqua Ring 1', color: aqua },
      { keypath: 'Ambler Aqua Ring 2', color: aqua },
      { keypath: 'Ambler Aqua Ring 3', color: aqua },
      { keypath: 'Ambler Violet Core', color: violet },
    ];
  }

  return [
    { keypath: 'Ambler Aqua Completion Circle', color: aqua },
    { keypath: 'Ambler White Completion Check', color: white },
  ];
}

export default function LottieAccent({
  kind,
  size = 112,
  loop,
  speed = 1,
  palette = {},
  style,
}: Props) {
  const reduceMotion = useReducedMotion();
  const shouldLoop = loop ?? kind !== 'completion';

  if (reduceMotion) {
    const iconColor = kind === 'completion' ? '#FFFFFF' : (palette.violet ?? '#5B2CFF');
    const background = kind === 'completion' ? (palette.aqua ?? '#18C7D5') : 'rgba(91,44,255,0.10)';

    return (
      <View style={[styles.staticFallback, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: background }, style]}>
        <Ionicons name={staticIcon[kind]} size={size * 0.34} color={iconColor} />
      </View>
    );
  }

  return (
    <LottieView
      source={sources[kind]}
      autoPlay
      loop={shouldLoop}
      speed={speed}
      colorFilters={colorFilters(kind, palette)}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  staticFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
