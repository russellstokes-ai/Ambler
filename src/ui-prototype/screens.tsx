import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  StyleProp,
  ViewStyle,
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
  PulseDot,
  MotionDrift,
  MotionReveal,
  RouteTraceSegment,
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
import LottieAccent from './LottieAccent';
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

const go = (id: PrototypeScreenId) =>
  router.push({ pathname: '/ui-preview/[screen]', params: { screen: id } } as never);
const amblerMark = require('../../assets/brand/ambler-mark-transparent.png');

type ScenicScene = 'mountain' | 'city' | 'venue' | 'celebration';

function ScenicMedia({
  scene = 'mountain',
  style,
  children,
}: {
  scene?: ScenicScene;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const colorsByScene: Record<ScenicScene, [string,string,string]> = {
    mountain: ['#0C3340','#1F6F68','#7FB7A4'],
    city: ['#161235','#34218A','#EC3FA4'],
    venue: ['#3A1438','#7B1F66','#F97316'],
    celebration: ['#3C1558','#9A2E82','#EC3FA4'],
  };
  return (
    <LinearGradient colors={colorsByScene[scene]} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.scenicMedia,style]}>
      <View style={styles.scenicLight}/>
      {scene === 'mountain' ? (
        <>
          <View style={styles.mountainBack}/>
          <View style={styles.mountainFront}/>
          <View style={styles.scenicSun}/>
          <View style={styles.mountainTrail}/>
        </>
      ) : null}
      {scene === 'city' ? (
        <View style={styles.citySkyline}>
          {[36,58,44,72,50,64].map((height,index)=><View key={index} style={[styles.cityBuilding,{height,opacity:0.62+(index%3)*0.12}]}/>)}
        </View>
      ) : null}
      {scene === 'venue' ? (
        <>
          <View style={styles.venueArc}/>
          <View style={styles.venueArcInner}/>
          <View style={styles.venueTrack}/>
        </>
      ) : null}
      {scene === 'celebration' ? (
        <>
          <View style={[styles.confettiDot,{left:'18%',top:'24%',backgroundColor:'#FFD86B'}]}/>
          <View style={[styles.confettiDot,{right:'16%',top:'32%',backgroundColor:ui.aqua}]}/>
          <View style={[styles.confettiDot,{left:'34%',bottom:'20%',backgroundColor:'#FFFFFF'}]}/>
          <View style={[styles.confettiBar,{right:'28%',bottom:'24%',backgroundColor:'#FFD86B'}]}/>
        </>
      ) : null}
      {children}
    </LinearGradient>
  );
}

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
        <SectionTitle title="Quality states" action="Designed, not ignored" />
        <View style={styles.resilienceGrid}>
          <Surface style={styles.resilienceCard}>
            <View style={styles.inlineBetween}><View style={[styles.stateIcon,{backgroundColor:'#FFF6DE'}]}><Ionicons name="cloud-offline-outline" size={20} color="#9C6500"/></View><StatusBadge label="OFFLINE" tone="gold"/></View>
            <Text style={styles.rowTitle}>Your work is safe</Text>
            <Text style={styles.rowMeta}>3 moments are saved on this device and will upload when you’re back online.</Text>
            <Text style={styles.stateAction}>Review queued items</Text>
          </Surface>
          <Surface style={styles.resilienceCard}>
            <View style={styles.inlineBetween}><View style={[styles.stateIcon,{backgroundColor:'#E8FBFD'}]}><Ionicons name="server-outline" size={20} color="#087B86"/></View><StatusBadge label="SERVER OFFLINE" tone="aqua"/></View>
            <Text style={styles.rowTitle}>Ambler Home is unavailable</Text>
            <Text style={styles.rowMeta}>The story stays usable here. Sync will resume after the server reconnects.</Text>
            <Text style={styles.stateAction}>Test connection</Text>
          </Surface>
          <Surface style={styles.resilienceCard}>
            <View style={styles.inlineBetween}><View style={[styles.stateIcon,{backgroundColor:'#FFF0F3'}]}><Ionicons name="alert-circle-outline" size={20} color={ui.danger}/></View><StatusBadge label="UPLOAD FAILED" tone="gray"/></View>
            <Text style={styles.rowTitle}>One video needs another try</Text>
            <Text style={styles.rowMeta}>The failed item stays visible. Successful uploads are not repeated.</Text>
            <Text style={styles.stateAction}>Retry video</Text>
          </Surface>
          <Surface style={styles.resilienceCard}>
            <View style={styles.inlineBetween}><View style={[styles.stateIcon,{backgroundColor:'#F0EDF5'}]}><Ionicons name="link-outline" size={20} color={ui.muted}/></View><StatusBadge label="LINK EXPIRED" tone="gray"/></View>
            <Text style={styles.rowTitle}>This private story link has expired</Text>
            <Text style={styles.rowMeta}>Nothing is publicly exposed. Ask the organiser for a new link.</Text>
            <Text style={styles.stateAction}>Close</Text>
          </Surface>
        </View>
      </View>
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
            <View style={styles.createFabHalo}>
              <Pressable accessibilityRole="button" accessibilityLabel="Create event" style={styles.createFab} onPress={() => go('create-basics')}>
                <LinearGradient colors={['#7A55FF','#5B2CFF','#A32FD1']} style={styles.createFabGradient}>
                  <Ionicons name="add" size={27} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" style={[styles.navItem, active === target && styles.navItemActive]} onPress={() => go(target)}>
            <Ionicons name={icon} size={20} color={active === target ? ui.violet : '#8D849D'} />
            <Text style={[styles.navLabel, active === target && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

function ScreenBack() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.circleButton} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={20} color={ui.ink} />
    </Pressable>
  );
}

function Splash() {
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.centerFill}>
        <View style={styles.logoOrb}>
          <Image source={amblerMark} style={styles.logoMark} resizeMode="contain" />
        </View>
        <Text style={styles.splashBrand}>Ambler</Text>
        <Text style={styles.splashTag}>Capture together. Relive the whole story.</Text>
      </View>
      <PrimaryButton label="Enter Ambler" onPress={() => go('onboarding')} inverse />
    </PrototypePage>
  );
}

function Onboarding() {
  const slides = [
    { step: '01 · CAPTURE', title: 'Bring everyone’s moments together.', subtitle: 'One private event. Every angle. Photos, clips, notes and the journey itself.', icon: 'camera-outline' as const, accent: ui.aqua },
    { step: '02 · BUILD', title: 'Turn the event into a story.', subtitle: 'Ambler curates the strongest real moments, shapes the timeline and keeps the story grounded in what actually happened.', icon: 'sparkles-outline' as const, accent: ui.pink },
    { step: '03 · RELIVE', title: 'Replay the journey, not just the gallery.', subtitle: 'Move through the finished story, open Route Replay and revisit the moments where they happened.', icon: 'map-outline' as const, accent: '#F97316' },
  ];
  const [page, setPage] = useState(0);
  const slide = slides[page]!;
  return (
    <PrototypePage>
      <View style={styles.topActions}>
        <View style={styles.brandLockup}><Image source={amblerMark} style={styles.brandMarkMini}/><Text style={styles.brandMini}>Ambler</Text></View>
        <Pressable accessibilityRole="button" hitSlop={10} onPress={() => go('auth')}><Text style={styles.linkText}>Skip</Text></Pressable>
      </View>
      <LinearGradient colors={['#0F062C', '#5B2CFF', page === 2 ? '#0F766E' : '#EC3FA4']} style={styles.onboardVisual}>
        <MotionReveal resetKey={page} delay={40} distance={8} style={[styles.floatPhoto, { left: '9%', top: '20%', transform: [{ rotate: '-8deg' }] }]}>
          <Ionicons name={page === 0 ? 'image-outline' : page === 1 ? 'albums-outline' : 'location-outline'} size={30} color="#FFFFFF" />
        </MotionReveal>
        <MotionReveal resetKey={page} delay={150} distance={10} style={[styles.floatPhoto, { right: '9%', top: '34%', transform: [{ rotate: '9deg' }] }]}>
          <Ionicons name={page === 0 ? 'videocam-outline' : page === 1 ? 'sparkles-outline' : 'play-outline'} size={30} color="#FFFFFF" />
        </MotionReveal>
        <RouteTraceSegment style={[styles.routeLine, { backgroundColor: slide.accent }]} rotate="-18deg" delay={160} duration={680} />
        <MotionReveal resetKey={page} delay={620} distance={0} scaleFrom={0.72} style={[styles.routeDot, { borderColor: slide.accent }]} />
        <MotionReveal resetKey={page} delay={250} distance={6} scaleFrom={0.92} style={styles.onboardHeroIcon}><Ionicons name={slide.icon} size={34} color="#FFFFFF"/></MotionReveal>
      </LinearGradient>
      <MotionReveal resetKey={page} delay={120} distance={10} style={styles.copyBlock}>
        <Text style={styles.stepKicker}>{slide.step}</Text>
        <Text style={styles.heroTitle}>{slide.title}</Text>
        <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
      </MotionReveal>
      <View style={styles.pagerDots}>{slides.map((_, index) => <View key={index} style={index === page ? styles.pagerDotActive : styles.pagerDot}/>)}</View>
      <PrimaryButton label={page === slides.length - 1 ? 'Get started' : 'Continue'} onPress={() => page === slides.length - 1 ? go('auth') : setPage(page + 1)} />
    </PrototypePage>
  );
}

function Auth() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const continueWithEmail = () => {
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    go('profile-setup');
  };
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Welcome back" title="Your stories are waiting." subtitle="Sign in to create, contribute and relive private shared events." right={<ScreenBack />} />
      <View style={styles.authArt}>
        <StoryArtwork title="Saturday in Barcelona" subtitle="Five viewpoints. One finished story." icon="airplane-outline" compact />
      </View>
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput value={email} onChangeText={(value) => { setEmail(value); if (emailError) setEmailError(''); }} placeholder="you@example.com" placeholderTextColor={ui.muted} style={[styles.input, emailError ? styles.inputError : null]} keyboardType="email-address" autoCapitalize="none" />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <PrimaryButton label="Continue with email" onPress={continueWithEmail} icon="mail-outline" />
        <View style={styles.orRow}><View style={styles.orLine}/><Text style={styles.orText}>or</Text><View style={styles.orLine}/></View>
        <SecondaryButton label="Continue with Google" icon="logo-google" onPress={() => go('profile-setup')} />
        <SecondaryButton label="Continue with Apple" icon="logo-apple" onPress={() => go('profile-setup')} />
      </View>
      <Text style={styles.legal}>Private by default. By continuing you agree to Ambler’s Terms and Privacy Policy.</Text>
    </PrototypePage>
  );
}

function ProfileSetup() {
  const [displayName, setDisplayName] = useState('Russell');
  const [photoSelected, setPhotoSelected] = useState(false);
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Almost there" title="How should people see you?" subtitle="This is shown to people inside shared Ambler events." right={<ScreenBack />} />
      <Pressable accessibilityRole="button" accessibilityLabel="Choose profile photo" onPress={() => setPhotoSelected(!photoSelected)} style={styles.avatarLarge}>
        {photoSelected ? <Text style={styles.avatarSelectedText}>RS</Text> : <Ionicons name="person-outline" size={42} color={ui.violet}/>}
        <View style={styles.avatarEdit}><Ionicons name={photoSelected ? "checkmark" : "camera"} size={14} color="#FFFFFF"/></View>
      </Pressable>
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Display name</Text>
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your name" placeholderTextColor={ui.muted} style={styles.input} />
        <Text style={styles.helper}>{photoSelected ? 'Profile photo selected · you can change both later.' : 'You can change this later.'}</Text>
      </View>
      <PrimaryButton label="Start using Ambler" onPress={() => displayName.trim() && go('home')} />
    </PrototypePage>
  );
}

