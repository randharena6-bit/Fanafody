import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/auth';
import { Colors, Shadows, Radius, Fonts } from '../../constants/theme';
import { useAnimatedPress } from '../../hooks/useAnimatedEntry';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(40)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  const btnAnim = useAnimatedPress();

  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: 1, friction: 4, tension: 60, useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(titleTranslate, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
      Animated.timing(formTranslate, { toValue: 0, duration: 600, delay: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
          <View style={styles.iconBg}>
            <Ionicons name="medkit" size={36} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.header, { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }]}>
          <Text style={styles.appName}>Fanafody</Text>
          <Text style={styles.subtitle}>Ne manquez plus jamais vos médicaments</Text>
        </Animated.View>

        <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formTranslate }] }]}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: btnAnim.scale }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
              onPressIn={btnAnim.onPressIn}
              onPressOut={btnAnim.onPressOut}
              activeOpacity={1}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkBtn}>
            <Text style={styles.link}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.linkBtn}>
            <Text style={styles.linkSmall}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.text, letterSpacing: 0.5 },
  subtitle: { color: Colors.textSecondary, marginTop: 8, fontSize: 16, fontWeight: '500' },
  form: { gap: 14 },
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
    alignItems: 'center', marginTop: 4,
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  linkBtn: { paddingVertical: 4 },
  link: { color: Colors.primary, textAlign: 'center', fontSize: 16, fontWeight: '600', marginTop: 8 },
  linkSmall: { color: Colors.textSecondary, textAlign: 'center', fontSize: 14, marginTop: 4 },
});
