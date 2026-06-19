import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getItems, Item } from '../../services/api';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const data = await getItems(1);
      setItems(data);
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

  function renderItem({ item }: { item: Item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/item/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[
            styles.badge,
            { backgroundColor: item.status === 'done' ? '#4CAF50' : '#FF9800' },
          ]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        {item.description && (
          <Text style={styles.cardDescription}>{item.description}</Text>
        )}
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun élément</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  cardDescription: { color: '#666', marginTop: 6, fontSize: 14 },
  cardDate: { color: '#999', marginTop: 8, fontSize: 12 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 16 },
});