function Home() {
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <PrototypePage>
      <PrototypeHeader
        title="Good evening, Russell"
        subtitle="One story is live. Two are ready to relive."
        right={<View style={styles.avatarSmall}><Text style={styles.avatarInitial}>R</Text></View>}
      />
      <TwoPane
        primary={
          <LinearGradient colors={['#0B041F', '#24105C', '#5B2CFF']} locations={[0,0.48,1]} style={styles.liveHero}>
            <View style={styles.heroGlowA}/><View style={styles.heroGlowB}/>
            <RouteTraceSegment style={styles.heroRouteOne} rotate="-24deg" delay={180} duration={620}/>
            <RouteTraceSegment style={styles.heroRouteTwo} rotate="18deg" delay={600} duration={560}/>
            <MotionReveal delay={980} distance={0} scaleFrom={0.72} style={styles.heroRouteDot}/>
            <View style={styles.inlineBetween}>
              <View style={styles.livePill}><PulseDot /><Text style={styles.livePillText}>LIVE NOW</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open live event menu" hitSlop={8} onPress={() => setMenuOpen(!menuOpen)}><Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.72)"/></Pressable>
            </View>
            {menuOpen ? (
              <View style={styles.heroQuickMenu}>
                <Pressable onPress={() => go('event-hub')}><Text style={styles.heroQuickMenuItem}>Open event</Text></Pressable>
                <Pressable onPress={() => go('moments')}><Text style={styles.heroQuickMenuItem}>View moments</Text></Pressable>
                <Pressable onPress={() => go('finish-build')}><Text style={styles.heroQuickMenuItem}>Finish & build story</Text></Pressable>
              </View>
            ) : null}
            <View style={styles.heroMiddle}>
              <View style={styles.liveHeroIcon}><Ionicons name="trail-sign-outline" size={34} color="#FFFFFF"/></View>
              <View style={styles.contributorStack}>
                {['RS','GA','AT','+5'].map((name,index)=><View key={name} style={[styles.contributorBubble,{marginLeft:index===0?0:-8,zIndex:4-index}]}><Text style={styles.contributorBubbleText}>{name}</Text></View>)}
              </View>
            </View>
            <View>
              <Text style={styles.liveHeroEyebrow}>SATURDAY · SNOWDONIA</Text>
              <Text style={styles.liveHeroTitle}>Snowdon Weekend</Text>
              <Text style={styles.liveHeroMeta}>99 shared moments · Route recording · 2h 14m</Text>
            </View>
            <PrimaryButton label="Open live event" inverse icon="arrow-forward" onPress={() => go('event-hub')} />
          </LinearGradient>
        }
        secondary={
          <View style={styles.stackGap}>
            <SectionTitle title="Coming up" action="View all" onAction={() => go('events')} />
            <Surface>
              <IconRow icon="airplane-outline" title="Saturday in Barcelona" subtitle="Starts Friday · 5 people" tone="aqua" />
            </Surface>
            <SectionTitle title="Continue reliving" />
            <StoryArtwork title="Sophie's 40th" subtitle="Page 6 of 12" icon="sparkles-outline" compact />
          </View>
        }
      />
      <SectionTitle title="Recent stories" action="See library" onAction={() => go('stories')} />
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
  const [filter, setFilter] = useState<'Active' | 'Upcoming' | 'Past'>('Active');
  const visible = filter === 'Active' ? mockEvents.slice(0, 1) : filter === 'Upcoming' ? mockEvents.slice(1, 2) : mockEvents.slice(2);
  return (
    <PrototypePage>
      <PrototypeHeader title="Events" subtitle="Capture what’s happening now. Relive what happened later." />
      <View style={styles.chipRow}>{(['Active','Upcoming','Past'] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)}><Chip label={item} active={filter === item}/></Pressable>)}</View>
      <View style={styles.listGap}>
        {visible.map((event) => {
          const index = mockEvents.indexOf(event);
          return (
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
          );
        })}
      </View>
      <PrototypeNav active="events" />
    </PrototypePage>
  );
}

