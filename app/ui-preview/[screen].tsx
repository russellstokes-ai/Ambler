import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PrototypeScreen } from '../../src/ui-prototype/screens';
import type { PrototypeScreenId } from '../../src/ui-prototype/data';

export default function UiPreviewScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  return <PrototypeScreen id={(screen || 'home') as PrototypeScreenId} />;
}
