import React from 'react';
import { View } from 'react-native';
import { PrototypeIndex } from '../../src/ui-prototype/screens';

export default function UiPreviewIndex() {
  return (
    <View testID="ui-preview-index" style={{ flex: 1 }}>
      <PrototypeIndex />
    </View>
  );
}
