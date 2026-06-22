import { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../services/auth';
import { getContacts, deleteContact, TrustedContact } from '../../services/api';
import { Colors, Fonts, Shadows, Radius, Gradients } from '../../constants/theme';
import { useFadeIn, useAnimatedPress } from '../../hooks/useAnimatedEntry';

function AnimatedSection({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  const { opacity, translateY } = useFadeIn(delay, 500);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
      </View>
    </Animated.View>
  );
}

function SettingsRow({ icon, label, onPress, color = Colors.primary }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; color?: string }) {
  const btnAnim = useAnimatedPress();

  return (
    <Animated.View style={{ transform: [{ scale: btnAnim.scale }] }}>
      <TouchableOpacity style={styles.row} onPress={onPress} onPressIn={btnAnim.onPressIn} onPressOut={btnAnim.onPressOut} activeOpacity={1}>
        <View style={[styles.rowIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function ContactItem({ contact, onDelete }: { contact: TrustedContact; onDelete: (id: number) => void }) {
  const { opacity, translateY } = useFadeIn(0, 400);

  return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.contactCard}>
        <View style={styles.contactAvatar}>
          <Ionicons name="person" size={18} color={Colors.primary} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          {contact.phone ? <Text style={styles.contactDetail}>{contact.phone}</Text> : null}
          {contact.email ? <Text style={styles.contactDetail}>{contact.email}</Text> : null}
          <Text style={styles.contactAlert}>Alerte après {contact.notify_after_missed} oublis</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(contact.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const headerAnim = useFadeIn(0, 500);
  const editBtnAnim = useAnimatedPress();
  const logoutBtnAnim = useAnimatedPress();

  useFocusEffect(useCallback(() => { loadContacts(); }, []));

  async function loadContacts() {
    try { const data = await getContacts(); setContacts(data); }
    catch (err) { console.error(err); }
  }

  async function handleUpdateProfile() {
    try {
      await refreshUser();
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (err: any) { Alert.alert('Erreur', err.message); }
  }

  async function handleDeleteContact(id: number) {
    Alert.alert('Supprimer', 'Voulez-vous supprimer ce contact ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { try { await deleteContact(id); loadContacts(); } catch (err: any) { Alert.alert('Erreur', err.message); } } },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] }}>
        <LinearGradient colors={[Gradients.primary[0], Gradients.primary[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <Text style={styles.gradientTitle}>Profil</Text>
          <Text style={styles.gradientSub}>Gérez votre compte</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.profileCard, { opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] }]}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          {editing ? (
            <View style={styles.editForm}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom" placeholderTextColor={Colors.textMuted} />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Téléphone" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{user?.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.emailBadge}>
                  <Ionicons name="mail-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.emailText}>{user?.email}</Text>
                </View>
              </View>
              {user?.phone ? (
                <View style={styles.badgeRow}>
                  <View style={styles.emailBadge}>
                    <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.emailText}>{user?.phone}</Text>
                  </View>
                </View>
              ) : null}
              <Animated.View style={{ transform: [{ scale: editBtnAnim.scale }] }}>
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)} onPressIn={editBtnAnim.onPressIn} onPressOut={editBtnAnim.onPressOut} activeOpacity={1}>
                  <Ionicons name="create-outline" size={16} color={Colors.primary} />
                  <Text style={styles.editBtnText}>Modifier le profil</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </View>
      </Animated.View>

      <AnimatedSection title="Contacts de confiance" delay={200}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSub}>Proches à alerter en cas d'oubli</Text>
          <TouchableOpacity onPress={() => router.push('/contact/add')} style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
        {contacts.length === 0 ? (
          <View style={styles.emptyContacts}>
            <Ionicons name="people-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucun contact de confiance</Text>
          </View>
        ) : (
          contacts.map((contact) => <ContactItem key={contact.id} contact={contact} onDelete={handleDeleteContact} />)
        )}
      </AnimatedSection>

      <AnimatedSection title="Paramètres" delay={300}>
        <SettingsRow icon="notifications-outline" label="Notifications" />
        <SettingsRow icon="information-circle-outline" label="À propos" color={Colors.secondary} />
      </AnimatedSection>

      <Animated.View style={{ opacity: headerAnim.opacity }}>
        <Animated.View style={{ transform: [{ scale: logoutBtnAnim.scale }] }}>
          <TouchableOpacity style={styles.logoutBtn} onPress={signOut} onPressIn={logoutBtnAnim.onPressIn} onPressOut={logoutBtnAnim.onPressOut} activeOpacity={1}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  gradientTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  gradientSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  profileCard: {
    backgroundColor: Colors.card, marginHorizontal: 16, marginTop: -10,
    borderRadius: Radius.lg, ...Shadows.md, overflow: 'hidden',
  },
  profileTop: { alignItems: 'center', padding: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    ...Shadows.lg,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  emailBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm },
  emailText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  editForm: { width: '100%', gap: 8 },
  input: { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 12, fontSize: Fonts.sizes.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.sm, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary + '10', borderRadius: Radius.sm },
  editBtnText: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  section: { backgroundColor: Colors.card, marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: Radius.lg, ...Shadows.sm },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.text },
  sectionSub: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm, gap: 4 },
  addBtnText: { color: '#fff', fontSize: Fonts.sizes.sm, fontWeight: '700' },
  emptyContacts: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 6 },
  contactCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  contactAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 10 },
  contactName: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.text },
  contactDetail: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 1 },
  contactAlert: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 1 },
  deleteBtn: { padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: 12, fontSize: Fonts.sizes.md, fontWeight: '500', color: Colors.text },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.card, borderRadius: Radius.lg, gap: 8,
    ...Shadows.sm,
  },
  logoutText: { color: Colors.danger, fontSize: Fonts.sizes.md, fontWeight: '700' },
});
