import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Chip,
  IconRow,
  PrimaryButton,
  ProgressSteps,
  PrototypeHeader,
  PrototypePage,
  SecondaryButton,
  SectionTitle,
  Stat,
  StatusBadge,
  StoryArtwork,
  Surface,
  TwoPane,
  ui,
} from './kit';
import {
  eventCategories,
  mockEvents,
  mockStories,
  popularEventTypes,
  prototypeScreens,
  routeMoments,
  storyThemes,
  type PrototypeScreenId,
} from './data';

const go = (id: PrototypeScreenId) => router.push(`/ui-preview/${id}` as never);

export function PrototypeScreen({ id }: { id: PrototypeScreenId }) {
  switch (id) {
    case 'splash': return <Splash />;
    case 'onboarding': return <Onboarding />;
    case 'auth': return <Auth />;
    case 'profile-setup': return <ProfileSetup />;
    case 'home': return <Home />;
    case 'events': return <Events />;
    case 'stories': return <Stories />;
    case 'archive': return <Archive />;
    case 'create-basics': return <CreateBasics />;
    case 'event-type': return <EventType />;
    case 'story-style': return <StoryStyle />;
    case 'privacy-route': return <PrivacyRoute />;
    case 'invite': return <Invite />;
    case 'event-hub': return <EventHub />;
    case 'moments': return <Moments />;
    case 'add-moment': return <AddMoment />;
    case 'route-capture': return <RouteCapture />;
    case 'guest-join': return <GuestJoin />;
    case 'guest-contribution': return <GuestContribution />;
    case 'guest-result': return <GuestResult />;
    case 'finish-build': return <FinishBuild />;
    case 'generation': return <Generation />;
    case 'story-ready': return <StoryReady />;
    case 'relive': return <Relive />;
    case 'route-replay': return <RouteReplay />;
    case 'route-moment': return <RouteMoment />;
    case 'story-editor': return <StoryEditor />;
    case 'theme-music': return <ThemeMusic />;
    case 'share-export': return <ShareExport />;
    case 'shared-web': return <SharedWeb />;
    case 'profile': return <Profile />;
    case 'settings': return <Settings />;
    case 'privacy-data': return <PrivacyData />;
    case 'storage-hosting': return <StorageHosting />;
    case 'add-server': return <AddServer />;
    case 'server-detail': return <ServerDetail />;
    default: return <PrototypeIndex />;
  }
}

