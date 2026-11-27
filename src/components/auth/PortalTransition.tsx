import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useI18n } from '../../i18n';

interface PortalTransitionProps {
  visible: boolean;
  isNewUser?: boolean;
  onComplete: () => void;
}

export const PortalTransition: React.FC<PortalTransitionProps> = ({
  visible,
  isNewUser = false,
  onComplete,
}) => {
  const { language } = useI18n();
  const useNativeDriver = Platform.OS !== 'web';

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.92)).current;
  const coreScale = useRef(new Animated.Value(0)).current;
  const orbitInScale = useRef(new Animated.Value(0.1)).current;
  const orbitInRotate = useRef(new Animated.Value(0)).current;
  const orbitInOpacity = useRef(new Animated.Value(0)).current;
  const continuousSpin = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset values
    overlayOpacity.setValue(0);
    overlayScale.setValue(0.92);
    coreScale.setValue(0);
    orbitInScale.setValue(0.1);
    orbitInRotate.setValue(0);
    orbitInOpacity.setValue(0);
    continuousSpin.setValue(0);
    textOpacity.setValue(0);
    textY.setValue(18);

    const spinLoop = Animated.loop(
      Animated.timing(continuousSpin, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver,
      })
    );
    spinLoop.start();

    const entrance = Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.timing(overlayScale, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.sequence([
        Animated.delay(140),
        Animated.spring(coreScale, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver,
        }),
      ]),
      Animated.sequence([
        Animated.delay(220),
        Animated.parallel([
          Animated.timing(orbitInOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver,
          }),
          Animated.timing(orbitInScale, {
            toValue: 1,
            duration: 950,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
          Animated.timing(orbitInRotate, {
            toValue: 1,
            duration: 950,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver,
          }),
          Animated.timing(textY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver,
          }),
        ]),
      ]),
    ]);

    entrance.start();

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver,
        }),
        Animated.timing(overlayScale, {
          toValue: 1.35,
          duration: 500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver,
        }),
      ]).start(() => {
        spinLoop.stop();
        onComplete();
      });
    }, 1650);

    return () => {
      clearTimeout(exitTimer);
      spinLoop.stop();
      entrance.stop();
    };
  }, [
    visible,
    overlayOpacity,
    overlayScale,
    coreScale,
    orbitInScale,
    orbitInRotate,
    orbitInOpacity,
    continuousSpin,
    textOpacity,
    textY,
    useNativeDriver,
    onComplete,
  ]);

  if (!visible) return null;

  const spiralRot = orbitInRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-220deg', '0deg'],
  });
  const spinRot = continuousSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const message = isNewUser
    ? language === 'tr'
      ? 'Hoş geldin, yörüngen kuruluyor…'
      : 'Welcome, building your orbit…'
    : language === 'tr'
      ? 'Günün hazırlanıyor…'
      : 'Preparing your day…';

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: overlayOpacity,
          transform: [{ scale: overlayScale }],
        },
      ]}
    >
      <View style={styles.orbitBox}>
        <Animated.View
          style={[
            styles.orbitInWrap,
            {
              opacity: orbitInOpacity,
              transform: [{ rotate: spiralRot }, { scale: orbitInScale }],
            },
          ]}
        >
          <View style={styles.orbitRing} />
          <Animated.View style={[styles.spinLayer, { transform: [{ rotate: spinRot }] }]}>
            <View style={[styles.planet, { left: 138, top: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFB454' }]} />
            <View style={[styles.planet, { left: 260, top: 92, width: 36, height: 36, borderRadius: 18, backgroundColor: '#5FD6E8' }]} />
            <View style={[styles.planet, { left: 226, top: 240, width: 40, height: 40, borderRadius: 20, backgroundColor: '#7BE3A1' }]} />
            <View style={[styles.planet, { left: 58, top: 244, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF8FA3' }]} />
            <View style={[styles.planet, { left: 22, top: 96, width: 40, height: 40, borderRadius: 20, backgroundColor: '#C9A6FF' }]} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.core, { transform: [{ scale: coreScale }] }]}>
          <Text style={styles.coreText}>LifeOS</Text>
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.welcomeText,
          {
            opacity: textOpacity,
            transform: [{ translateY: textY }],
          },
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#14173A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbitBox: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitInWrap: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  orbitRing: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 2,
    borderColor: '#3B4080',
    borderRadius: 999,
  },
  spinLayer: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  planet: {
    position: 'absolute',
  },
  core: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8FA2FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8FA2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  coreText: {
    color: '#0E1029',
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeText: {
    marginTop: 32,
    fontSize: 26,
    fontWeight: '700',
    color: '#F3F2FF',
    textAlign: 'center',
  },
});
