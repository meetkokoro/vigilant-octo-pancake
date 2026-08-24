import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Profile, CURRENT_USER } from '@linkradar/shared';

interface RadarViewProps {
  profiles: Profile[];
  mode: 'locality' | 'corporation';
  onSelectProfile: (profile: Profile) => void;
  selectedProfileId: string | null;
}

export default function RadarView({
  profiles,
  mode,
  onSelectProfile,
  selectedProfileId,
}: RadarViewProps) {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Sweep rotation
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const radarSize = 300;
  const centerPos = radarSize / 2;
  const maxRadius = radarSize / 2 - 30;

  const sweepRotation = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Radar Screen */}
      <View
        style={[
          styles.radarCircle,
          { width: radarSize, height: radarSize, borderRadius: radarSize / 2 },
        ]}
      >
        {/* Pulse Ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: radarSize,
              height: radarSize,
              borderRadius: radarSize / 2,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [0.95, 1.3],
                outputRange: [0.2, 0],
              }),
            },
          ]}
        />

        {/* Concentric Grid Rings — SVG */}
        <Svg
          width={radarSize}
          height={radarSize}
          style={StyleSheet.absoluteFill}
        >
          {[0.75, 0.5, 0.25].map((scale) => (
            <Circle
              key={scale}
              cx={centerPos}
              cy={centerPos}
              r={(radarSize * scale) / 2}
              stroke="rgba(30, 41, 59, 0.6)"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
          ))}

          {/* Crosshair Axes */}
          <Line x1={0} y1={centerPos} x2={radarSize} y2={centerPos} stroke="rgba(30, 41, 59, 0.4)" strokeWidth={1} />
          <Line x1={centerPos} y1={0} x2={centerPos} y2={radarSize} stroke="rgba(30, 41, 59, 0.4)" strokeWidth={1} />

          {/* Dashed connector lines for Corporation mode */}
          {mode === 'corporation' &&
            profiles.map((profile) => {
              if (profile.company !== CURRENT_USER.company) return null;
              const angleRad = (profile.radarAngle * Math.PI) / 180;
              const dist = profile.radarDistance * maxRadius;
              const x = centerPos + Math.cos(angleRad) * dist;
              const y = centerPos + Math.sin(angleRad) * dist;

              return (
                <Line
                  key={`line-${profile.id}`}
                  x1={centerPos}
                  y1={centerPos}
                  x2={x}
                  y2={y}
                  stroke="rgba(6, 182, 212, 0.4)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              );
            })}
        </Svg>

        {/* Rotating Sweep — simplified as an animated view */}
        <Animated.View
          style={[
            styles.sweepLine,
            {
              width: maxRadius + 10,
              height: 2,
              left: centerPos,
              top: centerPos - 1,
              transformOrigin: 'left center',
              transform: [{ rotate: sweepRotation }],
            },
          ]}
        />

        {/* Center Node (Current User) */}
        <View style={[styles.centerNode, { top: centerPos - 22, left: centerPos - 22 }]}>
          <Image source={{ uri: CURRENT_USER.avatar }} style={styles.centerAvatar} />
          <View style={styles.centerActiveDot} />
        </View>

        {/* Profile Nodes */}
        {profiles.map((profile) => {
          const angleRad = (profile.radarAngle * Math.PI) / 180;
          const dist = profile.radarDistance * maxRadius;
          const x = centerPos + Math.cos(angleRad) * dist;
          const y = centerPos + Math.sin(angleRad) * dist;

          const isSelected = selectedProfileId === profile.id;
          const isSameCompany = profile.company === CURRENT_USER.company;

          return (
            <TouchableOpacity
              key={profile.id}
              onPress={() => onSelectProfile(profile)}
              activeOpacity={0.8}
              style={[
                styles.nodeButton,
                isSelected && styles.nodeButtonSelected,
                isSameCompany && mode === 'corporation' && styles.nodeSameCompany,
                {
                  position: 'absolute',
                  top: y - 24,
                  left: x - 24,
                  zIndex: isSelected ? 50 : 20,
                },
              ]}
            >
              <Image source={{ uri: profile.avatar }} style={styles.nodeAvatar} />

              {/* Visual badge indicators */}
              {mode === 'corporation' ? (
                <View style={[styles.nodeBadge, isSameCompany ? styles.badgeCorp : styles.badgeNetwork]}>
                  {isSameCompany ? (
                    <Ionicons name="business" size={8} color="#ffffff" />
                  ) : (
                    <Text style={styles.degreeText}>{profile.connectionDegree}st</Text>
                  )}
                </View>
              ) : (
                <View style={[styles.nodeBadge, styles.badgeLocality]}>
                  <Ionicons name="location" size={8} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Grid Legend */}
      <View style={styles.legend}>
        {mode === 'corporation' ? (
          <View style={styles.legendRow}>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.accentNeon }]} />
            <Text style={styles.legendText}>Co-Workers</Text>
            <View style={[styles.legendIndicator, { backgroundColor: COLORS.primary, marginLeft: 16 }]} />
            <Text style={styles.legendText}>1st/2nd Degree Professional</Text>
          </View>
        ) : (
          <View style={styles.legendRow}>
            <View style={styles.legendCircleIndicator} />
            <Text style={styles.legendText}>Grid rings scale: 1km • 3km • 5km</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  radarCircle: {
    backgroundColor: '#0c1122',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    position: 'relative',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.accentNeon,
  },
  sweepLine: {
    position: 'absolute',
    backgroundColor: COLORS.accentNeon,
    opacity: 0.3,
  },
  centerNode: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.accentNeon,
    backgroundColor: COLORS.bgDark,
    padding: 2,
    shadowColor: COLORS.accentNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 90,
  },
  centerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  centerActiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
  },
  nodeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nodeButtonSelected: {
    borderColor: COLORS.heart,
    transform: [{ scale: 1.15 }],
    shadowColor: COLORS.heart,
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  nodeSameCompany: {
    borderColor: COLORS.accentNeon,
    shadowColor: COLORS.accentNeon,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nodeAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  nodeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.bgDark,
  },
  badgeCorp: {
    backgroundColor: COLORS.accentNeon,
  },
  badgeNetwork: {
    backgroundColor: COLORS.primary,
  },
  badgeLocality: {
    backgroundColor: COLORS.heart,
  },
  degreeText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendCircleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderStyle: 'dashed',
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});
