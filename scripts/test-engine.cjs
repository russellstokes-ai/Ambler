const assert = require('assert');
const ts = require('typescript');
const fs = require('fs');
require.extensions['.ts'] = function(module, filename) {
  const text=fs.readFileSync(filename,'utf8');
  const out=ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  module._compile(out,filename);
};
const { processRoute } = require('../src/features/storybook/engine/routeProcessor.ts');
const { planStory, detectMediaBursts } = require('../src/features/storybook/engine/storyPlanner.ts');
const { buildTimeline } = require('../src/features/storybook/engine/timelineBuilder.ts');
const { selectMusic } = require('../src/features/storybook/engine/musicSelector.ts');
const { selectStoryContent, getStoryVibes } = require('../src/features/storybook/engine/eventStoryContent.ts');
const { buildRouteMediaMoments, clusterRouteMediaMoments, selectRouteReplayScene } = require('../src/features/location/routeReplayV2.ts');
function media(id, at, uploader='Alex', place='') { return {id,uri:`file://${id}.jpg`,capturedAt:at,uploaderName:uploader,mediaType:'photo',score:{overall:80,qualityScore:80,featureScore:80,socialScore:50,diversityScore:50},placeLabel:place}; }
const start=Date.parse('2026-09-28T08:00:00Z');
const locations=Array.from({length:8},(_,i)=>({latitude:51.50+i*0.002,longitude:-0.1+i*0.001,capturedAt:new Date(start+i*5*60_000).toISOString(),accuracyM:5,speedMps:1.7+i*.1,altitudeM:100+i*12,placeLabel:i===0?'Trailhead':i===7?'High Point':undefined}));
const route=processRoute(locations,[media('m1',locations[0].capturedAt),media('m2',locations[7].capturedAt)],{blurPrivateLocations:false,shareSafeMode:false});
assert(route.totalDistanceKm>0,'route distance');
assert(route.movingDurationHours>0,'moving time');
assert(route.elevationGainM>0,'elevation gain');
assert(route.highestElevationM>=184,'high point');
const baseInput={event:{id:'e',title:'Hike',type:'hiking_day',startsAt:'2026-09-28T08:00:00Z',endsAt:'2026-09-28T13:00:00Z',locationLabel:'Hills'},media:[],locations:[],captions:[],theme:'route_replay',privacySettings:{blurPrivateLocations:false,shareSafeMode:false}};
assert(planStory({...baseInput,storyLength:'short'},[]).maxChapters < planStory({...baseInput,storyLength:'epic'},[]).maxChapters,'story lengths scale');
const burstMedia=[0,20,40,300,320,340].map((sec,i)=>media(`b${i}`,new Date(start+sec*1000).toISOString()));
assert(detectMediaBursts(burstMedia).length>=2,'burst detection');
const timelineMedia=[
  media('a1','2026-09-28T08:00:00Z','A','Trailhead'),media('a2','2026-09-28T08:02:00Z','A','Trailhead'),media('a3','2026-09-28T08:04:00Z','B','Trailhead'),media('a4','2026-09-28T08:06:00Z','A','Trailhead'),
  media('b1','2026-09-28T10:00:00Z','B','Summit'),media('b2','2026-09-28T10:02:00Z','A','Summit'),media('b3','2026-09-28T10:04:00Z','B','Summit'),media('b4','2026-09-28T10:06:00Z','A','Summit')
];
const chapters=buildTimeline(timelineMedia,'hiking_day',undefined,undefined,5);
assert(chapters.length>=2,'timeline detects meaningful boundary');
const content=selectStoryContent('hiking_day','event-1');
assert(content.opening && /trail|path|climb|walk|hike/i.test(`${content.opening.title} ${content.opening.subtitle}`),'hiking content');
assert(getStoryVibes('sports_event').length>=4,'sport vibes');
const music=selectMusic('route_replay','hiking_day',timelineMedia,chapters);
assert(/^((cinematic|chilled)-\d)$/.test(music.trackId),'music ID resolves to bundled catalog');

const routeMoments=buildRouteMediaMoments([
  {...media('rm1','2026-09-28T09:00:00Z','Alex'),gpsLat:51.5,gpsLng:-0.1,thumbnailUri:'file://rm1.jpg'},
  {...media('rm2','2026-09-28T09:01:00Z','Bea'),gpsLat:51.5001,gpsLng:-0.1001,mediaType:'video',thumbnailUri:'file://rm2-thumb.jpg'},
]);
assert.strictEqual(routeMoments.length,2,'route media keeps geotagged group media');
assert.strictEqual(clusterRouteMediaMoments(routeMoments,75).length,1,'nearby route media clusters');
assert.strictEqual(selectRouteReplayScene('hiking_day',{elevationGainM:400}),'terrain','hiking selects terrain replay');
assert.strictEqual(selectRouteReplayScene('night_out',{}),'city','night out selects city replay');
console.log('Engine tests passed: route metrics, story length, burst/timeline intelligence, event content, soundtrack mapping, Route Replay V2 media clustering.');
