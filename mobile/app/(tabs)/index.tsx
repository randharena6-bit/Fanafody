import { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getTodaysMedications, logMedicationIntake, getMedications, Medication } from '../../services/api';
import { Colors, Fonts, Shadows, Radius, Spacing, Gradients } from '../../constants/theme';
import { rescheduleAllReminders } from '../../services/notifications';
import { useFadeIn, useStaggeredAnimation, useAnimatedPress } from '../../hooks/useAnimatedEntry';

const { width } = Dimensions.get('window');

function TodayHeader() {
  const { opacity, translateY } = useFadeIn(0, 600);
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <LinearGradient
        colors={[Gradients.primary[0], Gradients.primary[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Fanafody</Text>
        <Text style={styles.headerDate}>{dateStr}</Text>
        <View style={styles.headerBadge}>
          <Ionicons name="medkit-outline" size={14} color="#fff" />
          <Text style={styles.headerBadgeText}>Rappel de médicaments</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function MedicationCard({ item, index, onLog }: { item: Medication; index: number; onLog: (id: number, status: 'taken' | 'skipped') => void }) {
  const { opacity, translateY } = useFadeIn(200 + index * 100, 500);
  const isPending = !item.today_log;
  const isTaken = item.today_log === 'taken';
  const isSkipped = item.today_log === 'skipped';

  const statusColor = isTaken ? Colors.success : isSkipped ? Colors.danger : Colors.secondary;
  const statusIcon = isTaken ? 'checkmark-circle' : isSkipped ? 'close-circle' : 'time-outline';
  const statusLabel = isTaken ? 'Pris' : isSkipped ? 'Ignoré' : 'En attente';

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[styles.card, isPending && styles.cardPending]}>
        <TouchableOpacity onPress={() => router.push(`/medication/${item.id}`)} style={styles.cardTouch} activeOpacity={0.7}>
          <View style={styles.cardLeft}>
            <View style={[styles.timePill, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.timeText, { color: statusColor }]}>{item.time}</Text>
            </View>
          </View>

          <View style={styles.cardCenter}>
            <Text style={styles.medName}>{item.name}</Text>
            {item.dosage ? <Text style={styles.dosage}>{item.dosage}</Text> : null}
            {item.notes ? (
              <View style={styles.notesRow}>
                <Ionicons name="document-text-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.statusDot, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        {isPending ? (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.takenBtn]} onPress={() => onLog(item.id, 'taken')} activeOpacity={0.8}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.actionText}>Pris</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={[styles.actionBtn, styles.skippedBtn]} onPress={() => onLog(item.id, 'skipped')} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.actionText}>Ignoré</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loggedBanner}>
            <Ionicons name={isTaken ? 'checkmark-circle' : 'alert-circle'} size={16} color={statusColor} />
            <Text style={[styles.loggedText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabAnimHook = useAnimatedPress();

  useEffect(() => {
    Animated.spring(fabAnim, { toValue: 1, friction: 5, tension: 60, delay: 600, useNativeDriver: true }).start();
  }, [medications]);

  useFocusEffect(useCallback(() => { loadMedications(); }, []));

  async function loadMedications() {
    try {
      const data = await getTodaysMedications();
      setMedications(data);
      const all = await getMedications();
      await rescheduleAllReminders(all);
    } catch (err: any) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }

  async function handleLog(medicationId: number, status: 'taken' | 'skipped') {
    try {
      await logMedicationIntake(medicationId, status);
      loadMedications();
    } catch (err: any) { Alert.alert('Erreur', err.message); }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => <MedicationCard item={item} index={index} onLog={handleLog} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMedications(); }} tintColor={Colors.primary} />}
        ListHeaderComponent={<TodayHeader />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="medkit-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun médicament aujourd'hui</Text>
            <Text style={styles.emptySub}>Ajoutez vos traitements pour recevoir des rappels</Text>
          </View>
        }
      />

      <Animated.View style={[styles.fabWrap, { transform: [{ scale: fabAnimHook.scale }, { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }], opacity: fabAnim }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/medication/add')}
          onPressIn={fabAnimHook.onPressIn}
          onPressOut={fabAnimHook.onPressOut}
          activeOpacity={1}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 100 },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    marginBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerDate: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4, textTransform: 'capitalize', fontWeight: '500' },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  headerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: Colors.card, marginHorizontal: 16, marginBottom: 12,
    borderRadius: Radius.lg, overflow: 'hidden',
    ...Shadows.md,
  },
  cardPending: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  cardTouch: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  cardLeft: { alignItems: 'center' },
  timePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  timeText: { fontSize: Fonts.sizes.md, fontWeight: '700' },
  cardCenter: { flex: 1 },
  medName: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
  dosage: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  notesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  notesText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, flex: 1 },
  statusDot: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  actionDivider: { width: 1, backgroundColor: Colors.border },
  takenBtn: { backgroundColor: Colors.success },
  skippedBtn: { backgroundColor: Colors.danger },
  actionText: { color: '#fff', fontSize: Fonts.sizes.md, fontWeight: '700' },
  loggedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, backgroundColor: Colors.backgroundDark, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  loggedText: { fontSize: Fonts.sizes.sm, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '700' },
  emptySub: { color: Colors.textMuted, marginTop: 8, fontSize: Fonts.sizes.md, textAlign: 'center', lineHeight: 22 },
  fabWrap: { position: 'absolute', bottom: 24, right: 20 },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.xl,
  },
});