export function PrototypeIndex() {
  const sections = useMemo(
    () => Array.from(new Set(prototypeScreens.map((screen) => screen.section))),
    [],
  );

  return (
    <PrototypePage>
      <PrototypeHeader
        eyebrow="Ambler UI first draft"
        title="36-screen prototype"
        subtitle="A navigable first-pass implementation of the approved Draftbit UI specification."
      />
      <Surface tone="tint">
        <View style={styles.inline}>
          <StatusBadge label="FIRST DRAFT" />
          <StatusBadge label="UI BRANCH" tone="aqua" />
        </View>
        <Text style={styles.body}>
          Use this prototype to review information hierarchy, navigation, responsive composition and product feel before major engineering.
        </Text>
      </Surface>
      <View style={styles.section}>
        <SectionTitle title="Test journeys" action="Start anywhere" />
        <View style={styles.journeyGrid}>
          <Pressable style={styles.journeyCard} onPress={() => go('home')}>
            <View style={[styles.journeyIcon,{backgroundColor:'#EFE9FF'}]}><Ionicons name="sparkles-outline" size={21} color={ui.violet}/></View>
            <Text style={styles.journeyTitle}>Organiser</Text>
            <Text style={styles.journeyMeta}>Create → capture → story</Text>
          </Pressable>
          <Pressable style={styles.journeyCard} onPress={() => go('guest-join')}>
            <View style={[styles.journeyIcon,{backgroundColor:'#E8FBFD'}]}><Ionicons name="people-outline" size={21} color="#087B86"/></View>
            <Text style={styles.journeyTitle}>Guest</Text>
            <Text style={styles.journeyMeta}>Join → contribute</Text>
          </Pressable>
          <Pressable style={styles.journeyCard} onPress={() => go('route-replay')}>
            <View style={[styles.journeyIcon,{backgroundColor:'#FFF1E7'}]}><Ionicons name="map-outline" size={21} color="#C65E0B"/></View>
            <Text style={styles.journeyTitle}>Route Replay</Text>
            <Text style={styles.journeyMeta}>Replay → media → resume</Text>
          </Pressable>
          <Pressable style={styles.journeyCard} onPress={() => go('story-editor')}>
            <View style={[styles.journeyIcon,{backgroundColor:'#FDEBF5'}]}><Ionicons name="create-outline" size={21} color="#B12F76"/></View>
            <Text style={styles.journeyTitle}>Edit & share</Text>
            <Text style={styles.journeyMeta}>Edit → theme → share</Text>
          </Pressable>
          <Pressable style={styles.journeyCard} onPress={() => go('storage-hosting')}>
            <View style={[styles.journeyIcon,{backgroundColor:'#E9FFF4'}]}><Ionicons name="server-outline" size={21} color="#147A4D"/></View>
            <Text style={styles.journeyTitle}>Home Server</Text>
            <Text style={styles.journeyMeta}>Connect → store → sync</Text>
          </Pressable>
        </View>
      </View>
      {sections.map((section) => (
        <View key={section} style={styles.section}>
          <SectionTitle title={section} />
          <View style={styles.listGap}>
            {prototypeScreens.filter((screen) => screen.section === section).map((screen) => (
              <Pressable key={screen.id} onPress={() => go(screen.id)}>
                <Surface style={styles.indexRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{screen.title}</Text>
                    <Text style={styles.rowMeta}>{screen.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={ui.muted} />
                </Surface>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </PrototypePage>
  );
}

function PrototypeNav({ active }: { active: 'home' | 'events' | 'stories' | 'profile' }) {
  const items = [
    ['home', 'home-outline', 'Home'],
    ['events', 'calendar-outline', 'Events'],
    ['stories', 'albums-outline', 'Stories'],
    ['profile', 'person-outline', 'Profile'],
  ] as const;
  return (
    <View style={styles.navBar}>
      {items.map(([target, icon, label], index) => (
        <React.Fragment key={target}>
          {index === 2 ? (
            <Pressable style={styles.createFab} onPress={() => go('create-basics')}>
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <Pressable style={styles.navItem} onPress={() => go(target)}>
            <Ionicons name={icon} size={21} color={active === target ? ui.violet : ui.muted} />
            <Text style={[styles.navLabel, active === target && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

function ScreenBack() {
  return (
    <Pressable style={styles.circleButton} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={20} color={ui.ink} />
    </Pressable>
  );
}

function Splash() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.centerFill}>
        <View style={styles.logoOrb}>
          <Ionicons name="trail-sign-outline" size={54} color="#FFFFFF" />
        </View>
        <Text style={styles.splashBrand}>Ambler</Text>
        <Text style={styles.splashTag}>Capture together. Relive the whole story.</Text>
      </View>
      <PrimaryButton label="Preview onboarding" onPress={() => go('onboarding')} inverse />
    </PrototypePage>
  );
}

function Onboarding() {
  return (
    <PrototypePage>
      <View style={styles.topActions}><Text style={styles.brandMini}>Ambler</Text><Text style={styles.linkText}>Skip</Text></View>
      <LinearGradient colors={['#0F062C', '#5B2CFF', '#EC3FA4']} style={styles.onboardVisual}>
        <View style={[styles.floatPhoto, { left: '9%', top: '20%', transform: [{ rotate: '-8deg' }] }]}>
          <Ionicons name="image-outline" size={30} color="#FFFFFF" />
        </View>
        <View style={[styles.floatPhoto, { right: '9%', top: '34%', transform: [{ rotate: '9deg' }] }]}>
          <Ionicons name="videocam-outline" size={30} color="#FFFFFF" />
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeDot} />
      </LinearGradient>
      <View style={styles.copyBlock}>
        <Text style={styles.stepKicker}>01 · CAPTURE</Text>
        <Text style={styles.heroTitle}>Bring everyone’s moments together.</Text>
        <Text style={styles.heroSubtitle}>One private event. Every angle. Photos, clips, notes and the journey itself.</Text>
      </View>
      <View style={styles.pagerDots}><View style={styles.pagerDotActive}/><View style={styles.pagerDot}/><View style={styles.pagerDot}/></View>
      <PrimaryButton label="Continue" onPress={() => go('auth')} />
    </PrototypePage>
  );
}

function Auth() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Welcome back" title="Your stories are waiting." subtitle="Sign in to create, contribute and relive private shared events." right={<ScreenBack />} />
      <View style={styles.authArt}>
        <StoryArtwork title="Saturday in Barcelona" subtitle="Five viewpoints. One finished story." icon="airplane-outline" compact />
      </View>
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput placeholder="you@example.com" placeholderTextColor={ui.muted} style={styles.input} keyboardType="email-address" />
        <PrimaryButton label="Continue with email" onPress={() => go('profile-setup')} icon="mail-outline" />
        <View style={styles.orRow}><View style={styles.orLine}/><Text style={styles.orText}>or</Text><View style={styles.orLine}/></View>
        <SecondaryButton label="Continue with Google" icon="logo-google" />
        <SecondaryButton label="Continue with Apple" icon="logo-apple" />
      </View>
      <Text style={styles.legal}>Private by default. By continuing you agree to Ambler’s Terms and Privacy Policy.</Text>
    </PrototypePage>
  );
}

function ProfileSetup() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Almost there" title="How should people see you?" subtitle="This is shown to people inside shared Ambler events." right={<ScreenBack />} />
      <View style={styles.avatarLarge}><Ionicons name="person-outline" size={42} color={ui.violet}/><View style={styles.avatarEdit}><Ionicons name="camera" size={14} color="#FFFFFF"/></View></View>
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Display name</Text>
        <TextInput value="Russell" editable={false} style={styles.input} />
        <Text style={styles.helper}>You can change this later.</Text>
      </View>
      <PrimaryButton label="Start using Ambler" onPress={() => go('home')} />
    </PrototypePage>
  );
}

function Home() {
  const { width } = useWindowDimensions();
  return (
    <PrototypePage>
      <PrototypeHeader
        title="Good evening, Russell"
        subtitle="One story is live. Two are ready to relive."
        right={<View style={styles.avatarSmall}><Text style={styles.avatarInitial}>R</Text></View>}
      />
      <TwoPane
        primary={
          <LinearGradient colors={['#0F062C', '#34218A', '#5B2CFF']} style={styles.liveHero}>
            <View style={styles.inlineBetween}>
              <StatusBadge label="LIVE NOW" tone="green" />
              <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.75)"/>
            </View>
            <View style={styles.liveHeroIcon}><Ionicons name="trail-sign-outline" size={38} color="#FFFFFF"/></View>
            <View>
              <Text style={styles.liveHeroTitle}>Snowdon Weekend</Text>
              <Text style={styles.liveHeroMeta}>8 people · 99 moments · Route recording</Text>
            </View>
            <PrimaryButton label="Open live event" inverse onPress={() => go('event-hub')} />
          </LinearGradient>
        }
        secondary={
          <View style={styles.stackGap}>
            <SectionTitle title="Coming up" action="View all" />
            <Surface>
              <IconRow icon="airplane-outline" title="Saturday in Barcelona" subtitle="Starts Friday · 5 people" tone="aqua" />
            </Surface>
            <SectionTitle title="Continue reliving" />
            <StoryArtwork title="Sophie's 40th" subtitle="Page 6 of 12" icon="sparkles-outline" compact />
          </View>
        }
      />
      <SectionTitle title="Recent stories" action="See library" />
      <View style={width >= 720 ? styles.storyGridWide : styles.storyGrid}>
        {mockStories.slice(0, 3).map((story) => (
          <Pressable key={story.title} style={styles.storyGridItem} onPress={() => go('relive')}>
            <StoryArtwork title={story.title} subtitle={story.kicker} icon={story.icon as any} compact />
            <View style={styles.inlineBetween}>
              <Text style={styles.storageMeta}>{story.storage}</Text>
              <Ionicons name="chevron-forward" size={16} color={ui.muted}/>
            </View>
          </Pressable>
        ))}
      </View>
      <PrototypeNav active="home" />
    </PrototypePage>
  );
}

function Events() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Events" subtitle="Capture what’s happening now. Relive what happened later." />
      <View style={styles.chipRow}><Chip label="Active" active/><Chip label="Upcoming"/><Chip label="Past"/></View>
      <View style={styles.listGap}>
        {mockEvents.map((event, index) => (
          <Pressable key={event.title} onPress={() => go(index === 0 ? 'event-hub' : 'finish-build')}>
            <Surface>
              <View style={styles.inlineBetween}>
                <StatusBadge label={event.state} tone={index === 0 ? 'green' : index === 1 ? 'aqua' : 'violet'} />
                <Ionicons name={event.icon as any} size={22} color={event.accent}/>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
              <Text style={styles.rowMeta}>{event.meta}</Text>
            </Surface>
          </Pressable>
        ))}
      </View>
      <PrototypeNav active="events" />
    </PrototypePage>
  );
}

function Stories() {
  const { width } = useWindowDimensions();
  return (
    <PrototypePage>
      <PrototypeHeader title="Stories" subtitle="Your finished Ambler library." />
      <View style={styles.searchBox}><Ionicons name="search" size={18} color={ui.muted}/><Text style={styles.searchPlaceholder}>Search stories, places or people</Text></View>
      <View style={styles.chipRow}><Chip label="All" active/><Chip label="Trips"/><Chip label="Celebrations"/><Chip label="Activities"/></View>
      <View style={width >= 720 ? styles.storyGridWide : styles.storyGrid}>
        {mockStories.map((story) => (
          <Pressable key={story.title} style={styles.storyGridItem} onPress={() => go('relive')}>
            <StoryArtwork title={story.title} subtitle={story.kicker} icon={story.icon as any} compact />
            <View style={styles.inlineBetween}>
              <StatusBadge label={story.storage.toUpperCase()} tone="gray"/>
              <Ionicons name="ellipsis-horizontal" size={18} color={ui.muted}/>
            </View>
          </Pressable>
        ))}
      </View>
      <PrototypeNav active="stories" />
    </PrototypePage>
  );
}

function Archive() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Archive" subtitle="Out of sight, never lost unless you delete it." right={<ScreenBack />} />
      <Surface>
        <IconRow icon="archive-outline" title="Lake District 2025" subtitle="Story · Home Server · 188 MB" />
        <View style={styles.divider}/>
        <IconRow icon="archive-outline" title="Christmas 2025" subtitle="Event + story · Cloud" tone="pink" />
      </Surface>
      <Surface tone="tint">
        <Text style={styles.cardTitle}>Permanent deletion is separate</Text>
        <Text style={styles.body}>Archived items can be restored. Delete permanently only when you also want Ambler-managed media removed.</Text>
      </Surface>
    </PrototypePage>
  );
}

function CreateBasics() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 1 of 4" title="What are we capturing?" subtitle="Start with the basics. You can edit them later." right={<ScreenBack />} />
      <ProgressSteps current={0} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Event name</Text>
        <TextInput value="Snowdon Weekend" editable={false} style={styles.input}/>
        <Text style={styles.fieldLabel}>When</Text>
        <Surface style={styles.fieldSurface}><IconRow icon="calendar-outline" title="17–19 October 2026" subtitle="Friday evening to Sunday afternoon"/></Surface>
        <Text style={styles.fieldLabel}>Where <Text style={styles.optional}>optional</Text></Text>
        <TextInput value="Snowdonia, Wales" editable={false} style={styles.input}/>
      </View>
      <PrimaryButton label="Choose event type" onPress={() => go('event-type')} />
    </PrototypePage>
  );
}

function EventType() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 2 of 4" title="What kind of story is this?" subtitle="We’ll use this to shape pacing, chapters and route treatment." right={<ScreenBack />} />
      <ProgressSteps current={1} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.searchBox}><Ionicons name="search" size={18} color={ui.muted}/><Text style={styles.searchPlaceholder}>Search 52 event types</Text></View>
      <View style={styles.chipRow}>
        {eventCategories.slice(0, 5).map(([name, icon], index) => <Chip key={name} label={name} icon={icon as any} active={index === 0}/>)}
      </View>
      <View style={styles.optionGrid}>
        {popularEventTypes.map(([name, icon, subtitle], index) => (
          <Pressable key={name} style={[styles.optionCard, index === 3 && styles.optionCardActive]}>
            <View style={[styles.optionIcon, index === 3 && { backgroundColor: ui.violet }]}><Ionicons name={icon as any} size={24} color={index === 3 ? '#FFFFFF' : ui.violet}/></View>
            <Text style={styles.optionTitle}>{name}</Text>
            <Text style={styles.optionMeta}>{subtitle}</Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Continue with Hiking day" onPress={() => go('story-style')} />
    </PrototypePage>
  );
}

function StoryStyle() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 3 of 4" title="Choose how the story should feel." subtitle="Recommended styles are based on your event type. You can change this later." right={<ScreenBack />} />
      <ProgressSteps current={2} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.listGap}>
        {storyThemes.map((theme, index) => (
          <Pressable key={theme.name}>
            <LinearGradient colors={theme.colors as [string,string,string]} style={[styles.themeCard, index === 1 && styles.themeCardSelected]}>
              <View style={styles.inlineBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeName, theme.name === 'Warm Gold' || theme.name === 'Magazine' ? { color: ui.ink } : null]}>{theme.name}</Text>
                  <Text style={[styles.themeSubtitle, theme.name === 'Warm Gold' || theme.name === 'Magazine' ? { color: '#5F536A' } : null]}>{theme.subtitle}</Text>
                </View>
                {index === 1 ? <View style={styles.selectedTick}><Ionicons name="checkmark" size={18} color="#FFFFFF"/></View> : null}
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Continue" onPress={() => go('privacy-route')} />
    </PrototypePage>
  );
}

function PrivacyRoute() {
  const [route, setRoute] = useState(true);
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 4 of 4" title="Keep it private. Add the journey if you want." subtitle="Ambler starts private. Route data is only captured when you choose it." right={<ScreenBack />} />
      <ProgressSteps current={3} labels={['Basics','Type','Style','Privacy']} />
      <Surface>
        <Text style={styles.cardTitle}>Who can see this event?</Text>
        <View style={styles.radioRow}><View style={styles.radioActive}><View style={styles.radioInner}/></View><View style={{flex:1}}><Text style={styles.rowTitle}>Invited people only</Text><Text style={styles.rowMeta}>Recommended · private by default</Text></View></View>
        <View style={styles.divider}/>
        <View style={styles.radioRow}><View style={styles.radio}/><View style={{flex:1}}><Text style={styles.rowTitle}>Anyone with a private link</Text><Text style={styles.rowMeta}>Useful for larger events</Text></View></View>
      </Surface>
      <Surface>
        <View style={styles.inlineBetween}>
          <View style={{flex:1}}>
            <Text style={styles.cardTitle}>Record the route</Text>
            <Text style={styles.body}>Unlock Route Replay with GPS captured during the event.</Text>
          </View>
          <Switch value={route} onValueChange={setRoute} trackColor={{ true: ui.violet }} />
        </View>
        <View style={styles.privacyNote}><Ionicons name="shield-checkmark-outline" size={18} color={ui.violet}/><Text style={styles.privacyText}>Sensitive start/end locations can be hidden in shared stories.</Text></View>
      </Surface>
      <PrimaryButton label="Create event" onPress={() => go('invite')} />
    </PrototypePage>
  );
}

