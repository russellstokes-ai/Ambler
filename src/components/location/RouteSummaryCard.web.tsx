import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { LocationPoint } from '../../features/location/locationTypes';
import {
  calculateRouteDistance,
  calculateRouteDuration,
  countPlacesVisited,
  detectStops,
} from '../../features/location/locationService';

interface RouteSummaryCardProps {
  route: LocationPoint[];
  accentColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textMutedColor?: string;
  showMap?: boolean;
  style?: ViewStyle;
  delayMs?: number;
}

function buildPlot(route: LocationPoint[]) {
  if (!route.length) return { path: '', points: [] as Array<{x:number;y:number}> };
  const lats = route.map((point) => point.latitude);
  const lngs = route.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);
  const points = route.map((point) => ({
    x: 8 + ((point.longitude - minLng) / lngSpan) * 84,
    y: 92 - ((point.latitude - minLat) / latSpan) * 84,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  return { path, points };
}

export function RouteSummaryCard({
  route,
  accentColor = '#5B2CFF',
  surfaceColor = '#FFFFFF',
  textColor = '#18122B',
  textMutedColor = '#746B8C',
  showMap = true,
  style,
}: RouteSummaryCardProps) {
  const stats = useMemo(() => ({
    distanceKm: route.length ? calculateRouteDistance(route) : 0,
    durationHours: route.length ? calculateRouteDuration(route) : 0,
    placesCount: route.length ? countPlacesVisited(route).length : 0,
    stopsCount: route.length ? detectStops(route).length : 0,
  }), [route]);

  const plot = useMemo(() => buildPlot(route), [route]);

  if (!route.length) return null;

  const durationLabel = stats.durationHours < 1
    ? `${Math.round(stats.durationHours * 60)} min`
    : `${stats.durationHours} h`;

  return (
    <View style={[styles.card, { backgroundColor: surfaceColor }, style]}>
      {showMap ? (
        <View style={styles.mapWrap}>
          <View style={styles.gridA}/><View style={styles.gridB}/><View style={styles.gridC}/>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Path d={plot.path} fill="none" stroke="rgba(91,44,255,0.16)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={plot.path} fill="none" stroke={accentColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            {plot.points.length ? <Circle cx={plot.points[0]!.x} cy={plot.points[0]!.y} r={2.5} fill="#FFFFFF" stroke={accentColor} strokeWidth={1.2}/> : null}
            {plot.points.length > 1 ? <Circle cx={plot.points[plot.points.length - 1]!.x} cy={plot.points[plot.points.length - 1]!.y} r={2.5} fill={accentColor} stroke="#FFFFFF" strokeWidth={1.2}/> : null}
          </Svg>
          <View style={styles.mapPill}><Text style={styles.mapPillText}>ROUTE SUMMARY</Text></View>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <Stat icon="navigate-outline" label="Distance" value={`${stats.distanceKm} km`} accent={accentColor} text={textColor} muted={textMutedColor}/>
        <Stat icon="time-outline" label="Duration" value={durationLabel} accent={accentColor} text={textColor} muted={textMutedColor}/>
        <Stat icon="location-outline" label="Places" value={String(stats.placesCount)} accent={accentColor} text={textColor} muted={textMutedColor}/>
        <Stat icon="flag-outline" label="Stops" value={String(stats.stopsCount)} accent={accentColor} text={textColor} muted={textMutedColor}/>
      </View>
    </View>
  );
}

function Stat({icon,label,value,accent,text,muted}:{icon:keyof typeof Ionicons.glyphMap;label:string;value:string;accent:string;text:string;muted:string}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon,{backgroundColor:`${accent}14`}]}><Ionicons name={icon} size={15} color={accent}/></View>
      <Text style={[styles.statValue,{color:text}]}>{value}</Text>
      <Text style={[styles.statLabel,{color:muted}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E8E1F8', shadowColor: '#23104F', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: {width:0,height:8} },
  mapWrap: { height: 180, backgroundColor: '#F1EDF8', position: 'relative', overflow: 'hidden', padding: 18 },
  gridA: { position: 'absolute', left: 0, right: 0, top: '25%', height: 1, backgroundColor: 'rgba(91,44,255,0.06)' },
  gridB: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(91,44,255,0.06)' },
  gridC: { position: 'absolute', left: 0, right: 0, top: '75%', height: 1, backgroundColor: 'rgba(91,44,255,0.06)' },
  mapPill: { position: 'absolute', left: 12, bottom: 12, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: 'rgba(15,6,44,0.76)' },
  mapPillText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  stat: { flexGrow: 1, flexBasis: 120, gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  statValue: { fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  statLabel: { fontSize: 10, fontWeight: '700' },
});
