import { getDatabase } from '../database/connection';

export interface TrustedContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  notify_after_missed: number;
  created_at: string;
}

export function findContactsByUser(userId: number): TrustedContact[] {
  return getDatabase().prepare(
    'SELECT * FROM trusted_contacts WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId) as TrustedContact[];
}

export function findContactById(id: number): TrustedContact | undefined {
  return getDatabase().prepare('SELECT * FROM trusted_contacts WHERE id = ?').get(id) as TrustedContact | undefined;
}

export function createContact(userId: number, name: string, phone: string, email: string, notifyAfterMissed: number): TrustedContact {
  const db = getDatabase();
  const r = db.prepare(`
    INSERT INTO trusted_contacts (user_id, name, phone, email, notify_after_missed)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, name, phone, email, notifyAfterMissed);
  return findContactById(r.lastInsertRowid as number)!;
}

export function updateContact(id: number, userId: number, data: Partial<TrustedContact>): TrustedContact | undefined {
  const db = getDatabase();
  const existing = findContactById(id);
  if (!existing || existing.user_id !== userId) return undefined;

  db.prepare(`
    UPDATE trusted_contacts SET name=?, phone=?, email=?, notify_after_missed=?
    WHERE id=? AND user_id=?
  `).run(
    data.name ?? existing.name,
    data.phone ?? existing.phone,
    data.email ?? existing.email,
    data.notify_after_missed ?? existing.notify_after_missed,
    id, userId
  );
  return findContactById(id);
}

export function deleteContact(id: number, userId: number): boolean {
  const db = getDatabase();
  const r = db.prepare('DELETE FROM trusted_contacts WHERE id = ? AND user_id = ?').run(id, userId);
  return r.changes > 0;
}
