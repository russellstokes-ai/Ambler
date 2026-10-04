import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to check if reduced motion is enabled.
 * Returns true when the user has enabled "Remove animations"
 * in their accessibility settings.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}