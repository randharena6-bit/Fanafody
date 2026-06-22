import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/auth';
import { Colors, Shadows, Radius } from '../../constants/theme';
import { useAnimatedPress } from '../../hooks/useAnimatedEntry';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(30)).current;
  const fieldsOpacity = useRef(new Animated.Value(0)).current;

  const btnAnim = useAnimatedPress();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
      Animated.timing(formTranslate, { toValue: 0, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();
    Animated.timing(fieldsOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }).start();
  }, []);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name, phone);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formTranslate }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez Fanafody pour gérer vos traitements</Text>
          </View>

          <Animated.View style={{ opacity: fieldsOpacity, gap: 12 }}>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nom complet *" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email *" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Téléphone (optionnel)" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Mot de passe *" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: btnAnim.scale }], marginTop: 8 }}>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.linkBtn}>
            <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  form: { gap: 4 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  subtitle: { color: Colors.textSecondary, marginTop: 6, fontSize: 15, textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.sm,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: Colors.text },
  eyeBtn: { padding: 4 },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  linkBtn: { paddingVertical: 8 },
  link: { color: Colors.primary, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