function Stories() {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const filteredStories = mockStories.filter((story) => {
    const matchesFilter = filter === 'All' || story.category === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || story.title.toLowerCase().includes(needle) || story.kicker.toLowerCase().includes(needle);
    return matchesFilter && matchesQuery;
  });
  return (
    <PrototypePage>
      <PrototypeHeader title="Stories" subtitle="Your finished Ambler library." />
      <View style={styles.searchBox}><Ionicons name="search" size={18} color={ui.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search stories, places or people" placeholderTextColor={ui.muted} style={styles.searchInput}/></View>
      <View style={styles.chipRow}>{['All','Trips','Celebrations','Activities'].map((item) => <Pressable key={item} onPress={() => setFilter(item)}><Chip label={item} active={filter === item}/></Pressable>)}</View>
      <View style={width >= 720 ? styles.storyGridWide : styles.storyGrid}>
        {filteredStories.map((story) => (
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
  const [eventName, setEventName] = useState('Snowdon Weekend');
  const [location, setLocation] = useState('Snowdonia, Wales');
  const [dateChoice, setDateChoice] = useState('17–19 October 2026');
  const [dateOpen, setDateOpen] = useState(false);
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 1 of 4" title="What are we capturing?" subtitle="Start with the basics. You can edit them later." right={<ScreenBack />} />
      <ProgressSteps current={0} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.formGap}>
        <Text style={styles.fieldLabel}>Event name</Text>
        <TextInput value={eventName} onChangeText={setEventName} placeholder="Name your event" placeholderTextColor={ui.muted} style={styles.input}/>
        <Text style={styles.fieldLabel}>When</Text>
        <Pressable accessibilityRole="button" onPress={() => setDateOpen(!dateOpen)}>
          <Surface style={styles.fieldSurface}><IconRow icon="calendar-outline" title={dateChoice} subtitle="Tap to change" chevron/></Surface>
        </Pressable>
        {dateOpen ? <View style={styles.chipRow}>
          {['17–19 October 2026','24–25 October 2026'].map((option) => <Pressable key={option} onPress={() => { setDateChoice(option); setDateOpen(false); }}><Chip label={option} active={dateChoice===option}/></Pressable>)}
        </View> : null}
        <Text style={styles.fieldLabel}>Where <Text style={styles.optional}>optional</Text></Text>
        <TextInput value={location} onChangeText={setLocation} placeholder="Add a place" placeholderTextColor={ui.muted} style={styles.input}/>
      </View>
      <PrimaryButton label="Choose event type" onPress={() => eventName.trim() && go('event-type')} />
    </PrototypePage>
  );
}

function EventType() {
  const [category, setCategory] = useState('Popular');
  const [selected, setSelected] = useState('Hiking day');
  const [query, setQuery] = useState('');
  const visibleTypes = popularEventTypes.filter(([name, , subtitle, typeCategory]) => {
    const categoryMatch = category === 'Popular' ? popularEventTypes.indexOf(popularEventTypes.find((item) => item[0] === name)!) < 6 : typeCategory === category;
    const needle = query.trim().toLowerCase();
    const queryMatch = !needle || name.toLowerCase().includes(needle) || subtitle.toLowerCase().includes(needle);
    return categoryMatch && queryMatch;
  });
  const chooseCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setQuery('');
    const first = nextCategory === 'Popular' ? popularEventTypes[0] : popularEventTypes.find((item) => item[3] === nextCategory);
    if (first) setSelected(first[0]);
  };
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 2 of 4" title="What kind of story is this?" subtitle="We’ll use this to shape pacing, chapters and route treatment." right={<ScreenBack />} />
      <ProgressSteps current={1} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.searchBox}><Ionicons name="search" size={18} color={ui.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search 52 event types" placeholderTextColor={ui.muted} style={styles.searchInput}/></View>
      <View style={styles.chipRow}>
        {eventCategories.slice(0, 5).map(([name, icon]) => <Pressable key={name} onPress={() => chooseCategory(name)}><Chip label={name} icon={icon as any} active={category === name}/></Pressable>)}
      </View>
      <View style={styles.optionGrid}>
        {visibleTypes.map(([name, icon, subtitle]) => {
          const active = selected === name;
          return (
            <Pressable key={name} onPress={() => setSelected(name)} style={[styles.optionCard, active && styles.optionCardActive]}>
              <View style={[styles.optionIcon, active && { backgroundColor: ui.violet }]}><Ionicons name={icon as any} size={24} color={active ? '#FFFFFF' : ui.violet}/></View>
              <Text style={styles.optionTitle}>{name}</Text>
              <Text style={styles.optionMeta}>{subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
      {visibleTypes.length === 0 ? <Surface tone="tint"><Text style={styles.cardTitle}>No matching event type</Text><Text style={styles.body}>Try another search or category.</Text></Surface> : null}
      <PrimaryButton label={`Continue with ${selected}`} onPress={() => go('story-style')} />
    </PrototypePage>
  );
}

function StoryStyle() {
  const [selectedTheme, setSelectedTheme] = useState('Route Replay');
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 3 of 4" title="Choose how the story should feel." subtitle="Recommended styles are based on your event type. You can change this later." right={<ScreenBack />} />
      <ProgressSteps current={2} labels={['Basics','Type','Style','Privacy']} />
      <View style={styles.listGap}>
        {storyThemes.map((theme) => {
          const active = selectedTheme === theme.name;
          return (
            <Pressable key={theme.name} onPress={() => setSelectedTheme(theme.name)}>
              <LinearGradient colors={theme.colors as [string,string,string]} style={[styles.themeCard, active && styles.themeCardSelected]}>
                <View style={styles.inlineBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.themeName, theme.name === 'Warm Gold' || theme.name === 'Magazine' ? { color: ui.ink } : null]}>{theme.name}</Text>
                    <Text style={[styles.themeSubtitle, theme.name === 'Warm Gold' || theme.name === 'Magazine' ? { color: '#5F536A' } : null]}>{theme.subtitle}</Text>
                  </View>
                  {active ? <View style={styles.selectedTick}><Ionicons name="checkmark" size={18} color="#FFFFFF"/></View> : null}
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton label="Continue" onPress={() => go('privacy-route')} />
    </PrototypePage>
  );
}

function PrivacyRoute() {
  const [route, setRoute] = useState(true);
  const [privacy, setPrivacy] = useState<'invited' | 'link'>('invited');
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Create event · 4 of 4" title="Keep it private. Add the journey if you want." subtitle="Ambler starts private. Route data is only captured when you choose it." right={<ScreenBack />} />
      <ProgressSteps current={3} labels={['Basics','Type','Style','Privacy']} />
      <Surface>
        <Text style={styles.cardTitle}>Who can see this event?</Text>
        <Pressable onPress={() => setPrivacy('invited')} style={styles.radioRow}><View style={privacy === 'invited' ? styles.radioActive : styles.radio}>{privacy === 'invited' ? <View style={styles.radioInner}/> : null}</View><View style={{flex:1}}><Text style={styles.rowTitle}>Invited people only</Text><Text style={styles.rowMeta}>Recommended · private by default</Text></View></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => setPrivacy('link')} style={styles.radioRow}><View style={privacy === 'link' ? styles.radioActive : styles.radio}>{privacy === 'link' ? <View style={styles.radioInner}/> : null}</View><View style={{flex:1}}><Text style={styles.rowTitle}>Anyone with a private link</Text><Text style={styles.rowMeta}>Useful for larger events</Text></View></Pressable>
      </Surface>
      <Surface>
        <View style={styles.inlineBetween}>
          <View style={{flex:1}}>
            <Text style={styles.cardTitle}>Record the route</Text>
            <Text style={styles.body}>Unlock Route Replay with GPS captured during the event.</Text>
          </View>
          <Switch accessibilityLabel="Record the route" value={route} onValueChange={setRoute} trackColor={{ true: ui.violet }} />
        </View>
        <View style={styles.privacyNote}><Ionicons name="shield-checkmark-outline" size={18} color={ui.violet}/><Text style={styles.privacyText}>Sensitive start/end locations can be hidden in shared stories.</Text></View>
      </Surface>
      <PrimaryButton label="Create event" onPress={() => go('invite')} />
    </PrototypePage>
  );
}

function Invite() {
  const [copied, setCopied] = useState(false);
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
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label={copied ? "Link copied" : "Copy link"} icon={copied ? "checkmark-circle-outline" : "link-outline"} onPress={() => setCopied(true)}/><SecondaryButton style={styles.flexButton} label="Share" icon="share-outline" onPress={() => go('event-hub')}/></View>
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
          <LinearGradient colors={['#071D26','#124851','#34218A']} style={styles.eventHero}>
            <View style={styles.eventHeroGlow}/>
            <RouteTraceSegment style={styles.eventRouteOne} rotate="-22deg" delay={120} duration={620}/>
            <RouteTraceSegment style={styles.eventRouteTwo} rotate="16deg" delay={560} duration={560}/>
            <MotionReveal delay={930} distance={0} scaleFrom={0.72} style={styles.eventRoutePoint}/>
            <View style={styles.inlineBetween}>
              <View style={styles.livePill}><PulseDot /><Text style={styles.livePillText}>ROUTE LIVE</Text></View>
              <Ionicons name="shield-checkmark-outline" size={21} color="rgba(255,255,255,0.72)"/>
            </View>
            <View>
              <Text style={styles.eventHeroEyebrow}>THE JOURNEY SO FAR</Text>
              <Text style={styles.eventHeroTitle}>The route is recording</Text>
              <Text style={styles.eventHeroMeta}>2h 14m · 7.8 km · 642 m climb</Text>
            </View>
            <View style={styles.eventHeroFooter}>
              <View style={styles.contributorStack}>
                {['RS','GA','AT','JM','+4'].map((name,index)=><View key={name} style={[styles.contributorBubble,{marginLeft:index===0?0:-8,zIndex:5-index}]}><Text style={styles.contributorBubbleText}>{name}</Text></View>)}
              </View>
              <Text style={styles.eventHeroPeople}>8 contributing</Text>
            </View>
            <PrimaryButton label="Add a moment" inverse icon="add-circle-outline" onPress={() => go('add-moment')}/>
          </LinearGradient>
        }
        secondary={
          <View style={styles.stackGap}>
            <Surface>
              <View style={styles.statRow}><Stat value="99" label="Moments"/><Stat value="8" label="People"/><Stat value="14" label="Notes"/></View>
            </Surface>
            <Surface>
              <Pressable onPress={() => go('moments')}><IconRow icon="images-outline" title="Moments" subtitle="87 photos · 12 videos" chevron/></Pressable>
              <View style={styles.divider}/>
              <Pressable onPress={() => go('route-capture')}><IconRow icon="map-outline" title="Route" subtitle="Recording · 7.8 km" tone="aqua" chevron/></Pressable>
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
  const [filter, setFilter] = useState('All');
  const [selectedMoment, setSelectedMoment] = useState<number | null>(null);
  const moments = Array.from({length: 10}).map((_, index) => ({
    id: index,
    type: index % 4 === 0 ? 'video' : 'photo',
    contributor: ['RS','GA','AT','JM'][index % 4],
    scene: (index % 4 === 0 ? 'city' : index % 3 === 0 ? 'celebration' : 'mountain') as ScenicScene,
  }));
  const visibleMoments = moments.filter((moment) => {
    if (filter === 'Photos') return moment.type === 'photo';
    if (filter === 'Videos') return moment.type === 'video';
    if (filter === 'Mine') return moment.contributor === 'RS';
    return true;
  });
  const selected = selectedMoment == null ? null : moments.find((moment) => moment.id === selectedMoment);
  return (
    <PrototypePage>
      <PrototypeHeader title="Moments" subtitle="The shared capture pool. The finished story comes later." right={<ScreenBack />} />
      <View style={styles.chipRow}>{['All','Photos','Videos','Mine'].map((item) => <Pressable key={item} onPress={() => setFilter(item)}><Chip label={item} active={filter === item}/></Pressable>)}</View>
      <Text style={styles.filterCount}>{visibleMoments.length} {filter === 'All' ? 'moments' : filter === 'Mine' ? 'by you' : filter.toLowerCase()}</Text>
      <View style={styles.mediaGrid}>
        {visibleMoments.map((moment, index) => (
          <Pressable key={moment.id} accessibilityRole="button" accessibilityLabel={`Open ${moment.type} moment by ${moment.contributor}`} onPress={() => setSelectedMoment(moment.id)} style={[styles.mediaTile, index % 3 === 0 && styles.mediaTileTall]}>
            <ScenicMedia scene={moment.scene} style={StyleSheet.absoluteFillObject}>
              {moment.type === 'video' ? <View style={styles.videoPlayBadge}><Ionicons name="play" size={15} color="#FFFFFF"/></View> : null}
              <View style={styles.mediaContributor}><Text style={styles.mediaContributorText}>{moment.contributor}</Text></View>
            </ScenicMedia>
          </Pressable>
        ))}
      </View>
      {selected ? (
        <Surface tone="tint">
          <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>Moment details</Text><Text style={styles.rowMeta}>{selected.type === 'video' ? 'Video' : 'Photo'} · contributed by {selected.contributor}</Text></View><StatusBadge label={selected.type.toUpperCase()} tone={selected.type === 'video' ? 'aqua' : 'gray'}/></View>
          <SecondaryButton label="Close moment" onPress={() => setSelectedMoment(null)}/>
        </Surface>
      ) : null}
      <PrimaryButton label="Add moment" icon="add" onPress={() => go('add-moment')}/>
    </PrototypePage>
  );
}

function AddMoment() {
  const [mode, setMode] = useState<'photo' | 'video' | 'library' | 'note'>('photo');
  return (
    <PrototypePage>
      <PrototypeHeader title="Add a moment" subtitle="Keep it quick. Ambler handles the organising later." right={<ScreenBack />} />
      <View style={styles.captureGrid}>
        <Pressable onPress={() => setMode('photo')} style={[styles.captureChoice, mode==='photo'&&styles.captureChoiceActive]}><Ionicons name="camera-outline" size={32} color={ui.violet}/><Text style={styles.captureTitle}>Take photo</Text></Pressable>
        <Pressable onPress={() => setMode('video')} style={[styles.captureChoice, mode==='video'&&styles.captureChoiceActive]}><Ionicons name="videocam-outline" size={32} color={ui.pink}/><Text style={styles.captureTitle}>Record video</Text></Pressable>
        <Pressable onPress={() => setMode('library')} style={[styles.captureChoice, mode==='library'&&styles.captureChoiceActive]}><Ionicons name="images-outline" size={32} color={ui.aqua}/><Text style={styles.captureTitle}>Choose media</Text></Pressable>
        <Pressable onPress={() => setMode('note')} style={[styles.captureChoice, mode==='note'&&styles.captureChoiceActive]}><Ionicons name="chatbubble-ellipses-outline" size={32} color={ui.warning}/><Text style={styles.captureTitle}>Add note</Text></Pressable>
      </View>
      <Surface>
        <ScenicMedia scene={mode==='video' ? 'city' : mode==='note' ? 'celebration' : 'mountain'} style={styles.uploadPreview}>
          <View style={styles.previewGlass}>
            <Ionicons name={mode==='video' ? 'videocam-outline' : mode==='note' ? 'chatbubble-ellipses-outline' : 'camera-outline'} size={26} color="#FFFFFF"/>
            <Text style={styles.previewModeLabel}>{mode==='photo' ? 'Camera preview' : mode==='video' ? 'Video preview' : mode==='library' ? 'Selected media' : 'Note moment'}</Text>
          </View>
        </ScenicMedia>
        <TextInput placeholder="Add a caption… optional" placeholderTextColor={ui.muted} style={styles.input}/>
        <View style={styles.privacyNote}><Ionicons name="location-outline" size={18} color={ui.violet}/><Text style={styles.privacyText}>Location available · include with this moment</Text></View>
      </Surface>
      <PrimaryButton label="Add to Snowdon Weekend" onPress={() => go('moments')}/>
    </PrototypePage>
  );
}

function RouteCapture() {
  const [paused, setPaused] = useState(false);
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.inlineBetween}><ScreenBackDark/><StatusBadge label={paused ? "PAUSED" : "RECORDING"} tone={paused ? "gold" : "green"}/></View>
      <View style={styles.routeCanvas}>
        <View style={styles.contourOne}/><View style={styles.contourTwo}/><View style={styles.contourThree}/>
        <View style={styles.routeStrokeA}/><View style={styles.routeStrokeB}/><View style={styles.routeUserDot}/>
      </View>
      <View style={styles.routeStatsDark}>
        <Stat value="2:14" label="Elapsed" dark/><Stat value="7.8 km" label="Distance" dark/><Stat value="642 m" label="Elevation" dark/>
      </View>
      <Text style={styles.routeCaptionDark}>Location stays private to this event. Shared stories can hide sensitive start/end points.</Text>
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label={paused ? "Resume" : "Pause"} icon={paused ? "play" : "pause"} dark onPress={() => setPaused(!paused)}/><PrimaryButton style={styles.flexButton} label="Finish route" icon="stop" onPress={() => go('event-hub')}/></View>
    </PrototypePage>
  );
}

function ScreenBackDark() {
  return <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.circleButtonDark} onPress={() => router.back()}><Ionicons name="chevron-back" size={20} color="#FFFFFF"/></Pressable>;
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
  const [kind, setKind] = useState<'photos' | 'video'>('photos');
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Snowdon Weekend" title="Add your moments" subtitle="Anything you add can help shape the finished story." />
      <Surface tone="tint">
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>You’re contributing as Alex</Text><Text style={styles.rowMeta}>No full account setup required</Text></View><StatusBadge label="GUEST" tone="aqua"/></View>
      </Surface>
      <View style={styles.captureGrid}>
        <Pressable onPress={() => setKind('photos')} style={[styles.captureChoice, kind==='photos'&&styles.captureChoiceActive]}><Ionicons name="images-outline" size={32} color={ui.violet}/><Text style={styles.captureTitle}>Photos</Text></Pressable>
        <Pressable onPress={() => setKind('video')} style={[styles.captureChoice, kind==='video'&&styles.captureChoiceActive]}><Ionicons name="videocam-outline" size={32} color={ui.pink}/><Text style={styles.captureTitle}>Video</Text></Pressable>
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
      <View style={styles.successHero}><LottieAccent kind="completion" size={88} loop={false} /><Text style={styles.successTitle}>Added to Snowdon Weekend</Text><Text style={styles.heroSubtitle}>2 photos and your note are safely in the event.</Text></View>
      <Surface>
        <View style={styles.uploadRow}><View style={styles.uploadThumb}><Ionicons name="image-outline" size={22} color="#FFFFFF"/></View><View style={{flex:1}}><Text style={styles.rowTitle}>IMG_2481.jpg</Text><Text style={styles.rowMeta}>Uploaded · location included</Text></View><Ionicons name="checkmark-circle" size={22} color={ui.success}/></View>
        <View style={styles.divider}/>
        <View style={styles.uploadRow}><View style={[styles.uploadThumb,{backgroundColor:'#27106E'}]}><Ionicons name="image-outline" size={22} color="#FFFFFF"/></View><View style={{flex:1}}><Text style={styles.rowTitle}>IMG_2482.jpg</Text><Text style={styles.rowMeta}>Uploaded</Text></View><Ionicons name="checkmark-circle" size={22} color={ui.success}/></View>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label="Done" onPress={() => go('guest-join')}/><PrimaryButton style={styles.flexButton} label="Add more" icon="add" onPress={() => go('guest-contribution')}/></View>
    </PrototypePage>
  );
}

function FinishBuild() {
  const [length, setLength] = useState<'Short' | 'Standard' | 'Epic'>('Standard');
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Capture complete" title="Ready to turn it into a story?" subtitle="Ambler will curate the real moments, route and notes into one finished experience." right={<ScreenBack />} />
      <Surface>
        <View style={styles.statRow}><Stat value="99" label="Moments"/><Stat value="8" label="People"/><Stat value="7.8 km" label="Route"/><Stat value="14" label="Notes"/></View>
      </Surface>
      <View style={styles.section}>
        <SectionTitle title="Story length" />
        <View style={styles.storyLengthGrid}>
          {[
            ['Short','5–7 pages'],
            ['Standard','Recommended · 10–14 pages'],
            ['Epic','15+ pages'],
          ].map(([name,meta]) => {
            const active = length === name;
            return <Pressable key={name} style={styles.lengthPressable} onPress={() => setLength(name as 'Short' | 'Standard' | 'Epic')}><Surface style={[styles.lengthCard, active && styles.lengthCardActive]}><Text style={[styles.lengthName,active&&{color:ui.violet}]}>{name}</Text><Text style={styles.rowMeta}>{meta}</Text></Surface></Pressable>;
          })}
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
        <View style={styles.generationLottieWrap}><LottieAccent kind="story-building" size={124} /></View>
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
      <PrimaryButton label="Open finished story" inverse onPress={() => go('story-ready')}/>
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
      <LinearGradient colors={['#070217','#21105B','#5B2CFF','#B32B92']} locations={[0,0.38,0.72,1]} style={styles.readyBackdrop}>
        <View style={styles.readyHalo}/><View style={styles.readyHaloTwo}/>
        <RouteTraceSegment style={styles.readyRouteOne} rotate="-24deg" delay={120} duration={760}/>
        <RouteTraceSegment style={styles.readyRouteTwo} rotate="17deg" delay={620} duration={620}/>
        <MotionReveal delay={1080} distance={0} scaleFrom={0.72} style={styles.readyRouteDot}/>
        <MotionReveal delay={80} distance={8} style={styles.readyTopline}><Text style={styles.readyEyebrow}>AMBLER PRESENTS</Text><Text style={styles.readyDate}>17–19 OCT 2026</Text></MotionReveal>
        <MotionReveal delay={260} distance={12} scaleFrom={0.90} style={styles.readyArt}><Ionicons name="trail-sign-outline" size={52} color="#FFFFFF"/><View style={styles.readyArtRing}/></MotionReveal>
        <MotionReveal delay={500} distance={12} style={styles.readyCopy}>
          <Text style={styles.readyTitle}>Snowdon Weekend</Text>
          <Text style={styles.readySubtitle}>Eight people. Ninety-nine moments. One story.</Text>
        </MotionReveal>
        <MotionReveal delay={680} distance={6} style={styles.readyDivider}/>
        <MotionReveal delay={760} distance={9} style={styles.readyStats}><Stat value="12" label="Story pages" dark/><Stat value="99" label="Moments" dark/><Stat value="7.8 km" label="Journey" dark/></MotionReveal>
        <MotionReveal delay={980} distance={8} scaleFrom={0.94} style={styles.readyStoryPill}><Ionicons name="sparkles" size={14} color={ui.aqua}/><Text style={styles.readyStoryPillText}>YOUR STORY IS READY</Text></MotionReveal>
      </LinearGradient>
      <PrimaryButton label="Relive story" inverse onPress={() => go('relive')}/>
      <SecondaryButton label="Edit first" dark onPress={() => go('story-editor')}/>
    </PrototypePage>
  );
}

function Relive() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}>
        <ScreenBackDark/>
        <View style={styles.storyProgressTrack}><View style={[styles.storyProgressFill,{width:'42%'}]}/></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Story options" style={styles.circleButtonDark} onPress={() => setMenuOpen(!menuOpen)}><Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF"/></Pressable>
      </View>
      {menuOpen ? <View style={styles.storyMenu}><Pressable onPress={() => go('story-editor')}><Text style={styles.storyMenuItem}>Edit story</Text></Pressable><Pressable onPress={() => go('share-export')}><Text style={styles.storyMenuItem}>Share story</Text></Pressable></View> : null}
      <LinearGradient colors={['#04161C','#0D3D43','#10253E','#0B041F']} locations={[0,0.38,0.72,1]} style={styles.reliveCanvas}>
        <View style={styles.reliveGlow}/>
        <MotionReveal delay={60} distance={8} style={styles.inlineBetween}><Text style={styles.reliveChapter}>CHAPTER 4 · THE RIDGE</Text><Text style={styles.reliveTime}>10:42</Text></MotionReveal>
        <MotionReveal delay={170} distance={12}><Text style={styles.reliveTitle}>The ridge changed the whole day.</Text></MotionReveal>
        <MotionReveal delay={340} distance={14} scaleFrom={0.975} style={styles.reliveMediaStage}>
          <ScenicMedia scene="mountain" style={styles.reliveMainPhoto}><View style={styles.mediaCountPill}><Text style={styles.mediaCountText}>6 moments</Text></View></ScenicMedia>
          <View style={styles.reliveSideStrip}>
            <ScenicMedia scene="mountain" style={styles.reliveSidePhoto}/>
            <ScenicMedia scene="city" style={styles.reliveSidePhoto}><View style={styles.videoPlayBadge}><Ionicons name="play" size={14} color="#FFFFFF"/></View></ScenicMedia>
          </View>
        </MotionReveal>
        <MotionReveal delay={560} distance={10} style={styles.reliveQuoteRow}><View style={styles.quoteBar}/><Text style={styles.reliveCaption}>Everyone stopped here. Different cameras, same view.</Text></MotionReveal>
        <MotionReveal delay={700} distance={8} style={styles.reliveByline}><View style={styles.contributorBubble}><Text style={styles.contributorBubbleText}>GA</Text></View><Text style={styles.reliveBylineText}>Moment led by Gabriella · 6 contributors</Text></MotionReveal>
      </LinearGradient>
      <View style={styles.reliveFooter}>
        <Text style={styles.storyPosition}>5 / 12</Text>
        <Pressable style={styles.routeNext} onPress={() => go('route-replay')}><Ionicons name="map-outline" size={19} color="#FFFFFF"/><Text style={styles.routeNextText}>Route Replay next</Text></Pressable>
      </View>
    </PrototypePage>
  );
}

