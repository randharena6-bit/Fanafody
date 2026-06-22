import { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getDailySummary, getHistoryByDateRange, DailySummary, MedicationLog } from '../../services/api';
import { Colors, Fonts, Shadows, Radius, Gradients, Spacing } from '../../constants/theme';
import { useFadeIn, useStaggeredAnimation, useAnimatedPress } from '../../hooks/useAnimatedEntry';

const { width } = Dimensions.get('window');

function SummaryCard({ title, value, color, gradient, icon, delay = 0 }: {
  title: string; value: number; color: string;
  gradient: readonly [string, string]; icon: keyof typeof Ionicons.glyphMap; delay?: number;
}) {
  const { opacity, translateY } = useFadeIn(delay, 500);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      <LinearGradient colors={[gradient[0], gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summaryCard}>
        <Ionicons name={icon} size={20} color="#fff" style={{ marginBottom: 4 }} />
        <Text style={styles.summaryNumber}>{value}</Text>
        <Text style={styles.summaryLabel}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function LogItem({ item, index }: { item: MedicationLog; index: number }) {
  const { opacity, translateY } = useFadeIn(100 + index * 80, 400);
  const isTaken = item.status === 'taken';
  const color = isTaken ? Colors.success : Colors.danger;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[styles.logCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
        <View style={[styles.logIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={isTaken ? 'checkmark-circle' : 'close-circle'} size={22} color={color} />
        </View>
        <View style={styles.logInfo}>
          <Text style={styles.logName}>{item.medication_name || 'Médicament'}</Text>
          <Text style={styles.logTime}>
            {new Date(item.taken_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.logBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.logBadgeText, { color }]}>{isTaken ? 'Pris' : 'Ignoré'}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const headerAnim = useFadeIn(0, 500);
  const navAnim = useAnimatedPress();

  useFocusEffect(useCallback(() => { loadData(); }, [selectedDate]));

  async function loadData() {
    try {
      const [s, l] = await Promise.all([getDailySummary(selectedDate), getHistoryByDateRange(selectedDate, selectedDate)]);
      setSummary(s); setLogs(l);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
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

  function isToday() { return selectedDate === new Date().toISOString().split('T')[0]; }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => <LogItem item={item} index={index} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <>
            <Animated.View style={{ opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] }}>
              <LinearGradient colors={[Gradients.primary[0], Gradients.primary[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                <Text style={styles.gradientTitle}>Historique</Text>
                <Text style={styles.gradientSub}>Suivez votre observance</Text>
              </LinearGradient>
            </Animated.View>

            <View style={styles.dateNav}>
              <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color={Colors.primary} />
              </TouchableOpacity>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                {isToday() && <View style={styles.todayPill}><Text style={styles.todayText}>Aujourd'hui</Text></View>}
              </View>
              <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn} disabled={isToday()} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={22} color={isToday() ? Colors.textMuted : Colors.primary} />
              </TouchableOpacity>
            </View>

            {summary ? (
              <View style={styles.summaryRow}>
                <SummaryCard title="Total" value={summary.total} color={Colors.primary} gradient={Gradients.primary} icon="stats-chart" delay={100} />
                <SummaryCard title="Pris" value={summary.taken} color={Colors.success} gradient={Gradients.success} icon="checkmark-circle" delay={200} />
                <SummaryCard title="Ratés" value={summary.missed} color={Colors.danger} gradient={Gradients.danger} icon="alert-circle" delay={300} />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>Aucune prise enregistrée</Text>
            <Text style={styles.emptySub}>Sélectionnez une autre date</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 24 },
  gradient: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  gradientTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  gradientSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  dateNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    padding: 12, borderRadius: Radius.lg, ...Shadows.md,
  },
  navBtn: { padding: 8, borderRadius: Radius.sm },
  dateInfo: { alignItems: 'center' },
  dateText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text, textTransform: 'capitalize' },
  todayPill: { backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  todayText: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8, marginTop: 4 },
  summaryCard: {
    flex: 1, borderRadius: Radius.md, padding: 14, alignItems: 'center',
    ...Shadows.md,
  },
  summaryNumber: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 2 },
  logCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, marginHorizontal: 16, marginBottom: 8,
    borderRadius: Radius.md, padding: 14, ...Shadows.sm,
  },
  logIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  logInfo: { flex: 1, marginLeft: 12 },
  logName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  logTime: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  logBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  logBadgeText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.backgroundDark, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textMuted, marginTop: 12, fontSize: Fonts.sizes.md, fontWeight: '600' },
  emptySub: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 4 },
});
