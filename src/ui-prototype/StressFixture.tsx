import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Chip,
  PrimaryButton,
  SecondaryButton,
  Stat,
  StatusBadge,
  StoryArtwork,
  Surface,
  ui,
} from './kit';
import LottieAccent from './LottieAccent';

export default function StressFixture() {
  const [actionMessage, setActionMessage] = useState('');
  return (
    <ScrollView testID="ui-stress-fixture" contentContainerStyle={styles.page}>
      <Text style={styles.eyebrow}>TEMPORARY SIMULATION DATA</Text>
      <Text style={styles.title}>Ambler UI stress population</Text>
      <Text style={styles.subtitle}>This route deliberately contains awkward content and failure states. It is removed after the simulation pass.</Text>

      <Surface>
        <Text style={styles.sectionTitle}>Long content + wrapping</Text>
        <Text style={styles.longTitle}>Sophie's 40th Birthday Celebration at The Orangery — Family, Friends, School Reunion and Surprise Weekend Gathering</Text>
        <Text style={styles.body}>A deliberately verbose description with enough words to force multiple lines on a compact phone and expose clipping, bad fixed heights, weak spacing, ellipsis mistakes, or buttons that drift away from the content they belong to.</Text>
        <View style={styles.chips}><Chip label="Extremely long event category label" active/><Chip label="Route + media + notes"/><Chip label="Home Server"/></View>
        <View style={styles.actions}><SecondaryButton label="A secondary action with a long label" onPress={() => setActionMessage('Secondary action completed')}/><PrimaryButton label="Primary action that still must fit" onPress={() => setActionMessage('Primary action completed')}/></View>
      </Surface>

      <View style={styles.storyGrid}>
        <View style={styles.storyItem}><StoryArtwork compact title="One Quiet Afternoon" subtitle="One photo only · sparse story" icon="sunny-outline"/><StatusBadge label="1 PHOTO" tone="gray"/></View>
        <View style={styles.storyItem}><StoryArtwork compact title="Five-a-side Final" subtitle="Video-only story with a long match caption" icon="football-outline"/><StatusBadge label="VIDEO ONLY" tone="aqua"/></View>
        <View style={styles.storyItem}><StoryArtwork compact title="Walking the Thames" subtitle="Route-only story · no geotagged media to pin" icon="walk-outline"/><StatusBadge label="ROUTE ONLY" tone="gold"/></View>
      </View>

      <Surface>
        <Text style={styles.sectionTitle}>Large event</Text>
        <View style={styles.stats}><Stat value="187" label="Moments"/><Stat value="28" label="Videos"/><Stat value="19" label="People"/><Stat value="42.8 km" label="Route"/></View>
        <Text style={styles.body}>Tests the high-density event summary without pretending that all 187 moments render at once.</Text>
      </Surface>

      <Surface>
        <Text style={styles.sectionTitle}>Media failure states</Text>
        <View style={styles.mediaRow}>
          <View style={styles.missingThumb}><Ionicons name="image-outline" size={24} color={ui.muted}/><Text style={styles.failureLabel}>Thumbnail unavailable</Text></View>
          <View style={styles.mediaCopy}><Text style={styles.rowTitle}>summit_video_004.mp4</Text><Text style={styles.rowMeta}>Video poster failed · original is still safe</Text></View>
          <StatusBadge label="RETRY" tone="gold"/>
        </View>
        <View style={styles.divider}/>
        <View style={styles.mediaRow}>
          <View style={styles.failedThumb}><Ionicons name="cloud-offline-outline" size={24} color="#FFFFFF"/></View>
          <View style={styles.mediaCopy}><Text style={styles.rowTitle}>ridge_group_photo.heic</Text><Text style={styles.rowMeta}>Upload failed at 64% · successful items are not repeated</Text></View>
          <StatusBadge label="FAILED" tone="gray"/>
        </View>
      </Surface>

      <LinearGradient colors={['#0B041F','#25105C']} style={styles.darkCard}>
        <LottieAccent kind="story-building" size={90}/>
        <View style={styles.darkCopy}><Text style={styles.darkTitle}>Story generation interrupted</Text><Text style={styles.darkBody}>Timeline and route stages are safely persisted. Retry resumes from the failed story-build stage.</Text></View>
        <SecondaryButton label="Retry story build" dark onPress={() => setActionMessage('Story build retry queued')}/>
      </LinearGradient>

      <Surface>
        <Text style={styles.sectionTitle}>Route integrity</Text>
        <View style={styles.stateRow}><Ionicons name="map-outline" size={20} color={ui.violet}/><View style={styles.mediaCopy}><Text style={styles.rowTitle}>No route captured</Text><Text style={styles.rowMeta}>Story remains valid with no map chapter.</Text></View></View>
        <View style={styles.divider}/>
        <View style={styles.stateRow}><Ionicons name="warning-outline" size={20} color="#9C6500"/><View style={styles.mediaCopy}><Text style={styles.rowTitle}>GPS accuracy too low</Text><Text style={styles.rowMeta}>Ambler must not pin media to an invented location.</Text></View></View>
      </Surface>

      <Surface>
        <Text style={styles.sectionTitle}>Sharing + privacy</Text>
        <View style={styles.stateRow}><Ionicons name="link-outline" size={20} color={ui.muted}/><View style={styles.mediaCopy}><Text style={styles.rowTitle}>Private link revoked</Text><Text style={styles.rowMeta}>The previous URL no longer opens the story.</Text></View><StatusBadge label="REVOKED" tone="gray"/></View>
        <View style={styles.divider}/>
        <View style={styles.stateRow}><Ionicons name="time-outline" size={20} color="#9C6500"/><View style={styles.mediaCopy}><Text style={styles.rowTitle}>Invite expired</Text><Text style={styles.rowMeta}>Ask the organiser for a new private invite.</Text></View><StatusBadge label="EXPIRED" tone="gold"/></View>
      </Surface>

      <Surface>
        <View style={styles.inlineBetween}><Text style={styles.sectionTitle}>Ambler Home</Text><StatusBadge label="RECONNECTING" tone="aqua"/></View>
        <LottieAccent kind="server-discovery" size={100}/>
        <Text style={styles.rowTitle}>Storage nearly full</Text>
        <View style={styles.storageTrack}><View style={styles.storageFill}/></View>
        <View style={styles.inlineBetween}><Text style={styles.rowMeta}>980 GB used</Text><Text style={styles.rowMeta}>20 GB free</Text></View>
        <Text style={styles.body}>New stories stay on this device until the server reconnects and confirms persistence.</Text>
      </Surface>

      <Surface>
        <Text style={styles.sectionTitle}>No server configured</Text>
        <Text style={styles.body}>Ambler continues normally without a Home Server. Self-hosting stays optional.</Text>
        <PrimaryButton label="Add Ambler Server" onPress={() => setActionMessage('Server setup opened')}/>
      </Surface>

      {actionMessage ? <Surface tone="tint"><Text style={styles.rowTitle}>{actionMessage}</Text></Surface> : null}
      <View style={styles.completed}>
        <LottieAccent kind="completion" size={76} loop={false}/>
        <Text style={styles.rowTitle}>Temporary fixture reached the end</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{width:'100%',maxWidth:1180,alignSelf:'center',padding:20,paddingBottom:50,gap:18,backgroundColor:'#F8F6FC'},
  eyebrow:{color:ui.violet,fontSize:10,fontWeight:'900',letterSpacing:1.5},
  title:{color:ui.ink,fontSize:32,lineHeight:36,fontWeight:'900',letterSpacing:-1},
  subtitle:{color:ui.muted,fontSize:14,lineHeight:21,fontWeight:'600'},
  sectionTitle:{color:ui.ink,fontSize:18,fontWeight:'900'},
  longTitle:{color:ui.ink,fontSize:24,lineHeight:29,fontWeight:'900'},
  body:{color:ui.muted,fontSize:13,lineHeight:20,fontWeight:'600'},
  rowTitle:{color:ui.ink,fontSize:14,fontWeight:'900'},
  rowMeta:{color:ui.muted,fontSize:11,lineHeight:16,fontWeight:'600'},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:8},
  actions:{flexDirection:'row',flexWrap:'wrap',gap:10},
  storyGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},
  storyItem:{flexGrow:1,flexBasis:230,gap:8},
  stats:{flexDirection:'row',flexWrap:'wrap',gap:12},
  mediaRow:{flexDirection:'row',alignItems:'center',gap:12},
  mediaCopy:{flex:1,minWidth:0,gap:3},
  missingThumb:{width:74,height:74,borderRadius:16,backgroundColor:'#F0EDF5',alignItems:'center',justifyContent:'center',padding:6},
  failedThumb:{width:74,height:74,borderRadius:16,backgroundColor:'#6B3653',alignItems:'center',justifyContent:'center'},
  failureLabel:{color:ui.muted,fontSize:8,fontWeight:'800',textAlign:'center',marginTop:3},
  divider:{height:1,backgroundColor:'#E8E1F8'},
  darkCard:{borderRadius:26,padding:18,gap:12,alignItems:'center'},
  darkCopy:{alignItems:'center',gap:5},
  darkTitle:{color:'#FFFFFF',fontSize:20,fontWeight:'900',textAlign:'center'},
  darkBody:{color:'rgba(255,255,255,0.68)',fontSize:12,lineHeight:18,fontWeight:'600',textAlign:'center'},
  stateRow:{flexDirection:'row',alignItems:'center',gap:12},
  inlineBetween:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
  storageTrack:{height:10,borderRadius:5,backgroundColor:'#EEEAF7',overflow:'hidden'},
  storageFill:{width:'98%',height:'100%',backgroundColor:'#D92D4C'},
  completed:{alignItems:'center',gap:6,paddingVertical:8},
});
