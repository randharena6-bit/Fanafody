import { getDatabase } from '../database/connection';

export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export function findAllUsers(): User[] {
  const db = getDatabase();
  return db.prepare('SELECT id, email, name, created_at, updated_at FROM users').all() as User[];
}

export function findUserById(id: number): User | undefined {
  const db = getDatabase();
  return db.prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(email: string, name: string, password: string): User {
  const db = getDatabase();
  const result = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)').run(email, name, password);
  return findUserById(result.lastInsertRowid as number)!;
}

export function updateUser(id: number, email: string, name: string): User | undefined {
  const db = getDatabase();
  db.prepare('UPDATE users SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(email, name, id);
  return findUserById(id);
}

export function deleteUser(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}
