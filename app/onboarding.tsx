// Onboarding Screen — wraps the OnboardingCarousel
// Shown only on first launch

import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingCarousel } from '../src/components/onboarding/OnboardingCarousel';
import { setOnboardingComplete } from '../src/stores/authStore';

export default function Onboarding() {
  const router = useRouter();

  const handleGetStarted = useCallback(async () => {
    await setOnboardingComplete();
    router.replace('/(auth)/welcome');
  }, [router]);

  const handleSkip = useCallback(async () => {
    await setOnboardingComplete();
    router.replace('/(auth)/welcome');
  }, [router]);

  return (
    <OnboardingCarousel onGetStarted={handleGetStarted} onSkip={handleSkip} />
  );
}