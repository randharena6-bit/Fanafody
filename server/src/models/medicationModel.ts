import { getDatabase } from '../database/connection';

export interface Medication {
  id: number;
  user_id: number;
  name: string;
  dosage: string;
  photo_url: string;
  time: string;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationInput {
  name: string;
  dosage?: string;
  photo_url?: string;
  time: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export function findMedicationsByUser(userId: number): Medication[] {
  return getDatabase().prepare(
    'SELECT * FROM medications WHERE user_id = ? ORDER BY time ASC'
  ).all(userId) as Medication[];
}

export function findMedicationById(id: number): Medication | undefined {
  return getDatabase().prepare('SELECT * FROM medications WHERE id = ?').get(id) as Medication | undefined;
}

export function createMedication(userId: number, data: MedicationInput): Medication {
  const db = getDatabase();
  const r = db.prepare(`
    INSERT INTO medications (user_id, name, dosage, photo_url, time, start_date, end_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, data.name, data.dosage || '', data.photo_url || '', data.time, data.start_date, data.end_date || '', data.notes || '');
  return findMedicationById(r.lastInsertRowid as number)!;
}

export function updateMedication(id: number, userId: number, data: Partial<MedicationInput>): Medication | undefined {
  const db = getDatabase();
  const existing = findMedicationById(id);
  if (!existing || existing.user_id !== userId) return undefined;

  db.prepare(`
    UPDATE medications SET name=?, dosage=?, photo_url=?, time=?, start_date=?, end_date=?, notes=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    data.name ?? existing.name,
    data.dosage ?? existing.dosage,
    data.photo_url ?? existing.photo_url,
    data.time ?? existing.time,
    data.start_date ?? existing.start_date,
    data.end_date ?? existing.end_date,
    data.notes ?? existing.notes,
    id
  );
  return findMedicationById(id);
}

export function deleteMedication(id: number, userId: number): boolean {
  const db = getDatabase();
  const r = db.prepare('DELETE FROM medications WHERE id = ? AND user_id = ?').run(id, userId);
  return r.changes > 0;
}

export function findTodaysMedications(userId: number, date: string): (Medication & { today_log: string | null })[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT m.*, ml.status as today_log
    FROM medications m
    LEFT JOIN medication_logs ml ON ml.medication_id = m.id AND date(ml.taken_at) = ?
    WHERE m.user_id = ?
    AND date(m.start_date) <= ?
    AND (m.end_date = '' OR date(m.end_date) >= ?)
    ORDER BY m.time ASC
  `).all(date, userId, date, date) as any[];
}
