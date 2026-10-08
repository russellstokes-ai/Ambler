import React from 'react';
import { View } from 'react-native';
import StressFixture from '../../src/ui-prototype/StressFixture';

export default function UiStressFixture() {
  return (
    <View testID="ui-stress-route" style={{ flex: 1 }}>
      <StressFixture />
    </View>
  );
}
