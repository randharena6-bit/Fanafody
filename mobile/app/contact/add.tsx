import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createContact } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function AddContactScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notifyAfter, setNotifyAfter] = useState('3');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    setLoading(true);
    try {
      await createContact(name.trim(), phone.trim(), email.trim(), parseInt(notifyAfter) || 3);
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nom du contact *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Marie Dupont" />

      <Text style={styles.label}>Téléphone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+261 XX XXX XX" keyboardType="phone-pad" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Alerte après X oublis</Text>
      <TextInput style={styles.input} value={notifyAfter} onChangeText={setNotifyAfter} placeholder="3" keyboardType="number-pad" />

      <Text style={styles.hint}>
        Un SMS ou email sera envoyé à ce contact après le nombre d'oublis défini.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajouter le contact</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 6 },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: Fonts.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '600' },
});
