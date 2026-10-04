import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import {
  eventTypeDefs,
  EventTypeKey,
  EventCategory,
  categoryMeta,
  EventTypeDefinition,
} from '../../features/events/eventTypes';

// ─── Category Tabs ────────────────────────────────────────────

const CATEGORY_TABS: { key: EventCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'social', label: 'Social' },
  { key: 'travel', label: 'Travel' },
  { key: 'activity', label: 'Activity' },
  { key: 'life_moment', label: 'Life Moments' },
  { key: 'family', label: 'Family' },
  { key: 'community', label: 'Community' },
];

// ─── Event Type Card ──────────────────────────────────────────

interface EventTypeCardProps {
  def: EventTypeDefinition;
  selected: boolean;
  onSelect: (key: EventTypeKey) => void;
}

function EventTypeCard({ def, selected, onSelect }: EventTypeCardProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return { transform: [{ scale: scale.value }] };
  });

  const catMeta = categoryMeta[def.category];

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withTiming(0.96, { duration: 150, easing: Easing.out(Easing.cubic) });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onSelect(def.key);
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          { borderColor: selected ? catMeta.color : '#E8E1F8' },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: catMeta.color + '22' }]}>
          <Ionicons name={def.icon as any} size={26} color={catMeta.color} />
        </View>
        <Text style={styles.cardLabel} numberOfLines={2}>
          {def.label}
        </Text>
        {selected && (
          <View style={[styles.checkBadge, { backgroundColor: catMeta.color }]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Event Type Selector ──────────────────────────────────────

interface EventTypeSelectorProps {
  selectedType: EventTypeKey | null;
  onSelect: (type: EventTypeKey) => void;
}

export function EventTypeSelector({ selectedType, onSelect }: EventTypeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');

  const filteredTypes = useMemo(() => {
    if (activeCategory === 'all') return eventTypeDefs;
    return eventTypeDefs.filter(d => d.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (cat: EventCategory | 'all') => {
    Haptics.selectionAsync().catch(() => {});
    setActiveCategory(cat);
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.key;
          const tabColor =
            tab.key === 'all' ? '#5B2CFF' : categoryMeta[tab.key as EventCategory]?.color ?? '#5B2CFF';
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleCategoryChange(tab.key)}
              style={[
                styles.tab,
                isActive && { backgroundColor: tabColor, borderColor: tabColor },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Event Type Grid */}
      <FlatList
        data={filteredTypes}
        keyExtractor={(item) => item.key}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <EventTypeCard
            def={item}
            selected={selectedType === item.key}
            onSelect={onSelect}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  tabsContent: {
    gap: 8,
    paddingRight: 20,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E1F8',
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#746B8C',
  },
  tabTextActive: {
    color: 'white',
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 120,
    justifyContent: 'center',
    gap: 8,
  },
  cardSelected: {
    shadowColor: '#5B2CFF',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#18122B',
    textAlign: 'center',
    lineHeight: 15,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});