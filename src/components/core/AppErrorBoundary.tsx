import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { recordAppError } from '../../features/diagnostics/errorReporter';
import { colors } from '../../styles/theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordAppError(error, {
      context: 'render-boundary',
      componentStack: info.componentStack ?? undefined,
    }).catch(() => {});
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <View style={styles.mark}><Text style={styles.markText}>A</Text></View>
        <Text style={styles.title}>Ambler hit a snag</Text>
        <Text style={styles.body}>
          Your event data has not been deleted. A private diagnostic was saved on this device so the issue can be investigated.
        </Text>
        <Pressable style={styles.button} onPress={this.reset}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  mark: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  markText: { color: 'white', fontSize: 28, fontWeight: '900' },
  title: { color: colors.ink, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, fontWeight: '600', textAlign: 'center', maxWidth: 420 },
  button: { marginTop: 8, backgroundColor: colors.purple, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 26 },
  buttonText: { color: 'white', fontSize: 14, fontWeight: '900' },
});
