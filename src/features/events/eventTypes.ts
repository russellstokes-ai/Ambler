// ─── Event Type System ────────────────────────────────────────
// Full event type catalog — templates, not hard-coded logic.
// Any event becomes a premium storybook.

export type EventCategory =
  | 'social'
  | 'travel'
  | 'activity'
  | 'life_moment'
  | 'family'
  | 'community'
  | 'universal';

export type EventTypeKey =
  // Social & celebration
  | 'birthday'
  | 'house_party'
  | 'dinner_party'
  | 'night_out'
  | 'weekend_away'
  | 'festival'
  | 'graduation'
  | 'reunion'
  | 'work_social'
  | 'team_event'
  | 'sports_trip'
  | 'private_party'
  | 'family_gathering'
  | 'anniversary'
  // Travel & movement
  | 'road_trip'
  | 'group_holiday'
  | 'city_break'
  | 'backpacking_trip'
  | 'cruise'
  | 'ski_trip'
  | 'camping_trip'
  | 'hiking_day'
  | 'beach_day'
  | 'theme_park_day'
  | 'match_day'
  | 'day_trip'
  | 'sports_event'
  | 'group_workout'
  | 'run_walk'
  | 'cycle_ride'
  | 'fitness_challenge'
  // Life moments
  | 'proposal'
  | 'engagement_party'
  | 'wedding'
  | 'stag'
  | 'hen'
  | 'baby_shower'
  | 'gender_reveal'
  | 'christening'
  | 'new_home_party'
  | 'leaving_party'
  | 'retirement_party'
  // Community & organised
  | 'school_event'
  | 'university_event'
  | 'club_event'
  | 'charity_event'
  | 'meetup'
  | 'conference_social'
  | 'brand_event'
  | 'launch_party'
  | 'creator_meetup'
  // Universal
  | 'custom';

export type ThemeKey =
  | 'cinematic'
  | 'social_story'
  | 'wrapped'
  | 'route_replay'
  | 'luxe'
  | 'confetti'
  | 'neon_pulse'
  | 'warm_gold'
  | 'retro_film'
  | 'magazine'
  | 'chaos'
  | 'family_keepsake'
  | 'minimal';

export const universalThemeKeys: ThemeKey[] = [
  'cinematic',
  'social_story',
  'wrapped',
  'route_replay',
  'luxe',
  'confetti',
  'neon_pulse',
  'warm_gold',
  'retro_film',
  'magazine',
  'chaos',
  'family_keepsake',
  'minimal',
];

// ─── Event Type Definition ────────────────────────────────────

export interface EventTypeDefinition {
  key: EventTypeKey;
  label: string;
  icon: string; // Ionicons name
  category: EventCategory;
  recommendedThemes: ThemeKey[];
  defaultPrivacy: 'private' | 'shared' | 'public';
  description: string;
}

// ─── Event Phase Config (for timeline chapter detection) ─────

export interface EventPhase {
  key: string;
  label: string;
  hint: string;
}

export type EventPhaseConfig = Record<EventTypeKey, EventPhase[]>;

// ─── Category Metadata ────────────────────────────────────────

export interface CategoryMeta {
  key: EventCategory;
  label: string;
  color: string;
  icon: string;
}

export const categoryMeta: Record<EventCategory, CategoryMeta> = {
  social: { key: 'social', label: 'Social', color: '#EC3FA4', icon: 'people' },
  travel: { key: 'travel', label: 'Travel', color: '#18C7D5', icon: 'airplane' },
  activity: { key: 'activity', label: 'Activity', color: '#FF6B35', icon: 'fitness' },
  life_moment: { key: 'life_moment', label: 'Life Moments', color: '#5B2CFF', icon: 'heart' },
  family: { key: 'family', label: 'Family', color: '#19C37D', icon: 'home' },
  community: { key: 'community', label: 'Community', color: '#FFB020', icon: 'earth' },
  universal: { key: 'universal', label: 'All Events', color: '#746B8C', icon: 'apps' },
};

// ─── Full Event Type Catalog ──────────────────────────────────

