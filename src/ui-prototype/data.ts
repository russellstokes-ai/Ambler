export type PrototypeScreenId =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'profile-setup'
  | 'home'
  | 'events'
  | 'stories'
  | 'archive'
  | 'create-basics'
  | 'event-type'
  | 'story-style'
  | 'privacy-route'
  | 'invite'
  | 'event-hub'
  | 'moments'
  | 'add-moment'
  | 'route-capture'
  | 'guest-join'
  | 'guest-contribution'
  | 'guest-result'
  | 'finish-build'
  | 'generation'
  | 'story-ready'
  | 'relive'
  | 'route-replay'
  | 'route-moment'
  | 'story-editor'
  | 'theme-music'
  | 'share-export'
  | 'shared-web'
  | 'profile'
  | 'settings'
  | 'privacy-data'
  | 'storage-hosting'
  | 'add-server'
  | 'server-detail';

export const prototypeScreens: Array<{
  id: PrototypeScreenId;
  title: string;
  section: string;
  subtitle: string;
}> = [
  { id: 'splash', title: 'Splash', section: 'Entry', subtitle: 'Brand reveal' },
  { id: 'onboarding', title: 'Onboarding', section: 'Entry', subtitle: 'Capture → Build → Relive' },
  { id: 'auth', title: 'Sign in', section: 'Entry', subtitle: 'Simple account entry' },
  { id: 'profile-setup', title: 'Profile setup', section: 'Entry', subtitle: 'Name and optional photo' },

  { id: 'home', title: 'Home', section: 'Main', subtitle: 'Active event + recent stories' },
  { id: 'events', title: 'Events', section: 'Main', subtitle: 'Active, upcoming and past' },
  { id: 'stories', title: 'Stories', section: 'Main', subtitle: 'Visual story library' },
  { id: 'archive', title: 'Archive', section: 'Main', subtitle: 'Archived events and stories' },

  { id: 'create-basics', title: 'Create event', section: 'Event', subtitle: 'Fast event basics' },
  { id: 'event-type', title: 'Event type', section: 'Event', subtitle: 'Curated categories + search' },
  { id: 'story-style', title: 'Story style', section: 'Event', subtitle: 'Recommended themes first' },
  { id: 'privacy-route', title: 'Privacy & route', section: 'Event', subtitle: 'Private-first choices' },
  { id: 'invite', title: 'Invite', section: 'Event', subtitle: 'QR and private link' },
  { id: 'event-hub', title: 'Live event hub', section: 'Event', subtitle: 'Capture is the primary action' },
  { id: 'moments', title: 'Moments', section: 'Event', subtitle: 'Shared media pool' },
  { id: 'add-moment', title: 'Add moment', section: 'Event', subtitle: 'Photo, video or note' },
  { id: 'route-capture', title: 'Route capture', section: 'Event', subtitle: 'Private live route recording' },

  { id: 'guest-join', title: 'Guest join', section: 'Guest', subtitle: 'No generic account wall' },
  { id: 'guest-contribution', title: 'Guest contribution', section: 'Guest', subtitle: 'Upload and note flow' },
  { id: 'guest-result', title: 'Guest upload result', section: 'Guest', subtitle: 'Success, retry and offline' },

  { id: 'finish-build', title: 'Build story', section: 'Relive', subtitle: 'Transition out of capture' },
  { id: 'generation', title: 'Generation progress', section: 'Relive', subtitle: 'Real phases, no fake spinner' },
  { id: 'story-ready', title: 'Story ready', section: 'Relive', subtitle: 'Cinematic reveal' },
  { id: 'relive', title: 'Relive', section: 'Relive', subtitle: 'Finished story experience' },
  { id: 'route-replay', title: 'Route Replay V2', section: 'Relive', subtitle: 'Interactive cinematic route' },
  { id: 'route-moment', title: 'Route moment', section: 'Relive', subtitle: 'Photo/video cluster viewer' },

  { id: 'story-editor', title: 'Story editor', section: 'Edit & share', subtitle: 'Simple, contextual editing' },
  { id: 'theme-music', title: 'Theme & music', section: 'Edit & share', subtitle: 'Visual theme and soundtrack' },
  { id: 'share-export', title: 'Share & export', section: 'Edit & share', subtitle: 'Private link + save options' },
  { id: 'shared-web', title: 'Shared web story', section: 'Edit & share', subtitle: 'No-install recipient experience' },

  { id: 'profile', title: 'Profile', section: 'Account', subtitle: 'Personal hub' },
  { id: 'settings', title: 'Settings', section: 'Account', subtitle: 'Calm grouped settings' },
  { id: 'privacy-data', title: 'Privacy & data', section: 'Account', subtitle: 'Clear privacy controls' },
  { id: 'storage-hosting', title: 'Storage & hosting', section: 'Hosting', subtitle: 'Cloud / device / home server' },
  { id: 'add-server', title: 'Add Ambler Server', section: 'Hosting', subtitle: 'Discover, QR or manual' },
  { id: 'server-detail', title: 'Server detail', section: 'Hosting', subtitle: 'Storage, sync and recovery' },
];