function Invite() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Event created" title="Bring your people in." subtitle="They can join from a link or scan the code. No generic Ambler onboarding first." />
      <StoryArtwork title="Snowdon Weekend" subtitle="17–19 Oct · Hiking day · Route on" icon="trail-sign-outline" compact />
      <Surface style={styles.qrCard}>
        <View style={styles.qrMock}>
          {Array.from({length: 49}).map((_, index) => <View key={index} style={[styles.qrCell, (index * 7 + index) % 3 !== 0 && styles.qrCellDark]}/>)}
        </View>
        <Text style={styles.cardTitle}>Scan to join Snowdon Weekend</Text>
        <Text style={styles.rowMeta}>Private invite · expires when the event closes</Text>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton label="Copy link" icon="link-outline"/><SecondaryButton label="Share" icon="share-outline"/></View>
      <PrimaryButton label="Open live event" onPress={() => go('event-hub')} />
    </PrototypePage>
  );
}

function EventHub() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Snowdon Weekend" subtitle="Saturday · Snowdonia, Wales" right={<StatusBadge label="LIVE" tone="green" />} />
      <TwoPane
        primary={
          <LinearGradient colors={['#10243B','#1F6F68','#5B2CFF']} style={styles.eventHero}>
            <Ionicons name="trail-sign-outline" size={46} color="#FFFFFF"/>
            <View><Text style={styles.eventHeroTitle}>The route is recording</Text><Text style={styles.eventHeroMeta}>2h 14m · 7.8 km · 8 contributors</Text></View>
            <PrimaryButton label="Add moment" inverse icon="add-circle-outline" onPress={() => go('add-moment')}/>
          </LinearGradient>
        }
        secondary={
          <View style={styles.stackGap}>
            <Surface>
              <View style={styles.statRow}><Stat value="99" label="Moments"/><Stat value="8" label="People"/><Stat value="14" label="Notes"/></View>
            </Surface>
            <Surface>
              <Pressable onPress={() => go('moments')}><IconRow icon="images-outline" title="Moments" subtitle="87 photos · 12 videos"/></Pressable>
              <View style={styles.divider}/>
              <Pressable onPress={() => go('route-capture')}><IconRow icon="map-outline" title="Route" subtitle="Recording · 7.8 km" tone="aqua"/></Pressable>
              <View style={styles.divider}/>
              <IconRow icon="people-outline" title="People" subtitle="8 joined · invite more" tone="pink"/>
            </Surface>
          </View>
        }
      />
      <Surface tone="tint">
        <View style={styles.inlineBetween}><Text style={styles.cardTitle}>When the day is done</Text><Ionicons name="sparkles-outline" size={20} color={ui.pink}/></View>
        <Text style={styles.body}>Finish the event when everyone has contributed. Ambler will build the story from the real moments and route.</Text>
        <SecondaryButton label="Finish event & build story" icon="sparkles-outline" onPress={() => go('finish-build')}/>
      </Surface>
    </PrototypePage>
  );
}

function Moments() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Moments" subtitle="The shared capture pool. The finished story comes later." right={<ScreenBack />} />
      <View style={styles.chipRow}><Chip label="All" active/><Chip label="Photos"/><Chip label="Videos"/><Chip label="Mine"/></View>
      <View style={styles.mediaGrid}>
        {Array.from({length: 10}).map((_, index) => (
          <View key={index} style={[styles.mediaTile, index % 3 === 0 && styles.mediaTileTall]}>
            <LinearGradient colors={index % 2 ? ['#27106E','#EC3FA4'] : ['#0F766E','#18C7D5']} style={StyleSheet.absoluteFill}/>
            <Ionicons name={index % 4 === 0 ? 'play' : 'image-outline'} size={24} color="#FFFFFF"/>
            <View style={styles.mediaContributor}><Text style={styles.mediaContributorText}>{['RS','GA','AT','JM'][index%4]}</Text></View>
          </View>
        ))}
      </View>
      <PrimaryButton label="Add moment" icon="add" onPress={() => go('add-moment')}/>
    </PrototypePage>
  );
}

function AddMoment() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Add a moment" subtitle="Keep it quick. Ambler handles the organising later." right={<ScreenBack />} />
      <View style={styles.captureGrid}>
        <Pressable style={styles.captureChoice}><Ionicons name="camera-outline" size={32} color={ui.violet}/><Text style={styles.captureTitle}>Take photo</Text></Pressable>
        <Pressable style={styles.captureChoice}><Ionicons name="videocam-outline" size={32} color={ui.pink}/><Text style={styles.captureTitle}>Record video</Text></Pressable>
        <Pressable style={styles.captureChoice}><Ionicons name="images-outline" size={32} color={ui.aqua}/><Text style={styles.captureTitle}>Choose media</Text></Pressable>
        <Pressable style={styles.captureChoice}><Ionicons name="chatbubble-ellipses-outline" size={32} color={ui.warning}/><Text style={styles.captureTitle}>Add note</Text></Pressable>
      </View>
      <Surface>
        <View style={styles.uploadPreview}>
          <LinearGradient colors={['#0F766E','#18C7D5']} style={StyleSheet.absoluteFill}/>
          <Ionicons name="image-outline" size={38} color="#FFFFFF"/>
        </View>
        <TextInput placeholder="Add a caption… optional" placeholderTextColor={ui.muted} style={styles.input}/>
        <View style={styles.privacyNote}><Ionicons name="location-outline" size={18} color={ui.violet}/><Text style={styles.privacyText}>Location available · include with this moment</Text></View>
      </Surface>
      <PrimaryButton label="Add to Snowdon Weekend" onPress={() => go('moments')}/>
    </PrototypePage>
  );
}