export const eventTypeDefs: EventTypeDefinition[] = [
  // ── Social & Celebration ──────────────────────────────────
  { key: 'birthday', label: 'Birthday', icon: 'gift', category: 'social', recommendedThemes: ['confetti', 'social_story', 'wrapped', 'cinematic', 'retro_film'], defaultPrivacy: 'shared', description: 'Celebrate another trip around the sun' },
  { key: 'house_party', label: 'House Party', icon: 'wine', category: 'social', recommendedThemes: ['warm_gold', 'chaos', 'social_story', 'wrapped', 'retro_film'], defaultPrivacy: 'shared', description: 'Music, friends, good times' },
  { key: 'dinner_party', label: 'Dinner Party', icon: 'restaurant', category: 'social', recommendedThemes: ['luxe', 'magazine', 'minimal', 'cinematic'], defaultPrivacy: 'private', description: 'An evening of food and conversation' },
  { key: 'night_out', label: 'Night Out', icon: 'moon', category: 'social', recommendedThemes: ['neon_pulse', 'chaos', 'social_story', 'wrapped', 'retro_film'], defaultPrivacy: 'shared', description: 'Paint the town' },
  { key: 'weekend_away', label: 'Weekend Away', icon: 'sunny', category: 'social', recommendedThemes: ['warm_gold', 'cinematic', 'wrapped', 'route_replay', 'social_story'], defaultPrivacy: 'shared', description: 'A short escape with friends' },
  { key: 'festival', label: 'Festival', icon: 'musical-notes', category: 'social', recommendedThemes: ['neon_pulse', 'social_story', 'route_replay', 'wrapped', 'chaos'], defaultPrivacy: 'shared', description: 'Multiple days of music and energy' },
  { key: 'graduation', label: 'Graduation', icon: 'school', category: 'social', recommendedThemes: ['cinematic', 'magazine', 'wrapped', 'luxe'], defaultPrivacy: 'shared', description: 'Mark the milestone' },
  { key: 'reunion', label: 'Reunion', icon: 'people-circle', category: 'social', recommendedThemes: ['retro_film', 'family_keepsake', 'cinematic', 'magazine'], defaultPrivacy: 'private', description: 'Reconnect with old friends' },
  { key: 'work_social', label: 'Work Social', icon: 'briefcase', category: 'social', recommendedThemes: ['minimal', 'magazine', 'luxe', 'cinematic'], defaultPrivacy: 'private', description: 'Team bonding outside the office' },
  { key: 'team_event', label: 'Team Event', icon: 'trophy', category: 'social', recommendedThemes: ['minimal', 'magazine', 'wrapped', 'social_story'], defaultPrivacy: 'private', description: 'Build, play, celebrate together' },
  { key: 'sports_trip', label: 'Sports Trip', icon: 'football', category: 'social', recommendedThemes: ['route_replay', 'wrapped', 'social_story', 'cinematic'], defaultPrivacy: 'shared', description: 'Follow the team, capture the journey' },
  { key: 'private_party', label: 'Private Party', icon: 'lock-closed', category: 'social', recommendedThemes: ['luxe', 'cinematic', 'social_story', 'magazine'], defaultPrivacy: 'private', description: 'An exclusive celebration' },
  { key: 'family_gathering', label: 'Family Gathering', icon: 'home', category: 'family', recommendedThemes: ['family_keepsake', 'minimal', 'retro_film', 'cinematic'], defaultPrivacy: 'private', description: 'Together with the people who matter' },
  { key: 'anniversary', label: 'Anniversary', icon: 'heart', category: 'social', recommendedThemes: ['luxe', 'cinematic', 'family_keepsake', 'magazine', 'retro_film'], defaultPrivacy: 'private', description: 'Celebrate the years together' },

  // ── Travel & Movement ─────────────────────────────────────
  { key: 'road_trip', label: 'Road Trip', icon: 'car', category: 'travel', recommendedThemes: ['route_replay', 'cinematic', 'retro_film', 'magazine', 'wrapped'], defaultPrivacy: 'shared', description: 'The journey is the destination' },
  { key: 'group_holiday', label: 'Group Holiday', icon: 'airplane', category: 'travel', recommendedThemes: ['cinematic', 'route_replay', 'wrapped', 'retro_film', 'magazine'], defaultPrivacy: 'shared', description: 'Travel together, remember forever' },
  { key: 'city_break', label: 'City Break', icon: 'map', category: 'travel', recommendedThemes: ['magazine', 'cinematic', 'route_replay', 'minimal', 'social_story'], defaultPrivacy: 'shared', description: 'A short urban adventure' },
  { key: 'backpacking_trip', label: 'Backpacking Trip', icon: 'walk', category: 'travel', recommendedThemes: ['route_replay', 'cinematic', 'retro_film', 'wrapped', 'magazine'], defaultPrivacy: 'shared', description: 'Off the beaten path' },
  { key: 'cruise', label: 'Cruise', icon: 'boat', category: 'travel', recommendedThemes: ['cinematic', 'luxe', 'route_replay', 'magazine', 'wrapped'], defaultPrivacy: 'shared', description: 'Life on the water' },
  { key: 'ski_trip', label: 'Ski Trip', icon: 'snow', category: 'travel', recommendedThemes: ['cinematic', 'route_replay', 'wrapped', 'retro_film', 'social_story'], defaultPrivacy: 'shared', description: 'Powder, lifts, and après' },
  { key: 'camping_trip', label: 'Camping Trip', icon: 'bonfire', category: 'travel', recommendedThemes: ['retro_film', 'route_replay', 'cinematic', 'family_keepsake', 'wrapped'], defaultPrivacy: 'shared', description: 'Under the stars' },
  { key: 'hiking_day', label: 'Hiking Day', icon: 'footsteps', category: 'travel', recommendedThemes: ['route_replay', 'cinematic', 'minimal', 'wrapped'], defaultPrivacy: 'shared', description: 'Trail to summit' },
  { key: 'beach_day', label: 'Beach Day', icon: 'sunny', category: 'travel', recommendedThemes: ['social_story', 'cinematic', 'wrapped', 'retro_film', 'minimal'], defaultPrivacy: 'shared', description: 'Sun, sand, and waves' },
  { key: 'theme_park_day', label: 'Theme Park Day', icon: 'happy', category: 'travel', recommendedThemes: ['social_story', 'wrapped', 'chaos', 'cinematic'], defaultPrivacy: 'shared', description: 'Thrills and memories' },
  { key: 'match_day', label: 'Match Day', icon: 'football', category: 'travel', recommendedThemes: ['route_replay', 'social_story', 'wrapped', 'cinematic'], defaultPrivacy: 'shared', description: 'Away day with the lads' },
  { key: 'day_trip', label: 'Day Trip', icon: 'navigate', category: 'travel', recommendedThemes: ['route_replay', 'cinematic', 'social_story', 'minimal', 'wrapped'], defaultPrivacy: 'shared', description: 'Out and back in a day' },
  { key: 'sports_event', label: 'Sports Event', icon: 'trophy', category: 'activity', recommendedThemes: ['wrapped', 'social_story', 'cinematic', 'route_replay'], defaultPrivacy: 'shared', description: 'Play, compete, support, and remember the day' },
  { key: 'group_workout', label: 'Group Workout', icon: 'fitness', category: 'activity', recommendedThemes: ['wrapped', 'route_replay', 'minimal', 'social_story'], defaultPrivacy: 'shared', description: 'Train together and capture the session' },
  { key: 'run_walk', label: 'Run or Walk', icon: 'walk', category: 'activity', recommendedThemes: ['route_replay', 'wrapped', 'minimal', 'cinematic'], defaultPrivacy: 'shared', description: 'From first step to finish line' },
  { key: 'cycle_ride', label: 'Cycle Ride', icon: 'bicycle', category: 'activity', recommendedThemes: ['route_replay', 'wrapped', 'cinematic', 'minimal'], defaultPrivacy: 'shared', description: 'Ride together, map the route, keep the views' },
  { key: 'fitness_challenge', label: 'Fitness Challenge', icon: 'barbell', category: 'activity', recommendedThemes: ['wrapped', 'cinematic', 'social_story', 'minimal'], defaultPrivacy: 'shared', description: 'A challenge worth finishing together' },

  // ── Life Moments ──────────────────────────────────────────
  { key: 'proposal', label: 'Proposal', icon: 'heart', category: 'life_moment', recommendedThemes: ['cinematic', 'luxe', 'minimal', 'magazine', 'retro_film'], defaultPrivacy: 'private', description: 'The moment that changes everything' },
  { key: 'engagement_party', label: 'Engagement Party', icon: 'wine', category: 'life_moment', recommendedThemes: ['luxe', 'cinematic', 'magazine', 'social_story', 'wrapped'], defaultPrivacy: 'private', description: 'Celebrate the yes' },
  { key: 'wedding', label: 'Wedding', icon: 'heart', category: 'life_moment', recommendedThemes: ['luxe', 'cinematic', 'magazine', 'family_keepsake', 'minimal'], defaultPrivacy: 'private', description: 'The big day, every angle' },
  { key: 'stag', label: 'Stag Party', icon: 'beer', category: 'life_moment', recommendedThemes: ['chaos', 'route_replay', 'wrapped', 'social_story', 'retro_film'], defaultPrivacy: 'shared', description: 'Last night of freedom' },
  { key: 'hen', label: 'Hen Party', icon: 'wine', category: 'life_moment', recommendedThemes: ['chaos', 'social_story', 'wrapped', 'route_replay', 'retro_film'], defaultPrivacy: 'shared', description: 'Celebrate the bride' },
  { key: 'baby_shower', label: 'Baby Shower', icon: 'baby', category: 'life_moment', recommendedThemes: ['family_keepsake', 'luxe', 'minimal', 'magazine', 'retro_film'], defaultPrivacy: 'private', description: 'Welcoming the new arrival' },
  { key: 'gender_reveal', label: 'Gender Reveal', icon: 'baby', category: 'life_moment', recommendedThemes: ['family_keepsake', 'cinematic', 'wrapped', 'minimal', 'social_story'], defaultPrivacy: 'private', description: 'The big reveal moment' },
  { key: 'christening', label: 'Christening', icon: 'heart', category: 'life_moment', recommendedThemes: ['family_keepsake', 'luxe', 'minimal', 'cinematic', 'magazine'], defaultPrivacy: 'private', description: 'A naming day celebration' },
  { key: 'new_home_party', label: 'New Home Party', icon: 'home', category: 'life_moment', recommendedThemes: ['social_story', 'minimal', 'magazine', 'cinematic', 'retro_film'], defaultPrivacy: 'shared', description: 'Warming the new place' },
  { key: 'leaving_party', label: 'Leaving Party', icon: 'airplane', category: 'life_moment', recommendedThemes: ['social_story', 'wrapped', 'retro_film', 'cinematic', 'family_keepsake'], defaultPrivacy: 'shared', description: 'Send-off in style' },
  { key: 'retirement_party', label: 'Retirement Party', icon: 'time', category: 'life_moment', recommendedThemes: ['family_keepsake', 'magazine', 'cinematic', 'luxe', 'retro_film'], defaultPrivacy: 'private', description: 'A new chapter begins' },

  // ── Community & Organised ─────────────────────────────────
  { key: 'school_event', label: 'School Event', icon: 'school', category: 'community', recommendedThemes: ['minimal', 'magazine', 'social_story', 'wrapped'], defaultPrivacy: 'private', description: 'Capturing the school year' },
  { key: 'university_event', label: 'University Event', icon: 'mortarboard', category: 'community', recommendedThemes: ['social_story', 'wrapped', 'cinematic', 'magazine', 'chaos'], defaultPrivacy: 'shared', description: 'Lecture halls to dance floors' },
  { key: 'club_event', label: 'Club Event', icon: 'people', category: 'community', recommendedThemes: ['neon_pulse', 'social_story', 'wrapped', 'route_replay', 'chaos'], defaultPrivacy: 'shared', description: 'Club night, group energy' },
  { key: 'charity_event', label: 'Charity Event', icon: 'heart', category: 'community', recommendedThemes: ['magazine', 'minimal', 'luxe', 'cinematic'], defaultPrivacy: 'public', description: 'For a cause worth capturing' },
  { key: 'meetup', label: 'Meetup', icon: 'people-circle', category: 'community', recommendedThemes: ['minimal', 'social_story', 'magazine'], defaultPrivacy: 'shared', description: 'People with shared interests' },
  { key: 'conference_social', label: 'Conference Social', icon: 'briefcase', category: 'community', recommendedThemes: ['minimal', 'magazine', 'cinematic'], defaultPrivacy: 'shared', description: 'Network, learn, socialise' },
  { key: 'brand_event', label: 'Brand Event', icon: 'storefront', category: 'community', recommendedThemes: ['luxe', 'magazine', 'cinematic', 'minimal'], defaultPrivacy: 'public', description: 'Launch, showcase, celebrate' },
  { key: 'launch_party', label: 'Launch Party', icon: 'rocket', category: 'community', recommendedThemes: ['luxe', 'cinematic', 'magazine', 'social_story', 'wrapped'], defaultPrivacy: 'public', description: 'Celebrate the release' },
  { key: 'creator_meetup', label: 'Creator Meetup', icon: 'camera', category: 'community', recommendedThemes: ['magazine', 'social_story', 'cinematic', 'minimal'], defaultPrivacy: 'shared', description: 'Creators connecting in real life' },

  // ── Universal ─────────────────────────────────────────────
  { key: 'custom', label: 'Custom Event', icon: 'apps', category: 'universal', recommendedThemes: ['warm_gold', 'cinematic', 'social_story', 'minimal', 'wrapped'], defaultPrivacy: 'shared', description: 'Any event, one story' },
];

