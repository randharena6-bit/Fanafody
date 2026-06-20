import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { getMedicationById, updateMedication, deleteMedication } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMedication();
    }, [id])
  );

  async function loadMedication() {
    try {
      const med = await getMedicationById(Number(id));
      setName(med.name);
      setDosage(med.dosage);
      setTime(med.time);
      setStartDate(med.start_date);
      setEndDate(med.end_date);
      setNotes(med.notes);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!name || !time || !startDate) {
      Alert.alert('Erreur', 'Champs requis : Nom, Heure, Date de début');
      return;
    }
    setSaving(true);
    try {
      await updateMedication(Number(id), {
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
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce médicament ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await deleteMedication(Number(id));
          router.back();
        } catch (err: any) {
          Alert.alert('Erreur', err.message);
        }
      }},
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nom du médicament *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Dosage</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />

      <Text style={styles.label}>Heure de prise *</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="HH:MM" />

      <Text style={styles.label}>Date de début *</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ" />

      <Text style={styles.label}>Date de fin</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ" />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Supprimer ce médicament</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  deleteBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteText: { color: Colors.danger, fontSize: Fonts.sizes.md, fontWeight: '600' },
});
