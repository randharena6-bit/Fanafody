import { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius } from '../constants/theme';

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  gradient?: readonly [string, string];
  height?: number;
  style?: ViewStyle;
}

export default function AnimatedHeader({
  title,
  subtitle,
  gradient = Gradients.primary,
  height = 200,
  style,
}: AnimatedHeaderProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius: Radius.lg,
          marginHorizontal: 16,
          marginTop: 16,
          overflow: 'hidden',
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}
      >
        <AnimatedText
          style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: '800',
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </AnimatedText>
        {subtitle && (
          <AnimatedText
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            {subtitle}
          </AnimatedText>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

function AnimatedText({ style, children }: { style: any; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return <Animated.Text style={[style, { opacity }]}>{children}</Animated.Text>;
}
