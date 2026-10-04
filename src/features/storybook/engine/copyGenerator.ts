// Copy Generator — Theme-aware copy generation
// Generates page titles, subtitles, kickers, and share card copy.
// Generated copy must use product language only.

import { EngineEvent, PageCopy, StorybookCopy, ThemeKey } from './types';
import { selectStoryContent } from './eventStoryContent';
import { EventType } from '../../../types';

interface ThemeVoice {
  cover: PageCopy;
  opening: PageCopy;
  timeline: PageCopy;
  routeReplay: PageCopy;
  heroGallery: PageCopy;
  storyInsights: PageCopy;
  friendCaptions: PageCopy;
  share: PageCopy;
  shareCardVerticalTemplate: string;  // uses {eventName} and {keyStat}
  shareCardSquareTemplate: string;    // uses {eventType}
}

// Theme voice configurations
const THEME_VOICES: Record<ThemeKey, ThemeVoice> = {
  cinematic: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'A story worth reliving' },
    opening: { kicker: 'The Beginning', title: 'The moments that mattered', subtitle: 'Where it all started' },
    timeline: { kicker: 'The Story', title: 'How it unfolded', subtitle: 'Every chapter, in its own time' },
    routeReplay: { kicker: 'The Journey', title: 'Where the day went', subtitle: 'Every mile, every turn' },
    heroGallery: { kicker: 'The Highlights', title: 'The best of {eventName}', subtitle: 'Moments that stop you in your tracks' },
    storyInsights: { kicker: 'The Details', title: 'Story Insights', subtitle: 'The story behind the memory' },
    friendCaptions: { kicker: 'The Voices', title: 'What everyone said', subtitle: 'Words from the people who were there' },
    share: { kicker: 'The Finale', title: 'Share the story', subtitle: 'Send it to the people who were there' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} in one cinematic story',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  social_story: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: "Here's what happened 👀" },
    opening: { kicker: 'Recap', title: 'The opening act', subtitle: 'How the night kicked off' },
    timeline: { kicker: 'Timeline', title: 'How it went down', subtitle: 'The full play-by-play' },
    routeReplay: { kicker: 'Map Check', title: 'Where you went', subtitle: 'The route, mapped out' },
    heroGallery: { kicker: 'Best Bits', title: 'Top moments', subtitle: 'The ones worth sharing' },
    storyInsights: { kicker: 'Stats', title: 'The recap by numbers', subtitle: 'The stats you needed' },
    friendCaptions: { kicker: 'Talk', title: 'What they said', subtitle: 'Quotes from the group chat' },
    share: { kicker: 'Share', title: 'Send it', subtitle: 'Share it with your people' },
    shareCardVerticalTemplate: '{eventName} — {keyStat}. The recap you needed',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  wrapped: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'The stats are in' },
    opening: { kicker: 'Opening', title: 'Your {eventType} by the numbers', subtitle: 'Where it all began' },
    timeline: { kicker: 'Timeline', title: 'How it played out', subtitle: 'Hour by hour, chapter by chapter' },
    routeReplay: { kicker: 'The Route', title: 'Where you went', subtitle: 'Distance and stops, mapped' },
    heroGallery: { kicker: 'Top Moments', title: 'Your biggest moments', subtitle: 'The highlights, ranked' },
    storyInsights: { kicker: 'Your Stats', title: 'Your story by the numbers', subtitle: 'Every number tells a story' },
    friendCaptions: { kicker: 'Quotes', title: 'What the group said', subtitle: 'The best one-liners' },
    share: { kicker: 'Share', title: 'Your wrapped story', subtitle: 'Share your stats with the group' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} in one wrapped story',
    shareCardSquareTemplate: 'Your {eventType} wrapped is here',
  },
  route_replay: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'The journey, mapped' },
    opening: { kicker: 'Start', title: 'Where the day went', subtitle: 'The road that started it all' },
    timeline: { kicker: 'Timeline', title: 'The route unfolds', subtitle: 'Every stop along the way' },
    routeReplay: { kicker: 'Route Replay', title: 'The full route', subtitle: 'Every mile, every stop, every detour' },
    heroGallery: { kicker: 'Highlights', title: 'Best of the road', subtitle: 'The moments worth the detour' },
    storyInsights: { kicker: 'Journey Notes', title: 'The journey by numbers', subtitle: 'Distance, stops, and highlights' },
    friendCaptions: { kicker: 'On the Road', title: 'What everyone said', subtitle: 'Captions from the car' },
    share: { kicker: 'Share', title: 'Share the route', subtitle: 'Send the journey to the group' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} on the road',
    shareCardSquareTemplate: 'Your {eventType} route is mapped and ready',
  },
  luxe: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'An evening to remember' },
    opening: { kicker: 'The Beginning', title: 'Elegance in motion', subtitle: 'The opening moments' },
    timeline: { kicker: 'The Evening', title: 'How the night unfolded', subtitle: 'A chronology of moments' },
    routeReplay: { kicker: 'The Map', title: 'Where the evening unfolded', subtitle: 'The places that framed it' },
    heroGallery: { kicker: 'The Collection', title: 'A curated selection', subtitle: 'The finest moments of the night' },
    storyInsights: { kicker: 'Insights', title: 'An evening of distinction', subtitle: 'The details that made it special' },
    friendCaptions: { kicker: 'Voices', title: 'Words from the evening', subtitle: 'Remarks from the guests' },
    share: { kicker: 'Share', title: 'Share the memory', subtitle: 'An evening worth passing on' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} of pure elegance',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  confetti: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'A celebration worth saving' },
    opening: { kicker: 'Start', title: 'The party begins', subtitle: 'Where the celebration kicked off' },
    timeline: { kicker: 'Timeline', title: 'How the joy unfolded', subtitle: 'Cheers, laughs, and favourite moments' },
    routeReplay: { kicker: 'The Places', title: 'Where the party went', subtitle: 'Every stop from start to finish' },
    heroGallery: { kicker: 'Highlights', title: 'The brightest moments', subtitle: 'Photos worth keeping' },
    storyInsights: { kicker: 'Party Notes', title: 'The celebration by numbers', subtitle: 'Friends, photos, and peak energy' },
    friendCaptions: { kicker: 'From the Group', title: 'What everyone said', subtitle: 'Messages from the people who were there' },
    share: { kicker: 'Share', title: 'Share the celebration', subtitle: 'Send it before the group chat moves on' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} in one celebration',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  neon_pulse: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'The night, turned all the way up' },
    opening: { kicker: 'First Beat', title: 'The energy started here', subtitle: 'Before the lights took over' },
    timeline: { kicker: 'Setlist', title: 'How the night built', subtitle: 'Beat by beat, moment by moment' },
    routeReplay: { kicker: 'Map Check', title: 'Where the night moved', subtitle: 'Stages, stops, and late-night detours' },
    heroGallery: { kicker: 'Highlights', title: 'Peak energy', subtitle: 'The moments everyone will ask for' },
    storyInsights: { kicker: 'Pulse Check', title: 'The night by numbers', subtitle: 'Photos, places, and standout moments' },
    friendCaptions: { kicker: 'Crowd Notes', title: 'What everyone said', subtitle: 'Quotes that survived the night' },
    share: { kicker: 'Share', title: 'Send the night back', subtitle: 'Share it before the details blur' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} at full volume',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  warm_gold: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'Warm moments, saved together' },
    opening: { kicker: 'The Beginning', title: 'The moments that mattered', subtitle: 'Where everyone gathered' },
    timeline: { kicker: 'The Story', title: 'How it unfolded', subtitle: 'Every chapter, kept in order' },
    routeReplay: { kicker: 'The Places', title: 'Where the day went', subtitle: 'The places behind the memory' },
    heroGallery: { kicker: 'Highlights', title: 'The moments to keep', subtitle: 'Photos worth coming back to' },
    storyInsights: { kicker: 'The Details', title: 'Story Insights', subtitle: 'The story behind the memory' },
    friendCaptions: { kicker: 'From Everyone', title: 'What everyone said', subtitle: 'Words from the people who were there' },
    share: { kicker: 'Share', title: 'Share the memory', subtitle: 'Send it to the people who made it' },
    shareCardVerticalTemplate: '{eventName} — {keyStat}, saved together',
    shareCardSquareTemplate: 'Your {eventType} storybook is ready',
  },
  retro_film: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'Back when it all happened' },
    opening: { kicker: 'Reel One', title: 'Throwback to {date}', subtitle: 'Where the story begins' },
    timeline: { kicker: 'The Reel', title: 'How it played out', subtitle: 'Frame by frame' },
    routeReplay: { kicker: 'On the Map', title: 'Where you went', subtitle: 'The route, vintage style' },
    heroGallery: { kicker: 'The Prints', title: 'The best shots', subtitle: 'Photos worth developing' },
    storyInsights: { kicker: 'The Details', title: 'Story Insights', subtitle: 'The story behind the film' },
    friendCaptions: { kicker: 'Handwritten', title: 'What everyone said', subtitle: 'Notes from the back of the photo' },
    share: { kicker: 'Share', title: 'Share the throwback', subtitle: 'Pass the memories along' },
    shareCardVerticalTemplate: '{eventName} — {keyStat}, saved on film',
    shareCardSquareTemplate: 'Your {eventType} throwback is ready',
  },
  magazine: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'The feature story' },
    opening: { kicker: 'Opening Spread', title: 'Inside {eventName}', subtitle: 'The story begins here' },
    timeline: { kicker: 'Feature', title: 'How it unfolded', subtitle: 'A timeline worth reading' },
    routeReplay: { kicker: 'The Map', title: 'Where the story went', subtitle: 'The places behind the story' },
    heroGallery: { kicker: 'The Portfolio', title: 'The best frames', subtitle: 'A gallery worth printing' },
    storyInsights: { kicker: 'By the Numbers', title: 'The details behind the story', subtitle: 'The moments in sharper focus' },
    friendCaptions: { kicker: 'Quotes', title: 'What they said', subtitle: 'Quotes from the feature' },
    share: { kicker: 'Share', title: 'Share the feature', subtitle: 'Send the story to your circle' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} in one feature story',
    shareCardSquareTemplate: 'Your {eventType} feature is ready',
  },
  chaos: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'What even happened' },
    opening: { kicker: 'The Start', title: 'How it began', subtitle: 'Before things got... interesting' },
    timeline: { kicker: 'The Chaos', title: 'How it actually went', subtitle: 'A beautiful disaster, hour by hour' },
    routeReplay: { kicker: 'Where You Went', title: 'The detours', subtitle: 'The map explains some of it' },
    heroGallery: { kicker: 'Highlights', title: 'The best chaos', subtitle: 'Photos that tell the whole story' },
    storyInsights: { kicker: 'The Recap', title: 'Stats from the night', subtitle: 'The numbers are wild' },
    friendCaptions: { kicker: 'The Group Chat', title: 'What everyone said', subtitle: 'The quotes that survived' },
    share: { kicker: 'Share', title: 'Send it to the group', subtitle: 'They need to see this' },
    shareCardVerticalTemplate: '{eventName} — {keyStat}. A beautiful disaster',
    shareCardSquareTemplate: 'Your {eventType} chaos is ready to share',
  },
  family_keepsake: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: 'A day we will keep forever' },
    opening: { kicker: 'The Beginning', title: 'A memory to hold onto', subtitle: 'Where the day started' },
    timeline: { kicker: 'The Day', title: 'How it unfolded', subtitle: 'Every moment, preserved' },
    routeReplay: { kicker: 'Where We Went', title: 'The family map', subtitle: 'Places we went together' },
    heroGallery: { kicker: 'Keepsakes', title: 'The moments we treasure', subtitle: 'Photos for the family archive' },
    storyInsights: { kicker: 'The Details', title: 'Story Insights', subtitle: 'The numbers behind the memory' },
    friendCaptions: { kicker: 'From the Family', title: 'What everyone said', subtitle: 'Messages to keep close' },
    share: { kicker: 'Share', title: 'Share with the family', subtitle: 'Pass it on to the ones who matter' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} to keep forever',
    shareCardSquareTemplate: 'Your {eventType} keepsake is ready',
  },
  minimal: {
    cover: { kicker: undefined, title: '{eventName}', subtitle: '{date} · {location}' },
    opening: { kicker: undefined, title: 'The opening', subtitle: undefined },
    timeline: { kicker: undefined, title: 'Timeline', subtitle: undefined },
    routeReplay: { kicker: undefined, title: 'Route', subtitle: undefined },
    heroGallery: { kicker: undefined, title: 'Highlights', subtitle: undefined },
    storyInsights: { kicker: undefined, title: 'Insights', subtitle: undefined },
    friendCaptions: { kicker: undefined, title: 'Captions', subtitle: undefined },
    share: { kicker: undefined, title: 'Share', subtitle: undefined },
    shareCardVerticalTemplate: '{eventName} — {keyStat}',
    shareCardSquareTemplate: 'Your {eventType} storybook',
  },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  birthday: 'birthday',
  road_trip: 'road trip',
  gender_reveal: 'gender reveal',
  baby_shower: 'baby shower',
  proposal: 'proposal',
  engagement_party: 'engagement party',
  wedding: 'wedding',
  stag: 'stag party',
  hen: 'hen party',
  festival: 'festival',
  night_out: 'night out',
  group_holiday: 'group holiday',
  family_gathering: 'family gathering',
  graduation: 'graduation',
  work_social: 'work social',
  hiking_day: 'hiking day',
  match_day: 'match day',
  sports_trip: 'sports trip',
  sports_event: 'sports event',
  group_workout: 'group workout',
  run_walk: 'run or walk',
  cycle_ride: 'cycle ride',
  fitness_challenge: 'fitness challenge',
  custom: 'event',
};

