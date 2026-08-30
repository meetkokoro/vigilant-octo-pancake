import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/theme';

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
  borderRadius?: number;
}

/** Tap-left / tap-right photo browser used on profile cards. */
export default function PhotoCarousel({
  photos,
  height = 320,
  borderRadius = 20,
}: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const safePhotos = photos.length > 0 ? photos : [''];
  const current = Math.min(index, safePhotos.length - 1);

  const go = (delta: number) => {
    setIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return safePhotos.length - 1;
      if (next >= safePhotos.length) return 0;
      return next;
    });
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          height,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
        },
      ]}
    >
      <Image
        source={{ uri: safePhotos[current] }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.progressRow} pointerEvents="none">
        {safePhotos.map((photo, i) => (
          <View
            key={`${photo}-${i}`}
            style={[
              styles.progressSegment,
              i === current && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      {safePhotos.length > 1 && (
        <View style={styles.tapZones}>
          <TouchableOpacity
            style={styles.tapZone}
            onPress={() => go(-1)}
            activeOpacity={1}
            accessibilityLabel="Previous photo"
          />
          <TouchableOpacity
            style={styles.tapZone}
            onPress={() => go(1)}
            activeOpacity={1}
            accessibilityLabel="Next photo"
          />
        </View>
      )}

      <View style={styles.scrim} pointerEvents="none" />

      {safePhotos.length > 1 && (
        <View style={styles.counterWrap} pointerEvents="none">
          <Text style={styles.counter}>
            {current + 1}/{safePhotos.length}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles: any = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: COLORS.bgCardHover,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  progressRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    zIndex: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressSegmentActive: {
    backgroundColor: '#ffffff',
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 3,
  },
  tapZone: {
    flex: 1,
    cursor: 'pointer',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    background:
      'linear-gradient(180deg, rgba(11,15,25,0) 0%, rgba(11,15,25,0.92) 100%)',
    zIndex: 2,
  },
  counter: {
    fontFamily: 'Outfit',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  counterWrap: {
    position: 'absolute',
    top: 22,
    right: 14,
    zIndex: 4,
  },
});
