import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { COLORS, Profile, CURRENT_USER } from '@linkradar/shared';
import { Building, MapPin } from 'lucide-react';

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
  selectedProfileId
}: RadarViewProps) {
  // Inject keyframe animation on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'radar-animation-styles';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes radar-pulse {
            0% { transform: scale(0.95); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.25; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          @keyframes node-float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0px); }
          }
          .radar-sweep-line {
            animation: radar-sweep 6s linear infinite;
            transform-origin: bottom right;
          }
          .radar-pulse-ring-1 {
            animation: radar-pulse 3s infinite ease-out;
          }
          .radar-pulse-ring-2 {
            animation: radar-pulse 3s infinite ease-out 1.5s;
          }
          .radar-node {
            animation: node-float 4s ease-in-out infinite;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const radarSize = 340;
  const centerPos = radarSize / 2;
  const maxRadius = (radarSize / 2) - 30; // buffer margin for nodes

  return (
    <View style={styles.container}>
      {/* Outer Radar Screen */}
      <View style={[styles.radarCircle, { width: radarSize, height: radarSize, borderRadius: radarSize / 2 }]}>
        
        {/* Pulsing Scan Rings */}
        <div 
          className="radar-pulse-ring-1" 
          style={{ ...styles.pulseRing, width: radarSize, height: radarSize, borderRadius: radarSize / 2, position: 'absolute', borderWidth: 1.5, borderColor: COLORS.accentNeon, borderStyle: 'solid' }} 
        />
        <div 
          className="radar-pulse-ring-2" 
          style={{ ...styles.pulseRing, width: radarSize, height: radarSize, borderRadius: radarSize / 2, position: 'absolute', borderWidth: 1.5, borderColor: COLORS.accentNeon, borderStyle: 'solid' }} 
        />

        {/* Concentric Grid Rings */}
        <View style={[styles.gridRing, { width: radarSize * 0.75, height: radarSize * 0.75, borderRadius: (radarSize * 0.75) / 2 }]} />
        <View style={[styles.gridRing, { width: radarSize * 0.5, height: radarSize * 0.5, borderRadius: (radarSize * 0.5) / 2 }]} />
        <View style={[styles.gridRing, { width: radarSize * 0.25, height: radarSize * 0.25, borderRadius: (radarSize * 0.25) / 2 }]} />

        {/* Crosshair Axes */}
        <View style={styles.axisX} />
        <View style={styles.axisY} />

        {/* Rotating Sweep Line */}
        <div 
          className="radar-sweep-line"
          style={{
            position: 'absolute',
            bottom: centerPos,
            right: centerPos,
            width: maxRadius + 10,
            height: maxRadius + 10,
            background: 'conic-gradient(from 90deg, rgba(6,182,212,0.15) 0deg, rgba(6,182,212,0.05) 45deg, rgba(6,182,212,0) 90deg)',
            borderRadius: '100% 0 0 0',
            pointerEvents: 'none',
          }}
        />

        {/* Dashed connector lines for Corporation mode */}
        {mode === 'corporation' && profiles.map(profile => {
          if (profile.company !== CURRENT_USER.company) return null;
          
          const angleRad = (profile.radarAngle * Math.PI) / 180;
          const dist = profile.radarDistance * maxRadius;
          const x = centerPos + Math.cos(angleRad) * dist;
          const y = centerPos + Math.sin(angleRad) * dist;

          // Simple SVG Line overlay to connect center node to cohort node
          return (
            <svg
              key={`line-${profile.id}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: radarSize,
                height: radarSize,
                pointerEvents: 'none',
              }}
            >
              <line
                x1={centerPos}
                y1={centerPos}
                x2={x}
                y2={y}
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          );
        })}

        {/* Center Node (Current User) */}
        <View style={[styles.centerNode, { top: centerPos - 22, left: centerPos - 22 }]}>
          <Image source={{ uri: CURRENT_USER.avatar }} style={styles.centerAvatar} />
          <View style={styles.centerActiveDot} />
        </View>

        {/* Profile Nodes floating on the Radar */}
        {profiles.map((profile, index) => {
          const angleRad = (profile.radarAngle * Math.PI) / 180;
          const dist = profile.radarDistance * maxRadius;
          const x = centerPos + Math.cos(angleRad) * dist;
          const y = centerPos + Math.sin(angleRad) * dist;

          const isSelected = selectedProfileId === profile.id;
          const isSameCompany = profile.company === CURRENT_USER.company;

          return (
            <div
              key={profile.id}
              className="radar-node"
              style={{
                position: 'absolute',
                top: y - 24, // adjust to center of node (node height=48)
                left: x - 24, // adjust to center of node (node width=48)
                animationDelay: `${index * 0.4}s`,
                zIndex: isSelected ? 50 : 20,
              }}
            >
              <TouchableOpacity
                onPress={() => onSelectProfile(profile)}
                activeOpacity={0.8}
                style={[
                  styles.nodeButton,
                  isSelected && styles.nodeButtonSelected,
                  isSameCompany && mode === 'corporation' && styles.nodeSameCompany
                ]}
              >
                <Image source={{ uri: profile.avatar }} style={styles.nodeAvatar} />
                
                {/* Visual badge indicators */}
                {mode === 'corporation' ? (
                  <View style={[
                    styles.nodeBadge, 
                    isSameCompany ? styles.badgeCorp : styles.badgeNetwork
                  ]}>
                    {isSameCompany ? (
                      <Building size={8} color="#ffffff" />
                    ) : (
                      <Text style={styles.degreeText}>{profile.connectionDegree}st</Text>
                    )}
                  </View>
                ) : (
                  <View style={[styles.nodeBadge, styles.badgeLocality]}>
                    <MapPin size={8} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </div>
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

const styles: any = StyleSheet.create({
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
    boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6)',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.accentNeon,
    pointerEvents: 'none',
  },
  gridRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' as any }, { translateY: '-50%' as any }],
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.6)',
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  axisX: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    pointerEvents: 'none',
  },
  axisY: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    pointerEvents: 'none',
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
    boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
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
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  nodeButtonSelected: {
    borderColor: COLORS.heart,
    transform: [{ scale: 1.15 }],
    boxShadow: '0 0 15px rgba(236, 72, 153, 0.6)',
  },
  nodeSameCompany: {
    borderColor: COLORS.accentNeon,
    boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
    fontFamily: 'Outfit',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  }
} as any);
