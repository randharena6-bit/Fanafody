import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getItemById, Item } from '../../services/api';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [id]);

  async function loadItem() {
    try {
      const data = await getItemById(Number(id));
      setItem(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Élément non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[
            styles.badge,
            { backgroundColor: item.status === 'done' ? '#4CAF50' : '#FF9800' },
          ]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        {item.description && (
          <>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </>
        )}

        <Text style={styles.label}>Créé le</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <Text style={styles.label}>Mis à jour le</Text>
        <Text style={styles.date}>
          {new Date(item.updated_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: '700', flex: 1, marginRight: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 4,
  },
  description: { fontSize: 16, color: '#333', lineHeight: 22 },
  date: { fontSize: 15, color: '#555' },
});