const EVENT_COPY_OVERRIDES: Partial<Record<string, Partial<ThemeVoice>>> = {
  road_trip: {
    opening: { kicker: 'Start', title: 'The road opened up', subtitle: 'Where the journey began' },
    timeline: { kicker: 'Timeline', title: 'How the route unfolded', subtitle: 'Stops, views, and the moments between' },
    routeReplay: { kicker: 'Route Replay', title: 'The full journey', subtitle: 'Every stop and scenic detour' },
    heroGallery: { kicker: 'Highlights', title: 'Best of the road', subtitle: 'The views worth pulling over for' },
    storyInsights: { kicker: 'Journey Notes', title: 'Your road trip by numbers', subtitle: 'Distance, stops, and standout moments' },
    friendCaptions: { kicker: 'From the car', title: 'What everyone said', subtitle: 'Quotes from the journey' },
    share: { kicker: 'Share', title: 'Share the road trip', subtitle: 'Send the journey to the group' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} on the road',
    shareCardSquareTemplate: 'Your road trip storybook is ready',
  },
  wedding: {
    opening: { kicker: 'The Beginning', title: 'The day began beautifully', subtitle: 'The first moments of forever' },
    timeline: { kicker: 'The Day', title: 'How the celebration unfolded', subtitle: 'From first look to last dance' },
    routeReplay: { kicker: 'The Places', title: 'Where the day unfolded', subtitle: 'Ceremony, celebration, and every stop between' },
    heroGallery: { kicker: 'The Highlights', title: 'The moments to keep', subtitle: 'Love, laughter, and all the little details' },
    storyInsights: { kicker: 'The Details', title: 'The day in detail', subtitle: 'The moments behind the memory' },
    friendCaptions: { kicker: 'From the Guests', title: 'What everyone said', subtitle: 'Messages from the people who were there' },
    share: { kicker: 'Share', title: 'Share the wedding story', subtitle: 'Send it to the people who made the day' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} from the wedding day',
    shareCardSquareTemplate: 'Your wedding storybook is ready',
  },
  festival: {
    opening: { kicker: 'First Set', title: 'The weekend came alive', subtitle: 'Where the music started' },
    timeline: { kicker: 'Setlist', title: 'How the festival unfolded', subtitle: 'Stages, crowds, and late-night highlights' },
    routeReplay: { kicker: 'Festival Map', title: 'Across the grounds', subtitle: 'Stages, stops, and favourite corners' },
    heroGallery: { kicker: 'Highlights', title: 'Best of the weekend', subtitle: 'Lights, crowds, and main-character moments' },
    storyInsights: { kicker: 'Festival Notes', title: 'The weekend by numbers', subtitle: 'Stages, photos, and peak moments' },
    friendCaptions: { kicker: 'From the Crowd', title: 'What everyone said', subtitle: 'Quotes from the weekend' },
    share: { kicker: 'Share', title: 'Share the festival story', subtitle: 'Send the weekend back to the group' },
    shareCardVerticalTemplate: '{eventName} — {keyStat} from the festival',
    shareCardSquareTemplate: 'Your festival storybook is ready',
  },
  birthday: {
    opening: { kicker: 'The Start', title: 'The celebration began', subtitle: 'Where the birthday energy started' },
    timeline: { kicker: 'The Party', title: 'How the celebration unfolded', subtitle: 'Candles, cheers, and favourite moments' },
    routeReplay: { kicker: 'The Places', title: 'Where the party went', subtitle: 'Every stop from start to finish' },
    heroGallery: { kicker: 'Highlights', title: 'Birthday favourites', subtitle: 'The moments worth keeping' },
    storyInsights: { kicker: 'Party Notes', title: 'The birthday by numbers', subtitle: 'Photos, friends, and peak moments' },
    shareCardSquareTemplate: 'Your birthday storybook is ready',
  },
  family_gathering: {
    opening: { kicker: 'The Beginning', title: 'A day together', subtitle: 'Where the family story began' },
    timeline: { kicker: 'The Day', title: 'How it unfolded', subtitle: 'Little moments, big memories' },
    routeReplay: { kicker: 'Where We Went', title: 'The family map', subtitle: 'Places we shared together' },
    heroGallery: { kicker: 'Keepsakes', title: 'The moments we treasure', subtitle: 'Photos for everyone to keep' },
    storyInsights: { kicker: 'The Details', title: 'A day to remember', subtitle: 'The moments behind the memory' },
    friendCaptions: { kicker: 'From the Family', title: 'What everyone said', subtitle: 'Messages to keep close' },
    share: { kicker: 'Share', title: 'Share with family', subtitle: 'Send it to the ones who matter' },
    shareCardSquareTemplate: 'Your family keepsake is ready',
  },
  proposal: {
    opening: { kicker: 'The Moment', title: 'Everything changed here', subtitle: 'The start of the story' },
    timeline: { kicker: 'The Story', title: 'How the moment unfolded', subtitle: 'Every look, smile, and yes' },
    heroGallery: { kicker: 'Keepsakes', title: 'The moments to keep', subtitle: 'The photos that say everything' },
    storyInsights: { kicker: 'The Details', title: 'The story in detail', subtitle: 'Small moments, unforgettable feeling' },
    shareCardSquareTemplate: 'Your proposal storybook is ready',
  },
};

