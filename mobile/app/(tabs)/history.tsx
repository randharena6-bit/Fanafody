import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getDailySummary, getHistoryByDateRange, DailySummary, MedicationLog } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function HistoryScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  async function loadData() {
    try {
      const [s, l] = await Promise.all([
        getDailySummary(selectedDate),
        getHistoryByDateRange(selectedDate, selectedDate),
      ]);
      setSummary(s);
      setLogs(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function isToday() {
    return selectedDate === new Date().toISOString().split('T')[0];
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  function renderLog({ item }: { item: MedicationLog }) {
    const isTaken = item.status === 'taken';
    return (
      <View style={styles.logCard}>
        <View style={[styles.logIcon, { backgroundColor: isTaken ? Colors.success + '20' : Colors.danger + '20' }]}>
          <Ionicons name={isTaken ? 'checkmark-circle' : 'close-circle'} size={24} color={isTaken ? Colors.success : Colors.danger} />
        </View>
        <View style={styles.logInfo}>
          <Text style={styles.logName}>{item.medication_name || 'Médicament'}</Text>
          <Text style={styles.logTime}>
            {new Date(item.taken_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.logBadge, { backgroundColor: isTaken ? Colors.success + '20' : Colors.danger + '20' }]}>
          <Text style={[styles.logBadgeText, { color: isTaken ? Colors.success : Colors.danger }]}>
            {isTaken ? 'Pris' : 'Ignoré'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {isToday() && <Text style={styles.todayBadge}>Aujourd'hui</Text>}
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn} disabled={isToday()}>
          <Ionicons name="chevron-forward" size={24} color={isToday() ? Colors.textMuted : Colors.primary} />
        </TouchableOpacity>
      </View>

      {summary ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.success + '15' }]}>
            <Text style={[styles.summaryNumber, { color: Colors.success }]}>{summary.taken}</Text>
            <Text style={styles.summaryLabel}>Pris</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.danger + '15' }]}>
            <Text style={[styles.summaryNumber, { color: Colors.danger }]}>{summary.missed}</Text>
            <Text style={styles.summaryLabel}>Ratés</Text>
          </View>
        </View>
      ) : null}

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune prise enregistrée</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 12,
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  navBtn: { padding: 8 },
  dateInfo: { alignItems: 'center' },
  dateText: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  todayBadge: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  summaryNumber: { fontSize: Fonts.sizes.xl, fontWeight: '700', color: Colors.text },
  summaryLabel: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: 16, paddingTop: 0 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  logIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  logInfo: { flex: 1, marginLeft: 12 },
  logName: { fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.text },
  logTime: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  logBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  logBadgeText: { fontSize: Fonts.sizes.sm, fontWeight: '600' },
  emptyText: { color: Colors.textMuted, marginTop: 12, fontSize: Fonts.sizes.md },
});
