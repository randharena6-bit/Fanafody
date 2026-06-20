import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getTodaysMedications, logMedicationIntake, getMedications, Medication } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';
import { scheduleMedicationReminder } from '../../services/notifications';

export default function HomeScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [])
  );

  async function loadMedications() {
    try {
      const data = await getTodaysMedications();
      setMedications(data);
      const all = await getMedications();
      all.forEach((m) => scheduleMedicationReminder(m));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleLog(medicationId: number, status: 'taken' | 'skipped') {
    try {
      await logMedicationIntake(medicationId, status);
      loadMedications();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  }

  function getStatusLabel(status: string | null): { label: string; color: string } {
    switch (status) {
      case 'taken': return { label: 'Pris', color: Colors.success };
      case 'skipped': return { label: 'Ignoré', color: Colors.danger };
      default: return { label: 'En attente', color: Colors.secondary };
    }
  }

  function getStatusIcon(status: string | null): keyof typeof Ionicons.glyphMap {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'skipped': return 'close-circle';
      default: return 'time-outline';
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  function renderMedication({ item }: { item: Medication }) {
    const status = getStatusLabel(item.today_log);
    const isPending = !item.today_log;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push(`/medication/${item.id}`)}
          style={styles.cardContent}
        >
          <View style={styles.cardHeader}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{item.name}</Text>
              {item.dosage ? <Text style={styles.dosage}>{item.dosage}</Text> : null}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Ionicons name={getStatusIcon(item.today_log)} size={20} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            {item.notes ? (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText} numberOfLines={1}>{item.notes}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {isPending ? (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.takenBtn]} onPress={() => handleLog(item.id, 'taken')}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionText}>Pris</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.skippedBtn]} onPress={() => handleLog(item.id, 'skipped')}>
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.actionText}>Ignoré</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMedication}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMedications(); }} />}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="medkit-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Aucun médicament aujourd'hui</Text>
            <Text style={styles.emptySub}>Ajoutez vos traitements pour recevoir des rappels</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/medication/add')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 16, paddingBottom: 80 },
  sectionTitle: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text, marginBottom: 16, textTransform: 'capitalize' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medicationInfo: { flex: 1, marginRight: 12 },
  medicationName: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
  dosage: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: { fontSize: Fonts.sizes.sm, fontWeight: '600' },
  details: { marginTop: 10, gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, flex: 1 },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  takenBtn: { backgroundColor: Colors.success },
  skippedBtn: { backgroundColor: Colors.danger },
  actionText: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '600' },
  emptyTitle: { color: Colors.textMuted, marginTop: 16, fontSize: Fonts.sizes.lg, fontWeight: '600' },
  emptySub: { color: Colors.textMuted, marginTop: 8, fontSize: Fonts.sizes.md, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    boxShadow: '0 4px 12px rgba(74,144,217,0.4)',
  },
});