function RouteReplay() {
  const [paused, setPaused] = useState(false);
  const [explore, setExplore] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}><ScreenBackDark/><StatusBadge label={expanded ? "FULL ROUTE" : "ROUTE REPLAY"} tone="aqua"/><Pressable accessibilityRole="button" accessibilityLabel={expanded ? "Exit full route" : "Expand route"} style={styles.circleButtonDark} onPress={() => setExpanded(!expanded)}><Ionicons name={expanded ? "contract-outline" : "expand-outline"} size={19} color="#FFFFFF"/></Pressable></View>
      <View style={styles.replayMap}>
        <LinearGradient colors={['#0B1E29','#143744','#1C5A59']} style={StyleSheet.absoluteFill}/>
        <MotionDrift>
          <View style={styles.terrainA}/><View style={styles.terrainB}/><View style={styles.terrainC}/>
          <View style={styles.contourReplayOne}/><View style={styles.contourReplayTwo}/><View style={styles.contourReplayThree}/>
        </MotionDrift>
        <View style={styles.mapCompass}><Ionicons name="navigate" size={14} color="#FFFFFF"/><Text style={styles.mapCompassText}>NW</Text></View>
        <View style={styles.replayRouteShadowA}/><View style={styles.replayRouteShadowB}/><View style={styles.replayRouteShadowC}/>
        <RouteTraceSegment style={styles.replayRouteA} rotate="-27deg" delay={160} duration={720}/>
        <RouteTraceSegment style={styles.replayRouteB} rotate="-38deg" delay={700} duration={680}/>
        <RouteTraceSegment style={styles.replayRouteC} rotate="-25deg" delay={1220} duration={620}/>
        <MotionReveal delay={1380} distance={0} scaleFrom={0.74} style={styles.routeTravelDot}><PulseDot color="#F97316" size={16}/></MotionReveal>
        {routeMoments.map((moment, index) => (
          <MotionReveal key={moment.id} delay={760 + index * 180} distance={8} scaleFrom={0.82} style={[styles.routeMoment,{left:moment.x as any,top:moment.y as any}]}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Open ${moment.title} media`} onPress={() => go('route-moment')} style={styles.routeMomentPressable}>
              <View style={styles.routeMomentThumb}><Ionicons name={moment.icon as any} size={18} color="#FFFFFF"/></View>
              {moment.count>1?<View style={styles.clusterCount}><Text style={styles.clusterCountText}>{moment.count}</Text></View>:null}
            </Pressable>
          </MotionReveal>
        ))}
        <MotionReveal delay={1540} distance={8} scaleFrom={0.96} style={styles.routeLabel}><View style={styles.routeLabelTop}><Text style={styles.routeLabelTitle}>Halfway ridge</Text><Ionicons name="images-outline" size={12} color={ui.aqua}/></View><Text style={styles.routeLabelMeta}>6 moments · 10:42 · 4.6 km</Text></MotionReveal>
        <View style={styles.mapAttributionPill}><Text style={styles.mapAttributionText}>TERRAIN · STORY MODE</Text></View>
      </View>
      {!expanded ? <View style={styles.replayInfo}>
        <View><Text style={styles.replayTitle}>Snowdon Weekend</Text><Text style={styles.replaySubtitle}>{explore ? 'Explore mode · camera released' : paused ? 'Paused · summit ahead' : 'Terrain replay · summit ahead'}</Text></View>
        <View style={styles.inline}><Stat value="7.8 km" label="Distance" dark/><Stat value="642 m" label="Gain" dark/></View>
      </View> : null}
      <View style={styles.replayControls}>
        <Pressable accessibilityRole="button" accessibilityLabel={paused ? "Play replay" : "Pause replay"} style={styles.replayControl} onPress={() => setPaused(!paused)}><Ionicons name={paused ? "play" : "pause"} size={22} color="#FFFFFF"/></Pressable>
        <View style={styles.scrubTrack}><View style={[styles.scrubFill,{width: explore ? '57%' : '57%'}]}/><View style={[styles.scrubKnob,{left:'55%'}]}/></View>
        <Pressable accessibilityRole="button" accessibilityLabel={explore ? "Resume replay" : "Explore map"} style={[styles.replayControl, explore && styles.replayControlActive]} onPress={() => setExplore(!explore)}><Ionicons name={explore ? "return-up-back-outline" : "navigate-outline"} size={20} color="#FFFFFF"/></Pressable>
      </View>
    </PrototypePage>
  );
}

function RouteMoment() {
  const [details, setDetails] = useState(false);
  return (
    <PrototypePage dark scroll={false}>
      <View style={styles.storyChrome}><ScreenBackDark/><Text style={styles.routeViewerTitle}>Halfway ridge · 6 moments</Text><Pressable accessibilityRole="button" accessibilityLabel={details ? "Hide moment details" : "Show moment details"} style={styles.circleButtonDark} onPress={() => setDetails(!details)}><Ionicons name="information-circle-outline" size={20} color="#FFFFFF"/></Pressable></View>
      <ScenicMedia scene="mountain" style={styles.viewerMedia}>
        <View style={styles.viewerPlay}><Ionicons name="play" size={27} color="#FFFFFF"/></View>
        <View style={styles.viewerContributor}><View style={styles.avatarTiny}><Text style={styles.avatarTinyText}>GA</Text></View><View><Text style={styles.viewerName}>Gabriella</Text><Text style={styles.viewerMeta}>10:42 · Halfway ridge</Text></View></View>
      </ScenicMedia>
      <Text style={styles.viewerCaption}>“Worth stopping for this view.”</Text>
      {details ? <Text style={styles.routeCaptionDark}>Captured by Gabriella · 10:42 · GPS attached · shared only inside this private event</Text> : null}
      <View style={styles.viewerDots}>{Array.from({length:6}).map((_,i)=><View key={i} style={[styles.viewerDot,i===2&&styles.viewerDotActive]}/>)}</View>
      <PrimaryButton label="Return to replay" inverse onPress={() => router.back()}/>
    </PrototypePage>
  );
}

function StoryEditor() {
  const [tool, setTool] = useState<'copy' | 'cover' | 'regenerate'>('copy');
  const [copy, setCopy] = useState('The ridge changed the whole day.');
  const [cover, setCover] = useState('Halfway ridge');
  const [order, setOrder] = useState(['Cover','The climb','Halfway ridge','Route Replay','Summit','After']);
  const [selectedPage, setSelectedPage] = useState(2);
  const [regenStatus, setRegenStatus] = useState('');

  const moveSelectedPage = (direction: -1 | 1) => {
    const next = selectedPage + direction;
    if (next < 0 || next >= order.length) return;
    const updated = [...order];
    const [page] = updated.splice(selectedPage, 1);
    updated.splice(next, 0, page);
    setOrder(updated);
    setSelectedPage(next);
  };

  return (
    <PrototypePage>
      <PrototypeHeader title="Edit story" subtitle="Adjust the story without turning Ambler into a video editor." right={<ScreenBack />} />
      <TwoPane
        primary={
          <StoryArtwork title="Snowdon Weekend" subtitle={cover + ' · Chapter 4'} icon="trail-sign-outline" />
        }
        secondary={
          <View style={styles.stackGap}>
            <Surface>
              <Pressable onPress={() => setTool('copy')}><IconRow icon="text-outline" title="Edit copy" subtitle="Change title or caption" chevron/></Pressable>
              <View style={styles.divider}/>
              <Pressable onPress={() => setTool('cover')}><IconRow icon="image-outline" title="Choose cover" subtitle={cover} tone="aqua" chevron/></Pressable>
              <View style={styles.divider}/>
              <Pressable onPress={() => setTool('regenerate')}><IconRow icon="sparkles-outline" title="Regenerate this section" subtitle={regenStatus || 'Keep the rest of the story unchanged'} tone="pink" chevron/></Pressable>
            </Surface>
            <Surface tone="tint">
              <Text style={styles.fieldLabel}>{tool === 'copy' ? 'Edit page copy' : tool === 'cover' ? 'Cover selection' : 'Regenerate section'}</Text>
              {tool === 'copy' ? <TextInput value={copy} onChangeText={setCopy} placeholder="Story copy" placeholderTextColor={ui.muted} multiline style={[styles.input,{minHeight:94,textAlignVertical:'top'}]}/> : null}
              {tool === 'cover' ? (
                <View style={styles.coverChoices}>
                  {[
                    ['Halfway ridge','mountain'],
                    ['Summit group','celebration'],
                    ['Trail start','city'],
                  ].map(([label,scene]) => (
                    <Pressable key={label} accessibilityRole="button" accessibilityLabel={'Choose cover ' + label} onPress={() => setCover(label)} style={[styles.coverChoice,cover===label&&styles.coverChoiceActive]}>
                      <ScenicMedia scene={scene as ScenicScene} style={styles.coverChoiceArt}/>
                      <Text style={[styles.coverChoiceText,cover===label&&{color:ui.violet}]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {tool === 'regenerate' ? (
                <View style={styles.stackGap}>
                  <Text style={styles.body}>Only this section will be rebuilt. The rest of the accepted story stays untouched.</Text>
                  <PrimaryButton label={regenStatus ? "Section refreshed" : "Regenerate section"} icon={regenStatus ? "checkmark" : "sparkles"} onPress={() => setRegenStatus('Section refreshed')}/>
                </View>
              ) : null}
            </Surface>
          </View>
        }
      />
      <SectionTitle title="Story order" />
      <View style={styles.editorTimeline}>
        {order.map((label,index)=>(
          <Pressable accessibilityRole="button" accessibilityLabel={'Select story page ' + label} onPress={() => setSelectedPage(index)} key={label} style={[styles.editorPage,index===selectedPage&&styles.editorPageActive]}>
            <Text style={[styles.editorPageIndex,index===selectedPage&&{color:ui.violet}]}>{index+1}</Text>
            <Text style={styles.editorPageLabel}>{label}</Text>
            <Ionicons name="reorder-three-outline" size={20} color={index===selectedPage?ui.violet:ui.muted}/>
          </Pressable>
        ))}
      </View>
      <View style={styles.twoButtons}>
        <SecondaryButton style={styles.flexButton} label="Move earlier" icon="arrow-up" onPress={() => moveSelectedPage(-1)}/>
        <SecondaryButton style={styles.flexButton} label="Move later" icon="arrow-down" onPress={() => moveSelectedPage(1)}/>
      </View>
      <Text style={styles.reorderStatus}>Selected: {order[selectedPage]} · position {selectedPage + 1} of {order.length}</Text>
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label="Theme & music" onPress={() => go('theme-music')}/><PrimaryButton style={styles.flexButton} label="Save changes" onPress={() => go('share-export')}/></View>
    </PrototypePage>
  );
}

function ThemeMusic() {
  const [selectedTheme, setSelectedTheme] = useState('Route Replay');
  const [playing, setPlaying] = useState(false);
  return (
    <PrototypePage>
      <PrototypeHeader title="Theme & music" subtitle="Change the mood without changing the memories." right={<ScreenBack />} />
      <SectionTitle title="Theme" />
      <View style={styles.themeMiniGrid}>
        {storyThemes.slice(0,4).map((theme)=>(
          <Pressable key={theme.name} style={styles.themeMiniPressable} onPress={() => setSelectedTheme(theme.name)}>
            <LinearGradient colors={theme.colors as [string,string,string]} style={[styles.themeMini,selectedTheme===theme.name&&styles.themeMiniSelected]}>
              <Text style={[styles.themeMiniText,(theme.name==='Warm Gold'||theme.name==='Magazine')&&{color:ui.ink}]}>{theme.name}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
      <SectionTitle title="Soundtrack" />
      <Surface>
        <View style={styles.inlineBetween}>
          <View style={styles.musicIcon}><Ionicons name="musical-notes" size={22} color={ui.violet}/></View>
          <View style={{flex:1}}><Text style={styles.rowTitle}>Open Skies</Text><Text style={styles.rowMeta}>Cinematic · uplifting · licensed</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={playing ? "Pause soundtrack preview" : "Play soundtrack preview"} style={styles.playButton} onPress={() => setPlaying(!playing)}><Ionicons name={playing ? "pause" : "play"} size={18} color="#FFFFFF"/></Pressable>
        </View>
      </Surface>
      <Surface tone="tint"><Text style={styles.body}>Only tracks with confirmed production rights are available in release builds.</Text></Surface>
      <PrimaryButton label="Apply to story" onPress={() => go('story-editor')}/>
    </PrototypePage>
  );
}

function ShareExport() {
  const [linkActive, setLinkActive] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  return (
    <PrototypePage>
      <PrototypeHeader title="Share & save" subtitle="Private by default. You decide where the finished story goes." right={<ScreenBack />} />
      <Surface>
        <View style={styles.inlineBetween}><View style={{flex:1}}><Text style={styles.cardTitle}>Private story link</Text><Text style={styles.rowMeta}>{linkActive ? 'Anyone with this link can view until you revoke it.' : 'This link no longer opens the story.'}</Text></View><StatusBadge label={linkActive ? "ACTIVE" : "REVOKED"} tone={linkActive ? "green" : "gray"}/></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Copy private story link" disabled={!linkActive} onPress={() => linkActive && setLinkCopied(true)} style={[styles.linkBox,!linkActive&&{opacity:0.5}]}><Text style={styles.privateLink}>{linkActive ? (linkCopied ? 'Private link copied' : 'ambler.app/s/7KM4…') : 'Link revoked'}</Text><Ionicons name={linkActive ? (linkCopied ? "checkmark-circle-outline" : "copy-outline") : "close-circle-outline"} size={18} color={linkActive ? ui.violet : ui.muted}/></Pressable>
        <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label={linkActive ? "Revoke" : "Create new link"} onPress={() => { setLinkActive(!linkActive); setLinkCopied(false); }}/><PrimaryButton style={styles.flexButton} label="Share" icon="share-outline" onPress={() => linkActive && go('shared-web')}/></View>
      </Surface>
      <SectionTitle title="Save a copy" />
      <Surface>
        <Pressable onPress={() => setSavedTo('Home Server')}><IconRow icon="server-outline" title="Ambler Home Server" subtitle={savedTo==='Home Server' ? 'Saved · full story + originals' : 'Connected · save full story + originals'} tone="aqua" trailing={savedTo==='Home Server' ? <Ionicons name="checkmark-circle" size={20} color={ui.success}/> : <Ionicons name="download-outline" size={19} color={ui.muted}/>}/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => setSavedTo('PDF')}><IconRow icon="document-outline" title="PDF / print" subtitle={savedTo==='PDF' ? 'PDF prepared' : 'Save a printable story'} trailing={savedTo==='PDF' ? <Ionicons name="checkmark-circle" size={20} color={ui.success}/> : <Ionicons name="download-outline" size={19} color={ui.muted}/>}/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => setSavedTo('Story card')}><IconRow icon="image-outline" title="Story card" subtitle={savedTo==='Story card' ? 'Story card prepared' : 'Shareable image summary'} tone="pink" trailing={savedTo==='Story card' ? <Ionicons name="checkmark-circle" size={20} color={ui.success}/> : <Ionicons name="download-outline" size={19} color={ui.muted}/>}/></Pressable>
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
        <Pressable onPress={() => go('settings')}><IconRow icon="settings-outline" title="Settings" subtitle="Appearance, notifications and accessibility" chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('storage-hosting')}><IconRow icon="server-outline" title="Storage & Hosting" subtitle="Home Server connected" tone="aqua" chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('privacy-data')}><IconRow icon="shield-checkmark-outline" title="Privacy & Data" subtitle="Routes, sharing and account data" chevron/></Pressable>
      </Surface>
      <PrototypeNav active="profile" />
    </PrototypePage>
  );
}

function Settings() {
  const [panel, setPanel] = useState<'appearance'|'notifications'|'story'|'accessibility'|'about'|null>(null);
  const [appearance, setAppearance] = useState('System');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [storyLength, setStoryLength] = useState('Standard');
  const [autoplay, setAutoplay] = useState(true);
  const [reducedMotionPref, setReducedMotionPref] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const togglePanel = (next: typeof panel) => setPanel(panel === next ? null : next);
  return (
    <PrototypePage>
      <PrototypeHeader title="Settings" subtitle="Keep everyday controls simple." right={<ScreenBack />} />
      <Surface>
        <Pressable onPress={() => togglePanel('appearance')}><IconRow icon="contrast-outline" title="Appearance" subtitle={appearance + ' · dark/light'} chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => togglePanel('notifications')}><IconRow icon="notifications-outline" title="Notifications" subtitle={notificationsOn ? 'Invites, contributions and story ready' : 'Paused'} tone="pink" chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => togglePanel('story')}><IconRow icon="sparkles-outline" title="Story preferences" subtitle={storyLength + ' · ' + (autoplay ? 'autoplay on' : 'autoplay off')} chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('storage-hosting')}><IconRow icon="server-outline" title="Storage & Hosting" subtitle="Home Server + default storage" tone="aqua" chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => go('privacy-data')}><IconRow icon="shield-outline" title="Privacy & Data" subtitle="Default privacy and account data" chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => togglePanel('accessibility')}><IconRow icon="accessibility-outline" title="Accessibility" subtitle={reducedMotionPref || largerText ? 'Custom preferences' : 'Reduced motion and text'} chevron/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => togglePanel('about')}><IconRow icon="information-circle-outline" title="About Ambler" subtitle="Version, policies and acknowledgements" chevron/></Pressable>
      </Surface>
      {panel === 'appearance' ? <Surface tone="tint"><SectionTitle title="Appearance"/><View style={styles.chipRow}>{['System','Light','Dark'].map((item)=><Pressable key={item} onPress={() => setAppearance(item)}><Chip label={item} active={appearance===item}/></Pressable>)}</View></Surface> : null}
      {panel === 'notifications' ? <Surface tone="tint"><ToggleRow title="Ambler notifications" subtitle="Invites, contributions and Story Ready alerts" value={notificationsOn} onChange={setNotificationsOn}/></Surface> : null}
      {panel === 'story' ? <Surface tone="tint"><SectionTitle title="Default story length"/><View style={styles.chipRow}>{['Short','Standard','Epic'].map((item)=><Pressable key={item} onPress={() => setStoryLength(item)}><Chip label={item} active={storyLength===item}/></Pressable>)}</View><View style={styles.divider}/><ToggleRow title="Autoplay Relive" subtitle="Move through story pages automatically" value={autoplay} onChange={setAutoplay}/></Surface> : null}
      {panel === 'accessibility' ? <Surface tone="tint"><ToggleRow title="Prefer reduced motion" subtitle="Use calmer transitions in Ambler" value={reducedMotionPref} onChange={setReducedMotionPref}/><View style={styles.divider}/><ToggleRow title="Larger text" subtitle="Increase reading size where supported" value={largerText} onChange={setLargerText}/></Surface> : null}
      {panel === 'about' ? <Surface tone="tint"><Text style={styles.cardTitle}>Ambler 0.3.0</Text><Text style={styles.body}>Private shared event and journey storytelling. Policies and acknowledgements remain available from the production About screen.</Text></Surface> : null}
    </PrototypePage>
  );
}

function PrivacyData() {
  const [redact, setRedact] = useState(true);
  const [defaultPrivacy, setDefaultPrivacy] = useState<'Invited people only'|'Private link'>('Invited people only');
  const [exportStatus, setExportStatus] = useState('');
  const [deletionReview, setDeletionReview] = useState(false);
  return (
    <PrototypePage>
      <PrototypeHeader title="Privacy & Data" subtitle="Private-first defaults, with clear exceptions." right={<ScreenBack />} />
      <Surface>
        <View style={styles.inlineBetween}><View style={{flex:1}}><Text style={styles.rowTitle}>Hide sensitive route ends</Text><Text style={styles.rowMeta}>Redact precise start/end locations in shared stories.</Text></View><Switch accessibilityLabel="Hide sensitive route ends" value={redact} onValueChange={setRedact} trackColor={{true:ui.violet}}/></View>
        <View style={styles.divider}/>
        <Pressable onPress={() => setDefaultPrivacy(defaultPrivacy === 'Invited people only' ? 'Private link' : 'Invited people only')}><IconRow icon="lock-closed-outline" title="Default event privacy" subtitle={defaultPrivacy} trailing={<Text style={styles.rowAction}>Change</Text>}/></Pressable>
        <View style={styles.divider}/>
        <Pressable onPress={() => setExportStatus('Export preparation started')}><IconRow icon="download-outline" title="Export my data" subtitle={exportStatus || 'Prepare an account data export'} tone="aqua" trailing={exportStatus ? <Ionicons name="checkmark-circle-outline" size={20} color={ui.success}/> : <Text style={styles.rowAction}>Prepare</Text>}/></Pressable>
      </Surface>
      <Surface style={styles.dangerSurface}>
        <Text style={styles.dangerTitle}>Delete account</Text>
        <Text style={styles.body}>Ambler will explain the effect on owned events, cloud media, links and any Home Server copies it can manage before deletion.</Text>
        <SecondaryButton label={deletionReview ? "Review opened" : "Review deletion"} icon="trash-outline" onPress={() => setDeletionReview(true)}/>
        {deletionReview ? <Text style={styles.dangerNote}>Deleting your account would remove Ambler-managed cloud data and revoke private links. Home Server copies are handled separately and are never silently erased.</Text> : null}
      </Surface>
    </PrototypePage>
  );
}

function StorageHosting() {
  const [destination, setDestination] = useState<'server' | 'cloud' | 'device'>('server');
  return (
    <PrototypePage>
      <PrototypeHeader title="Storage & Hosting" subtitle="Use Ambler normally, or keep your stories on your own server." right={<ScreenBack />} />
      <LinearGradient colors={['#E9FFF4','#F5FFFB','#EAF9FF']} style={styles.serverHero}>
        <View style={styles.serverHeroGlow}/>
        <View style={styles.inlineBetween}>
          <View style={styles.serverHeroIcon}><Ionicons name="server-outline" size={24} color="#087B86"/></View>
          <StatusBadge label="ONLINE" tone="green"/>
        </View>
        <View><Text style={styles.serverHeroEyebrow}>YOUR PRIVATE LIBRARY</Text><Text style={styles.serverHeroTitle}>Ambler Home</Text><Text style={styles.rowMeta}>Last sync 4 minutes ago · local + remote access</Text></View>
        <View style={styles.storageBar}><View style={[styles.storageFill,{width:'38%'}]}/></View>
        <View style={styles.inlineBetween}><Text style={styles.rowMeta}>386 GB used</Text><Text style={styles.rowMeta}>614 GB free</Text></View>
        <PrimaryButton label="Manage server" icon="arrow-forward" onPress={() => go('server-detail')}/>
      </LinearGradient>
      <SectionTitle title="Default story destination" />
      <Surface>
        <Pressable style={styles.radioRow} onPress={() => setDestination('server')}><View style={destination==='server'?styles.radioActive:styles.radio}>{destination==='server'?<View style={styles.radioInner}/>:null}</View><View style={{flex:1}}><Text style={styles.rowTitle}>My Ambler Server</Text><Text style={styles.rowMeta}>Full story + selected original media</Text></View><Ionicons name="server-outline" size={20} color={ui.aqua}/></Pressable>
        <View style={styles.divider}/>
        <Pressable style={styles.radioRow} onPress={() => setDestination('cloud')}><View style={destination==='cloud'?styles.radioActive:styles.radio}>{destination==='cloud'?<View style={styles.radioInner}/>:null}</View><View style={{flex:1}}><Text style={styles.rowTitle}>Ambler Cloud</Text><Text style={styles.rowMeta}>Managed storage</Text></View></Pressable>
        <View style={styles.divider}/>
        <Pressable style={styles.radioRow} onPress={() => setDestination('device')}><View style={destination==='device'?styles.radioActive:styles.radio}>{destination==='device'?<View style={styles.radioInner}/>:null}</View><View style={{flex:1}}><Text style={styles.rowTitle}>This device</Text><Text style={styles.rowMeta}>Local-only where supported</Text></View></Pressable>
      </Surface>
      <SecondaryButton label="Add another server" icon="add" onPress={() => go('add-server')}/>
    </PrototypePage>
  );
}

function AddServer() {
  const [method, setMethod] = useState<'discover' | 'qr' | 'manual'>('discover');
  const [manualAddress, setManualAddress] = useState('http://ambler-home.local');
  return (
    <PrototypePage>
      <PrototypeHeader eyebrow="Ambler Home Server" title="Connect your own storage." subtitle="We’ll try local discovery first. QR and manual address are always available." right={<ScreenBack />} />
      <Surface>
        <View style={styles.serverDiscovery}>
          <View style={styles.serverLottieWrap}>
            <LottieAccent kind="server-discovery" size={164} />
            <View style={styles.serverLottieIcon}><Ionicons name="server-outline" size={25} color="#FFFFFF"/></View>
          </View>
          <Text style={styles.cardTitle}>Searching your local network…</Text>
          <Text style={styles.rowMeta}>1 Ambler server found</Text>
        </View>
      </Surface>
      <Surface style={styles.serverFound}>
        <View style={styles.inlineBetween}><View><Text style={styles.cardTitle}>Ambler Home</Text><Text style={styles.rowMeta}>192.168.1.44 · local network</Text></View><StatusBadge label="FOUND" tone="aqua"/></View>
        <PrimaryButton label="Connect securely" onPress={() => go('server-detail')}/>
      </Surface>
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label={method==='qr' ? "QR ready" : "Scan QR"} icon="qr-code-outline" onPress={() => setMethod('qr')}/><SecondaryButton style={styles.flexButton} label={method==='manual' ? "Address entry" : "Enter address"} icon="create-outline" onPress={() => setMethod('manual')}/></View>
      {method === 'qr' ? <Surface tone="tint"><Text style={styles.cardTitle}>Scan the QR shown by your Ambler Server</Text><Text style={styles.body}>The server QR contains the connection details without exposing a raw token.</Text><View style={styles.qrPlaceholder}><Ionicons name="qr-code-outline" size={58} color={ui.violet}/></View></Surface> : null}
      {method === 'manual' ? <Surface tone="tint"><Text style={styles.cardTitle}>Enter your Ambler Server address</Text><Text style={styles.body}>Manual setup is available for advanced/network configurations.</Text><TextInput value={manualAddress} onChangeText={setManualAddress} placeholder="https://ambler-home.local" placeholderTextColor={ui.muted} autoCapitalize="none" style={styles.input}/><PrimaryButton label="Connect address" onPress={() => manualAddress.trim() && go('server-detail')}/></Surface> : null}
    </PrototypePage>
  );
}

function ServerDetail() {
  const [syncing, setSyncing] = useState(false);
  const [tested, setTested] = useState(false);
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
      <View style={styles.twoButtons}><SecondaryButton style={styles.flexButton} label={tested ? "Connection good" : "Test connection"} icon={tested ? "checkmark-circle-outline" : undefined} onPress={() => setTested(true)}/><PrimaryButton style={styles.flexButton} label={syncing ? "Syncing…" : "Sync now"} icon="sync-outline" onPress={() => setSyncing(!syncing)}/></View>
    </PrototypePage>
  );
}

function ToggleRow({title,subtitle,value,onChange}:{title:string;subtitle:string;value:boolean;onChange?:(value:boolean)=>void}) {
  const [internal,setInternal]=useState(value);
  const on = onChange ? value : internal;
  const update = (next:boolean) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };
  return <View style={styles.inlineBetween}><View style={{flex:1}}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowMeta}>{subtitle}</Text></View><Switch accessibilityLabel={title} value={on} onValueChange={update} trackColor={{true:ui.violet}}/></View>;
}

const styles = StyleSheet.create({
  scenicMedia: { overflow:'hidden',position:'relative',alignItems:'center',justifyContent:'center' },
  scenicLight: { position:'absolute',width:160,height:160,borderRadius:80,right:-45,top:-55,backgroundColor:'rgba(255,255,255,0.10)' },
  mountainBack: { position:'absolute',width:180,height:180,backgroundColor:'rgba(7,35,42,0.44)',left:-35,bottom:-115,transform:[{rotate:'45deg'}],borderRadius:18 },
  mountainFront: { position:'absolute',width:210,height:210,backgroundColor:'rgba(9,52,57,0.62)',right:-60,bottom:-145,transform:[{rotate:'45deg'}],borderRadius:20 },
  scenicSun: { position:'absolute',right:'18%',top:'17%',width:28,height:28,borderRadius:14,backgroundColor:'rgba(255,232,174,0.82)' },
  mountainTrail: { position:'absolute',left:'29%',bottom:'23%',width:'52%',height:3,borderRadius:2,backgroundColor:'rgba(255,228,169,0.70)',transform:[{rotate:'-18deg'}] },
  citySkyline: { position:'absolute',left:0,right:0,bottom:0,height:92,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-around',paddingHorizontal:10 },
  cityBuilding: { width:'12%',backgroundColor:'rgba(10,6,36,0.66)',borderTopLeftRadius:4,borderTopRightRadius:4 },
  venueArc: { position:'absolute',width:190,height:190,borderRadius:95,borderWidth:16,borderColor:'rgba(255,255,255,0.13)',bottom:-94,right:-40 },
  venueArcInner: { position:'absolute',width:120,height:120,borderRadius:60,borderWidth:7,borderColor:'rgba(255,210,90,0.26)',bottom:-58,right:-6 },
  venueTrack: { position:'absolute',left:'16%',top:'30%',width:'68%',height:5,borderRadius:3,backgroundColor:'rgba(255,255,255,0.42)',transform:[{rotate:'-13deg'}] },
  confettiDot: { position:'absolute',width:10,height:10,borderRadius:5 },
  confettiBar: { position:'absolute',width:9,height:30,borderRadius:5,transform:[{rotate:'28deg'}] },
  videoPlayBadge: { width:34,height:34,borderRadius:17,backgroundColor:'rgba(15,6,44,0.68)',borderWidth:1,borderColor:'rgba(255,255,255,0.20)',alignItems:'center',justifyContent:'center' },
  previewGlass: { paddingHorizontal:14,paddingVertical:11,borderRadius:17,backgroundColor:'rgba(15,6,44,0.38)',borderWidth:1,borderColor:'rgba(255,255,255,0.18)',alignItems:'center',gap:5 },
  viewerPlay: { width:64,height:64,borderRadius:32,backgroundColor:'rgba(15,6,44,0.52)',borderWidth:1,borderColor:'rgba(255,255,255,0.24)',alignItems:'center',justifyContent:'center' },
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
  twoButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flexButton: { flexGrow: 1, flexBasis: 150 },
  divider: { height: 1, backgroundColor: ui.line },
  indexRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  journeyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resilienceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  resilienceCard: { flexGrow: 1, flexBasis: 250, minHeight: 170 },
  stateIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stateAction: { color: ui.violet, fontSize: 11, fontWeight: '900', marginTop: 'auto' },
  journeyCard: { width: '48%', minHeight: 122, backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#E7E0F1', padding: 14, gap: 7, shadowColor: ui.shadow, shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: {width:0,height:6}, elevation: 2 },
  journeyIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  journeyTitle: { color: ui.ink, fontSize: 13, fontWeight: '900' },
  journeyMeta: { color: ui.muted, fontSize: 10, lineHeight: 14, fontWeight: '600' },
  topActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandMini: { color: ui.ink, fontSize: 20, fontWeight: '900' },
  brandMiniDark: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  linkText: { color: ui.violet, fontSize: 13, fontWeight: '900' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoOrb: { width: 112, height: 112, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: ui.violet, shadowColor: ui.pink, shadowOpacity: 0.3, shadowRadius: 26, elevation: 8 },
  logoMark: { width: 72, height: 72 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMarkMini: { width: 24, height: 24 },
  splashBrand: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', letterSpacing: -1.5 },
  splashTag: { color: 'rgba(255,255,255,0.62)', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  onboardVisual: { height: 310, borderRadius: 34, overflow: 'hidden', position: 'relative' },
  floatPhoto: { position: 'absolute', width: 110, height: 136, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  routeLine: { position: 'absolute', left: '28%', right: '22%', top: '62%', height: 5, borderRadius: 3, backgroundColor: ui.aqua, transform: [{ rotate: '-16deg' }] },
  routeDot: { position: 'absolute', right: '20%', top: '52%', width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 5, borderColor: ui.aqua },
  onboardHeroIcon: { position: 'absolute', left: '42%', top: '39%', width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
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
  input: { minHeight: 54, borderRadius: 18, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4DDED', color: ui.ink, fontSize: 15, fontWeight: '700', shadowColor:ui.shadow,shadowOpacity:0.03,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:1 },
  inputError: { borderColor: ui.danger, backgroundColor: '#FFF8FA' },
  errorText: { color: ui.danger, fontSize: 11, fontWeight: '700', marginTop: -4 },
  helper: { color: ui.muted, fontSize: 11, fontWeight: '600' },
  legal: { color: ui.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', fontWeight: '600' },
  orRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  orLine: { flex: 1, height: 1, backgroundColor: ui.line },
  orText: { color: ui.muted, fontSize: 11, fontWeight: '700' },
  avatarLarge: { alignSelf: 'center', width: 108, height: 108, borderRadius: 38, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarEdit: { position: 'absolute', right: -3, bottom: -3, width: 34, height: 34, borderRadius: 17, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: ui.soft },
  avatarSmall: { width: 42, height: 42, borderRadius: 15, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  avatarSelectedText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  liveHero: { minHeight: 354, borderRadius: 32, padding: 21, justifyContent: 'space-between', overflow: 'hidden', shadowColor: '#25105C', shadowOpacity: 0.32, shadowRadius: 26, shadowOffset: {width:0,height:14}, elevation: 8 },
  heroGlowA: { position:'absolute', width:230,height:230,borderRadius:115,right:-70,top:-80,backgroundColor:'rgba(24,199,213,0.16)' },
  heroGlowB: { position:'absolute', width:180,height:180,borderRadius:90,left:-60,bottom:-80,backgroundColor:'rgba(236,63,164,0.13)' },
  heroRouteOne: { position:'absolute',width:170,height:3,borderRadius:2,right:18,top:120,backgroundColor:'rgba(255,255,255,0.16)' },
  heroRouteTwo: { position:'absolute',width:120,height:3,borderRadius:2,right:64,top:166,backgroundColor:'rgba(24,199,213,0.75)' },
  heroRouteDot: { position:'absolute',right:82,top:143,width:14,height:14,borderRadius:7,backgroundColor:'#FFFFFF',borderWidth:4,borderColor:ui.aqua },
  livePill: { flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:10,paddingVertical:7,borderRadius:14,backgroundColor:'rgba(6,255,150,0.12)',borderWidth:1,borderColor:'rgba(92,255,174,0.18)' },
  livePillText: { color:'#D8FFE9',fontSize:9,fontWeight:'900',letterSpacing:1.1 },
  heroMiddle: { flexDirection:'row',alignItems:'center',justifyContent:'space-between' },
  heroQuickMenu: { position:'absolute',right:18,top:56,zIndex:20,minWidth:170,borderRadius:16,padding:8,backgroundColor:'rgba(16,7,44,0.96)',borderWidth:1,borderColor:'rgba(255,255,255,0.14)',shadowColor:'#000',shadowOpacity:0.28,shadowRadius:14,elevation:8 },
  heroQuickMenuItem: { color:'#FFFFFF',fontSize:12,fontWeight:'800',paddingHorizontal:10,paddingVertical:9 },
  liveHeroIcon: { width:70,height:70,borderRadius:24,backgroundColor:'rgba(255,255,255,0.11)',borderWidth:1,borderColor:'rgba(255,255,255,0.16)',alignItems:'center',justifyContent:'center' },
  contributorStack: { flexDirection:'row',alignItems:'center' },
  contributorBubble: { width:34,height:34,borderRadius:13,backgroundColor:'#5B2CFF',borderWidth:2,borderColor:'rgba(255,255,255,0.92)',alignItems:'center',justifyContent:'center' },
  contributorBubbleText: { color:'#FFFFFF',fontSize:8,fontWeight:'900' },
  liveHeroEyebrow: { color:'rgba(255,255,255,0.50)',fontSize:9,fontWeight:'900',letterSpacing:1.4,marginBottom:5 },
  liveHeroTitle: { color: '#FFFFFF', fontSize: 30, lineHeight: 33, fontWeight: '900', letterSpacing:-0.8 },
  liveHeroMeta: { color: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: '700', marginTop: 6 },
  storyGrid: { gap: 14 },
  storyGridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  storyGridItem: { gap: 8, flexGrow: 1, flexBasis: 220 },
  storageMeta: { color: ui.muted, fontSize: 10, fontWeight: '800' },
  navBar: { minHeight: 70, backgroundColor: 'rgba(255,255,255,0.97)', borderWidth: 1, borderColor: '#E8E1F2', borderRadius: 27, paddingHorizontal: 9, paddingVertical:7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 6, position: 'relative', shadowColor:ui.shadow,shadowOpacity:0.09,shadowRadius:20,shadowOffset:{width:0,height:10},elevation:5 },
  navItem: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 54, minHeight:48, borderRadius:17,paddingHorizontal:8 },
  navItemActive: { backgroundColor:'#F0EBFF' },
  navLabel: { color: '#8D849D', fontSize: 9, fontWeight: '800' },
  navLabelActive: { color: ui.violet },
  createFabHalo: { width:56,height:56,borderRadius:21,backgroundColor:'rgba(91,44,255,0.12)',alignItems:'center',justifyContent:'center',marginHorizontal:2 },
  createFab: { width:50,height:50,borderRadius:19,overflow:'hidden',shadowColor:ui.violet,shadowOpacity:0.35,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:7 },
  createFabGradient: { flex:1,alignItems:'center',justifyContent:'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchBox: { minHeight: 50, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4DDED', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15, shadowColor:ui.shadow,shadowOpacity:0.035,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:1 },
  searchPlaceholder: { color: ui.muted, fontSize: 13, fontWeight: '600' },
  searchInput: { flex: 1, color: ui.ink, fontSize: 13, fontWeight: '600', paddingVertical: 0 },
  fieldSurface: { padding: 6 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionCard: { width: '48%', minHeight: 142, backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#E6DFEF', padding: 15, gap: 8, shadowColor:ui.shadow,shadowOpacity:0.04,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:1 },
  optionCardActive: { borderColor: '#7958FF', borderWidth: 2, backgroundColor: '#FBF9FF', shadowColor:ui.violet,shadowOpacity:0.13,shadowRadius:14,elevation:3 },
  optionIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center', borderWidth:1,borderColor:'rgba(91,44,255,0.08)' },
  optionTitle: { color: ui.ink, fontSize: 14, fontWeight: '900' },
  optionMeta: { color: ui.muted, fontSize: 10, fontWeight: '600' },
  themeCard: { minHeight: 128, borderRadius: 26, padding: 18, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', overflow:'hidden', shadowColor:'#16083D',shadowOpacity:0.16,shadowRadius:16,shadowOffset:{width:0,height:8},elevation:4 },
  themeCardSelected: { borderWidth: 3, borderColor: '#55E3EC', shadowColor:ui.aqua,shadowOpacity:0.28,shadowRadius:18,elevation:6 },
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
  eventHero: { minHeight: 326, borderRadius: 32, padding: 20, justifyContent: 'space-between', overflow:'hidden',shadowColor:'#0D3D43',shadowOpacity:0.28,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:7 },
  eventHeroGlow: { position:'absolute',width:220,height:220,borderRadius:110,right:-70,top:-80,backgroundColor:'rgba(24,199,213,0.17)' },
  eventRouteOne: { position:'absolute',left:30,top:130,width:150,height:4,borderRadius:2,backgroundColor:'rgba(24,199,213,0.78)' },
  eventRouteTwo: { position:'absolute',left:150,top:102,width:120,height:4,borderRadius:2,backgroundColor:'rgba(255,255,255,0.22)' },
  eventRoutePoint: { position:'absolute',left:155,top:106,width:16,height:16,borderRadius:8,backgroundColor:'#FFFFFF',borderWidth:4,borderColor:ui.aqua },
  eventHeroEyebrow: { color:'rgba(255,255,255,0.52)',fontSize:9,fontWeight:'900',letterSpacing:1.4,marginBottom:5 },
  eventHeroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', letterSpacing:-0.6 },
  eventHeroMeta: { color: 'rgba(255,255,255,0.70)', fontSize: 12, fontWeight: '700', marginTop: 5 },
  eventHeroFooter: { flexDirection:'row',alignItems:'center',gap:10 },
  eventHeroPeople: { color:'rgba(255,255,255,0.64)',fontSize:10,fontWeight:'800' },
  statRow: { flexDirection: 'row', gap: 10 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterCount: { color: ui.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  mediaTile: { width: '31%', aspectRatio: 1, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth:1,borderColor:'rgba(255,255,255,0.72)', shadowColor:ui.shadow,shadowOpacity:0.08,shadowRadius:10,shadowOffset:{width:0,height:5},elevation:2 },
  mediaTileTall: { aspectRatio: 0.82 },
  mediaContributor: { position: 'absolute', left: 6, bottom: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(15,6,44,0.74)', alignItems: 'center', justifyContent: 'center' },
  mediaContributorText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  captureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  captureChoice: { width: '48%', minHeight: 136, borderRadius: 24, borderWidth: 1, borderColor: '#E6DFEF', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor:ui.shadow,shadowOpacity:0.04,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:2 },
  captureChoiceActive: { borderColor: '#7958FF', borderWidth: 2, backgroundColor: '#FBF9FF', shadowColor:ui.violet,shadowOpacity:0.14,shadowRadius:14,elevation:3 },
  captureTitle: { color: ui.ink, fontSize: 13, fontWeight: '900' },
  uploadPreview: { height: 210, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewModeLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
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
  successTitle: { color: ui.ink, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  uploadRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  uploadThumb: { width: 52, height: 52, borderRadius: 15, backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center' },
  storyLengthGrid: { flexDirection: 'row', gap: 8 },
  lengthPressable: { flex: 1 },
  lengthCard: { flex: 1, padding: 13, minHeight: 104, borderRadius:20 },
  lengthCardActive: { borderColor: ui.violet, borderWidth: 2, backgroundColor: '#FBF9FF', shadowColor:ui.violet,shadowOpacity:0.12,shadowRadius:12,elevation:2 },
  lengthName: { color: ui.ink, fontSize: 15, fontWeight: '900' },
  generationLottieWrap: { width: 132, height: 132, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  generationTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  generationSubtitle: { color: 'rgba(255,255,255,0.60)', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  generationList: { gap: 12, marginTop: 22, alignSelf: 'stretch', paddingHorizontal: 24 },
  generationStep: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  generationDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  generationDotActive: { backgroundColor: ui.violet },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  generationStepText: { color: 'rgba(255,255,255,0.36)', fontSize: 13, fontWeight: '800' },
  readyBackdrop: { flex: 1, borderRadius: 34, padding: 24, justifyContent: 'space-between', alignItems: 'center', gap: 12, overflow: 'hidden',shadowColor:'#5B2CFF',shadowOpacity:0.30,shadowRadius:28,shadowOffset:{width:0,height:14},elevation:8 },
  readyHalo: { position: 'absolute', width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(24,199,213,0.15)', top: -100, right: -120 },
  readyHaloTwo: { position:'absolute',width:240,height:240,borderRadius:120,left:-90,bottom:-100,backgroundColor:'rgba(236,63,164,0.15)' },
  readyRouteOne: { position:'absolute',width:190,height:3,borderRadius:2,right:18,top:150,backgroundColor:'rgba(255,255,255,0.16)' },
  readyRouteTwo: { position:'absolute',width:120,height:3,borderRadius:2,right:80,top:196,backgroundColor:'rgba(24,199,213,0.72)' },
  readyRouteDot: { position:'absolute',right:94,top:175,width:14,height:14,borderRadius:7,backgroundColor:'#FFFFFF',borderWidth:4,borderColor:ui.aqua },
  readyTopline: { width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'space-between' },
  readyDate: { color:'rgba(255,255,255,0.44)',fontSize:8,fontWeight:'900',letterSpacing:1.1 },
  readyEyebrow: { color: 'rgba(255,255,255,0.58)', fontSize: 9, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  readyArt: { width: 126, height: 126, borderRadius: 42, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  readyArtRing: { position:'absolute',width:98,height:98,borderRadius:49,borderWidth:1,borderColor:'rgba(255,255,255,0.16)' },
  readyCopy: { alignItems:'center',gap:7 },
  readyTitle: { color: '#FFFFFF', fontSize: 36, lineHeight:39,fontWeight: '900', textAlign: 'center', letterSpacing: -1.2 },
  readySubtitle: { color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight:19,fontWeight: '700',textAlign:'center' },
  readyDivider: { width:44,height:2,borderRadius:1,backgroundColor:'rgba(255,255,255,0.36)' },
  readyStats: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  readyStoryPill: { flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:11,paddingVertical:7,borderRadius:14,backgroundColor:'rgba(24,199,213,0.10)',borderWidth:1,borderColor:'rgba(24,199,213,0.22)' },
  readyStoryPillText: { color:'#CCFBFF',fontSize:9,fontWeight:'900',letterSpacing:1.2 },
  storyChrome: { flexDirection: 'row', gap: 10, alignItems: 'center', zIndex: 5 },
  storyMenu: { position: 'absolute', right: 20, top: 76, zIndex: 20, minWidth: 150, borderRadius: 16, padding: 10, gap: 4, backgroundColor: '#21163E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  storyMenuItem: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', paddingVertical: 9, paddingHorizontal: 8 },
  storyProgressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  storyProgressFill: { height: '100%', backgroundColor: '#FFFFFF' },
  reliveCanvas: { flex: 1, minHeight: 540, borderRadius: 32, padding: 22, justifyContent: 'space-between', overflow: 'hidden',shadowColor:'#0D3D43',shadowOpacity:0.28,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:7 },
  reliveGlow: { position:'absolute',width:260,height:260,borderRadius:130,right:-100,top:-100,backgroundColor:'rgba(24,199,213,0.12)' },
  reliveChapter: { color: ui.aqua, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  reliveTime: { color:'rgba(255,255,255,0.42)',fontSize:9,fontWeight:'800' },
  reliveTitle: { color: '#FFFFFF', fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1.05,maxWidth:520 },
  reliveMediaStage: { flexDirection:'row',height:230,gap:8 },
  reliveMainPhoto: { flex:1,borderRadius:24,overflow:'hidden',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.11)' },
  reliveSideStrip: { width:86,gap:8 },
  reliveSidePhoto: { flex:1,borderRadius:18,overflow:'hidden',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.10)' },
  mediaCountPill: { position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(15,6,44,0.74)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,borderWidth:1,borderColor:'rgba(255,255,255,0.12)' },
  mediaCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  reliveQuoteRow: { flexDirection:'row',gap:11,alignItems:'stretch' },
  quoteBar: { width:3,borderRadius:2,backgroundColor:ui.aqua },
  reliveCaption: { flex:1,color: 'rgba(255,255,255,0.76)', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  reliveByline: { flexDirection:'row',alignItems:'center',gap:9 },
  reliveBylineText: { color:'rgba(255,255,255,0.50)',fontSize:9,fontWeight:'800' },
  reliveFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storyPosition: { color: 'rgba(255,255,255,0.54)', fontSize: 11, fontWeight: '800' },
  routeNext: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  routeNextText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  replayMap: { flex: 1, minHeight: 470, borderRadius: 30, overflow: 'hidden', position: 'relative' },
  terrainA: { position: 'absolute', width: 300, height: 160, borderRadius: 150, backgroundColor: 'rgba(67,120,90,0.50)', left: -70, bottom: -50, transform: [{rotate:'10deg'}] },
  terrainB: { position: 'absolute', width: 300, height: 210, borderRadius: 150, backgroundColor: 'rgba(54,92,91,0.55)', right: -90, bottom: -60, transform: [{rotate:'-8deg'}] },
  terrainC: { position: 'absolute', width: 170, height: 130, borderRadius: 85, backgroundColor: 'rgba(98,137,105,0.32)', right: 40, top: 80 },
  contourReplayOne: { position:'absolute',width:260,height:170,borderRadius:130,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',left:-30,top:95,transform:[{rotate:'16deg'}] },
  contourReplayTwo: { position:'absolute',width:210,height:145,borderRadius:105,borderWidth:1,borderColor:'rgba(24,199,213,0.11)',right:-30,top:165,transform:[{rotate:'-18deg'}] },
  contourReplayThree: { position:'absolute',width:140,height:110,borderRadius:70,borderWidth:1,borderColor:'rgba(255,255,255,0.07)',right:62,top:54 },
  mapCompass: { position:'absolute',right:14,top:14,width:42,height:42,borderRadius:15,backgroundColor:'rgba(6,24,34,0.68)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center' },
  mapCompassText: { color:'rgba(255,255,255,0.60)',fontSize:7,fontWeight:'900',marginTop:-2 },
  replayRouteShadowA: { position:'absolute',left:'9%',top:'72%',width:'36%',height:12,borderRadius:6,backgroundColor:'rgba(14,165,233,0.18)',transform:[{rotate:'-27deg'}] },
  replayRouteShadowB: { position:'absolute',left:'37%',top:'52%',width:'30%',height:12,borderRadius:6,backgroundColor:'rgba(14,165,233,0.18)',transform:[{rotate:'-38deg'}] },
  replayRouteShadowC: { position:'absolute',left:'58%',top:'31%',width:'28%',height:12,borderRadius:6,backgroundColor:'rgba(14,165,233,0.18)',transform:[{rotate:'-25deg'}] },
  routeTravelDot: { position:'absolute',left:'54%',top:'42%',width:16,height:16,borderRadius:8,backgroundColor:'#FFFFFF',borderWidth:4,borderColor:'#F97316',shadowColor:'#F97316',shadowOpacity:0.75,shadowRadius:10,elevation:4 },
  replayRouteA: { position: 'absolute', left: '9%', top: '72%', width: '36%', height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  replayRouteB: { position: 'absolute', left: '37%', top: '52%', width: '30%', height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  replayRouteC: { position: 'absolute', left: '58%', top: '31%', width: '28%', height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  routeMoment: { position: 'absolute', width: 46, height: 46 },
  routeMomentPressable: { width: 46, height: 46 },
  routeMomentThumb: { width: 42, height: 42, borderRadius: 15, backgroundColor: ui.violet, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  clusterCount: { position: 'absolute', right: -4, top: -5, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: ui.pink, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  clusterCountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  routeLabel: { position: 'absolute', left: '27%', top: '61%', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(11,4,31,0.80)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',shadowColor:'#000',shadowOpacity:0.25,shadowRadius:10,elevation:4 },
  routeLabelTop: { flexDirection:'row',alignItems:'center',gap:6 },
  routeLabelTitle: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  routeLabelMeta: { color: 'rgba(255,255,255,0.58)', fontSize: 8, fontWeight: '700',marginTop:2 },
  mapAttributionPill: { position:'absolute',left:12,bottom:12,paddingHorizontal:9,paddingVertical:6,borderRadius:11,backgroundColor:'rgba(6,24,34,0.66)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)' },
  mapAttributionText: { color:'rgba(255,255,255,0.56)',fontSize:7,fontWeight:'900',letterSpacing:1.1 },
  replayInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  replayTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  replaySubtitle: { color: 'rgba(255,255,255,0.54)', fontSize: 10, fontWeight: '700' },
  replayControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  replayControl: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  replayControlActive: { backgroundColor: ui.aqua },
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
  coverChoices: { flexDirection:'row',flexWrap:'wrap',gap:8 },
  coverChoice: { flexGrow:1,flexBasis:100,gap:6,padding:7,borderRadius:16,borderWidth:1,borderColor:'#E4DDED',backgroundColor:'#FFFFFF' },
  coverChoiceActive: { borderColor:ui.violet,borderWidth:2,backgroundColor:'#FBF9FF' },
  coverChoiceArt: { height:64,borderRadius:12 },
  coverChoiceText: { color:ui.ink,fontSize:10,fontWeight:'800' },
  reorderStatus: { color:ui.muted,fontSize:10,fontWeight:'800',textAlign:'center' },
  editorPage: { minHeight: 54, paddingHorizontal: 13, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6DFEF', flexDirection: 'row', alignItems: 'center', gap: 10, shadowColor:ui.shadow,shadowOpacity:0.025,shadowRadius:8,shadowOffset:{width:0,height:3},elevation:1 },
  editorPageActive: { borderColor: ui.violet, backgroundColor: '#FBF9FF' },
  editorPageIndex: { color: ui.muted, width: 20, fontSize: 11, fontWeight: '900' },
  editorPageLabel: { flex: 1, color: ui.ink, fontSize: 12, fontWeight: '800' },
  themeMiniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeMiniPressable: { width: '48%' },
  themeMini: { width: '100%', minHeight: 98, borderRadius: 22, padding: 15, justifyContent: 'flex-end', overflow:'hidden', shadowColor:ui.shadow,shadowOpacity:0.08,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:2 },
  themeMiniSelected: { borderWidth: 3, borderColor: ui.aqua },
  themeMiniText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  musicIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#EFE9FF', alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center' },
  linkBox: { minHeight: 50, borderRadius: 17, backgroundColor: '#F4F0FA', borderWidth:1,borderColor:'#E4DDED', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  privateLink: { color: ui.ink, fontSize: 12, fontWeight: '800' },
  rowAction: { color: ui.violet, fontSize: 10, fontWeight: '900' },
  qrPlaceholder: { minHeight:120,borderRadius:20,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E6DFF0',alignItems:'center',justifyContent:'center' },
  webTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  webStoryTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 35, fontWeight: '900' },
  webStoryBody: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 21, fontWeight: '600' },
  darkCardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  darkMeta: { color: 'rgba(255,255,255,0.60)', fontSize: 10, fontWeight: '700', marginTop: 4 },
  profileHero: { alignItems: 'center', gap: 7, paddingVertical: 24, paddingHorizontal:18, borderRadius:28, backgroundColor:'rgba(255,255,255,0.72)', borderWidth:1,borderColor:'#E9E3F2', shadowColor:ui.shadow,shadowOpacity:0.045,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:1 },
  avatarXL: { width: 96, height: 96, borderRadius: 34, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', borderWidth:4,borderColor:'#EEE8FF', shadowColor:ui.violet,shadowOpacity:0.20,shadowRadius:18,shadowOffset:{width:0,height:8},elevation:4 },
  avatarXLText: { color: '#FFFFFF', fontSize: 25, fontWeight: '900' },
  profileName: { color: ui.ink, fontSize: 26, fontWeight: '900' },
  dangerSurface: { borderColor: '#F4C8D1', backgroundColor: '#FFF7F8' },
  dangerTitle: { color: ui.danger, fontSize: 16, fontWeight: '900' },
  dangerNote: { color: '#7F2940', fontSize: 11, lineHeight: 17, fontWeight: '700', paddingTop: 4 },
  storageBar: { height: 8, borderRadius: 4, backgroundColor: '#DCEDE5', overflow: 'hidden' },
  storageFill: { height: '100%', borderRadius: 4, backgroundColor: ui.success },
  serverDiscovery: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  serverLottieWrap: { width: 170, height: 170, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  serverLottieIcon: { position: 'absolute', width: 50, height: 50, borderRadius: 18, backgroundColor: ui.violet, alignItems: 'center', justifyContent: 'center', shadowColor: ui.violet, shadowOpacity: 0.24, shadowRadius: 14, elevation: 4 },
  serverFound: { borderColor: '#BFEAF0', backgroundColor: '#F4FEFF' },
  serverHero: { borderRadius:28,padding:18,gap:14,overflow:'hidden',borderWidth:1,borderColor:'#CBEFE0',shadowColor:'#0F766E',shadowOpacity:0.09,shadowRadius:18,shadowOffset:{width:0,height:8},elevation:3 },
  serverHeroGlow: { position:'absolute',width:180,height:180,borderRadius:90,right:-60,top:-70,backgroundColor:'rgba(24,199,213,0.10)' },
  serverHeroIcon: { width:50,height:50,borderRadius:18,backgroundColor:'rgba(24,199,213,0.12)',alignItems:'center',justifyContent:'center' },
  serverHeroEyebrow: { color:'#147A4D',fontSize:9,fontWeight:'900',letterSpacing:1.3,marginBottom:4 },
  serverHeroTitle: { color:ui.ink,fontSize:25,fontWeight:'900',letterSpacing:-0.6 },
});

