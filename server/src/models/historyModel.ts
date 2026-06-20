import { getDatabase } from '../database/connection';

export interface MedicationLog {
  id: number;
  medication_id: number;
  user_id: number;
  status: 'taken' | 'skipped';
  taken_at: string;
  created_at: string;
}

export function logMedication(medicationId: number, userId: number, status: 'taken' | 'skipped', takenAt?: string): MedicationLog {
  const db = getDatabase();
  const r = db.prepare(`
    INSERT INTO medication_logs (medication_id, user_id, status, taken_at)
    VALUES (?, ?, ?, ?)
  `).run(medicationId, userId, status, takenAt || new Date().toISOString());
  return db.prepare('SELECT * FROM medication_logs WHERE id = ?').get(r.lastInsertRowid) as MedicationLog;
}

export function getMedicationLogs(medicationId: number, userId: number): MedicationLog[] {
  return getDatabase().prepare(
    'SELECT * FROM medication_logs WHERE medication_id = ? AND user_id = ? ORDER BY taken_at DESC'
  ).all(medicationId, userId) as MedicationLog[];
}

export function getHistoryByDateRange(userId: number, from: string, to: string): any[] {
  return getDatabase().prepare(`
    SELECT ml.*, m.name as medication_name, m.dosage, m.time as scheduled_time
    FROM medication_logs ml
    JOIN medications m ON m.id = ml.medication_id
    WHERE ml.user_id = ? AND date(ml.taken_at) BETWEEN ? AND ?
    ORDER BY ml.taken_at DESC
  `).all(userId, from, to) as any[];
}

export function getDailySummary(userId: number, date: string): any {
  const db = getDatabase();
  const taken = db.prepare(`
    SELECT COUNT(DISTINCT medication_id) as count FROM medication_logs
    WHERE user_id = ? AND date(taken_at) = ? AND status = 'taken'
  `).get(userId, date) as any;

  const skipped = db.prepare(`
    SELECT COUNT(DISTINCT medication_id) as count FROM medication_logs
    WHERE user_id = ? AND date(taken_at) = ? AND status = 'skipped'
  `).get(userId, date) as any;

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM medications
    WHERE user_id = ? AND date(start_date) <= ? AND (end_date = '' OR date(end_date) >= ?)
  `).get(userId, date, date) as any;

  return {
    date,
    total: total.count,
    taken: taken.count,
    skipped: skipped.count,
    missed: Math.max(0, total.count - taken.count - skipped.count),
  };
}