/**
 * Generate all copy for the storybook.
 * Pure function — no side effects.
 */
export function generateCopy(
  event: EngineEvent,
  theme: ThemeKey,
  keyStat?: string,
): StorybookCopy {
  const voice = THEME_VOICES[theme] ?? THEME_VOICES.cinematic!;
  const baseEventVoice = mergeThemeVoice(voice, EVENT_COPY_OVERRIDES[event.type]);
  const richEventContent = selectStoryContent(event.type, `${event.id}|${event.title}|${event.startsAt}`);
  const eventVoice = mergeThemeVoice(baseEventVoice, richEventContent);
  const eventTypeLabel = EVENT_TYPE_LABELS[event.type] ?? humanizeEventType(event.type);
  const dateLabel = formatDateLabel(event.startsAt);
  const stat = keyStat ?? defaultKeyStat(event.type);

  return {
    cover: fillTemplate(eventVoice.cover, event, dateLabel, eventTypeLabel),
    opening: fillTemplate(eventVoice.opening, event, dateLabel, eventTypeLabel),
    timeline: fillTemplate(eventVoice.timeline, event, dateLabel, eventTypeLabel),
    routeReplay: fillTemplate(eventVoice.routeReplay, event, dateLabel, eventTypeLabel),
    heroGallery: fillTemplate(eventVoice.heroGallery, event, dateLabel, eventTypeLabel),
    storyInsights: fillTemplate(eventVoice.storyInsights, event, dateLabel, eventTypeLabel),
    friendCaptions: fillTemplate(eventVoice.friendCaptions, event, dateLabel, eventTypeLabel),
    share: fillTemplate(eventVoice.share, event, dateLabel, eventTypeLabel),
    shareCardVertical: fillStringTemplate(eventVoice.shareCardVerticalTemplate, event, eventTypeLabel, stat),
    shareCardSquare: fillStringTemplate(eventVoice.shareCardSquareTemplate, event, eventTypeLabel, stat),
  };
}

