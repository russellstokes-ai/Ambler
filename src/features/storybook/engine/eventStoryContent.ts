// Ambler event story content library.
// Rich deterministic copy: lots of variety without requiring generative AI.
// Copy is selected from the event family using a stable seed, so regenerating the
// same event stays familiar while different events do not all sound identical.

import { EventType } from '../../../types';
import { PageCopy } from './types';

type StoryFamily =
  | 'celebration'
  | 'nightlife'
  | 'travel'
  | 'journey'
  | 'hiking'
  | 'outdoors'
  | 'sport'
  | 'fitness'
  | 'wedding'
  | 'family'
  | 'festival'
  | 'milestone'
  | 'community'
  | 'custom';

interface StoryFamilyPack {
  opening: PageCopy[];
  timeline: PageCopy[];
  routeReplay: PageCopy[];
  heroGallery: PageCopy[];
  storyInsights: PageCopy[];
  friendCaptions: PageCopy[];
  share: PageCopy[];
  vibes: string[];
}

export interface StoryContentSelection {
  opening: PageCopy;
  timeline: PageCopy;
  routeReplay: PageCopy;
  heroGallery: PageCopy;
  storyInsights: PageCopy;
  friendCaptions: PageCopy;
  share: PageCopy;
}

const FAMILY_BY_EVENT: Record<EventType, StoryFamily> = {
  birthday: 'celebration',
  house_party: 'nightlife',
  dinner_party: 'celebration',
  night_out: 'nightlife',
  weekend_away: 'travel',
  festival: 'festival',
  graduation: 'milestone',
  reunion: 'family',
  work_social: 'community',
  team_event: 'community',
  sports_trip: 'sport',
  private_party: 'celebration',
  family_gathering: 'family',
  anniversary: 'family',
  road_trip: 'journey',
  group_holiday: 'travel',
  city_break: 'travel',
  backpacking_trip: 'outdoors',
  cruise: 'travel',
  ski_trip: 'outdoors',
  camping_trip: 'outdoors',
  hiking_day: 'hiking',
  beach_day: 'travel',
  theme_park_day: 'celebration',
  match_day: 'sport',
  day_trip: 'travel',
  sports_event: 'sport',
  group_workout: 'fitness',
  run_walk: 'fitness',
  cycle_ride: 'fitness',
  fitness_challenge: 'fitness',
  proposal: 'wedding',
  engagement_party: 'wedding',
  wedding: 'wedding',
  stag: 'nightlife',
  hen: 'nightlife',
  baby_shower: 'family',
  gender_reveal: 'family',
  christening: 'family',
  new_home_party: 'celebration',
  leaving_party: 'milestone',
  retirement_party: 'milestone',
  school_event: 'community',
  university_event: 'community',
  club_event: 'community',
  charity_event: 'community',
  meetup: 'community',
  conference_social: 'community',
  brand_event: 'community',
  launch_party: 'community',
  creator_meetup: 'community',
  custom: 'custom',
};

