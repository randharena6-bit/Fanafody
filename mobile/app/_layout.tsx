import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../services/auth';
import { requestPermissions, setupNotificationCategories } from '../services/notifications';
import { Colors, Radius } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await requestPermissions();
      await setupNotificationCategories();
    })();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: 'Connexion',
            headerStyle: { backgroundColor: 'transparent' },
            headerTintColor: Colors.primary,
            headerTransparent: true,
            headerBlurEffect: 'light',
          }}
        />
        <Stack.Screen
          name="(auth)/register"
          options={{
            title: 'Inscription',
            headerStyle: { backgroundColor: 'transparent' },
            headerTintColor: Colors.primary,
            headerTransparent: true,
            headerBlurEffect: 'light',
          }}
        />
        <Stack.Screen
          name="(auth)/forgot-password"
          options={{
            title: 'Mot de passe oublié',
            headerStyle: { backgroundColor: 'transparent' },
            headerTintColor: Colors.primary,
            headerTransparent: true,
            headerBlurEffect: 'light',
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="medication/add"
          options={{
            title: 'Ajouter un médicament',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="medication/[id]"
          options={{
            title: 'Modifier',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="contact/add"
          options={{
            title: 'Ajouter un contact',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