export const mockEvents = [
  {
    title: 'Snowdon Weekend',
    meta: '8 people · 99 moments · Route on',
    state: 'LIVE',
    accent: '#19C37D',
    icon: 'trail-sign-outline',
  },
  {
    title: 'Saturday in Barcelona',
    meta: '5 people · 74 moments',
    state: 'UPCOMING',
    accent: '#18C7D5',
    icon: 'airplane-outline',
  },
  {
    title: "Sophie's 40th Birthday Celebration at The Orangery",
    meta: '12 people · 68 moments',
    state: 'STORY READY',
    accent: '#EC3FA4',
    icon: 'sparkles-outline',
  },
];

export const mockStories = [
  { title: 'Snowdon Weekend', kicker: 'A summit worth replaying', storage: 'Home Server', theme: 'terrain', icon: 'mountain-outline' },
  { title: 'Barcelona', kicker: '48 hours, one city, five viewpoints', storage: 'Cloud', theme: 'city', icon: 'business-outline' },
  { title: 'Thorpe Park Day', kicker: 'The fast bits, the wet bits, the best bits', storage: 'Device', theme: 'venue', icon: 'ticket-outline' },
  { title: "Sophie's 40th", kicker: 'Everyone brought a different angle', storage: 'Cloud', theme: 'party', icon: 'balloon-outline' },
  { title: 'One Quiet Afternoon', kicker: 'One photo. One small memory worth keeping.', storage: 'Device', theme: 'sparse', icon: 'sunny-outline' },
  { title: 'Five-a-side Final', kicker: 'Video-first match story', storage: 'Cloud', theme: 'sport', icon: 'football-outline' },
  { title: 'Walking the Thames', kicker: 'A route-led story with very little media', storage: 'Home Server', theme: 'route', icon: 'walk-outline' },
];

export const eventCategories = [
  ['Popular', 'sparkles-outline'],
  ['Travel', 'airplane-outline'],
  ['Activities', 'walk-outline'],
  ['Celebrations', 'wine-outline'],
  ['Family & life', 'heart-outline'],
  ['Community', 'people-outline'],
  ['All', 'apps-outline'],
] as const;

export const popularEventTypes = [
  ['Road trip', 'car-sport-outline', 'Journey-first story'],
  ['Weekend away', 'bed-outline', 'Shared trip'],
  ['Birthday', 'gift-outline', 'Celebration'],
  ['Hiking day', 'trail-sign-outline', 'Route + elevation'],
  ['City break', 'business-outline', 'Urban story'],
  ['Theme park day', 'ticket-outline', 'Venue journey'],
];

export const storyThemes = [
  { name: 'Cinematic', subtitle: 'Dark, immersive, slow-build', colors: ['#050713', '#4C1D95', '#F43F5E'] },
  { name: 'Route Replay', subtitle: 'Map-first, energetic journey', colors: ['#061822', '#0EA5E9', '#F97316'] },
  { name: 'Warm Gold', subtitle: 'Travel journal, warm editorial', colors: ['#FFF8EA', '#1F6F68', '#D99A2B'] },
  { name: 'Magazine', subtitle: 'Clean editorial storytelling', colors: ['#F8F5EF', '#111827', '#E11D48'] },
];

export const routeMoments = [
  { id: '1', x: '13%', y: '69%', title: 'Trail start', icon: 'camera-outline', count: 3 },
  { id: '2', x: '37%', y: '53%', title: 'Halfway ridge', icon: 'images-outline', count: 6 },
  { id: '3', x: '58%', y: '32%', title: 'Summit clip', icon: 'play', count: 1 },
  { id: '4', x: '79%', y: '19%', title: 'Summit', icon: 'images-outline', count: 9 },
] as const;
