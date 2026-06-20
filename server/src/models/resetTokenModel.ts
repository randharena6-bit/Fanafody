import { getDatabase } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export function createResetToken(userId: number): string {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
  getDatabase().prepare(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).run(userId, token, expiresAt);
  return token;
}

export function verifyResetToken(token: string): { userId: number } | null {
  const row = getDatabase().prepare(`
    SELECT user_id FROM password_reset_tokens
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).get(token) as { userId: number } | undefined;
  return row || null;
}

export function markTokenUsed(token: string): void {
  getDatabase().prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);
}