// ─── Lookup Maps ──────────────────────────────────────────────

export const eventTypeMap: Record<EventTypeKey, EventTypeDefinition> =
  eventTypeDefs.reduce((acc, def) => {
    acc[def.key] = def;
    return acc;
  }, {} as Record<EventTypeKey, EventTypeDefinition>);

export function getEventTypeDef(key: EventTypeKey): EventTypeDefinition {
  return eventTypeMap[key] ?? eventTypeMap.custom;
}

export function getRecommendedThemes(eventType: EventTypeKey): ThemeKey[] {
  const def = getEventTypeDef(eventType);
  return def?.recommendedThemes ?? eventTypeMap.custom.recommendedThemes;
}

// ─── Event Phase Configs (for timeline chapter detection) ────

export const eventPhaseConfig: EventPhaseConfig = {
  birthday: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving, settling in' },
    { key: 'main', label: 'The Party', hint: 'Food, drinks, mingling' },
    { key: 'cake', label: 'Cake & Toasts', hint: 'The centrepiece moment' },
    { key: 'late', label: 'Late Night', hint: 'After the candles' },
  ],
  house_party: [
    { key: 'pre', label: 'Pre-Party', hint: 'Setting up, first arrivals' },
    { key: 'peak', label: 'Peak Energy', hint: 'Music, dancing, crowds' },
    { key: 'late', label: 'Late Night', hint: 'Winding down, after-party' },
  ],
  dinner_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Drinks, greetings' },
    { key: 'dinner', label: 'Dinner', hint: 'The main course' },
    { key: 'after', label: 'After Dinner', hint: 'Dessert, conversation' },
  ],
  night_out: [
    { key: 'pre', label: 'Pre-Drinks', hint: 'Getting ready' },
    { key: 'out', label: 'The Night', hint: 'Bars, clubs, venues' },
    { key: 'late', label: 'End of Night', hint: 'Late night food, taxi home' },
  ],
  weekend_away: [
    { key: 'travel', label: 'Travel', hint: 'Getting there' },
    { key: 'day1', label: 'Day 1', hint: 'First activities' },
    { key: 'day2', label: 'Day 2', hint: 'Full day' },
    { key: 'travel_back', label: 'Travel Home', hint: 'The journey back' },
  ],
  festival: [
    { key: 'arrival', label: 'Arrival', hint: 'Setting up camp' },
    { key: 'day', label: 'Daytime', hint: 'Exploring the site' },
    { key: 'night', label: 'Main Acts', hint: 'Headliners and crowds' },
    { key: 'late', label: 'After Hours', hint: 'Late night energy' },
  ],
  graduation: [
    { key: 'pre', label: 'Before Ceremony', hint: 'Robes, photos, anticipation' },
    { key: 'ceremony', label: 'Ceremony', hint: 'The formal moment' },
    { key: 'after', label: 'Celebration', hint: 'Family, friends, photos' },
  ],
  reunion: [
    { key: 'arrival', label: 'Reunion', hint: 'Seeing everyone again' },
    { key: 'main', label: 'Catching Up', hint: 'Conversations, memories' },
    { key: 'late', label: 'Later', hint: 'Group photos, farewells' },
  ],
  work_social: [
    { key: 'arrival', label: 'Arrival', hint: 'Team gathering' },
    { key: 'main', label: 'Social', hint: 'Activities, mingling' },
    { key: 'after', label: 'After', hint: 'Optional continuation' },
  ],
  team_event: [
    { key: 'start', label: 'Kickoff', hint: 'Team assembly' },
    { key: 'main', label: 'Activity', hint: 'The main event' },
    { key: 'after', label: 'Wrap-Up', hint: 'Debrief, social' },
  ],
  sports_trip: [
    { key: 'travel', label: 'Travel', hint: 'Getting to the match' },
    { key: 'match', label: 'The Match', hint: 'Game time' },
    { key: 'after', label: 'After Party', hint: 'Celebration or commiseration' },
  ],
  private_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'main', label: 'The Event', hint: 'Main programme' },
    { key: 'late', label: 'After', hint: 'Late night' },
  ],
  family_gathering: [
    { key: 'arrival', label: 'Arrival', hint: 'Family arriving' },
    { key: 'main', label: 'Together', hint: 'Food, conversation, kids' },
    { key: 'after', label: 'After', hint: 'Group photos, farewells' },
  ],
  anniversary: [
    { key: 'pre', label: 'Before', hint: 'Getting ready' },
    { key: 'main', label: 'Celebration', hint: 'Dinner, toasts, memories' },
    { key: 'after', label: 'After', hint: 'Quiet moments' },
  ],
  road_trip: [
    { key: 'depart', label: 'Departure', hint: 'Hitting the road' },
    { key: 'stop1', label: 'First Stop', hint: 'First landmark or break' },
    { key: 'stop2', label: 'Midway', hint: 'Mid-journey highlight' },
    { key: 'arrive', label: 'Arrival', hint: 'Reaching destination' },
    { key: 'return', label: 'Return', hint: 'The journey home' },
  ],
  group_holiday: [
    { key: 'travel', label: 'Travel', hint: 'Getting there' },
    { key: 'day1', label: 'Day 1', hint: 'First activities' },
    { key: 'mid', label: 'Mid-Holiday', hint: 'The heart of the trip' },
    { key: 'last', label: 'Last Day', hint: 'Final moments' },
    { key: 'return', label: 'Return', hint: 'Travel home' },
  ],
  city_break: [
    { key: 'arrive', label: 'Arrival', hint: 'Checking in, first look' },
    { key: 'explore', label: 'Exploring', hint: 'Sights and sounds' },
    { key: 'night', label: 'Night Out', hint: 'Evening in the city' },
    { key: 'return', label: 'Return', hint: 'Heading home' },
  ],
  backpacking_trip: [
    { key: 'start', label: 'Start', hint: 'Setting off' },
    { key: 'mid', label: 'On the Trail', hint: 'The journey' },
    { key: 'highlight', label: 'Highlight', hint: 'Best moment' },
    { key: 'end', label: 'Finish', hint: 'Reaching the end' },
  ],
  cruise: [
    { key: 'board', label: 'Boarding', hint: 'Setting sail' },
    { key: 'sea', label: 'Sea Days', hint: 'Life on board' },
    { key: 'port', label: 'Port Days', hint: 'Exploring destinations' },
    { key: 'return', label: 'Return', hint: 'Back to port' },
  ],
  ski_trip: [
    { key: 'arrive', label: 'Arrival', hint: 'Checking in, gear' },
    { key: 'slope', label: 'On the Slopes', hint: 'Skiing days' },
    { key: 'apres', label: 'Après Ski', hint: 'Evening social' },
    { key: 'return', label: 'Return', hint: 'Heading home' },
  ],
  camping_trip: [
    { key: 'arrive', label: 'Arrival', hint: 'Setting up camp' },
    { key: 'day', label: 'Daytime', hint: 'Activities, hiking' },
    { key: 'night', label: 'Campfire', hint: 'Evening under stars' },
    { key: 'pack', label: 'Pack Up', hint: 'Breaking camp' },
  ],
  hiking_day: [
    { key: 'start', label: 'Trail Start', hint: 'Setting off' },
    { key: 'mid', label: 'On the Trail', hint: 'The climb' },
    { key: 'summit', label: 'Summit', hint: 'The peak' },
    { key: 'descent', label: 'Descent', hint: 'Heading down' },
  ],
  beach_day: [
    { key: 'arrive', label: 'Arrival', hint: 'Setting up' },
    { key: 'midday', label: 'Midday', hint: 'Sun, sea, sand' },
    { key: 'afternoon', label: 'Afternoon', hint: 'Activities, relaxation' },
    { key: 'sunset', label: 'Sunset', hint: 'Golden hour' },
  ],
  theme_park_day: [
    { key: 'arrive', label: 'Arrival', hint: 'Park entry' },
    { key: 'morning', label: 'Morning Rides', hint: 'First attractions' },
    { key: 'midday', label: 'Midday', hint: 'Lunch, shows' },
    { key: 'afternoon', label: 'Afternoon', hint: 'More rides' },
    { key: 'evening', label: 'Evening', hint: 'Closing, night rides' },
  ],
  match_day: [
    { key: 'travel', label: 'Travel', hint: 'Getting to the ground' },
    { key: 'pre', label: 'Pre-Match', hint: 'Pubs, atmosphere' },
    { key: 'match', label: 'The Match', hint: 'Game time' },
    { key: 'after', label: 'After', hint: 'Celebration or drown sorrows' },
  ],
  day_trip: [
    { key: 'depart', label: 'Departure', hint: 'Setting off' },
    { key: 'main', label: 'The Activity', hint: 'Main highlight' },
    { key: 'return', label: 'Return', hint: 'Heading home' },
  ],
  sports_event: [
    { key: 'arrival', label: 'Arrival', hint: 'Teams, supporters, and atmosphere building' },
    { key: 'warmup', label: 'Warm-Up', hint: 'Getting ready for the action' },
    { key: 'action', label: 'Game Time', hint: 'The main sporting action' },
    { key: 'finish', label: 'Final Moments', hint: 'The closing action and reactions' },
    { key: 'after', label: 'After', hint: 'Celebration, debrief, and the journey home' },
  ],
  group_workout: [
    { key: 'meet', label: 'Meet-Up', hint: 'The group gets together' },
    { key: 'warmup', label: 'Warm-Up', hint: 'Getting moving' },
    { key: 'session', label: 'The Session', hint: 'The main workout' },
    { key: 'push', label: 'Final Push', hint: 'Last effort together' },
    { key: 'finish', label: 'Cooldown', hint: 'Recovery and post-session moments' },
  ],
  run_walk: [
    { key: 'start', label: 'Start Line', hint: 'Before the first step' },
    { key: 'early', label: 'Finding the Rhythm', hint: 'Settling into the route' },
    { key: 'middle', label: 'Halfway', hint: 'The heart of the route' },
    { key: 'finish', label: 'Finish Line', hint: 'The final stretch' },
    { key: 'after', label: 'After', hint: 'Recovery and celebration' },
  ],
  cycle_ride: [
    { key: 'start', label: 'Roll Out', hint: 'Bikes ready, route ahead' },
    { key: 'ride', label: 'On the Ride', hint: 'Miles, climbs, and views' },
    { key: 'stop', label: 'The Stop', hint: 'Coffee, regroup, or viewpoint' },
    { key: 'home', label: 'Home Stretch', hint: 'The final kilometres' },
    { key: 'finish', label: 'Ride Complete', hint: 'Bikes down, story saved' },
  ],
  fitness_challenge: [
    { key: 'before', label: 'Before', hint: 'The challenge ahead' },
    { key: 'start', label: 'Start', hint: 'First effort' },
    { key: 'middle', label: 'Digging In', hint: 'The hard middle' },
    { key: 'finish', label: 'Completed', hint: 'Challenge finished' },
    { key: 'after', label: 'After', hint: 'Recovery and reactions' },
  ],
  proposal: [
    { key: 'before', label: 'Before', hint: 'The build-up' },
    { key: 'moment', label: 'The Moment', hint: 'The proposal' },
    { key: 'after', label: 'After', hint: 'Reactions, celebration' },
  ],
  engagement_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'toasts', label: 'Toasts', hint: 'Speeches and announcements' },
    { key: 'main', label: 'Celebration', hint: 'Party in full swing' },
  ],
  wedding: [
    { key: 'prep', label: 'Preparation', hint: 'Getting ready' },
    { key: 'ceremony', label: 'Ceremony', hint: 'The vows' },
    { key: 'reception', label: 'Reception', hint: 'Drinks and mingling' },
    { key: 'dinner', label: 'Dinner', hint: 'The meal' },
    { key: 'speeches', label: 'Speeches', hint: 'Words from loved ones' },
    { key: 'dance', label: 'First Dance', hint: 'The dance floor opens' },
    { key: 'late', label: 'Late Night', hint: 'Party continues' },
  ],
  stag: [
    { key: 'arrival', label: 'Arrival', hint: 'The lads assemble' },
    { key: 'day', label: 'Daytime', hint: 'Activities' },
    { key: 'night', label: 'Night Out', hint: 'The main event' },
    { key: 'recovery', label: 'Recovery', hint: 'The morning after' },
  ],
  hen: [
    { key: 'arrival', label: 'Arrival', hint: 'The group assembles' },
    { key: 'day', label: 'Daytime', hint: 'Activities and pampering' },
    { key: 'night', label: 'Night Out', hint: 'The main event' },
    { key: 'recovery', label: 'Recovery', hint: 'The morning after' },
  ],
  baby_shower: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'games', label: 'Games', hint: 'Shower activities' },
    { key: 'gifts', label: 'Gifts', hint: 'Opening presents' },
    { key: 'messages', label: 'Messages', hint: 'Wishes for baby' },
  ],
  gender_reveal: [
    { key: 'buildup', label: 'Build-up', hint: 'Anticipation and guesses' },
    { key: 'reveal', label: 'The Reveal', hint: 'The big moment' },
    { key: 'reactions', label: 'Reactions', hint: 'Family and friends respond' },
  ],
  christening: [
    { key: 'ceremony', label: 'Ceremony', hint: 'The service' },
    { key: 'after', label: 'Celebration', hint: 'Food and family' },
  ],
  new_home_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'tour', label: 'House Tour', hint: 'Showing the new place' },
    { key: 'main', label: 'Social', hint: 'Food, drinks, celebration' },
  ],
  leaving_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'main', label: 'Celebration', hint: 'Party in full swing' },
    { key: 'farewell', label: 'Farewell', hint: 'Goodbyes and speeches' },
  ],
  retirement_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'speeches', label: 'Speeches', hint: 'Tributes and memories' },
    { key: 'main', label: 'Celebration', hint: 'Party in full swing' },
  ],
  school_event: [
    { key: 'start', label: 'Start', hint: 'Event begins' },
    { key: 'main', label: 'Main Activity', hint: 'The core event' },
    { key: 'after', label: 'After', hint: 'Social and photos' },
  ],
  university_event: [
    { key: 'pre', label: 'Pre-Event', hint: 'Getting ready' },
    { key: 'main', label: 'The Event', hint: 'Main activity' },
    { key: 'after', label: 'After', hint: 'After-party' },
  ],
  club_event: [
    { key: 'arrival', label: 'Arrival', hint: 'Entry and meet-up' },
    { key: 'main', label: 'The Night', hint: 'Dancing and social' },
    { key: 'late', label: 'Late Night', hint: 'Closing time' },
  ],
  charity_event: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'main', label: 'Programme', hint: 'Main event' },
    { key: 'after', label: 'After', hint: 'Social and networking' },
  ],
  meetup: [
    { key: 'arrival', label: 'Arrival', hint: 'Introductions' },
    { key: 'main', label: 'Activity', hint: 'The main meetup' },
    { key: 'after', label: 'After', hint: 'Social' },
  ],
  conference_social: [
    { key: 'start', label: 'Start', hint: 'Opening' },
    { key: 'main', label: 'Networking', hint: 'Connecting' },
    { key: 'after', label: 'After', hint: 'Post-conference social' },
  ],
  brand_event: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'main', label: 'Showcase', hint: 'The main presentation' },
    { key: 'after', label: 'After', hint: 'Social and networking' },
  ],
  launch_party: [
    { key: 'arrival', label: 'Arrival', hint: 'Guests arriving' },
    { key: 'main', label: 'Launch', hint: 'The big reveal' },
    { key: 'after', label: 'Celebration', hint: 'Party in full swing' },
  ],
  creator_meetup: [
    { key: 'arrival', label: 'Arrival', hint: 'Meet and greet' },
    { key: 'main', label: 'Activity', hint: 'Collaboration and content' },
    { key: 'after', label: 'After', hint: 'Social' },
  ],
  custom: [
    { key: 'start', label: 'Start', hint: 'Event begins' },
    { key: 'main', label: 'Main', hint: 'The core of the event' },
    { key: 'end', label: 'End', hint: 'Event concludes' },
  ],
};

// ─── Convenience: grouped by category for UI ─────────────────

export const eventTypesByCategory: Record<EventCategory, EventTypeDefinition[]> = {
  social: eventTypeDefs.filter(d => d.category === 'social'),
  travel: eventTypeDefs.filter(d => d.category === 'travel'),
  activity: eventTypeDefs.filter(d => d.category === 'activity'),
  life_moment: eventTypeDefs.filter(d => d.category === 'life_moment'),
  family: eventTypeDefs.filter(d => d.category === 'family'),
  community: eventTypeDefs.filter(d => d.category === 'community'),
  universal: eventTypeDefs.filter(d => d.category === 'universal'),
};

// ─── Theme recommendation map (kept for backwards compat) ────

export const eventThemeRecommendations: Record<EventTypeKey, ThemeKey[]> =
  eventTypeDefs.reduce((acc, def) => {
    acc[def.key] = def.recommendedThemes;
    return acc;
  }, {} as Record<EventTypeKey, ThemeKey[]>);