// ─── Template Helpers ──────────────────────────────────────────

function mergeThemeVoice(base: ThemeVoice, override?: Partial<ThemeVoice>): ThemeVoice {
  if (!override) return base;
  return {
    ...base,
    ...override,
    cover: { ...base.cover, ...override.cover },
    opening: { ...base.opening, ...override.opening },
    timeline: { ...base.timeline, ...override.timeline },
    routeReplay: { ...base.routeReplay, ...override.routeReplay },
    heroGallery: { ...base.heroGallery, ...override.heroGallery },
    storyInsights: { ...base.storyInsights, ...override.storyInsights },
    friendCaptions: { ...base.friendCaptions, ...override.friendCaptions },
    share: { ...base.share, ...override.share },
  };
}

function defaultKeyStat(eventType: EventType): string {
  switch (eventType) {
    case 'road_trip':
      return 'A journey';
    case 'wedding':
      return 'A day to remember';
    case 'festival':
      return 'A weekend of highlights';
    case 'family_gathering':
      return 'A family keepsake';
    case 'proposal':
      return 'The moment';
    case 'hiking_day':
      return 'A trail worth remembering';
    case 'sports_event':
    case 'match_day':
    case 'sports_trip':
      return 'Game-day memories';
    case 'group_workout':
    case 'fitness_challenge':
      return 'A shared challenge';
    case 'run_walk':
    case 'cycle_ride':
      return 'A route worth replaying';
    default:
      return 'A story';
  }
}

function fillTemplate(
  copy: PageCopy,
  event: EngineEvent,
  dateLabel: string,
  eventTypeLabel: string,
): PageCopy {
  return {
    kicker: copy.kicker,
    title: fillStringTemplate(copy.title, event, eventTypeLabel, '', dateLabel),
    subtitle: copy.subtitle
      ? fillStringTemplate(copy.subtitle, event, eventTypeLabel, '', dateLabel)
      : undefined,
  };
}

function fillStringTemplate(
  template: string,
  event: EngineEvent,
  eventTypeLabel: string,
  keyStat: string,
  dateLabel?: string,
): string {
  return template
    .replace(/\{eventName\}/g, event.title)
    .replace(/\{eventType\}/g, eventTypeLabel)
    .replace(/\{keyStat\}/g, keyStat)
    .replace(/\{date\}/g, dateLabel ?? formatDateLabel(event.startsAt))
    .replace(/\{location\}/g, event.locationLabel);
}

function humanizeEventType(eventType: EventType): string {
  return eventType.replace(/_/g, ' ');
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]!} ${d.getDate()}, ${d.getFullYear()}`;
}
