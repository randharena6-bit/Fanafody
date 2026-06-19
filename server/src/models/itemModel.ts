import { getDatabase } from '../database/connection';

export interface Item {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function findItemsByUser(userId: number): Item[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Item[];
}

export function findItemById(id: number): Item | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item | undefined;
}

export function createItem(userId: number, title: string, description?: string): Item {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO items (user_id, title, description) VALUES (?, ?, ?)').run(userId, title, description || null);
  return findItemById(result.lastInsertRowid as number)!;
}

export function updateItem(id: number, title: string, description: string | null, status: string): Item | undefined {
  const db = getDatabase();
  db.prepare('UPDATE items SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, description, status, id);
  return findItemById(id);
}

export function deleteItem(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}