function RouteCapture() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.inlineBetween}><ScreenBackDark/><StatusBadge label="RECORDING" tone="green"/></View>
      <View style={styles.routeCanvas}>
        <View style={styles.contourOne}/><View style={styles.contourTwo}/><View style={styles.contourThree}/>
        <View style={styles.routeStrokeA}/><View style={styles.routeStrokeB}/><View style={styles.routeUserDot}/>
      </View>
      <View style={styles.routeStatsDark}>
        <Stat value="2:14" label="Elapsed" dark/><Stat value="7.8 km" label="Distance" dark/><Stat value="642 m" label="Elevation" dark/>
      </View>
      <Text style={styles.routeCaptionDark}>Location stays private to this event. Shared stories can hide sensitive start/end points.</Text>
      <View style={styles.twoButtons}><SecondaryButton label="Pause" icon="pause" dark/><PrimaryButton label="Finish route" icon="stop" onPress={() => go('event-hub')}/></View>
    </PrototypePage>
  );
}

function ScreenBackDark() {
  return <Pressable style={styles.circleButtonDark} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color="#FFFFFF"/></Pressable>;
}

function GuestJoin() {
  return (
    <PrototypePage>
      <Text style={styles.brandMini}>Ambler</Text>
      <StoryArtwork title="Snowdon Weekend" subtitle="Russell invited you to add your moments" icon="trail-sign-outline" />
      <Surface>
        <IconRow icon="calendar-outline" title="17–19 October" subtitle="This weekend"/>
        <View style={styles.divider}/>
        <IconRow icon="location-outline" title="Snowdonia, Wales" subtitle="Shared with invited guests" tone="aqua"/>
      </Surface>
      <Text style={styles.guestPitch}>You don’t need to set up Ambler first. Join this event and add your photos, videos and notes.</Text>
      <PrimaryButton label="Join Snowdon Weekend" onPress={() => go('guest-contribution')}/>
      <Text style={styles.legal}>Private event · contributions are visible to the organiser and event participants.</Text>
    </PrototypePage>
  );
}

function GuestContribution() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Snowdon Weekend" title="Add your moments" subtitle="Anything you add can help shape the finished story." />
      <Surface tone="tint">
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>You’re contributing as Alex</Text><Text style={styles.rowMeta}>No full account setup required</Text></View><StatusBadge label="GUEST" tone="aqua"/></View>
      </Surface>
      <View style={styles.captureGrid}>
        <Pressable style={styles.captureChoice}><Ionicons name="images-outline" size={32} color={ui.violet}/><Text style={styles.captureTitle}>Photos</Text></Pressable>
        <Pressable style={styles.captureChoice}><Ionicons name="videocam-outline" size={32} color={ui.pink}/><Text style={styles.captureTitle}>Video</Text></Pressable>
      </View>
      <Text style={styles.fieldLabel}>Add a note</Text>
      <TextInput multiline placeholder="The view from the ridge was unreal…" placeholderTextColor={ui.muted} style={[styles.input,{minHeight:110,textAlignVertical:'top'}]}/>
      <PrimaryButton label="Add to event" onPress={() => go('guest-result')}/>
    </PrototypePage>
  );
}

function GuestResult() {
  return (
    <PrototypePage>
      <View style={styles.successHero}><View style={styles.successIcon}><Ionicons name="checkmark" size={34} color="#FFFFFF"/></View><Text style={styles.successTitle}>Added to Snowdon Weekend</Text><Text style={styles.heroSubtitle}>2 photos and your note are safely in the event.</Text></View>
      <Surface>
        <View style={styles.uploadRow}><View style={styles.uploadThumb}><Ionicons name="image-outline" size={22} color="#FFFFFF"/></View><View style={{flex:1}}><Text style={styles.rowTitle}>IMG_2481.jpg</Text><Text style={styles.rowMeta}>Uploaded · location included</Text></View><Ionicons name="checkmark-circle" size={22} color={ui.success}/></View>
        <View style={styles.divider}/>
        <View style={styles.uploadRow}><View style={[styles.uploadThumb,{backgroundColor:'#27106E'}]}><Ionicons name="image-outline" size={22} color="#FFFFFF"/></View><View style={{flex:1}}><Text style={styles.rowTitle}>IMG_2482.jpg</Text><Text style={styles.rowMeta}>Uploaded</Text></View><Ionicons name="checkmark-circle" size={22} color={ui.success}/></View>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton label="Done"/><PrimaryButton label="Add more" icon="add"/></View>
    </PrototypePage>
  );
}

function FinishBuild() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Capture complete" title="Ready to turn it into a story?" subtitle="Ambler will curate the real moments, route and notes into one finished experience." right={<ScreenBack />} />
      <Surface>
        <View style={styles.statRow}><Stat value="99" label="Moments"/><Stat value="8" label="People"/><Stat value="7.8 km" label="Route"/><Stat value="14" label="Notes"/></View>
      </Surface>
      <View style={styles.section}>
        <SectionTitle title="Story length" />
        <View style={styles.storyLengthGrid}>
          <Surface style={styles.lengthCard}><Text style={styles.lengthName}>Short</Text><Text style={styles.rowMeta}>5–7 pages</Text></Surface>
          <Surface style={[styles.lengthCard, styles.lengthCardActive]}><Text style={[styles.lengthName,{color:ui.violet}]}>Standard</Text><Text style={styles.rowMeta}>Recommended · 10–14 pages</Text></Surface>
          <Surface style={styles.lengthCard}><Text style={styles.lengthName}>Epic</Text><Text style={styles.rowMeta}>15+ pages</Text></Surface>
        </View>
      </View>
      <Surface tone="tint">
        <IconRow icon="sparkles-outline" title="Route Replay will be a hero chapter" subtitle="This event has enough route + media data for a strong replay." tone="pink"/>
      </Surface>
      <PrimaryButton label="Build my story" icon="sparkles" onPress={() => go('generation')}/>
    </PrototypePage>
  );
}

function Generation() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.centerFill}>
        <View style={styles.generationOrb}><Ionicons name="sparkles" size={42} color="#FFFFFF"/></View>
        <Text style={styles.generationTitle}>Building Snowdon Weekend</Text>
        <Text style={styles.generationSubtitle}>Turning 99 real moments into one story.</Text>
        <View style={styles.generationList}>
          <GenerationStep label="Preparing moments" done/>
          <GenerationStep label="Building the timeline" done/>
          <GenerationStep label="Mapping the journey" active/>
          <GenerationStep label="Creating the story"/>
          <GenerationStep label="Saving"/>
        </View>
      </View>
      <Text style={styles.routeCaptionDark}>You can leave this screen once generation is safely persisted.</Text>
      <PrimaryButton label="Preview completed state" inverse onPress={() => go('story-ready')}/>
    </PrototypePage>
  );
}

function GenerationStep({label,done,active}:{label:string;done?:boolean;active?:boolean}) {
  return (
    <View style={styles.generationStep}>
      <View style={[styles.generationDot,(done||active)&&styles.generationDotActive]}>{done?<Ionicons name="checkmark" size={13} color="#FFFFFF"/>:active?<View style={styles.pulseDot}/>:null}</View>
      <Text style={[styles.generationStepText,(done||active)&&{color:'#FFFFFF'}]}>{label}</Text>
    </View>
  );
}

function StoryReady() {
  return (
    <PrototypePage dark scroll={false}>
      <LinearGradient colors={['#0F062C','#27106E','#EC3FA4']} style={styles.readyBackdrop}>
        <View style={styles.readyHalo}/>
        <Text style={styles.readyEyebrow}>AMBler presents</Text>
        <View style={styles.readyArt}><Ionicons name="trail-sign-outline" size={62} color="#FFFFFF"/></View>
        <Text style={styles.readyTitle}>Snowdon Weekend</Text>
        <Text style={styles.readySubtitle}>Your story is ready.</Text>
        <View style={styles.readyStats}><Stat value="12" label="Story pages" dark/><Stat value="99" label="Moments considered" dark/><Stat value="1" label="Route Replay" dark/></View>
      </LinearGradient>
      <PrimaryButton label="Relive story" inverse onPress={() => go('relive')}/>
      <SecondaryButton label="Edit first" dark onPress={() => go('story-editor')}/>
    </PrototypePage>
  );
}

