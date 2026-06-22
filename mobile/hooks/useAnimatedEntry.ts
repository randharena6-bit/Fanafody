import { useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';

export function useFadeIn(delay = 0, duration = 500) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY };
}

export function useSlideInLeft(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateX };
}

export function useScaleIn(delay = 0) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { scale, opacity };
}

export function useStaggeredAnimation(count: number, baseDelay = 100) {
  const values = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    const animations = values.flatMap((v, i) => [
      Animated.timing(v.opacity, {
        toValue: 1,
        duration: 400,
        delay: baseDelay + i * 100,
        useNativeDriver: true,
      }),
      Animated.timing(v.translateY, {
        toValue: 0,
        duration: 400,
        delay: baseDelay + i * 100,
        useNativeDriver: true,
      }),
    ]);
    Animated.parallel(animations).start();
  }, []);

  return values;
}

export function usePulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return scale;
}

export function useAnimatedPress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return { scale, onPressIn, onPressOut };
}
