import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { forgotPassword, resetPassword } from '../../services/api';
import { Colors } from '../../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset() {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setToken(res.token);
      setStep('reset');
      Alert.alert('Succès', 'Un code de réinitialisation a été généré.');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!token || !newPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      Alert.alert('Succès', 'Mot de passe réinitialisé. Connectez-vous.');
      router.push('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {step === 'email' ? (
        <View style={styles.form}>
          <Text style={styles.label}>Entrez votre email pour réinitialiser votre mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.link}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Entrez le code de réinitialisation et votre nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Code de réinitialisation"
            placeholderTextColor={Colors.textMuted}
            value={token}
            onChangeText={setToken}
          />
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            placeholderTextColor={Colors.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Réinitialiser</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  form: { gap: 16 },
  label: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { color: Colors.primary, textAlign: 'center', fontSize: 16, marginTop: 8 },
});
