import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGNOSTIC_KEY = '@ambler/diagnostics/recent-errors';
const MAX_ERRORS = 10;

export interface AppDiagnostic {
  at: string;
  message: string;
  stack?: string;
  componentStack?: string;
  context?: string;
}

function scrub(value?: string): string | undefined {
  if (!value) return undefined;
  // Keep diagnostics useful without persisting URLs/query strings that could
  // contain signed media tokens or invite/share identifiers.
  return value
    .replace(/https?:\/\/[^\s)]+/g, '[url]')
    .replace(/\b[A-Fa-f0-9]{24,}\b/g, '[token]')
    .slice(0, 8000);
}

export async function recordAppError(
  error: unknown,
  options: { componentStack?: string; context?: string } = {},
): Promise<void> {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const entry: AppDiagnostic = {
    at: new Date().toISOString(),
    message: scrub(normalized.message) ?? 'Unknown error',
    stack: scrub(normalized.stack),
    componentStack: scrub(options.componentStack),
    context: options.context,
  };

  console.error('[Ambler]', options.context ?? 'app-error', normalized);

  try {
    const raw = await AsyncStorage.getItem(DIAGNOSTIC_KEY);
    const existing = raw ? (JSON.parse(raw) as AppDiagnostic[]) : [];
    const next = [entry, ...existing].slice(0, MAX_ERRORS);
    await AsyncStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(next));
  } catch {
    // Diagnostics must never crash the app while handling another failure.
  }
}

export async function getRecentDiagnostics(): Promise<AppDiagnostic[]> {
  try {
    const raw = await AsyncStorage.getItem(DIAGNOSTIC_KEY);
    return raw ? (JSON.parse(raw) as AppDiagnostic[]) : [];
  } catch {
    return [];
  }
}

export async function clearDiagnostics(): Promise<void> {
  await AsyncStorage.removeItem(DIAGNOSTIC_KEY);
}
