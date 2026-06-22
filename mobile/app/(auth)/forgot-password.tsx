import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword, resetPassword } from '../../services/api';
import { Colors, Radius, Shadows } from '../../constants/theme';
import { useAnimatedPress } from '../../hooks/useAnimatedEntry';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const btnAnim = useAnimatedPress();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(formSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [step]);

  async function handleRequestReset() {
    if (!email) { Alert.alert('Erreur', 'Veuillez entrer votre email'); return; }
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setToken(res.token);
      setStep('reset');
      Alert.alert('Succès', 'Un code de réinitialisation a été généré.');
    } catch (err: any) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  async function handleResetPassword() {
    if (!token || !newPassword) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      Alert.alert('Succès', 'Mot de passe réinitialisé. Connectez-vous.');
      router.push('/(auth)/login');
    } catch (err: any) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formSlide }] }]}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={40} color={Colors.primary} />
        </View>

        {step === 'email' ? (
          <>
            <Text style={styles.label}>Entrez votre email pour réinitialiser votre mot de passe</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <Animated.View style={{ transform: [{ scale: btnAnim.scale }] }}>
              <TouchableOpacity style={styles.button} onPress={handleRequestReset} disabled={loading} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer le code</Text>}
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Retour à la connexion</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Entrez le code de réinitialisation et votre nouveau mot de passe</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput style={styles.input} placeholder="Code de réinitialisation" placeholderTextColor={Colors.textMuted} value={token} onChangeText={setToken} />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={{ marginRight: 10 }} />
              <TextInput style={styles.input} placeholder="Nouveau mot de passe" placeholderTextColor={Colors.textMuted} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            </View>
            <Animated.View style={{ transform: [{ scale: btnAnim.scale }] }}>
              <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Réinitialiser</Text>}
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  form: { gap: 16 },
  iconWrap: { alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.sm,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: Colors.text },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16, alignItems: 'center',
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { color: Colors.primary, textAlign: 'center', fontSize: 16, fontWeight: '600', marginTop: 8 },
});
