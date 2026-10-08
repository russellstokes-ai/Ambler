import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PrototypeIndex, PrototypeScreen } from '../../src/ui-prototype/screens';
import type { PrototypeScreenId } from '../../src/ui-prototype/data';
import StressFixture from '../../src/ui-prototype/StressFixture';

export default function UiPreviewIndex() {
  const { preview } = useLocalSearchParams<{ preview?: string }>();

  if (preview === '__stress') {
    return (
      <View testID="ui-stress-route" style={{ flex: 1 }}>
        <StressFixture />
      </View>
    );
  }

  if (preview) {
    const id = preview as PrototypeScreenId;
    return (
      <View testID={`ui-screen-${id}`} style={{ flex: 1 }}>
        <PrototypeScreen id={id} />
      </View>
    );
  }

  return (
    <View testID="ui-preview-index" style={{ flex: 1 }}>
      <PrototypeIndex />
    </View>
  );
}
