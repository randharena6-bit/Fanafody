import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../services/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#4A90D9' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ title: 'Mot de passe oublié' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="medication/add" options={{ title: 'Ajouter un médicament' }} />
        <Stack.Screen name="medication/[id]" options={{ title: 'Modifier' }} />
        <Stack.Screen name="contact/add" options={{ title: 'Ajouter un contact' }} />
      </Stack>
    </AuthProvider>
  );
}
