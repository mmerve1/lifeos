import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native';

interface FadeRiseViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

export const FadeRiseView: React.FC<FadeRiseViewProps> = ({
  children,
  delay = 0,
  duration = 550,
  offsetY = 18,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;

  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]);

    anim.start();
    return () => anim.stop();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};
