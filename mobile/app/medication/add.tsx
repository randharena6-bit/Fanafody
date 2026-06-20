import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createMedication } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function AddMedicationScreen() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name || !time || !startDate) {
      Alert.alert('Erreur', 'Champs requis : Nom, Heure, Date de début');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Erreur', 'Format d\'heure invalide (HH:MM)');
      return;
    }
    setLoading(true);
    try {
      await createMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        time: time.trim(),
        start_date: startDate,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nom du médicament *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Paracétamol" />

      <Text style={styles.label}>Dosage</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="Ex: 500mg" />

      <Text style={styles.label}>Heure de prise *</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM (ex: 08:00)" keyboardType="numbers-and-punctuation" />

      <Text style={styles.label}>Date de début *</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ" />

      <Text style={styles.label}>Date de fin (optionnelle)</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ (laisser vide pour continuer)" />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Instructions, précautions..." multiline numberOfLines={3} />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajouter</Text>}
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '600' },
});
