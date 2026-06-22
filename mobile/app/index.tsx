import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../services/auth';
import { Colors } from '../constants/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!loading) {
      const target = user ? '/(tabs)' : '/(auth)/login';
      setTimeout(() => router.replace(target), 600);
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }], opacity }]}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View style={styles.iconBg}>
            <Ionicons name="medkit" size={50} color="#fff" />
          </View>
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity }]}>Fanafody</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity }]}>Rappel de médicaments</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(74,144,217,0.4)',
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
