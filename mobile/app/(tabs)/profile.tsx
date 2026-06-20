import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../services/auth';
import { getContacts, deleteContact, TrustedContact } from '../../services/api';
import { Colors, Fonts } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  async function loadContacts() {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateProfile() {
    try {
      await refreshUser();
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  }

  async function handleDeleteContact(id: number) {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce contact ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await deleteContact(id);
          loadContacts();
        } catch (err: any) {
          Alert.alert('Erreur', err.message);
        }
      }},
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        {editing ? (
          <View style={styles.editForm}>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom" />
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Téléphone" keyboardType="phone-pad" />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.phone ? <Text style={styles.phone}>{user?.phone}</Text> : null}
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>Modifier le profil</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contacts de confiance</Text>
          <TouchableOpacity onPress={() => router.push('/contact/add')}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.emptyContacts}>
            <Ionicons name="people-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Aucun contact de confiance</Text>
            <Text style={styles.emptySub}>Ajoutez un proche pour être alerté en cas d'oubli</Text>
          </View>
        ) : (
          contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.phone ? <Text style={styles.contactDetail}>{contact.phone}</Text> : null}
                {contact.email ? <Text style={styles.contactDetail}>{contact.email}</Text> : null}
                <Text style={styles.contactAlert}>Alerte après {contact.notify_after_missed} oublis</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteContact(contact.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          <Text style={styles.rowText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          <Text style={styles.rowText}>À propos</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profile: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: Fonts.sizes.xl, fontWeight: '700' },
  email: { color: Colors.textSecondary, marginTop: 4, fontSize: Fonts.sizes.md },
  phone: { color: Colors.textSecondary, marginTop: 2, fontSize: Fonts.sizes.sm },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 },
  editBtnText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '500' },
  editForm: { width: '80%', gap: 8 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: Fonts.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, padding: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  section: { backgroundColor: Colors.card, marginBottom: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.text },
  emptyContacts: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: Colors.textMuted, marginTop: 8, fontSize: Fonts.sizes.md },
  emptySub: { color: Colors.textMuted, marginTop: 4, fontSize: Fonts.sizes.sm, textAlign: 'center' },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: Fonts.sizes.md, fontWeight: '600' },
  contactDetail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 1 },
  contactAlert: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { flex: 1, marginLeft: 12, fontSize: Fonts.sizes.md },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { color: Colors.danger, fontSize: Fonts.sizes.md, fontWeight: '600' },
});
