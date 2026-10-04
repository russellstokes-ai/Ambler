const DEFAULT_PUBLIC_APP_URL = 'https://ambler.app';

export function publicAppUrl(): string {
  return (process.env.EXPO_PUBLIC_APP_URL ?? process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? DEFAULT_PUBLIC_APP_URL)
    .replace(/\/$/, '');
}

export function eventInviteUrl(inviteCode: string): string {
  return `${publicAppUrl()}/join/${encodeURIComponent(inviteCode.toUpperCase())}`;
}

export function storyShareUrl(token: string): string {
  return `${publicAppUrl()}/share/${encodeURIComponent(token)}`;
}