function Relive() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}>
        <ScreenBackDark/>
        <View style={styles.storyProgressTrack}><View style={[styles.storyProgressFill,{width:'42%'}]}/></View>
        <Pressable style={styles.circleButtonDark}><Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF"/></Pressable>
      </View>
      <LinearGradient colors={['#061822','#174C56','#0F062C']} style={styles.reliveCanvas}>
        <Text style={styles.reliveChapter}>CHAPTER 4</Text>
        <Text style={styles.reliveTitle}>The ridge changed the whole day.</Text>
        <View style={styles.reliveMedia}>
          <Ionicons name="images-outline" size={56} color="rgba(255,255,255,0.9)"/>
          <View style={styles.mediaCountPill}><Text style={styles.mediaCountText}>6 moments</Text></View>
        </View>
        <Text style={styles.reliveCaption}>Everyone stopped here. Different cameras, same view.</Text>
      </LinearGradient>
      <View style={styles.reliveFooter}>
        <Text style={styles.storyPosition}>5 / 12</Text>
        <Pressable style={styles.routeNext} onPress={() => go('route-replay')}><Ionicons name="map-outline" size={19} color="#FFFFFF"/><Text style={styles.routeNextText}>Route Replay next</Text></Pressable>
      </View>
    </PrototypePage>
  );
}

function RouteReplay() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}><ScreenBackDark/><StatusBadge label="ROUTE REPLAY" tone="aqua"/><Pressable style={styles.circleButtonDark}><Ionicons name="expand-outline" size={19} color="#FFFFFF"/></Pressable></View>
      <View style={styles.replayMap}>
        <LinearGradient colors={['#0B1E29','#143744','#1C5A59']} style={StyleSheet.absoluteFill}/>
        <View style={styles.terrainA}/><View style={styles.terrainB}/><View style={styles.terrainC}/>
        <View style={styles.replayRouteA}/><View style={styles.replayRouteB}/><View style={styles.replayRouteC}/>
        {routeMoments.map((moment) => (
          <Pressable key={moment.id} onPress={() => go('route-moment')} style={[styles.routeMoment,{left:moment.x as any,top:moment.y as any}]}>
            <View style={styles.routeMomentThumb}><Ionicons name={moment.icon as any} size={18} color="#FFFFFF"/></View>
            {moment.count>1?<View style={styles.clusterCount}><Text style={styles.clusterCountText}>{moment.count}</Text></View>:null}
          </Pressable>
        ))}
        <View style={styles.routeLabel}><Text style={styles.routeLabelTitle}>Halfway ridge</Text><Text style={styles.routeLabelMeta}>6 moments · 10:42</Text></View>
      </View>
      <View style={styles.replayInfo}>
        <View><Text style={styles.replayTitle}>Snowdon Weekend</Text><Text style={styles.replaySubtitle}>Terrain replay · summit ahead</Text></View>
        <View style={styles.inline}><Stat value="7.8 km" label="Distance" dark/><Stat value="642 m" label="Gain" dark/></View>
      </View>
      <View style={styles.replayControls}>
        <Pressable style={styles.replayControl}><Ionicons name="pause" size={22} color="#FFFFFF"/></Pressable>
        <View style={styles.scrubTrack}><View style={[styles.scrubFill,{width:'57%'}]}/><View style={[styles.scrubKnob,{left:'55%'}]}/></View>
        <Pressable style={styles.replayControl}><Ionicons name="navigate-outline" size={20} color="#FFFFFF"/></Pressable>
      </View>
    </PrototypePage>
  );
}

function RouteMoment() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}><ScreenBackDark/><Text style={styles.routeViewerTitle}>Halfway ridge · 6 moments</Text><Pressable style={styles.circleButtonDark}><Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF"/></Pressable></View>
      <LinearGradient colors={['#123B45','#0F766E','#0F062C']} style={styles.viewerMedia}>
        <Ionicons name="play-circle-outline" size={74} color="#FFFFFF"/>
        <View style={styles.viewerContributor}><View style={styles.avatarTiny}><Text style={styles.avatarTinyText}>GA</Text></View><View><Text style={styles.viewerName}>Gabriella</Text><Text style={styles.viewerMeta}>10:42 · Halfway ridge</Text></View></View>
      </LinearGradient>
      <Text style={styles.viewerCaption}>“Worth stopping for this view.”</Text>
      <View style={styles.viewerDots}>{Array.from({length:6}).map((_,i)=><View key={i} style={[styles.viewerDot,i===2&&styles.viewerDotActive]}/>)}</View>
      <PrimaryButton label="Return to replay" inverse onPress={() => go('route-replay')}/>
    </PrototypePage>
  );
}

function StoryEditor() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Edit story" subtitle="Adjust the story without turning Ambler into a video editor." right={<ScreenBack />} />
      <TwoPane
        primary={
          <StoryArtwork title="Snowdon Weekend" subtitle="Chapter 4 · The ridge" icon="trail-sign-outline" />
        }
        secondary={
          <Surface>
            <IconRow icon="text-outline" title="Edit copy" subtitle="Change title or caption"/>
            <View style={styles.divider}/>
            <IconRow icon="image-outline" title="Choose cover" subtitle="Select another strong moment" tone="aqua"/>
            <View style={styles.divider}/>
            <IconRow icon="sparkles-outline" title="Regenerate this section" subtitle="Keep the rest of the story unchanged" tone="pink"/>
          </Surface>
        }
      />
      <SectionTitle title="Story order" />
      <View style={styles.editorTimeline}>
        {['Cover','The climb','Halfway ridge','Route Replay','Summit','After'].map((label,index)=>(
          <View key={label} style={[styles.editorPage,index===2&&styles.editorPageActive]}><Text style={[styles.editorPageIndex,index===2&&{color:ui.violet}]}>{index+1}</Text><Text style={styles.editorPageLabel}>{label}</Text><Ionicons name="reorder-three-outline" size={20} color={ui.muted}/></View>
        ))}
      </View>
      <View style={styles.twoButtons}><SecondaryButton label="Theme & music" onPress={() => go('theme-music')}/><PrimaryButton label="Save changes" onPress={() => go('share-export')}/></View>
    </PrototypePage>
  );
}

function ThemeMusic() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Theme & music" subtitle="Change the mood without changing the memories." right={<ScreenBack />} />
      <SectionTitle title="Theme" />
      <View style={styles.themeMiniGrid}>
        {storyThemes.slice(0,4).map((theme,index)=>(
          <LinearGradient key={theme.name} colors={theme.colors as [string,string,string]} style={[styles.themeMini,index===1&&styles.themeMiniSelected]}>
            <Text style={[styles.themeMiniText,(theme.name==='Warm Gold'||theme.name==='Magazine')&&{color:ui.ink}]}>{theme.name}</Text>
          </LinearGradient>
        ))}
      </View>
      <SectionTitle title="Soundtrack" />
      <Surface>
        <View style={styles.inlineBetween}>
          <View style={styles.musicIcon}><Ionicons name="musical-notes" size={22} color={ui.violet}/></View>
          <View style={{flex:1}}><Text style={styles.rowTitle}>Open Skies</Text><Text style={styles.rowMeta}>Cinematic · uplifting · licensed</Text></View>
          <Pressable style={styles.playButton}><Ionicons name="play" size={18} color="#FFFFFF"/></Pressable>
        </View>
      </Surface>
      <Surface tone="tint"><Text style={styles.body}>Only tracks with confirmed production rights are available in release builds.</Text></Surface>
      <PrimaryButton label="Apply to story" onPress={() => go('story-editor')}/>
    </PrototypePage>
  );
}

