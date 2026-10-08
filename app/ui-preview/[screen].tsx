import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PrototypeScreen } from '../../src/ui-prototype/screens';
import type { PrototypeScreenId } from '../../src/ui-prototype/data';

export default function UiPreviewScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  const id = (screen || 'home') as PrototypeScreenId;

  return (
    <View testID={`ui-screen-${id}`} style={{ flex: 1 }}>
      <PrototypeScreen id={id} />
    </View>
  );
}
