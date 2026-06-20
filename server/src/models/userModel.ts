import { getDatabase } from '../database/connection';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export function findUserByEmail(email: string): User | undefined {
  return getDatabase().prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return getDatabase().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(email: string, password: string, name: string, phone?: string): User {
  const db = getDatabase();
  db.prepare('INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)').run(email, password, name, phone || '');
  return findUserByEmail(email)!;
}

export function updateUser(id: number, name: string, phone: string): User | undefined {
  const db = getDatabase();
  db.prepare('UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, phone, id);
  return findUserById(id);
}

export function findAllUsers(): Omit<User, 'password'>[] {
  return getDatabase().prepare('SELECT id, email, name, phone, created_at, updated_at FROM users ORDER BY created_at DESC').all() as Omit<User, 'password'>[];
}

export function deleteUser(id: number): boolean {
  const r = getDatabase().prepare('DELETE FROM users WHERE id = ?').run(id);
  return r.changes > 0;
}

export function updatePassword(id: number, password: string): void {
  getDatabase().prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(password, id);
}
