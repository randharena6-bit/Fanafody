import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../services/auth';
import { requestPermissions, setupNotificationCategories, rescheduleAllReminders } from '../services/notifications';
import { getMedications } from '../services/api';
import { Colors } from '../constants/theme';

function NotificationScheduler() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      await requestPermissions();
      await setupNotificationCategories();
      try {
        const meds = await getMedications();
        await rescheduleAllReminders(meds);
      } catch {}
    })();
  }, [user, loading]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <NotificationScheduler />
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