function ShareExport() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Share & save" subtitle="Private by default. You decide where the finished story goes." right={<ScreenBack />} />
      <Surface>
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>Private story link</Text><Text style={styles.rowMeta}>Anyone with this link can view until you revoke it.</Text></View><StatusBadge label="ACTIVE" tone="green"/></View>
        <View style={styles.linkBox}><Text style={styles.privateLink}>ambler.app/s/7KM4…</Text><Ionicons name="copy-outline" size={18} color={ui.violet}/></View>
        <View style={styles.twoButtons}><SecondaryButton label="Revoke"/><PrimaryButton label="Share" icon="share-outline" onPress={() => go('shared-web')}/></View>
      </Surface>
      <SectionTitle title="Save a copy" />
      <Surface>
        <IconRow icon="server-outline" title="Ambler Home Server" subtitle="Connected · save full story + originals" tone="aqua"/>
        <View style={styles.divider}/>
        <IconRow icon="document-outline" title="PDF / print" subtitle="Save a printable story"/>
        <View style={styles.divider}/>
        <IconRow icon="image-outline" title="Story card" subtitle="Shareable image summary" tone="pink"/>
      </Surface>
    </PrototypePage>
  );
}

function SharedWeb() {
  return (
    <PrototypePage dark>
      <View style={styles.webTop}><Text style={styles.brandMiniDark}>Ambler</Text><StatusBadge label="PRIVATE STORY" tone="gray"/></View>
      <StoryArtwork title="Snowdon Weekend" subtitle="17–19 October 2026 · shared by Russell" icon="trail-sign-outline"/>
      <Text style={styles.webStoryTitle}>A weekend that kept climbing.</Text>
      <Text style={styles.webStoryBody}>Eight people captured the same trip from completely different angles. Ambler brought it back together.</Text>
      <Surface tone="dark">
        <View style={styles.inlineBetween}><View><Text style={styles.darkCardTitle}>Route Replay</Text><Text style={styles.darkMeta}>7.8 km · 4 story stops · 19 route moments</Text></View><Ionicons name="map-outline" size={26} color={ui.aqua}/></View>
        <PrimaryButton label="Play route" inverse onPress={() => go('route-replay')}/>
      </Surface>
      <Text style={styles.routeCaptionDark}>No Ambler account required to view this private story.</Text>
    </PrototypePage>
  );
}

function Profile() {
  return (
    <PrototypePage>
      <View style={styles.profileHero}>
        <View style={styles.avatarXL}><Text style={styles.avatarXLText}>RS</Text></View>
        <Text style={styles.profileName}>Russell</Text>
        <Text style={styles.rowMeta}>12 stories · 19 events</Text>
      </View>
      <Surface>
        <Pressable onPress={() => go('settings')}><IconRow icon="settings-outline" title="Settings" subtitle="Appearance, notifications and accessibility"/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('storage-hosting')}><IconRow icon="server-outline" title="Storage & Hosting" subtitle="Home Server connected" tone="aqua"/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('privacy-data')}><IconRow icon="shield-checkmark-outline" title="Privacy & Data" subtitle="Routes, sharing and account data"/></Pressable>
      </Surface>
      <PrototypeNav active="profile" />
    </PrototypePage>
  );
}

function Settings() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Settings" subtitle="Keep everyday controls simple." right={<ScreenBack />} />
      <Surface>
        <IconRow icon="contrast-outline" title="Appearance" subtitle="System · dark/light"/>
        <View style={styles.divider}/>
        <IconRow icon="notifications-outline" title="Notifications" subtitle="Invites, contributions and story ready" tone="pink"/>
        <View style={styles.divider}/>
        <IconRow icon="sparkles-outline" title="Story preferences" subtitle="Default length and autoplay"/>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('storage-hosting')}><IconRow icon="server-outline" title="Storage & Hosting" subtitle="Home Server + default storage" tone="aqua"/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('privacy-data')}><IconRow icon="shield-outline" title="Privacy & Data" subtitle="Default privacy and account data"/></Pressable>
        <View style={styles.divider}/>
        <IconRow icon="accessibility-outline" title="Accessibility" subtitle="Reduced motion and text"/>
        <View style={styles.divider}/>
        <IconRow icon="information-circle-outline" title="About Ambler" subtitle="Version, policies and acknowledgements"/>
      </Surface>
    </PrototypePage>
  );
}

function PrivacyData() {
  const [redact, setRedact] = useState(true);
  return (
    <PrototypePage>
      <PrototypeHeader title="Privacy & Data" subtitle="Private-first defaults, with clear exceptions." right={<ScreenBack />} />
      <Surface>
        <View style={styles.inlineBetween}><View style={{flex:1}}><Text style={styles.rowTitle}>Hide sensitive route ends</Text><Text style={styles.rowMeta}>Redact precise start/end locations in shared stories.</Text></View><Switch value={redact} onValueChange={setRedact} trackColor={{true:ui.violet}}/></View>
        <View style={styles.divider}/>
        <IconRow icon="lock-closed-outline" title="Default event privacy" subtitle="Invited people only"/>
        <View style={styles.divider}/>
        <IconRow icon="download-outline" title="Export my data" subtitle="Prepare an account data export" tone="aqua"/>
      </Surface>
      <Surface style={styles.dangerSurface}>
        <Text style={styles.dangerTitle}>Delete account</Text>
        <Text style={styles.body}>Ambler will explain the effect on owned events, cloud media, links and any Home Server copies it can manage before deletion.</Text>
        <SecondaryButton label="Review deletion" icon="trash-outline"/>
      </Surface>
    </PrototypePage>
  );
}

function StorageHosting() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Storage & Hosting" subtitle="Use Ambler normally, or keep your stories on your own server." right={<ScreenBack />} />
      <Surface tone="success">
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>Home Server connected</Text><Text style={styles.rowMeta}>Ambler Home · online · last sync 4 min ago</Text></View><StatusBadge label="ONLINE" tone="green"/></View>
        <View style={styles.storageBar}><View style={[styles.storageFill,{width:'38%'}]}/></View>
        <Text style={styles.rowMeta}>386 GB used of 1 TB</Text>
        <PrimaryButton label="Manage server" onPress={() => go('server-detail')}/>
      </Surface>
      <SectionTitle title="Default story destination" />
      <Surface>
        <View style={styles.radioRow}><View style={styles.radioActive}><View style={styles.radioInner}/></View><View style={{flex:1}}><Text style={styles.rowTitle}>My Ambler Server</Text><Text style={styles.rowMeta}>Full story + selected original media</Text></View><Ionicons name="server-outline" size={20} color={ui.aqua}/></View>
        <View style={styles.divider}/>
        <View style={styles.radioRow}><View style={styles.radio}/><View style={{flex:1}}><Text style={styles.rowTitle}>Ambler Cloud</Text><Text style={styles.rowMeta}>Managed storage</Text></View></View>
        <View style={styles.divider}/>
        <View style={styles.radioRow}><View style={styles.radio}/><View style={{flex:1}}><Text style={styles.rowTitle}>This device</Text><Text style={styles.rowMeta}>Local-only where supported</Text></View></View>
      </Surface>
      <SecondaryButton label="Add another server" icon="add" onPress={() => go('add-server')}/>
    </PrototypePage>
  );
}

function AddServer() {
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Ambler Home Server" title="Connect your own storage." subtitle="We’ll try local discovery first. QR and manual address are always available." right={<ScreenBack />} />
      <Surface>
        <View style={styles.serverDiscovery}>
          <View style={styles.radarOuter}><View style={styles.radarMiddle}><View style={styles.radarCore}><Ionicons name="server-outline" size={27} color="#FFFFFF"/></View></View></View>
          <Text style={styles.cardTitle}>Searching your local network…</Text>
          <Text style={styles.rowMeta}>1 Ambler server found</Text>
        </View>
      </Surface>
      <Surface style={styles.serverFound}>
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>Ambler Home</Text><Text style={styles.rowMeta}>192.168.1.44 · local network</Text></View><StatusBadge label="FOUND" tone="aqua"/></View>
        <PrimaryButton label="Connect securely" onPress={() => go('server-detail')}/>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton label="Scan QR" icon="qr-code-outline"/><SecondaryButton label="Enter address" icon="create-outline"/></View>
    </PrototypePage>
  );
}

