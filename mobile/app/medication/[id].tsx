import { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMedicationById, updateMedication, deleteMedication } from '../../services/api';
import { Colors, Fonts, Shadows, Radius } from '../../constants/theme';
import { useFadeIn, useAnimatedPress } from '../../hooks/useAnimatedEntry';

function FormField({ label, icon, ...props }: {
  label: string; icon: keyof typeof Ionicons.glyphMap;
  value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean; numberOfLines?: number;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, props.multiline && { minHeight: 80 }]}>
        <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput style={[styles.input, props.multiline && styles.textArea]} placeholderTextColor={Colors.textMuted} {...props} />
      </View>
    </View>
  );
}

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
  const { opacity, translateY } = useFadeIn(0, 400);
  const saveBtn = useAnimatedPress();
  const deleteBtn = useAnimatedPress();

  useFocusEffect(useCallback(() => { loadMedication(); }, [id]));

  async function loadMedication() {
    try {
      const med = await getMedicationById(Number(id));
      setName(med.name); setDosage(med.dosage); setTime(med.time);
      setStartDate(med.start_date); setEndDate(med.end_date); setNotes(med.notes);
    } catch (err: any) { Alert.alert('Erreur', err.message); router.back(); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!name || !time || !startDate) { Alert.alert('Erreur', 'Champs requis'); return; }
    setSaving(true);
    try {
      await updateMedication(Number(id), { name: name.trim(), dosage: dosage.trim(), time: time.trim(), start_date: startDate, end_date: endDate || undefined, notes: notes.trim() || undefined });
      router.back();
    } catch (err: any) { Alert.alert('Erreur', err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce médicament ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { try { await deleteMedication(Number(id)); router.back(); } catch (err: any) { Alert.alert('Erreur', err.message); } } },
    ]);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 8 }}>
        <Text style={styles.screenTitle}>Modifier le traitement</Text>
        <Text style={styles.screenSub}>Mettez à jour les informations</Text>
      </Animated.View>

      <FormField label="Nom du médicament *" icon="medkit-outline" value={name} onChangeText={setName} />
      <FormField label="Dosage" icon="flask-outline" value={dosage} onChangeText={setDosage} />
      <FormField label="Heure de prise *" icon="time-outline" value={time} onChangeText={setTime} placeholder="HH:MM" />
      <FormField label="Date de début *" icon="calendar-outline" value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ" />
      <FormField label="Date de fin" icon="calendar-outline" value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ" />
      <FormField label="Notes" icon="document-text-outline" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <Animated.View style={{ transform: [{ scale: saveBtn.scale }], marginTop: 8 }}>
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving} onPressIn={saveBtn.onPressIn} onPressOut={saveBtn.onPressOut} activeOpacity={1}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: deleteBtn.scale }] }}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} onPressIn={deleteBtn.onPressIn} onPressOut={deleteBtn.onPressOut} activeOpacity={1}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.deleteText}>Supprimer ce médicament</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 14 },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16,
    alignItems: 'center', marginTop: 16,
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', borderRadius: Radius.md, padding: 16,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, borderWidth: 1.5, borderColor: Colors.danger + '40',
    backgroundColor: Colors.danger + '08',
  },
  deleteText: { color: Colors.danger, fontSize: Fonts.sizes.md, fontWeight: '700' },
});