const PACKS: Record<StoryFamily, StoryFamilyPack> = {
  celebration: {
    opening: [
      { title: 'The celebration starts here', subtitle: 'The first arrivals, first laughs, and first photos' },
      { title: 'Before everyone lost track of time', subtitle: 'How the day began' },
      { title: 'The first round of memories', subtitle: 'Where everyone came together' },
      { title: 'It started quietly enough', subtitle: 'The opening moments before the energy built' },
      { title: 'The room filled up fast', subtitle: 'Friends, family, and the beginning of the story' },
    ],
    timeline: [
      { title: 'How the celebration unfolded', subtitle: 'From arrivals to the final photo' },
      { title: 'The day, chapter by chapter', subtitle: 'Every little moment in the right order' },
      { title: 'From first hello to last goodbye', subtitle: 'The full celebration timeline' },
      { title: 'The moments kept coming', subtitle: 'A celebration told in sequence' },
      { title: 'One thing led to another', subtitle: 'The story exactly as it happened' },
    ],
    routeReplay: [
      { title: 'Where the celebration went', subtitle: 'Every venue, stop, and little detour' },
      { title: 'The places behind the memories', subtitle: 'A map of the day' },
      { title: 'From here to there', subtitle: 'Every stop that became part of the story' },
      { title: 'The celebration on the map', subtitle: 'Where the photos happened' },
      { title: 'A few places, one story', subtitle: 'The route from start to finish' },
    ],
    heroGallery: [
      { title: 'The ones worth keeping', subtitle: 'The photos that tell the story best' },
      { title: 'The brightest moments', subtitle: 'The celebration at its best' },
      { title: 'The photos everyone will ask for', subtitle: 'The best of {eventName}' },
      { title: 'The frame-worthy bits', subtitle: 'A few moments that deserve another look' },
      { title: 'This was the good part', subtitle: 'Favourite moments from the celebration' },
    ],
    storyInsights: [
      { title: 'The celebration by numbers', subtitle: 'People, places, photos, and peak moments' },
      { title: 'What the day looked like in numbers', subtitle: 'A few details hiding inside the memories' },
      { title: 'The little stats behind the big day', subtitle: 'Real numbers from the story' },
      { title: 'A celebration, measured', subtitle: 'The details you probably missed at the time' },
      { title: 'The numbers tell their own story', subtitle: 'A different look at the day' },
    ],
    friendCaptions: [
      { title: 'In their own words', subtitle: 'Messages from the people who were there' },
      { title: 'What everyone had to say', subtitle: 'Captions, comments, and the lines worth keeping' },
      { title: 'Straight from the group', subtitle: 'The words that came with the photos' },
      { title: 'The quotes that survived the day', subtitle: 'Because photos only tell half the story' },
      { title: 'What the group remembers', subtitle: 'A few words from the people inside the story' },
    ],
    share: [
      { title: 'Keep the celebration going', subtitle: 'Send the story to everyone who made it' },
      { title: 'One story for everyone', subtitle: 'Share the finished memory' },
      { title: 'Send it back to the group', subtitle: 'The celebration, all in one place' },
      { title: 'This one is worth sharing', subtitle: 'Pass the story on' },
      { title: 'The day is over. The story is not.', subtitle: 'Share it with the people who were there' },
    ],
    vibes: ['Celebration mode', 'Good people, good day', 'Big-day energy', 'All together now', 'Worth celebrating', 'The room was alive', 'Easy joy', 'One for the memory bank'],
  },

  nightlife: {
    opening: [
      { title: 'It started with one plan', subtitle: 'What happened after that is in the photos' },
      { title: 'Before the night got ideas', subtitle: 'The calm before the group chat got busy' },
      { title: 'The first stop', subtitle: 'Where the night officially began' },
      { title: 'Everyone was still presentable here', subtitle: 'The opening chapter' },
      { title: 'The night switched on', subtitle: 'First drinks, first photos, first bad decisions' },
    ],
    timeline: [
      { title: 'How the night escalated', subtitle: 'A completely objective timeline' },
      { title: 'The evidence, in order', subtitle: 'From sensible to significantly less sensible' },
      { title: 'The night, play by play', subtitle: 'Every stop and every change of plan' },
      { title: 'How it actually went down', subtitle: 'The timeline nobody remembered perfectly' },
      { title: 'From pre-drinks to whatever came last', subtitle: 'The full sequence' },
    ],
    routeReplay: [
      { title: 'Where you actually went', subtitle: 'The route may explain a few things' },
      { title: 'The night on the map', subtitle: 'Bars, venues, food stops, and detours' },
      { title: 'A surprisingly ambitious route', subtitle: 'Every stop the group managed' },
      { title: 'The long way home', subtitle: 'The places behind the night' },
      { title: 'The route nobody planned', subtitle: 'But somehow everyone followed' },
    ],
    heroGallery: [
      { title: 'Peak night', subtitle: 'The moments that need no explanation' },
      { title: 'The best evidence', subtitle: 'Photos worth keeping, mostly' },
      { title: 'Main-character moments', subtitle: 'The night at full volume' },
      { title: 'Somehow, these came out well', subtitle: 'The strongest photos from the night' },
      { title: 'The good, the great, the questionable', subtitle: 'A carefully curated selection' },
    ],
    storyInsights: [
      { title: 'The night by numbers', subtitle: 'Stops, photos, people, and the hour things peaked' },
      { title: 'A forensic recap', subtitle: 'The numbers behind the night' },
      { title: 'What the data remembers', subtitle: 'Useful when the group does not' },
      { title: 'The official stats', subtitle: 'As official as this night deserves' },
      { title: 'Numbers do not lie', subtitle: 'Even when the group chat does' },
    ],
    friendCaptions: [
      { title: 'The group chat, but permanent', subtitle: 'The lines that came with the night' },
      { title: 'Things people actually said', subtitle: 'No context provided' },
      { title: 'Quotes from the scene', subtitle: 'The group supplied the commentary' },
      { title: 'The one-liners', subtitle: 'Some aged better than others' },
      { title: 'For the record', subtitle: 'What everyone said at the time' },
    ],
    share: [
      { title: 'Send the night back', subtitle: 'Before the details get rewritten' },
      { title: 'Share the evidence', subtitle: 'Everyone gets the same version of events' },
      { title: 'The recap is ready', subtitle: 'Drop it into the group chat' },
      { title: 'One last round', subtitle: 'This time it is just the story' },
      { title: 'You may as well share it', subtitle: 'They were there too' },
    ],
    vibes: ['Full-volume night', 'Organised chaos', 'City-light energy', 'No early night here', 'Peak group chat', 'Questionable planning, excellent memories', 'One more stop', 'Worth the next-day recovery'],
  },

  travel: {
    opening: [
      { title: 'Away from the usual', subtitle: 'The first chapter somewhere different' },
      { title: 'The trip begins', subtitle: 'Bags packed, cameras out' },
      { title: 'First look, first photo', subtitle: 'Where the escape started' },
      { title: 'A change of scenery', subtitle: 'The opening moments of the trip' },
      { title: 'Out of office, into the story', subtitle: 'The beginning of {eventName}' },
    ],
    timeline: [
      { title: 'The trip as it unfolded', subtitle: 'Day by day, stop by stop' },
      { title: 'A few days, a lot of story', subtitle: 'The trip in sequence' },
      { title: 'Every chapter of the escape', subtitle: 'From arrival to the journey home' },
      { title: 'What happened between check-in and check-out', subtitle: 'The full timeline' },
      { title: 'The trip, properly remembered', subtitle: 'All the important bits in order' },
    ],
    routeReplay: [
      { title: 'The trip on the map', subtitle: 'Every place that became part of it' },
      { title: 'Where the days took you', subtitle: 'Routes, stops, and discoveries' },
      { title: 'The places between the photos', subtitle: 'A map of the memory' },
      { title: 'From one pin to the next', subtitle: 'The journey through {location}' },
      { title: 'The geography of a good trip', subtitle: 'Every stop worth remembering' },
    ],
    heroGallery: [
      { title: 'Postcard material', subtitle: 'The views and moments worth keeping' },
      { title: 'The trip in a handful of frames', subtitle: 'Favourite moments from the journey' },
      { title: 'The photos that bring it back', subtitle: 'The best of {eventName}' },
      { title: 'Worth the journey', subtitle: 'The moments that made the trip' },
      { title: 'The ones you would print', subtitle: 'A curated travel gallery' },
    ],
    storyInsights: [
      { title: 'The trip by numbers', subtitle: 'Distance, places, people, and moments' },
      { title: 'What the journey added up to', subtitle: 'A few stats from the road' },
      { title: 'The travel notes', subtitle: 'The numbers behind the escape' },
      { title: 'A trip measured in more than miles', subtitle: 'Places, photos, and time together' },
      { title: 'The practical details of a very impractical memory', subtitle: 'Your trip stats' },
    ],
    friendCaptions: [
      { title: 'Travel notes from everyone', subtitle: 'What the group wrote along the way' },
      { title: 'Wish you were here', subtitle: 'Except everyone important already was' },
      { title: 'Notes from the trip', subtitle: 'Words attached to the memories' },
      { title: 'The group commentary', subtitle: 'A second layer to the journey' },
      { title: 'What everyone remembers', subtitle: 'Captions from the road' },
    ],
    share: [
      { title: 'Bring everyone back', subtitle: 'Share the whole trip in one story' },
      { title: 'The trip is ready to relive', subtitle: 'Send it to the people who went' },
      { title: 'One link, the whole journey', subtitle: 'Share {eventName}' },
      { title: 'Keep the trip moving', subtitle: 'Pass the story along' },
      { title: 'Home again, but not quite done', subtitle: 'Share the memory' },
    ],
    vibes: ['Escape mode', 'Out of routine', 'Somewhere worth going', 'Good trip energy', 'Postcard days', 'Worth the journey', 'A change of scenery', 'More than a weekend away'],
  },

  journey: {
    opening: [
      { title: 'And they are off', subtitle: 'The first miles of the story' },
      { title: 'The road opened up', subtitle: 'Everything started here' },
      { title: 'First stop: somewhere else', subtitle: 'The journey begins' },
      { title: 'Keys, bags, route', subtitle: 'The road trip gets moving' },
      { title: 'The scenic route starts here', subtitle: 'No rush, plenty to remember' },
    ],
    timeline: [
      { title: 'The road, chapter by chapter', subtitle: 'Stops, stretches, and the moments between' },
      { title: 'How the journey unfolded', subtitle: 'Every leg in the right order' },
      { title: 'The route became the story', subtitle: 'A timeline made of miles' },
      { title: 'From departure to destination', subtitle: 'And everything that happened between' },
      { title: 'The long version', subtitle: 'Because the journey was the point' },
    ],
    routeReplay: [
      { title: 'The full route', subtitle: 'Every mile, stop, and scenic detour' },
      { title: 'Follow the line', subtitle: 'The road as it really happened' },
      { title: 'The journey, mapped', subtitle: 'A line through all the memories' },
      { title: 'The long way round', subtitle: 'Usually the better way' },
      { title: 'Every stop had a reason', subtitle: 'Even the unplanned ones' },
    ],
    heroGallery: [
      { title: 'Worth pulling over for', subtitle: 'The best views and roadside moments' },
      { title: 'The road gave you these', subtitle: 'Favourite frames from the journey' },
      { title: 'Windows down, cameras out', subtitle: 'The strongest moments on the route' },
      { title: 'The views that justified the detour', subtitle: 'A road-trip gallery' },
      { title: 'The miles between these photos', subtitle: 'A few frames that carry the whole trip' },
    ],
    storyInsights: [
      { title: 'The journey by numbers', subtitle: 'Distance, stops, duration, and people' },
      { title: 'What the odometer does not show', subtitle: 'The numbers behind the road trip' },
      { title: 'Road notes', subtitle: 'A statistical version of the scenic route' },
      { title: 'Miles of memory', subtitle: 'The route distilled into a few numbers' },
      { title: 'The road report', subtitle: 'How far, how long, how many stops' },
    ],
    friendCaptions: [
      { title: 'From the passenger seat', subtitle: 'Commentary from the road' },
      { title: 'Things said between stops', subtitle: 'The group supplied the narration' },
      { title: 'Road-trip notes', subtitle: 'Captions from the journey' },
      { title: 'What everyone said on the way', subtitle: 'A soundtrack made of words' },
      { title: 'From the car', subtitle: 'The quotes worth taking home' },
    ],
    share: [
      { title: 'Share the scenic route', subtitle: 'The whole journey in one story' },
      { title: 'Send the road trip back around', subtitle: 'Every mile, ready to relive' },
      { title: 'The journey is ready', subtitle: 'Pass it to the people who were in the car' },
      { title: 'One route, one story', subtitle: 'Share the road exactly as it happened' },
      { title: 'Park the car. Keep the story.', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Open-road freedom', 'Scenic-route energy', 'Miles of memories', 'Worth the detour', 'No rush today', 'Windows-down kind of day', 'Road-trip rhythm', 'The journey was the point'],
  },

  hiking: {
    opening: [
      { title: 'Trailhead', subtitle: 'Fresh legs, full bottles, route ahead' },
      { title: 'The first step is the easy one', subtitle: 'The trail starts here' },
      { title: 'Before the climb', subtitle: 'Everyone still had plenty to say' },
      { title: 'Boots on, world off', subtitle: 'The hike begins' },
      { title: 'The path disappears around the corner', subtitle: 'Time to follow it' },
    ],
    timeline: [
      { title: 'From trailhead to turnaround', subtitle: 'Every climb, pause, view, and descent' },
      { title: 'The hike, step by step', subtitle: 'The route found its own chapters' },
      { title: 'How the trail unfolded', subtitle: 'Easy start, hard middle, very good views' },
      { title: 'The climb had a story', subtitle: 'This is how it happened' },
      { title: 'Up, across, and back down', subtitle: 'The full hiking day in sequence' },
    ],
    routeReplay: [
      { title: 'The trail you actually walked', subtitle: 'Every turn, stop, and viewpoint on the map' },
      { title: 'Follow the footsteps back', subtitle: 'The complete route replay' },
      { title: 'The line through the landscape', subtitle: 'Distance and stops in context' },
      { title: 'That looked shorter on the map', subtitle: 'The route, now with evidence' },
      { title: 'The path behind the pictures', subtitle: 'See where every part of the hike happened' },
    ],
    heroGallery: [
      { title: 'Worth the climb', subtitle: 'The views that made the uphill disappear' },
      { title: 'The summit roll', subtitle: 'The strongest frames from the trail' },
      { title: 'Views you had to earn', subtitle: 'The best of {eventName}' },
      { title: 'This is why you kept walking', subtitle: 'Favourite moments from the hike' },
      { title: 'The trail did most of the styling', subtitle: 'A very good outdoor gallery' },
    ],
    storyInsights: [
      { title: 'The hike by numbers', subtitle: 'Distance, duration, stops, pace, and moments' },
      { title: 'Trail stats', subtitle: 'The factual version of a very scenic day' },
      { title: 'What the legs already knew', subtitle: 'How far and how long the route really was' },
      { title: 'The numbers behind the view', subtitle: 'A route summary from the day' },
      { title: 'A proper trail report', subtitle: 'Distance, time, people, and peak activity' },
    ],
    friendCaptions: [
      { title: 'Things said on the climb', subtitle: 'Some more motivational than others' },
      { title: 'Trail commentary', subtitle: 'The group in its own words' },
      { title: 'What everyone said before the next hill', subtitle: 'Captions from the route' },
      { title: 'Notes from the trail', subtitle: 'Words attached to the views' },
      { title: 'The walking conversation', subtitle: 'A few lines worth bringing home' },
    ],
    share: [
      { title: 'Bring the trail home', subtitle: 'Share the route, views, and whole day together' },
      { title: 'Hike complete', subtitle: 'Now everyone gets the same story' },
      { title: 'Share the route you earned', subtitle: 'Every step without having to walk it again' },
      { title: 'The boots can dry now', subtitle: 'The story is ready' },
      { title: 'One trail, one shared memory', subtitle: 'Send {eventName} to the group' },
    ],
    vibes: ['Trail-day energy', 'Worth the climb', 'Summit feeling', 'Fresh-air reset', 'Good tired', 'Views earned properly', 'One more hill', 'Boots-on kind of day'],
  },

  outdoors: {
    opening: [
      { title: 'Trailhead', subtitle: 'The first steps into the day' },
      { title: 'The path starts here', subtitle: 'Boots on, route ahead' },
      { title: 'Before the climb', subtitle: 'Fresh legs and a long way to go' },
      { title: 'Out into the open', subtitle: 'The beginning of the route' },
      { title: 'One step away from ordinary', subtitle: 'The outdoor story begins' },
    ],
    timeline: [
      { title: 'The trail, chapter by chapter', subtitle: 'Start, climb, views, and the way back' },
      { title: 'How the day gained altitude', subtitle: 'The route told in moments' },
      { title: 'Step by step', subtitle: 'The whole outdoor day in sequence' },
      { title: 'From trailhead to tired legs', subtitle: 'A very good day outside' },
      { title: 'The route had its own pace', subtitle: 'Every chapter of the day' },
    ],
    routeReplay: [
      { title: 'The trail on the map', subtitle: 'Every turn, pause, and viewpoint' },
      { title: 'Follow the route back', subtitle: 'The path behind the photos' },
      { title: 'Where your legs took you', subtitle: 'The full route replay' },
      { title: 'The line through the landscape', subtitle: 'Distance, stops, and viewpoints' },
      { title: 'The route earned every photo', subtitle: 'See the whole day on the map' },
    ],
    heroGallery: [
      { title: 'Worth the climb', subtitle: 'The views and moments that paid you back' },
      { title: 'The best of the trail', subtitle: 'A few frames from a big day outside' },
      { title: 'Views you had to earn', subtitle: 'The outdoor highlights' },
      { title: 'The landscape did most of the work', subtitle: 'Your strongest trail photos' },
      { title: 'The photos that make your legs forget', subtitle: 'A reminder of why you went' },
    ],
    storyInsights: [
      { title: 'The day by numbers', subtitle: 'Distance, duration, stops, and moments' },
      { title: 'The trail report', subtitle: 'What the route added up to' },
      { title: 'A walk measured properly', subtitle: 'Real route stats from the day' },
      { title: 'The numbers behind the view', subtitle: 'How far and how long it took' },
      { title: 'Distance is only half the story', subtitle: 'The details behind the route' },
    ],
    friendCaptions: [
      { title: 'Trail notes', subtitle: 'What everyone said along the way' },
      { title: 'Words from the path', subtitle: 'Comments between climbs and viewpoints' },
      { title: 'The walking commentary', subtitle: 'A few lines from the people who came' },
      { title: 'What was said before the next hill', subtitle: 'Captions from the route' },
      { title: 'Notes from outside', subtitle: 'The group remembers it in their own words' },
    ],
    share: [
      { title: 'Bring the trail home', subtitle: 'Share the route and the views together' },
      { title: 'The walk is finished. The story is ready.', subtitle: 'Send it to the group' },
      { title: 'Share the route you earned', subtitle: 'Every step, stop, and view' },
      { title: 'One path, one story', subtitle: 'Relive the day together' },
      { title: 'Save the view for later', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Trail-day energy', 'Worth the climb', 'Fresh-air reset', 'One more hill', 'Views earned properly', 'Outside all day', 'Scenic-route legs', 'Good tired'],
  },

  sport: {
    opening: [
      { title: 'Game day starts early', subtitle: 'The build-up before the action' },
      { title: 'Before the first whistle', subtitle: 'Travel, arrivals, and anticipation' },
      { title: 'The atmosphere was already building', subtitle: 'The opening moments of the day' },
      { title: 'Colours on, cameras out', subtitle: 'The sporting story begins' },
      { title: 'The day had one destination', subtitle: 'Everything before the action' },
    ],
    timeline: [
      { title: 'Game day, play by play', subtitle: 'Build-up, action, and everything after' },
      { title: 'How the day unfolded', subtitle: 'From arrival to the final reactions' },
      { title: 'The story around the sport', subtitle: 'Not just what happened on the field' },
      { title: 'Before, during, after', subtitle: 'The full sporting day in sequence' },
      { title: 'The day had momentum', subtitle: 'Every chapter around the action' },
    ],
    routeReplay: [
      { title: 'The road to game day', subtitle: 'Travel, venue, and the route home' },
      { title: 'Where the day happened', subtitle: 'The ground, the stops, and the journey' },
      { title: 'From meeting point to final whistle', subtitle: 'Game day on the map' },
      { title: 'The route behind the result', subtitle: 'Everything around the action' },
      { title: 'The away-day line', subtitle: 'Every stop before and after the game' },
    ],
    heroGallery: [
      { title: 'The big moments', subtitle: 'Action, atmosphere, and reactions' },
      { title: 'The photos with match-day noise in them', subtitle: 'The strongest frames from the day' },
      { title: 'Crowd, colour, action', subtitle: 'The sporting highlights' },
      { title: 'The day at full intensity', subtitle: 'A gallery from around the action' },
      { title: 'The frames that feel loud', subtitle: 'The best of {eventName}' },
    ],
    storyInsights: [
      { title: 'Game day by numbers', subtitle: 'Distance, time, contributors, and peak activity' },
      { title: 'The stats around the sport', subtitle: 'Real numbers from the day' },
      { title: 'Off-field statistics', subtitle: 'The story behind the action' },
      { title: 'The day in data', subtitle: 'A few numbers that capture the scale of it' },
      { title: 'Match-day notes', subtitle: 'Travel, photos, people, and timing' },
    ],
    friendCaptions: [
      { title: 'From the stands and sidelines', subtitle: 'What everyone said on the day' },
      { title: 'The unofficial commentary', subtitle: 'Captions from the group' },
      { title: 'Voices from game day', subtitle: 'The people around the action' },
      { title: 'What the group made of it', subtitle: 'No pundits required' },
      { title: 'The commentary you actually wanted', subtitle: 'Straight from the people who were there' },
    ],
    share: [
      { title: 'Replay more than the game', subtitle: 'Share the whole day' },
      { title: 'Send game day back around', subtitle: 'Travel, atmosphere, action, and after' },
      { title: 'The day is ready to replay', subtitle: 'Share it with the team or supporters' },
      { title: 'One link, the whole fixture', subtitle: 'Pass the story on' },
      { title: 'Final whistle. Story saved.', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Game-day energy', 'All eyes on the action', 'Full-time memories', 'Colours on', 'Big-day atmosphere', 'Team together', 'Worth the journey', 'Crowd alive'],
  },

  fitness: {
    opening: [
      { title: 'Before the first rep', subtitle: 'The group, the goal, and the session ahead' },
      { title: 'Ready when everyone is', subtitle: 'The workout begins together' },
      { title: 'First step, first effort', subtitle: 'Where the session started' },
      { title: 'Fresh legs', subtitle: 'For now, anyway' },
      { title: 'The challenge starts here', subtitle: 'One session, one shared finish line' },
    ],
    timeline: [
      { title: 'The session, set by set', subtitle: 'Warm-up, work, final push, done' },
      { title: 'How the effort built', subtitle: 'The workout told in chapters' },
      { title: 'From warm-up to well-earned recovery', subtitle: 'The session in sequence' },
      { title: 'The hard middle was worth it', subtitle: 'Every phase of the challenge' },
      { title: 'Effort has a timeline', subtitle: 'This is what yours looked like' },
    ],
    routeReplay: [
      { title: 'The route behind the effort', subtitle: 'Distance, turns, and shared progress' },
      { title: 'Every metre on the map', subtitle: 'Follow the session back' },
      { title: 'Where the workout took you', subtitle: 'The moving version of the story' },
      { title: 'The line you earned', subtitle: 'Your shared route replay' },
      { title: 'From start point to done', subtitle: 'See the full route again' },
    ],
    heroGallery: [
      { title: 'The effort showed', subtitle: 'The strongest moments from the session' },
      { title: 'The finish was worth the work', subtitle: 'A gallery of the day' },
      { title: 'Sweat, smiles, repeat', subtitle: 'The best of the shared session' },
      { title: 'Strong moments', subtitle: 'The frames that carry the effort' },
      { title: 'Proof you all showed up', subtitle: 'The workout highlights' },
    ],
    storyInsights: [
      { title: 'The session by numbers', subtitle: 'Distance, duration, people, and peak activity' },
      { title: 'What the effort added up to', subtitle: 'Real stats from the shared session' },
      { title: 'Training notes', subtitle: 'A few numbers from the workout' },
      { title: 'The challenge in data', subtitle: 'How far, how long, how many together' },
      { title: 'A different kind of progress photo', subtitle: 'The numbers behind the story' },
    ],
    friendCaptions: [
      { title: 'What everyone said between breaths', subtitle: 'Comments from the session' },
      { title: 'Training-room commentary', subtitle: 'The words that came with the effort' },
      { title: 'From the group', subtitle: 'Motivation, complaints, and everything between' },
      { title: 'The session in their words', subtitle: 'Comments worth keeping' },
      { title: 'What was said before the last set', subtitle: 'A few lines from the group' },
    ],
    share: [
      { title: 'Session complete', subtitle: 'Share the effort with everyone who finished it' },
      { title: 'Done together, saved together', subtitle: 'Send the workout story around' },
      { title: 'The finish line gets a replay', subtitle: 'Share the route and the moments' },
      { title: 'One session, one story', subtitle: 'Everyone gets the same memory' },
      { title: 'Recovery starts now', subtitle: 'The story is already ready' },
    ],
    vibes: ['Shared effort', 'Strong together', 'Finish-line feeling', 'One more rep', 'Good tired', 'Progress in company', 'Earned, not staged', 'Group-session energy'],
  },

  wedding: {
    opening: [
      { title: 'The day begins', subtitle: 'Small moments before the big one' },
      { title: 'Before the vows', subtitle: 'The anticipation, the details, the people' },
      { title: 'The first moments of forever', subtitle: 'Where the day started' },
      { title: 'Everything was ready', subtitle: 'Almost' },
      { title: 'The quiet before the celebration', subtitle: 'The opening chapter' },
    ],
    timeline: [
      { title: 'From getting ready to last dance', subtitle: 'The whole day, beautifully in order' },
      { title: 'How the day unfolded', subtitle: 'Every chapter of the celebration' },
      { title: 'One day, a lifetime of moments', subtitle: 'The wedding in sequence' },
      { title: 'The ceremony was only one chapter', subtitle: 'The full story of the day' },
      { title: 'The day moved quickly', subtitle: 'This keeps every part of it' },
    ],
    routeReplay: [
      { title: 'The places that held the day', subtitle: 'Preparation, ceremony, celebration' },
      { title: 'The wedding on the map', subtitle: 'Every place that became part of the story' },
      { title: 'From first look to final dance', subtitle: 'The geography of the day' },
      { title: 'A few places, one enormous memory', subtitle: 'Follow the day back' },
      { title: 'Where forever started', subtitle: 'The places behind the wedding' },
    ],
    heroGallery: [
      { title: 'The moments to keep forever', subtitle: 'Love, laughter, and all the little details' },
      { title: 'The photos that say everything', subtitle: 'A wedding gallery worth returning to' },
      { title: 'The day in its best frames', subtitle: 'The moments that carry the feeling' },
      { title: 'These are the ones', subtitle: 'The photographs that hold the day together' },
      { title: 'A handful of forever', subtitle: 'The wedding highlights' },
    ],
    storyInsights: [
      { title: 'The day in detail', subtitle: 'Time, people, photos, and the rhythm of the celebration' },
      { title: 'The little numbers behind the big day', subtitle: 'Details you could not notice in the moment' },
      { title: 'A wedding, measured gently', subtitle: 'Real details from the day' },
      { title: 'The story between the photographs', subtitle: 'A few facts from the celebration' },
      { title: 'What the day added up to', subtitle: 'More than the sum of its parts' },
    ],
    friendCaptions: [
      { title: 'Messages from the people who were there', subtitle: 'Words worth keeping with the photographs' },
      { title: 'From the guests', subtitle: 'The day in their own words' },
      { title: 'A few words for the couple', subtitle: 'Messages from inside the celebration' },
      { title: 'The voices around the day', subtitle: 'Captions, notes, and memories' },
      { title: 'What everyone wanted to remember', subtitle: 'Words alongside the moments' },
    ],
    share: [
      { title: 'Share the whole day', subtitle: 'Not just the photographs' },
      { title: 'A wedding story for everyone who made it', subtitle: 'Send the finished memory' },
      { title: 'The day is ready to relive', subtitle: 'Share it with the people who were there' },
      { title: 'Keep the day moving through the family', subtitle: 'One story, easy to share' },
      { title: 'The celebration ended. This stays.', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Wedding magic', 'A day to remember', 'Full-heart day', 'Forever starts here', 'Love in the room', 'All the little details', 'Once-in-a-lifetime energy', 'A very good yes'],
  },

  family: {
    opening: [
      { title: 'Everyone together', subtitle: 'The simplest reason to take a photo' },
      { title: 'The day started with familiar faces', subtitle: 'And a few new memories' },
      { title: 'A little time together', subtitle: 'The beginning of the family story' },
      { title: 'The kind of day that matters later', subtitle: 'The first moments' },
      { title: 'Home is sometimes just the people', subtitle: 'Where the story began' },
    ],
    timeline: [
      { title: 'How the day unfolded', subtitle: 'Little moments, kept in order' },
      { title: 'A day made of ordinary things', subtitle: 'Which is exactly why it matters' },
      { title: 'Everyone, in the same story', subtitle: 'The day from beginning to end' },
      { title: 'The moments between the big moments', subtitle: 'A family day in sequence' },
      { title: 'A day worth keeping whole', subtitle: 'Every chapter together' },
    ],
    routeReplay: [
      { title: 'The places behind the day', subtitle: 'Where everyone came together' },
      { title: 'A small map of a big memory', subtitle: 'The places in the story' },
      { title: 'Where the family went', subtitle: 'Every shared stop' },
      { title: 'The day on the map', subtitle: 'Places that now mean a little more' },
      { title: 'The route through the memory', subtitle: 'Every place that held a moment' },
    ],
    heroGallery: [
      { title: 'The ones to keep close', subtitle: 'Family moments worth coming back to' },
      { title: 'For the family album', subtitle: 'The photographs that matter most' },
      { title: 'The photos that get better with time', subtitle: 'A few favourites from the day' },
      { title: 'Together, properly captured', subtitle: 'The strongest family moments' },
      { title: 'The keepsakes', subtitle: 'The photos that deserve to stay' },
    ],
    storyInsights: [
      { title: 'The day in detail', subtitle: 'Time together, people, places, and memories' },
      { title: 'A family day by numbers', subtitle: 'Small details worth remembering' },
      { title: 'The quiet statistics', subtitle: 'A different view of time together' },
      { title: 'What the day held', subtitle: 'People, moments, places, time' },
      { title: 'The details behind the keepsake', subtitle: 'A few real numbers from the day' },
    ],
    friendCaptions: [
      { title: 'In the family’s own words', subtitle: 'Messages worth saving too' },
      { title: 'What everyone wanted to say', subtitle: 'Words alongside the photographs' },
      { title: 'Notes to keep', subtitle: 'The people in the story add their own layer' },
      { title: 'From everyone', subtitle: 'Messages from inside the memory' },
      { title: 'The words between the pictures', subtitle: 'Family notes from the day' },
    ],
    share: [
      { title: 'Keep it in the family', subtitle: 'Share the story privately with the people who matter' },
      { title: 'One keepsake, everyone included', subtitle: 'Send the finished story' },
      { title: 'This one is for later too', subtitle: 'Share it with the family' },
      { title: 'Pass the memory along', subtitle: 'The whole day in one place' },
      { title: 'Made together, kept together', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Together time', 'Family warmth', 'One for the album', 'Familiar faces', 'Worth keeping', 'Home-team energy', 'Simple moments, big meaning', 'The good kind of ordinary'],
  },

  festival: {
    opening: [
      { title: 'Wristbands on', subtitle: 'The weekend starts here' },
      { title: 'Before the first set', subtitle: 'The site was still full of possibility' },
      { title: 'The gates opened', subtitle: 'And normal volume stopped applying' },
      { title: 'First beat, first photo', subtitle: 'The festival story begins' },
      { title: 'The weekend came alive', subtitle: 'Where the music started' },
    ],
    timeline: [
      { title: 'Set by set, night by night', subtitle: 'The festival in full' },
      { title: 'How the weekend built', subtitle: 'Stages, crowds, late nights' },
      { title: 'The unofficial setlist', subtitle: 'Your festival timeline' },
      { title: 'From gates open to one last song', subtitle: 'Every chapter in between' },
      { title: 'A weekend at full volume', subtitle: 'The whole thing in sequence' },
    ],
    routeReplay: [
      { title: 'Across the festival grounds', subtitle: 'Stages, food stops, camp, repeat' },
      { title: 'The route between the sets', subtitle: 'A map of the weekend' },
      { title: 'Where the music took you', subtitle: 'Every stage and detour' },
      { title: 'The festival on foot', subtitle: 'A surprisingly long route' },
      { title: 'From main stage to somewhere unexpected', subtitle: 'The weekend mapped' },
    ],
    heroGallery: [
      { title: 'Peak festival', subtitle: 'Lights, crowds, friends, repeat' },
      { title: 'The photos that still sound loud', subtitle: 'The best frames from the weekend' },
      { title: 'Main-stage memories', subtitle: 'The moments worth replaying' },
      { title: 'The weekend in full colour', subtitle: 'A festival highlight reel' },
      { title: 'The ones worth losing your voice for', subtitle: 'Your strongest festival moments' },
    ],
    storyInsights: [
      { title: 'The weekend by numbers', subtitle: 'Stages, distance, photos, and peak energy' },
      { title: 'Festival stats', subtitle: 'What the weekend added up to' },
      { title: 'The data behind the wristband', subtitle: 'A numerical festival recap' },
      { title: 'How much weekend fitted into the weekend', subtitle: 'The numbers tell you' },
      { title: 'Crowd notes', subtitle: 'Places, moments, people, distance' },
    ],
    friendCaptions: [
      { title: 'From the crowd', subtitle: 'What everyone said between sets' },
      { title: 'Things shouted near a stage', subtitle: 'Now preserved as captions' },
      { title: 'The festival commentary', subtitle: 'A few words from the group' },
      { title: 'Messages from somewhere in the crowd', subtitle: 'The weekend in their words' },
      { title: 'What survived the group chat', subtitle: 'Captions from the festival' },
    ],
    share: [
      { title: 'Encore', subtitle: 'Share the weekend one more time' },
      { title: 'Send the festival back around', subtitle: 'Every stage, stop, and standout moment' },
      { title: 'The wristband can come off now', subtitle: 'The story stays' },
      { title: 'One more replay', subtitle: 'Share the whole weekend' },
      { title: 'The weekend is ready', subtitle: 'Drop it into the group chat' },
    ],
    vibes: ['Festival energy', 'Main-stage magic', 'Crowd alive', 'Full-volume weekend', 'One more set', 'Wristband weather', 'Bass and lights', 'Worth the lost voice'],
  },

  milestone: {
    opening: [
      { title: 'A new chapter starts here', subtitle: 'The moment before everything changes' },
      { title: 'This one deserved marking', subtitle: 'The first moments of the milestone' },
      { title: 'A day with a before and after', subtitle: 'The story begins' },
      { title: 'The moment arrived', subtitle: 'After all the build-up' },
      { title: 'Worth stopping for', subtitle: 'The beginning of a milestone day' },
    ],
    timeline: [
      { title: 'How the milestone unfolded', subtitle: 'The build-up, the moment, the celebration' },
      { title: 'The day in chapters', subtitle: 'Everything around the main moment' },
      { title: 'A big moment has a lot around it', subtitle: 'The full story in order' },
      { title: 'Before, during, after', subtitle: 'The milestone from every side' },
      { title: 'The story behind the headline', subtitle: 'All the moments that made the day' },
    ],
    routeReplay: [
      { title: 'The places behind the milestone', subtitle: 'Where the day happened' },
      { title: 'The day on the map', subtitle: 'Every place that became part of it' },
      { title: 'From build-up to celebration', subtitle: 'The route through the day' },
      { title: 'A map with meaning', subtitle: 'The places around the moment' },
      { title: 'Where one chapter ended and another began', subtitle: 'The day, mapped' },
    ],
    heroGallery: [
      { title: 'The defining moments', subtitle: 'The photos that hold the milestone' },
      { title: 'The ones to keep', subtitle: 'The best frames from the day' },
      { title: 'The moment, and everything around it', subtitle: 'A gallery from the milestone' },
      { title: 'A few photographs that say a lot', subtitle: 'The highlights' },
      { title: 'The day in its strongest frames', subtitle: 'The memory, distilled' },
    ],
    storyInsights: [
      { title: 'The milestone in detail', subtitle: 'People, photos, timing, and moments' },
      { title: 'What the day added up to', subtitle: 'A few numbers behind the memory' },
      { title: 'The details worth keeping too', subtitle: 'A factual look at the day' },
      { title: 'One day, measured', subtitle: 'The numbers behind the milestone' },
      { title: 'The quieter details', subtitle: 'A few facts from a big day' },
    ],
    friendCaptions: [
      { title: 'What everyone wanted to say', subtitle: 'Messages from the people around the milestone' },
      { title: 'In their own words', subtitle: 'A few lines worth keeping' },
      { title: 'Messages for the moment', subtitle: 'The people in the story add their voices' },
      { title: 'The words that came with the day', subtitle: 'Notes, captions, and congratulations' },
      { title: 'From everyone who shared it', subtitle: 'A second layer to the memory' },
    ],
    share: [
      { title: 'Mark it properly', subtitle: 'Share the whole story, not just one photo' },
      { title: 'A milestone everyone can keep', subtitle: 'Send the finished story' },
      { title: 'The next chapter can wait a minute', subtitle: 'Relive this one first' },
      { title: 'Pass the day along', subtitle: 'Share it with everyone who was part of it' },
      { title: 'The moment is saved', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Milestone moment', 'A new chapter', 'Worth marking', 'Proud-day energy', 'One for the record', 'Big moment, good people', 'The next chapter starts here', 'A day with meaning'],
  },

  community: {
    opening: [
      { title: 'People showed up', subtitle: 'And that is where the story starts' },
      { title: 'The room came together', subtitle: 'The first moments of the event' },
      { title: 'Before the programme filled the day', subtitle: 'Arrivals, hellos, and first connections' },
      { title: 'Something brought everyone here', subtitle: 'The opening chapter' },
      { title: 'The event starts with the people', subtitle: 'Everything else follows' },
    ],
    timeline: [
      { title: 'How the event unfolded', subtitle: 'Sessions, conversations, and moments between' },
      { title: 'The day in sequence', subtitle: 'From first arrival to final goodbye' },
      { title: 'The programme, plus everything around it', subtitle: 'The real event timeline' },
      { title: 'What happened when everyone came together', subtitle: 'The story in chapters' },
      { title: 'The event behind the agenda', subtitle: 'A people-first timeline' },
    ],
    routeReplay: [
      { title: 'Where the event moved', subtitle: 'Venues, rooms, stops, and shared spaces' },
      { title: 'The event on the map', subtitle: 'Every place that played a part' },
      { title: 'From one space to the next', subtitle: 'The geography of the day' },
      { title: 'Where people connected', subtitle: 'The places behind the programme' },
      { title: 'A map of the event', subtitle: 'Useful context behind the moments' },
    ],
    heroGallery: [
      { title: 'The moments that represent the day', subtitle: 'People, energy, and shared experience' },
      { title: 'The event in its best frames', subtitle: 'A curated set of highlights' },
      { title: 'The photos worth carrying forward', subtitle: 'The strongest moments from the event' },
      { title: 'People made the event', subtitle: 'These frames show why' },
      { title: 'The highlight set', subtitle: 'A visual recap of {eventName}' },
    ],
    storyInsights: [
      { title: 'The event by numbers', subtitle: 'People, time, places, and moments' },
      { title: 'A factual recap', subtitle: 'The numbers behind the event' },
      { title: 'What the day looked like in data', subtitle: 'A compact event summary' },
      { title: 'The details behind the programme', subtitle: 'A few useful numbers' },
      { title: 'Event notes', subtitle: 'A different view of the day' },
    ],
    friendCaptions: [
      { title: 'From the people in the room', subtitle: 'What attendees wanted to remember' },
      { title: 'In their own words', subtitle: 'Comments from inside the event' },
      { title: 'What people took away', subtitle: 'A few lines from the day' },
      { title: 'The voices behind the event', subtitle: 'Captions, reactions, and notes' },
      { title: 'From the community', subtitle: 'The day, told by the people in it' },
    ],
    share: [
      { title: 'Keep the event moving', subtitle: 'Share the finished story with the community' },
      { title: 'One recap, easy to pass on', subtitle: 'Send {eventName}' },
      { title: 'The day is ready to share', subtitle: 'People can relive it in one place' },
      { title: 'More useful than another photo dump', subtitle: 'Share the complete event story' },
      { title: 'The event is over. The record is ready.', subtitle: 'Pass it on' },
    ],
    vibes: ['Community energy', 'Good room', 'People-first event', 'Shared purpose', 'Everyone showed up', 'Connections made', 'A day with momentum', 'Better together'],
  },

  custom: {
    opening: [
      { title: 'This is where it started', subtitle: 'The first moments of {eventName}' },
      { title: 'Every story needs a beginning', subtitle: 'Here is yours' },
      { title: 'The opening moments', subtitle: 'Before the day found its rhythm' },
      { title: 'At the beginning', subtitle: 'The story starts simply' },
      { title: 'First frame', subtitle: 'The beginning of the memory' },
    ],
    timeline: [
      { title: 'How it unfolded', subtitle: 'The story in the order it happened' },
      { title: 'The full timeline', subtitle: 'Every chapter in sequence' },
      { title: 'From start to finish', subtitle: 'The day, remembered properly' },
      { title: 'One moment after another', subtitle: 'How the story came together' },
      { title: 'The shape of the day', subtitle: 'A timeline built from your moments' },
    ],
    routeReplay: [
      { title: 'Where it happened', subtitle: 'The places behind the story' },
      { title: 'The route through the day', subtitle: 'Every stop on the map' },
      { title: 'The story has a geography', subtitle: 'See it all again' },
      { title: 'Every place in context', subtitle: 'The map behind the moments' },
      { title: 'The route replay', subtitle: 'Where the day took you' },
    ],
    heroGallery: [
      { title: 'The moments that stand out', subtitle: 'A curated set from {eventName}' },
      { title: 'The ones worth another look', subtitle: 'The strongest photos from the story' },
      { title: 'Highlights', subtitle: 'The moments that carry the day' },
      { title: 'The story in frames', subtitle: 'A few photographs that say a lot' },
      { title: 'The keepers', subtitle: 'Favourite moments, all together' },
    ],
    storyInsights: [
      { title: 'The story by numbers', subtitle: 'Time, people, places, and moments' },
      { title: 'A different look at the day', subtitle: 'The details behind the photos' },
      { title: 'What the story added up to', subtitle: 'A few real numbers' },
      { title: 'The details', subtitle: 'Useful context behind the memory' },
      { title: 'Inside the story', subtitle: 'The numbers you did not notice at the time' },
    ],
    friendCaptions: [
      { title: 'In everyone’s own words', subtitle: 'Comments from inside the story' },
      { title: 'What people said', subtitle: 'A second layer to the memory' },
      { title: 'The voices in the story', subtitle: 'Captions and comments from the group' },
      { title: 'Words worth keeping', subtitle: 'The comments that came with the moments' },
      { title: 'From everyone who was there', subtitle: 'The story in their words' },
    ],
    share: [
      { title: 'Share the whole story', subtitle: 'Not another folder of loose photos' },
      { title: 'One link, everything that mattered', subtitle: 'Send {eventName}' },
      { title: 'The story is ready', subtitle: 'Share it with the people who were there' },
      { title: 'Pass the memory on', subtitle: 'Everyone can relive it together' },
      { title: 'This is worth keeping', subtitle: 'And worth sharing' },
    ],
    vibes: ['A story worth keeping', 'Good-day energy', 'Shared memory', 'One for later', 'The whole story', 'A day with character', 'Worth another look', 'Made of moments'],
  },
};



// Event-specific packs sit on top of the broader family voice. This gives the
// highest-use Ambler activities a distinct personality without duplicating the
// entire content system for every event type.
const EVENT_OVERRIDES: Partial<Record<EventType, Partial<StoryFamilyPack>>> = {
  wedding: {
    opening: [
      { title: 'Before the vows', subtitle: 'The quiet build-up to {eventName}' },
      { title: 'The day everyone came for', subtitle: 'Getting ready, arriving, taking it all in' },
      { title: 'It started before the aisle', subtitle: 'The first chapter of the wedding day' },
      { title: 'All the little moments first', subtitle: 'Before the ceremony changed the pace' },
      { title: 'The beginning of a very big day', subtitle: 'The story starts with everyone getting ready' },
    ],
    timeline: [
      { title: 'From getting ready to last dance', subtitle: 'The wedding in the order it happened' },
      { title: 'The whole wedding day', subtitle: 'Preparations, ceremony, speeches, dancing' },
      { title: 'Every chapter of the day', subtitle: 'The moments between the major moments' },
      { title: 'A day with a natural storyline', subtitle: 'From anticipation to the final photos' },
      { title: 'The wedding, properly remembered', subtitle: 'Not just the formal photographs' },
    ],
    friendCaptions: [
      { title: 'What everyone remembers', subtitle: 'Messages and captions from the people who were there' },
      { title: 'In their own words', subtitle: 'The wedding through the guests’ voices' },
      { title: 'The lines worth keeping', subtitle: 'A few words from inside the day' },
      { title: 'Things people actually said', subtitle: 'A less formal wedding record' },
      { title: 'From the people around you', subtitle: 'Captions that belong with the photographs' },
    ],
    share: [
      { title: 'One story for everyone who was there', subtitle: 'Share the wedding without sending another photo folder' },
      { title: 'The day is ready to relive', subtitle: 'Send {eventName} to the people who made it' },
      { title: 'Keep more than the formal shots', subtitle: 'Share the full wedding story' },
      { title: 'From first photo to last dance', subtitle: 'One private link to the whole day' },
      { title: 'The wedding story is finished', subtitle: 'Now everyone can relive it together' },
    ],
  },
  birthday: {
    opening: [
      { title: 'Birthday mode: on', subtitle: 'Before the candles and the group photos' },
      { title: 'Another year, another story', subtitle: 'The first moments of {eventName}' },
      { title: 'It started civilised', subtitle: 'The opening chapter of the birthday' },
      { title: 'Before the cake disappeared', subtitle: 'Where the celebration began' },
      { title: 'The birthday starts here', subtitle: 'Arrivals, first drinks, first photos' },
    ],
    storyInsights: [
      { title: 'The birthday by numbers', subtitle: 'People, photos, time, and the busiest part of the celebration' },
      { title: 'What the party added up to', subtitle: 'A few factual details from the day' },
      { title: 'Behind the birthday photos', subtitle: 'The real numbers inside the celebration' },
      { title: 'Party stats', subtitle: 'Nothing invented, just what the group captured' },
      { title: 'The shape of the celebration', subtitle: 'When, where, and how much was captured' },
    ],
    share: [
      { title: 'Keep the whole birthday', subtitle: 'Not just the cake photo' },
      { title: 'The birthday story is ready', subtitle: 'Send it to everyone who was there' },
      { title: 'One more look before next year', subtitle: 'Share {eventName}' },
      { title: 'The party ended. The story did not.', subtitle: 'Relive it together' },
      { title: 'A better birthday photo dump', subtitle: 'One story, every perspective' },
    ],
  },
  festival: {
    opening: [
      { title: 'Wristbands on', subtitle: 'Before the first stage and the first lost friend' },
      { title: 'The gates opened', subtitle: 'The first chapter of {eventName}' },
      { title: 'Before the headline set', subtitle: 'Where the festival story actually began' },
      { title: 'Camp set. Phones charged. Mostly.', subtitle: 'The festival starts here' },
      { title: 'Day one energy', subtitle: 'Fresh clothes, full batteries, big plans' },
    ],
    timeline: [
      { title: 'Stage to stage', subtitle: 'The festival in the order it happened' },
      { title: 'Days, nights, repeat', subtitle: 'Every chapter of the weekend' },
      { title: 'The site found its rhythm', subtitle: 'Crowds, stages, food stops, after-hours' },
      { title: 'From gates to final song', subtitle: 'The complete festival timeline' },
      { title: 'How the weekend escalated', subtitle: 'The story from daylight to late night' },
    ],
    routeReplay: [
      { title: 'The festival on foot', subtitle: 'Stages, tents, stops, and the routes between them' },
      { title: 'How many times did you cross the site?', subtitle: 'The weekend, mapped' },
      { title: 'Stage-hopping, visualised', subtitle: 'Replay where the group actually went' },
      { title: 'The map behind the music', subtitle: 'Every recorded stop in context' },
      { title: 'From camp to crowd and back again', subtitle: 'The festival route' },
    ],
  },
  family_gathering: {
    opening: [
      { title: 'Everyone under one roof', subtitle: 'The beginning of {eventName}' },
      { title: 'The familiar faces arrived', subtitle: 'Where the family story began' },
      { title: 'Together again', subtitle: 'The first moments worth keeping' },
      { title: 'Before everyone sat down', subtitle: 'The quieter start to the gathering' },
      { title: 'A full house', subtitle: 'The story starts with people arriving' },
    ],
    friendCaptions: [
      { title: 'Family, in their own words', subtitle: 'The lines that belong with these photographs' },
      { title: 'Things worth remembering', subtitle: 'Captions from around the family' },
      { title: 'The voices behind the photos', subtitle: 'A few words from the people in the story' },
      { title: 'What everyone wanted to add', subtitle: 'The family’s own notes' },
      { title: 'Words for later', subtitle: 'A small written layer to the memory' },
    ],
    share: [
      { title: 'Keep it in the family', subtitle: 'A private story for the people who were there' },
      { title: 'One place for the whole gathering', subtitle: 'Share {eventName} privately' },
      { title: 'Worth keeping for later', subtitle: 'Send the finished family story' },
      { title: 'The day together, saved', subtitle: 'Everyone can relive it from one link' },
      { title: 'A family memory, properly assembled', subtitle: 'Ready to share privately' },
    ],
  },
  graduation: {
    opening: [
      { title: 'Before the name was called', subtitle: 'Robes, nerves, family photos' },
      { title: 'A long road to one day', subtitle: 'The graduation starts here' },
      { title: 'Robes on', subtitle: 'The first chapter of {eventName}' },
      { title: 'Before the ceremony', subtitle: 'Everyone arrived ready to remember it' },
      { title: 'Milestone day', subtitle: 'The build-up before the formal moment' },
    ],
    share: [
      { title: 'The milestone is saved', subtitle: 'Share it with everyone who helped get here' },
      { title: 'One ceremony, years behind it', subtitle: 'Keep the whole graduation story' },
      { title: 'Worth more than one cap-throw photo', subtitle: 'Send {eventName}' },
      { title: 'The certificate is official. So is the story.', subtitle: 'Relive the day' },
      { title: 'A big day, all in one place', subtitle: 'Share it with family and friends' },
    ],
  },
  road_trip: {
    opening: [
      { title: 'Engine on', subtitle: 'The road trip started before the destination mattered' },
      { title: 'Leaving was the first chapter', subtitle: 'The road opens up from here' },
      { title: 'First mile', subtitle: 'Where {eventName} actually began' },
      { title: 'Bags in. Route set.', subtitle: 'The journey starts now' },
      { title: 'The long way round', subtitle: 'Exactly how a good road trip should begin' },
    ],
    routeReplay: [
      { title: 'The road behind the story', subtitle: 'Distance, stops, detours, and the places between' },
      { title: 'Every stop earned its place', subtitle: 'Replay the full journey' },
      { title: 'The route was part of the point', subtitle: 'See the whole trip on the map' },
      { title: 'From first mile to last stop', subtitle: 'The journey, visualised' },
      { title: 'A story with a road through it', subtitle: 'The route behind the photos' },
    ],
    share: [
      { title: 'Send the road trip around', subtitle: 'One link for every stop and every perspective' },
      { title: 'The route ended. The story stays.', subtitle: 'Relive {eventName}' },
      { title: 'Worth taking the long way again', subtitle: 'Share the trip' },
      { title: 'Every stop, one story', subtitle: 'Pass it to the people who were in the car' },
      { title: 'The journey is ready to replay', subtitle: 'No slideshow required' },
    ],
  },
  camping_trip: {
    opening: [
      { title: 'Tent up. Signal optional.', subtitle: 'Where {eventName} began' },
      { title: 'Camp set', subtitle: 'The first quiet moments outside' },
      { title: 'Under open sky', subtitle: 'The beginning of the camping story' },
      { title: 'Before the fire was lit', subtitle: 'Setting up the weekend' },
      { title: 'Out here for a while', subtitle: 'The first chapter away from everything else' },
    ],
    timeline: [
      { title: 'Days outside, nights by the fire', subtitle: 'How the trip unfolded' },
      { title: 'Camp life in chapters', subtitle: 'Set-up, exploring, firelight, pack-down' },
      { title: 'The slower timeline', subtitle: 'The moments that filled the trip' },
      { title: 'From tent pegs to pack-up', subtitle: 'The complete camping story' },
      { title: 'How the weekend settled in', subtitle: 'A story told outdoors' },
    ],
  },
  run_walk: {
    opening: [
      { title: 'Shoes on. Story started.', subtitle: 'The first steps of {eventName}' },
      { title: 'From the first stride', subtitle: 'Before the route found its rhythm' },
      { title: 'Start line energy', subtitle: 'Fresh legs and the first photos' },
    ],
    timeline: [
      { title: 'The route, kilometre by kilometre', subtitle: 'How the effort unfolded' },
      { title: 'Finding the rhythm', subtitle: 'Start, middle, finish, and everything between' },
      { title: 'One step after another', subtitle: 'The session in sequence' },
    ],
    routeReplay: [
      { title: 'Every step on the map', subtitle: 'Distance, pace, stops, and the finish' },
      { title: 'The line you earned', subtitle: 'Replay the route from start to finish' },
      { title: 'Where the legs took you', subtitle: 'The full route, properly remembered' },
    ],
    share: [
      { title: 'Finish line, saved', subtitle: 'Share the route and the story behind it' },
      { title: 'The effort deserves a replay', subtitle: 'Send {eventName} to the people who did it' },
      { title: 'Done. Kept. Shared.', subtitle: 'The whole session in one story' },
    ],
    vibes: ['Finish-line feeling', 'Steady miles', 'Good tired', 'One more kilometre', 'Shared effort', 'Earned endorphins', 'Feet did the work', 'Worth the route'],
  },
  cycle_ride: {
    opening: [
      { title: 'Roll out', subtitle: 'The first turns of the pedals' },
      { title: 'Wheels moving', subtitle: 'Where {eventName} began' },
      { title: 'The ride starts here', subtitle: 'Fresh legs, open road' },
    ],
    timeline: [
      { title: 'How the ride unfolded', subtitle: 'Climbs, stops, views, and the home stretch' },
      { title: 'From roll-out to ride complete', subtitle: 'The day on two wheels' },
      { title: 'The miles in order', subtitle: 'A ride told from first pedal to last' },
    ],
    routeReplay: [
      { title: 'The ride line', subtitle: 'Distance, speed, stops, and every turn' },
      { title: 'Replay the route', subtitle: 'The road behind the photos' },
      { title: 'Every bend has a memory', subtitle: 'The full ride on the map' },
    ],
    share: [
      { title: 'Send the ride around', subtitle: 'One route, everyone’s moments' },
      { title: 'Worth another lap', subtitle: 'Relive {eventName}' },
      { title: 'Ride complete', subtitle: 'Keep the route and the story together' },
    ],
    vibes: ['Two-wheel freedom', 'Ride-day energy', 'Miles together', 'Cafe-stop approved', 'Worth the climb', 'Rolling momentum', 'Open-road feeling', 'Strong finish'],
  },
  group_workout: {
    opening: [
      { title: 'Everyone showed up', subtitle: 'The session starts together' },
      { title: 'Before the first rep', subtitle: 'The room was still suspiciously calm' },
      { title: 'Warm-up energy', subtitle: 'Where the shared effort began' },
    ],
    timeline: [
      { title: 'Warm-up to final push', subtitle: 'The session, rep by rep' },
      { title: 'How the work got done', subtitle: 'A group session in sequence' },
      { title: 'The effort built', subtitle: 'From easy start to earned finish' },
    ],
    storyInsights: [
      { title: 'The session by numbers', subtitle: 'Time, people, movement, and moments' },
      { title: 'What everyone put in', subtitle: 'A factual recap of the group effort' },
      { title: 'The work behind the smiles', subtitle: 'Real numbers from the session' },
    ],
    share: [
      { title: 'Strong together', subtitle: 'Send the finished session story to the group' },
      { title: 'Proof everyone did the work', subtitle: 'Share {eventName}' },
      { title: 'Session complete', subtitle: 'Keep the effort, not just the selfie' },
    ],
    vibes: ['Strong together', 'Shared effort', 'Good tired', 'Final-push energy', 'Everyone worked', 'Earned smiles', 'Team session', 'Better together'],
  },
  fitness_challenge: {
    opening: [
      { title: 'Challenge accepted', subtitle: 'Before anyone could change their mind' },
      { title: 'This looked easier on paper', subtitle: 'The first moments of the challenge' },
      { title: 'At the start', subtitle: 'The goal was simple: finish' },
    ],
    timeline: [
      { title: 'How the challenge went down', subtitle: 'Start, struggle, finish' },
      { title: 'From fresh to finished', subtitle: 'The full effort in order' },
      { title: 'The work in chapters', subtitle: 'Every stage of the challenge' },
    ],
    share: [
      { title: 'Challenge completed', subtitle: 'The story proves it happened' },
      { title: 'Earned, not staged', subtitle: 'Share the finish' },
      { title: 'Keep the result', subtitle: 'And everything it took to get there' },
    ],
    vibes: ['Challenge accepted', 'Earned, not staged', 'Dig deep', 'Finish-line feeling', 'Shared effort', 'No shortcuts', 'Strong finish', 'Worth the work'],
  },
  ski_trip: {
    opening: [
      { title: 'First lift, fresh snow', subtitle: 'Where the mountain story began' },
      { title: 'Boots clicked in', subtitle: 'The first run of {eventName}' },
      { title: 'Up the mountain', subtitle: 'Cold air, clear views, ready legs' },
    ],
    timeline: [
      { title: 'Runs, lifts, repeat', subtitle: 'The mountain day in order' },
      { title: 'From first chair to après', subtitle: 'How the day unfolded' },
      { title: 'The mountain chapters', subtitle: 'Runs, stops, and the bits in between' },
    ],
    routeReplay: [
      { title: 'Tracks on the mountain', subtitle: 'Replay where the day went' },
      { title: 'Lifts, runs, and high points', subtitle: 'The mountain on the map' },
      { title: 'The lines behind the memories', subtitle: 'A day measured in movement' },
    ],
    share: [
      { title: 'Save the mountain day', subtitle: 'Before the snow disappears' },
      { title: 'Après can wait one minute', subtitle: 'Share the story first' },
      { title: 'One more run through the memories', subtitle: 'Relive {eventName}' },
    ],
    vibes: ['Mountain-day energy', 'First-chair feeling', 'Fresh tracks', 'Cold air, good day', 'Après earned', 'High-point happiness', 'One more run', 'Snow-day story'],
  },
  theme_park_day: {
    opening: [
      { title: 'Gates open', subtitle: 'The first rush of the day' },
      { title: 'Before the first queue', subtitle: 'Everyone still had a plan' },
      { title: 'The park was waiting', subtitle: 'Where the day began' },
    ],
    timeline: [
      { title: 'Ride by ride', subtitle: 'How the day escalated' },
      { title: 'Queues, screams, snacks, repeat', subtitle: 'The day in the correct order' },
      { title: 'From rope drop to tired feet', subtitle: 'Every chapter of the park day' },
    ],
    routeReplay: [
      { title: 'The park, walked properly', subtitle: 'Every land, detour, and snack stop' },
      { title: 'You covered more ground than you think', subtitle: 'The day on the map' },
      { title: 'The route between the rides', subtitle: 'Where the memories happened' },
    ],
    share: [
      { title: 'One more ride', subtitle: 'This time through the story' },
      { title: 'The park day is ready', subtitle: 'Send it to the whole group' },
      { title: 'Keep the screams', subtitle: 'Share {eventName}' },
    ],
    vibes: ['Rope-drop energy', 'Ride-day chaos', 'Worth the queue', 'Theme-park feet', 'One more ride', 'Snack-stop strategy', 'Scream-photo energy', 'Full-day adventure'],
  },
  cruise: {
    opening: [
      { title: 'Leaving the shore behind', subtitle: 'The first chapter at sea' },
      { title: 'All aboard', subtitle: 'Where {eventName} started' },
      { title: 'The horizon changed', subtitle: 'And the trip properly began' },
    ],
    timeline: [
      { title: 'Sea days and shore days', subtitle: 'The voyage in chapters' },
      { title: 'Port by port', subtitle: 'How the journey unfolded' },
      { title: 'From embarkation to the final morning', subtitle: 'The full cruise story' },
    ],
    routeReplay: [
      { title: 'The voyage on the map', subtitle: 'Ports, distance, and the water between' },
      { title: 'Across the water', subtitle: 'Replay every place the trip reached' },
      { title: 'A route with a horizon', subtitle: 'The geography of the cruise' },
    ],
    share: [
      { title: 'Bring the voyage home', subtitle: 'Share the whole cruise story' },
      { title: 'One link, every port', subtitle: 'Send {eventName}' },
      { title: 'The ship docked. The story stays.', subtitle: 'Relive the trip together' },
    ],
    vibes: ['At-sea feeling', 'Port-day energy', 'Horizon mode', 'Deck-life pace', 'Ship-to-shore', 'Voyage memories', 'One more sunset', 'Sea-day reset'],
  },
  sports_event: {
    opening: [
      { title: 'Before the action', subtitle: 'Warm-ups, arrivals, and anticipation' },
      { title: 'Game face on', subtitle: 'The opening moments of {eventName}' },
      { title: 'The venue filled up', subtitle: 'Before the competition took over' },
    ],
    timeline: [
      { title: 'The event, play by play', subtitle: 'Build-up, action, final moments' },
      { title: 'How the competition unfolded', subtitle: 'Every chapter in order' },
      { title: 'From warm-up to after', subtitle: 'The complete sporting story' },
    ],
    heroGallery: [
      { title: 'The action frames', subtitle: 'The moments that carried the event' },
      { title: 'Caught in motion', subtitle: 'The best of the competition' },
      { title: 'The moments worth replaying', subtitle: 'A gallery from {eventName}' },
    ],
    share: [
      { title: 'Replay the day', subtitle: 'Send the full sporting story' },
      { title: 'The event is over. The replay is ready.', subtitle: 'Share {eventName}' },
      { title: 'One story for the whole team', subtitle: 'Keep the action together' },
    ],
    vibes: ['Game-day energy', 'In the action', 'Team together', 'Crowd alive', 'Competitive edge', 'Big-moment feeling', 'Final-whistle memory', 'Worth the replay'],
  },
};

export function selectStoryContent(eventType: EventType, seed: string): StoryContentSelection {
  const family = FAMILY_BY_EVENT[eventType] ?? 'custom';
  const pack = PACKS[family];
  const override = EVENT_OVERRIDES[eventType];
  return {
    opening: stablePick(override?.opening ?? pack.opening, `${seed}:opening`),
    timeline: stablePick(override?.timeline ?? pack.timeline, `${seed}:timeline`),
    routeReplay: stablePick(override?.routeReplay ?? pack.routeReplay, `${seed}:route`),
    heroGallery: stablePick(override?.heroGallery ?? pack.heroGallery, `${seed}:gallery`),
    storyInsights: stablePick(override?.storyInsights ?? pack.storyInsights, `${seed}:insights`),
    friendCaptions: stablePick(override?.friendCaptions ?? pack.friendCaptions, `${seed}:captions`),
    share: stablePick(override?.share ?? pack.share, `${seed}:share`),
  };
}

export function getStoryVibes(eventType: EventType): string[] {
  const family = FAMILY_BY_EVENT[eventType] ?? 'custom';
  return EVENT_OVERRIDES[eventType]?.vibes ?? PACKS[family].vibes;
}

function stablePick<T>(items: T[], seed: string): T {
  return items[stableHash(seed) % items.length]!;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
