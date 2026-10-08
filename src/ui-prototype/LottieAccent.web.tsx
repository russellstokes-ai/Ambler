import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useReducedMotion } from '../hooks/useReducedMotion';
import type { AmblerLottieKind } from './LottieAccent.native';

type Props = {
  kind: AmblerLottieKind;
  size?: number;
  loop?: boolean;
  speed?: number;
  palette?: {
    violet?: string;
    aqua?: string;
    white?: string;
  };
  style?: StyleProp<ViewStyle>;
};

const iconByKind: Record<AmblerLottieKind, keyof typeof Ionicons.glyphMap> = {
  'story-building': 'sparkles-outline',
  'server-discovery': 'server-outline',
  completion: 'checkmark',
};

export default function LottieAccent({
  kind,
  size = 112,
  loop,
  speed = 1,
  palette = {},
  style,
}: Props) {
  const reduceMotion = useReducedMotion();
  const motion = useRef(new Animated.Value(0)).current;
  const shouldLoop = loop ?? kind !== 'completion';
  const violet = palette.violet ?? '#5B2CFF';
  const aqua = palette.aqua ?? '#18C7D5';

  useEffect(() => {
    if (reduceMotion) {
      motion.setValue(1);
      return;
    }

    const cycle = Animated.sequence([
      Animated.timing(motion, {
        toValue: 1,
        duration: 700 / Math.max(speed, 0.25),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(motion, {
        toValue: shouldLoop ? 0 : 1,
        duration: shouldLoop ? 700 / Math.max(speed, 0.25) : 1,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    const animation = shouldLoop ? Animated.loop(cycle) : cycle;
    animation.start();
    return () => animation.stop();
  }, [motion, reduceMotion, shouldLoop, speed]);

  return (
    <View style={[styles.frame, { width: size, height: size }, style]}>
      {kind === 'server-discovery' ? (
        <>
          {[0.68, 0.84, 1].map((scale, index) => (
            <Animated.View
              key={scale}
              style={[
                styles.ring,
                {
                  width: size * scale,
                  height: size * scale,
                  borderRadius: size,
                  borderColor: aqua,
                  opacity: motion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.12 + index * 0.03, 0.38 - index * 0.05],
                  }),
                  transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.06] }) }],
                },
              ]}
            />
          ))}
        </>
      ) : null}
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.46,
            height: size * 0.46,
            borderRadius: size * 0.16,
            backgroundColor: kind === 'completion' ? aqua : 'rgba(91,44,255,0.12)',
            transform: [{ scale: motion.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) }],
            opacity: reduceMotion ? 1 : motion.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
          },
        ]}
      >
        <Ionicons
          name={iconByKind[kind]}
          size={size * 0.25}
          color={kind === 'completion' ? '#FFFFFF' : violet}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
