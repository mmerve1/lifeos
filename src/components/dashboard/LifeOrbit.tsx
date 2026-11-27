import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Pressable,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { useI18n } from '../../i18n';
import { Typography } from '../../theme/typography';
import { ModuleCategory } from '../../types';

interface LifeOrbitProps {
  completed: number;
  total: number;
  onSelectModule?: (category: ModuleCategory) => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~326.73

export const LifeOrbit: React.FC<LifeOrbitProps> = ({
  completed,
  total,
  onSelectModule,
}) => {
  const { colors, isDark } = useTheme();
  const { language } = useI18n();

  const outerSpin = useRef(new Animated.Value(0)).current;
  const innerSpin = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(RING_CIRCUMFERENCE)).current;

  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const outerLoop = Animated.loop(
      Animated.timing(outerSpin, {
        toValue: 1,
        duration: 48000,
        easing: Easing.linear,
        useNativeDriver,
      })
    );

    const innerLoop = Animated.loop(
      Animated.timing(innerSpin, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver,
      })
    );

    outerLoop.start();
    innerLoop.start();

    return () => {
      outerLoop.stop();
      innerLoop.stop();
    };
  }, [outerSpin, innerSpin, useNativeDriver]);

  useEffect(() => {
    const ratio = total > 0 ? completed / total : 0;
    const targetOffset = RING_CIRCUMFERENCE * (1 - ratio);

    Animated.timing(progressAnim, {
      toValue: targetOffset,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [completed, total, progressAnim]);

  const outerRotate = outerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const outerCounterRotate = outerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const innerRotate = innerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const innerCounterRotate = innerSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const outerPlanets: {
    key: ModuleCategory;
    label: string;
    bg: string;
    left: number;
    top: number;
  }[] = [
    { key: 'career', label: language === 'tr' ? 'Kariyer' : 'Career', bg: '#FFB454', left: 113, top: -27 },
    { key: 'academic', label: language === 'tr' ? 'Okul' : 'School', bg: '#5FD6E8', left: 253, top: 113 },
    { key: 'finance', label: language === 'tr' ? 'Finans' : 'Finance', bg: '#7BE3A1', left: 113, top: 253 },
    { key: 'health', label: language === 'tr' ? 'Sağlık' : 'Health', bg: '#FF8FA3', left: -27, top: 113 },
  ];

  const innerPlanets: {
    key: ModuleCategory;
    label: string;
    bg: string;
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  }[] = [
    { key: 'learning', label: language === 'tr' ? 'Öğren' : 'Learn', bg: '#C9A6FF', left: 6, top: 6 },
    { key: 'social', label: language === 'tr' ? 'Sosyal' : 'Social', bg: '#F5E06B', right: 6, bottom: 6 },
  ];

  const orbitBorderColor = isDark ? '#3B4080' : '#C7CCF0';
  const trackColor = isDark ? '#30356E' : '#E2E6FA';

  return (
    <View style={styles.wrapper}>
      <View style={styles.orbitStage}>
        {/* Outer static ring */}
        <View style={[styles.outerRing, { borderColor: orbitBorderColor }]} />

        {/* Inner dashed ring */}
        <View style={[styles.innerRing, { borderColor: orbitBorderColor }]} />

        {/* Outer rotating orbit */}
        <Animated.View
          style={[styles.outerOrbitLayer, { transform: [{ rotate: outerRotate }] }]}
          pointerEvents="box-none"
        >
          {outerPlanets.map((planet) => (
            <Animated.View
              key={planet.key}
              style={[
                styles.outerPlanetWrap,
                {
                  left: planet.left,
                  top: planet.top,
                  transform: [{ rotate: outerCounterRotate }],
                },
              ]}
            >
              <Pressable
                onPress={() => onSelectModule?.(planet.key)}
                style={({ pressed }) => [
                  styles.outerPlanet,
                  { backgroundColor: planet.bg, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.planetText}>{planet.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Inner rotating orbit */}
        <Animated.View
          style={[styles.innerOrbitLayer, { transform: [{ rotate: innerRotate }] }]}
          pointerEvents="box-none"
        >
          {innerPlanets.map((planet) => (
            <Animated.View
              key={planet.key}
              style={[
                styles.innerPlanetWrap,
                {
                  left: planet.left,
                  top: planet.top,
                  right: planet.right,
                  bottom: planet.bottom,
                  transform: [{ rotate: innerCounterRotate }],
                },
              ]}
            >
              <Pressable
                onPress={() => onSelectModule?.(planet.key)}
                style={({ pressed }) => [
                  styles.innerPlanet,
                  { backgroundColor: planet.bg, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.innerPlanetText}>{planet.label}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Center animated SVG progress ring */}
        <View style={styles.centerRingWrap} pointerEvents="none">
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <Circle
              cx={60}
              cy={60}
              r={RING_RADIUS}
              fill={colors.background}
              stroke={trackColor}
              strokeWidth={9}
            />
            <AnimatedCircle
              cx={60}
              cy={60}
              r={RING_RADIUS}
              fill="none"
              stroke={colors.primary}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE}`}
              strokeDashoffset={progressAnim}
              rotation={-90}
              origin="60, 60"
            />
          </Svg>
          <View style={styles.centerTextWrap}>
            <Text style={[styles.ratioText, { color: colors.textPrimary }]}>
              {completed}/{total}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
        {language === 'tr'
          ? 'Görevler ve takvim bu yörüngenin merkezi'
          : 'Tasks and calendar are the center of your orbit'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  orbitStage: {
    position: 'relative',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderRadius: 999,
  },
  innerRing: {
    position: 'absolute',
    top: 68,
    left: 68,
    right: 68,
    bottom: 68,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 999,
  },
  outerOrbitLayer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 280,
    height: 280,
  },
  outerPlanetWrap: {
    position: 'absolute',
    width: 54,
    height: 54,
  },
  outerPlanet: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  planetText: {
    color: '#0E1029',
    fontSize: 11,
    fontWeight: '700',
  },
  innerOrbitLayer: {
    position: 'absolute',
    top: 68,
    left: 68,
    width: 184,
    height: 184,
  },
  innerPlanetWrap: {
    position: 'absolute',
    width: 46,
    height: 46,
  },
  innerPlanet: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  innerPlanetText: {
    color: '#0E1029',
    fontSize: 10,
    fontWeight: '700',
  },
  centerRingWrap: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextWrap: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioText: {
    fontSize: 24,
    fontWeight: '700',
  },
});
