import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, Ellipse } from 'react-native-svg';

interface MentorAvatarProps {
  size?: number;
  isThinking?: boolean;
  mood?: 'happy' | 'thinking' | 'calm';
}

export const MentorAvatar: React.FC<MentorAvatarProps> = ({
  size = 64,
  isThinking = false,
  mood = 'happy',
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0.85)).current;

  const useNativeDriver = Platform.OS !== 'web';

  // Gentle floating bob animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: isThinking ? 700 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(floatAnim, {
          toValue: 3,
          duration: isThinking ? 700 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, isThinking, useNativeDriver]);

  // Halo pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: isThinking ? 1.18 : 1.08,
          duration: isThinking ? 650 : 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(haloAnim, {
          toValue: isThinking ? 0.92 : 0.96,
          duration: isThinking ? 650 : 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [haloAnim, isThinking, useNativeDriver]);

  // Natural periodic eye blink
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.12,
          duration: 90,
          useNativeDriver,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver,
        }),
      ]).start(() => {
        if (!mounted) return;
        const nextDelay = isThinking ? 1600 : 2800 + Math.random() * 2400;
        timer = setTimeout(triggerBlink, nextDelay);
      });
    };

    timer = setTimeout(triggerBlink, 1800);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [blinkAnim, isThinking, useNativeDriver]);

  const eyeSize = Math.max(5, size * 0.115);
  const eyeGap = size * 0.18;

  return (
    <View style={[styles.wrapper, { width: size + 16, height: size + 16 }]}>
      {/* Soft glowing halo */}
      <Animated.View
        style={[
          styles.halo,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            backgroundColor: isThinking ? 'rgba(95, 214, 232, 0.24)' : 'rgba(143, 162, 255, 0.22)',
            transform: [{ scale: haloAnim }],
          },
        ]}
      />

      {/* Floating cute assistant orb */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="mentorOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#A9B8FF" />
              <Stop offset="50%" stopColor="#8FA2FF" />
              <Stop offset="100%" stopColor="#C9A6FF" />
            </LinearGradient>
            <LinearGradient id="mentorFaceInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#1B1F4E" />
              <Stop offset="100%" stopColor="#111436" />
            </LinearGradient>
          </Defs>

          {/* Outer pastel orb */}
          <Circle cx="50" cy="50" r="46" fill="url(#mentorOrbGrad)" />

          {/* Subtle top highlight */}
          <Ellipse cx="38" cy="22" rx="18" ry="8" fill="rgba(255,255,255,0.28)" />

          {/* Little cute antenna / sparkle crown */}
          <Circle cx="50" cy="11" r="4" fill="#FFF4C2" />

          {/* Visor / Face screen */}
          <Path
            d="M 22 44 C 22 30, 32 26, 50 26 C 68 26, 78 30, 78 44 L 78 58 C 78 72, 68 78, 50 78 C 32 78, 22 72, 22 58 Z"
            fill="url(#mentorFaceInner)"
          />

          {/* Cute rosy cheeks */}
          <Ellipse cx="32" cy="59" rx="5.5" ry="3.2" fill="#FF8FA3" opacity={0.55} />
          <Ellipse cx="68" cy="59" rx="5.5" ry="3.2" fill="#FF8FA3" opacity={0.55} />

          {/* Smile or thinking mouth */}
          {isThinking || mood === 'thinking' ? (
            <Circle cx="50" cy="63" r="3.4" fill="#5FD6E8" />
          ) : (
            <Path
              d="M 41 61 Q 50 69 59 61"
              stroke="#E7E9FF"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </Svg>

        {/* Animated blinking eyes overlaid precisely on visor */}
        <View
          pointerEvents="none"
          style={[
            styles.eyesRow,
            {
              top: size * 0.41,
              gap: eyeGap,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.eye,
              {
                width: eyeSize,
                height: eyeSize * 1.25,
                borderRadius: eyeSize,
                backgroundColor: isThinking ? '#5FD6E8' : '#E7E9FF',
                transform: [{ scaleY: blinkAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.eyeSpark,
                {
                  width: eyeSize * 0.38,
                  height: eyeSize * 0.38,
                  borderRadius: eyeSize,
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.eye,
              {
                width: eyeSize,
                height: eyeSize * 1.25,
                borderRadius: eyeSize,
                backgroundColor: isThinking ? '#5FD6E8' : '#E7E9FF',
                transform: [{ scaleY: blinkAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.eyeSpark,
                {
                  width: eyeSize * 0.38,
                  height: eyeSize * 0.38,
                  borderRadius: eyeSize,
                },
              ]}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 1,
    paddingRight: 1,
  },
  eyeSpark: {
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
});
