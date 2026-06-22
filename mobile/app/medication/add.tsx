import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createMedication } from '../../services/api';
import { Colors, Fonts, Shadows, Radius } from '../../constants/theme';
import { scheduleMedicationReminder } from '../../services/notifications';
import { useFadeIn, useAnimatedPress } from '../../hooks/useAnimatedEntry';

function FormField({ label, icon, ...props }: {
  label: string; icon: keyof typeof Ionicons.glyphMap;
  value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean; numberOfLines?: number;
}) {
  const { opacity, translateY } = useFadeIn(0, 400);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, props.multiline && { minHeight: 80 }]}>
        <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, props.multiline && styles.textArea]}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
      </View>
    </Animated.View>
  );
}

export default function AddMedicationScreen() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const btnAnim = useAnimatedPress();
  const { opacity, translateY } = useFadeIn(0, 500);

  async function handleSave() {
    if (!name || !time || !startDate) {
      Alert.alert('Erreur', 'Champs requis : Nom, Heure, Date de début');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Erreur', "Format d'heure invalide (HH:MM)");
      return;
    }
    setLoading(true);
    try {
      const med = await createMedication({
        name: name.trim(), dosage: dosage.trim(), time: time.trim(),
        start_date: startDate, end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      await scheduleMedicationReminder(med);
      router.back();
    } catch (err: any) { Alert.alert('Erreur', err.message); }
    finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 8 }}>
        <Text style={styles.screenTitle}>Nouveau médicament</Text>
        <Text style={styles.screenSub}>Ajoutez un traitement à votre planning</Text>
      </Animated.View>

      <FormField label="Nom du médicament *" icon="medkit-outline" value={name} onChangeText={setName} placeholder="Ex: Paracétamol" />
      <FormField label="Dosage" icon="flask-outline" value={dosage} onChangeText={setDosage} placeholder="Ex: 500mg" />
      <FormField label="Heure de prise *" icon="time-outline" value={time} onChangeText={setTime} placeholder="HH:MM (ex: 08:00)" keyboardType="numbers-and-punctuation" />
      <FormField label="Date de début *" icon="calendar-outline" value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-JJ" />
      <FormField label="Date de fin (optionnelle)" icon="calendar-outline" value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-JJ (laisser vide)" />
      <FormField label="Notes" icon="document-text-outline" value={notes} onChangeText={setNotes} placeholder="Instructions, précautions..." multiline numberOfLines={3} />

      <Animated.View style={{ transform: [{ scale: btnAnim.scale }], marginTop: 8 }}>
        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ajouter le médicament</Text>}
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
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 14 },
  button: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 16,
    alignItems: 'center', marginTop: 16,
    boxShadow: '0 4px 12px rgba(74,144,217,0.3)',
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: Fonts.sizes.lg, fontWeight: '700' },
});
