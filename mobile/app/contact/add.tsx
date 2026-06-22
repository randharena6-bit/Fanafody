import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createContact } from '../../services/api';
import { Colors, Fonts, Shadows, Radius } from '../../constants/theme';
import { useFadeIn, useAnimatedPress } from '../../hooks/useAnimatedEntry';

function FormField({ label, icon, ...props }: {
  label: string; icon: keyof typeof Ionicons.glyphMap;
  value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholderTextColor={Colors.textMuted} {...props} />
      </View>
    </View>
  );
}

export default function AddContactScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notifyAfter, setNotifyAfter] = useState('3');
  const [loading, setLoading] = useState(false);
  const { opacity, translateY } = useFadeIn(0, 500);
  const btnAnim = useAnimatedPress();

  async function handleSave() {
    if (!name) { Alert.alert('Erreur', 'Le nom est obligatoire'); return; }
    setLoading(true);
    try {
      await createContact(name.trim(), phone.trim(), email.trim(), parseInt(notifyAfter) || 3);
      router.back();
    } catch (err: any) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 8 }}>
        <Text style={styles.screenTitle}>Nouveau contact</Text>
        <Text style={styles.screenSub}>Ajoutez une personne de confiance</Text>
      </Animated.View>

      <FormField label="Nom du contact *" icon="person-outline" value={name} onChangeText={setName} placeholder="Ex: Marie Dupont" />
      <FormField label="Téléphone" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+261 XX XXX XX" keyboardType="phone-pad" />
      <FormField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" />
      <FormField label="Alerte après X oublis" icon="alert-circle-outline" value={notifyAfter} onChangeText={setNotifyAfter} placeholder="3" keyboardType="number-pad" />

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.hint}>
          Un SMS ou email sera envoyé à ce contact après le nombre d'oublis défini.
        </Text>
      </View>

      <Animated.View style={{ transform: [{ scale: btnAnim.scale }], marginTop: 8 }}>
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajouter le contact</Text>}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  screenSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 8 },
  label: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.sm,
    paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.sm,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: Fonts.sizes.md, color: Colors.text },
  hintBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, backgroundColor: Colors.backgroundDark, padding: 12, borderRadius: Radius.sm },
  hint: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, fontStyle: 'italic', flex: 1, lineHeight: 20 },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16,
    alignItems: 'center', marginTop: 16,
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
});