function ServerDetail() {
  return (
    <PrototypePage>
      <PrototypeHeader title="Ambler Home" subtitle="Your private story library at home." right={<StatusBadge label="ONLINE" tone="green"/>} />
      <Surface tone="success">
        <View style={styles.statRow}><Stat value="386 GB" label="Used"/><Stat value="614 GB" label="Free"/><Stat value="4 min" label="Last sync"/></View>
        <View style={styles.storageBar}><View style={[styles.storageFill,{width:'38%'}]}/></View>
      </Surface>
      <SectionTitle title="What gets saved" />
      <Surface>
        <ToggleRow title="Completed stories" subtitle="Story definition, theme, captions and route" value/>
        <View style={styles.divider}/>
        <ToggleRow title="Original media" subtitle="Photos and videos used by this server" value/>
        <View style={styles.divider}/>
        <ToggleRow title="Thumbnails & exports" subtitle="Posters, previews and generated copies" value/>
      </Surface>
      <Surface tone="tint">
        <IconRow icon="cloud-offline-outline" title="If your server goes offline" subtitle="New work stays on this device and syncs after the server returns." tone="aqua"/>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton label="Test connection"/><PrimaryButton label="Sync now" icon="sync-outline"/></View>
    </PrototypePage>
  );
}

function ToggleRow({title,subtitle,value}:{title:string;subtitle:string;value:boolean}) {
  const [on,setOn]=useState(value);
  return <View style={styles.inlineBetween}><View style={{flex:1}}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowMeta}>{subtitle}</Text></View><Switch value={on} onValueChange={setOn} trackColor={{true:ui.violet}}/></View>;
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  listGap: { gap: 10 },
  stackGap: { gap: 14 },
  body: { color: ui.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  rowTitle: { color: ui.ink, fontSize: 15, fontWeight: '900' },
  rowMeta: { color: ui.muted, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  cardTitle: { color: ui.ink, fontSize: 17, lineHeight: 22, fontWeight: '900' },
  cardTitleDark: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  twoButtons: { flexDirection: 'row', gap: 10 },
  divider: { height: 1, backgroundColor: ui.line },
  indexRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  journeyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  journeyCard: { width: '48%', minHeight: 116, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: ui.line, padding: 13, gap: 6 },
  journeyIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  journeyTitle: { color: ui.ink, fontSize: 13, fontWeight: '900' },
  journeyMeta: { color: ui.muted, fontSize: 10, lineHeight: 14, fontWeight: '600' },
  topActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandMini: { color: ui.ink, fontSize: 20, fontWeight: '900' },
  brandMiniDark: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  linkText: { color: ui.violet, fontSize: 13, fontWeight: '900' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoOrb: { width: 112, height: 112, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: ui.violet, shadowColor: ui.pink, shadowOpacity: 0.3, shadowRadius: 26, elevation: 8 },
  splashBrand: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', letterSpacing: -1.5 },
  splashTag: { color: 'rgba(255,255,255,0.62)', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  onboardVisual: { height: 310, borderRadius: 34, overflow: 'hidden', position: 'relative' },
  floatPhoto: { position: 'absolute', width: 110, height: 136, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  routeLine: { position: 'absolute', left: '28%', right: '22%', top: '62%', height: 5, borderRadius: 3, backgroundColor: ui.aqua, transform: [{ rotate: '-16deg' }] },
  routeDot: { position: 'absolute', right: '20%', top: '52%', width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 5, borderColor: ui.aqua },
  copyBlock: { gap: 8 },
  stepKicker: { color: ui.violet, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  heroTitle: { color: ui.ink, fontSize: 32, lineHeight: 36, fontWeight: '900', letterSpacing: -1 },
  heroSubtitle: { color: ui.muted, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  pagerDots: { flexDirection: 'row', gap: 7, alignSelf: 'center' },
  pagerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D9D1E8' },
  pagerDotActive: { width: 24, height: 7, borderRadius: 4, backgroundColor: ui.violet },
  authArt: { marginTop: 8 },
  formGap: { gap: 10 },
  fieldLabel: { color: ui.ink, fontSize: 13, fontWeight: '900' },
  optional: { color: ui.muted, fontWeight: '600' },
  input: { minHeight: 52, borderRadius: 16, paddingHorizontal: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ui.line, color: ui.ink, fontSize: 15, fontWeight: '700' },
  helper: { color: ui.muted, fontSize: 11, fontWeight: '600' },
  legal: { color: ui.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', fontWeight: '600' },
  orRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  orLine: { flex: 1, height: 1, backgroundColor: ui.line },
  orText: { color: ui.muted, fontSize: 11, fontWeight: '700' },
  avatarLarge: { alignSelf: 'center', width: 108, height: 108, borderRadius: 38, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarEdit: { position: 'absolute', right: -3, bottom: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: ui.soft },
  avatarSmall: { width: 42, height: 42, borderRadius: 15, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  liveHero: { minHeight: 330, borderRadius: 30, padding: 20, justifyContent: 'space-between', overflow: 'hidden' },
  liveHeroIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  liveHeroTitle: { color: '#FFFFFF', fontSize: 28, lineHeight: 31, fontWeight: '900' },
  liveHeroMeta: { color: 'rgba(255,255,255,0.70)', fontSize: 12, fontWeight: '700', marginTop: 5 },
  storyGrid: { gap: 14 },
  storyGridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  storyGridItem: { gap: 8, flexGrow: 1, flexBasis: 220 },
  storageMeta: { color: ui.muted, fontSize: 10, fontWeight: '800' },
  navBar: { minHeight: 66, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ui.line, borderRadius: 24, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 4, position: 'relative' },
  navItem: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 50 },
  navLabel: { color: ui.muted, fontSize: 9, fontWeight: '800' },
  navLabelActive: { color: ui.violet },
  createFab: { width: 48, height: 48, borderRadius: 18, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchBox: { minHeight: 46, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ui.line, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14 },
  searchPlaceholder: { color: ui.muted, fontSize: 13, fontWeight: '600' },
  fieldSurface: { padding: 6 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionCard: { width: '48%', minHeight: 138, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: ui.line, padding: 14, gap: 7 },
  optionCardActive: { borderColor: ui.violet, borderWidth: 2, backgroundColor: '#FBF9FF' },
  optionIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center' },
  optionTitle: { color: ui.ink, fontSize: 14, fontWeight: '900' },
  optionMeta: { color: ui.muted, fontSize: 10, fontWeight: '600' },
  themeCard: { minHeight: 120, borderRadius: 24, padding: 17, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  themeCardSelected: { borderWidth: 3, borderColor: ui.aqua },
  themeName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  themeSubtitle: { color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  selectedTick: { width: 32, height: 32, borderRadius: 16, backgroundColor: ui.aqua, alignItems: 'center', justifyContent: 'center' },
  radioRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C8C0D5' },
  radioActive: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: ui.violet },
  privacyNote: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 11, borderRadius: 14, backgroundColor: '#F5F0FF' },
  privacyText: { flex: 1, color: '#5D4D79', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  qrCard: { alignItems: 'center' },
  qrMock: { width: 190, height: 190, padding: 16, borderRadius: 22, backgroundColor: '#FFFFFF', flexDirection: 'row', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignContent: 'center' },
  qrCell: { width: 17, height: 17, backgroundColor: '#FFFFFF' },
  qrCellDark: { backgroundColor: ui.ink },
  eventHero: { minHeight: 290, borderRadius: 30, padding: 20, justifyContent: 'space-between' },
  eventHeroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  eventHeroMeta: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 10 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  mediaTile: { width: '31%', aspectRatio: 1, borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mediaTileTall: { aspectRatio: 0.82 },
  mediaContributor: { position: 'absolute', left: 6, bottom: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(15,6,44,0.74)', alignItems: 'center', justifyContent: 'center' },
  mediaContributorText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  captureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  captureChoice: { width: '48%', minHeight: 132, borderRadius: 22, borderWidth: 1, borderColor: ui.line, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 10 },
  captureTitle: { color: ui.ink, fontSize: 13, fontWeight: '900' },
  uploadPreview: { height: 210, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  circleButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ui.line, alignItems: 'center', justifyContent: 'center' },
  circleButtonDark: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  routeCanvas: { flex: 1, minHeight: 380, borderRadius: 28, backgroundColor: '#102A34', overflow: 'hidden', position: 'relative' },
  contourOne: { position: 'absolute', width: 260, height: 190, borderRadius: 120, borderWidth: 2, borderColor: 'rgba(24,199,213,0.18)', left: -30, top: 70, transform: [{rotate:'18deg'}] },
  contourTwo: { position: 'absolute', width: 240, height: 180, borderRadius: 120, borderWidth: 2, borderColor: 'rgba(24,199,213,0.16)', right: -50, bottom: 50, transform: [{rotate:'-12deg'}] },
  contourThree: { position: 'absolute', width: 170, height: 130, borderRadius: 85, borderWidth: 2, borderColor: 'rgba(255,255,255,0.09)', right: 40, top: 40 },
  routeStrokeA: { position: 'absolute', left: '14%', top: '70%', width: '38%', height: 6, backgroundColor: '#F97316', borderRadius: 3, transform: [{rotate:'-24deg'}] },
  routeStrokeB: { position: 'absolute', left: '43%', top: '47%', width: '42%', height: 6, backgroundColor: '#F97316', borderRadius: 3, transform: [{rotate:'-36deg'}] },
  routeUserDot: { position: 'absolute', left: '49%', top: '49%', width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 6, borderColor: ui.aqua },
  routeStatsDark: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  routeCaptionDark: { color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 15, textAlign: 'center', fontWeight: '600' },
  guestPitch: { color: ui.ink, fontSize: 18, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  successHero: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  successIcon: { width: 72, height: 72, borderRadius: 28, backgroundColor: ui.success, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: ui.ink, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  uploadRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  uploadThumb: { width: 52, height: 52, borderRadius: 15, backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center' },
  storyLengthGrid: { flexDirection: 'row', gap: 8 },
  lengthCard: { flex: 1, padding: 12, minHeight: 100 },
  lengthCardActive: { borderColor: ui.violet, borderWidth: 2, backgroundColor: '#FBF9FF' },
  lengthName: { color: ui.ink, fontSize: 15, fontWeight: '900' },
  generationOrb: { width: 92, height: 92, borderRadius: 32, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', shadowColor: ui.pink, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
  generationTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  generationSubtitle: { color: 'rgba(255,255,255,0.60)', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  generationList: { gap: 12, marginTop: 22, alignSelf: 'stretch', paddingHorizontal: 24 },
  generationStep: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  generationDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  generationDotActive: { backgroundColor: ui.violet },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  generationStepText: { color: 'rgba(255,255,255,0.36)', fontSize: 13, fontWeight: '800' },
  readyBackdrop: { flex: 1, borderRadius: 32, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 12, overflow: 'hidden' },
  readyHalo: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(24,199,213,0.16)', top: -80, right: -100 },
  readyEyebrow: { color: 'rgba(255,255,255,0.58)', fontSize: 10, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  readyArt: { width: 138, height: 138, borderRadius: 46, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  readyTitle: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  readySubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 16, fontWeight: '700' },
  readyStats: { flexDirection: 'row', gap: 12, marginTop: 14, alignSelf: 'stretch' },
  storyChrome: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  storyProgressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  storyProgressFill: { height: '100%', backgroundColor: '#FFFFFF' },
  reliveCanvas: { flex: 1, minHeight: 520, borderRadius: 30, padding: 24, justifyContent: 'space-between', overflow: 'hidden' },
  reliveChapter: { color: ui.aqua, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  reliveTitle: { color: '#FFFFFF', fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1 },
  reliveMedia: { height: 230, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  mediaCountPill: { position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(15,6,44,0.70)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  mediaCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  reliveCaption: { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  reliveFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storyPosition: { color: 'rgba(255,255,255,0.54)', fontSize: 11, fontWeight: '800' },
  routeNext: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  routeNextText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  replayMap: { flex: 1, minHeight: 470, borderRadius: 30, overflow: 'hidden', position: 'relative' },
  terrainA: { position: 'absolute', width: 300, height: 160, borderRadius: 150, backgroundColor: 'rgba(67,120,90,0.50)', left: -70, bottom: -50, transform: [{rotate:'10deg'}] },
  terrainB: { position: 'absolute', width: 300, height: 210, borderRadius: 150, backgroundColor: 'rgba(54,92,91,0.55)', right: -90, bottom: -60, transform: [{rotate:'-8deg'}] },
  terrainC: { position: 'absolute', width: 170, height: 130, borderRadius: 85, backgroundColor: 'rgba(98,137,105,0.32)', right: 40, top: 80 },
  replayRouteA: { position: 'absolute', left: '9%', top: '72%', width: '36%', height: 6, borderRadius: 3, backgroundColor: '#F97316', transform: [{rotate:'-27deg'}] },
  replayRouteB: { position: 'absolute', left: '37%', top: '52%', width: '30%', height: 6, borderRadius: 3, backgroundColor: '#F97316', transform: [{rotate:'-38deg'}] },
  replayRouteC: { position: 'absolute', left: '58%', top: '31%', width: '28%', height: 6, borderRadius: 3, backgroundColor: '#F97316', transform: [{rotate:'-25deg'}] },
  routeMoment: { position: 'absolute', width: 46, height: 46 },
  routeMomentThumb: { width: 42, height: 42, borderRadius: 15, backgroundColor: ui.violet, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  clusterCount: { position: 'absolute', right: -4, top: -5, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: ui.pink, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  clusterCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  routeLabel: { position: 'absolute', left: '30%', top: '61%', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, backgroundColor: 'rgba(15,6,44,0.76)' },
  routeLabelTitle: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  routeLabelMeta: { color: 'rgba(255,255,255,0.62)', fontSize: 8, fontWeight: '700' },
  replayInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  replayTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  replaySubtitle: { color: 'rgba(255,255,255,0.54)', fontSize: 10, fontWeight: '700' },
  replayControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  replayControl: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  scrubTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.16)', position: 'relative' },
  scrubFill: { height: '100%', borderRadius: 3, backgroundColor: '#F97316' },
  scrubKnob: { position: 'absolute', top: -5, width: 15, height: 15, borderRadius: 8, backgroundColor: '#FFFFFF' },
  routeViewerTitle: { flex: 1, color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  viewerMedia: { flex: 1, minHeight: 500, borderRadius: 30, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  viewerContributor: { position: 'absolute', left: 18, bottom: 18, flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatarTiny: { width: 38, height: 38, borderRadius: 14, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  avatarTinyText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  viewerName: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  viewerMeta: { color: 'rgba(255,255,255,0.62)', fontSize: 9, fontWeight: '700' },
  viewerCaption: { color: '#FFFFFF', fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center' },
  viewerDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  viewerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.30)' },
  viewerDotActive: { width: 18, backgroundColor: '#FFFFFF' },
  editorTimeline: { gap: 7 },
  editorPage: { minHeight: 50, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ui.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  editorPageActive: { borderColor: ui.violet, backgroundColor: '#FBF9FF' },
  editorPageIndex: { color: ui.muted, width: 20, fontSize: 11, fontWeight: '900' },
  editorPageLabel: { flex: 1, color: ui.ink, fontSize: 12, fontWeight: '800' },
  themeMiniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeMini: { width: '48%', minHeight: 92, borderRadius: 20, padding: 14, justifyContent: 'flex-end' },
  themeMiniSelected: { borderWidth: 3, borderColor: ui.aqua },
  themeMiniText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  musicIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  linkBox: { minHeight: 46, borderRadius: 15, backgroundColor: '#F5F2FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13 },
  privateLink: { color: ui.ink, fontSize: 12, fontWeight: '800' },
  webTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  webStoryTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 35, fontWeight: '900' },
  webStoryBody: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 21, fontWeight: '600' },
  darkCardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  darkMeta: { color: 'rgba(255,255,255,0.60)', fontSize: 10, fontWeight: '700', marginTop: 4 },
  profileHero: { alignItems: 'center', gap: 7, paddingVertical: 20 },
  avatarXL: { width: 92, height: 92, borderRadius: 34, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  avatarXLText: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  profileName: { color: ui.ink, fontSize: 26, fontWeight: '900' },
  dangerSurface: { borderColor: '#F4C8D1', backgroundColor: '#FFF7F8' },
  dangerTitle: { color: ui.danger, fontSize: 16, fontWeight: '900' },
  storageBar: { height: 8, borderRadius: 4, backgroundColor: '#DCEDE5', overflow: 'hidden' },
  storageFill: { height: '100%', borderRadius: 4, backgroundColor: ui.success },
  serverDiscovery: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  radarOuter: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#E9F9FB', alignItems: 'center', justifyContent: 'center' },
  radarMiddle: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#D6F3F6', alignItems: 'center', justifyContent: 'center' },
  radarCore: { width: 62, height: 62, borderRadius: 24, backgroundColor: ui.aqua, alignItems: 'center', justifyContent: 'center' },
  serverFound: { borderColor: '#BFEAF0', backgroundColor: '#F4FEFF' },
});

