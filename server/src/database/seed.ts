import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'fanafody.db');

if (!fs.existsSync(DATA_DIR)) {
  console.error('Database not found. Run migration first.');
  process.exit(1);
}

const db = new Database(DB_PATH);

const hash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(`
  INSERT INTO users (email, name, phone, password) VALUES (?, ?, ?, ?)
`);

const insertMedication = db.prepare(`
  INSERT INTO medications (user_id, name, dosage, time, start_date, end_date, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertLog = db.prepare(`
  INSERT INTO medication_logs (medication_id, user_id, status, taken_at)
  VALUES (?, ?, ?, ?)
`);

const seed = db.transaction(() => {
  db.exec('DELETE FROM medication_logs');
  db.exec('DELETE FROM medications');
  db.exec('DELETE FROM password_reset_tokens');
  db.exec('DELETE FROM trusted_contacts');
  db.exec('DELETE FROM users');
  const u = insertUser.run('admin@fanafody.app', 'Admin', '+26134000000', hash);
  const uid = u.lastInsertRowid;

  const m1 = insertMedication.run(uid, 'Paracétamol', '500mg', '08:00', '2026-06-01', '2026-12-31', 'Après le petit-déjeuner');
  const m2 = insertMedication.run(uid, 'Vitamine D', '1000 UI', '12:00', '2026-06-01', '', 'Avec le déjeuner');
  const m3 = insertMedication.run(uid, 'Ibuprofène', '200mg', '20:00', '2026-06-15', '2026-07-15', 'Si douleur');

  insertLog.run(m1.lastInsertRowid, uid, 'taken', '2026-06-19 08:05:00');
  insertLog.run(m1.lastInsertRowid, uid, 'taken', '2026-06-18 08:10:00');
  insertLog.run(m2.lastInsertRowid, uid, 'taken', '2026-06-19 12:02:00');
  insertLog.run(m3.lastInsertRowid, uid, 'skipped', '2026-06-18 20:00:00');
});

seed();
console.log('Seed completed successfully.');
db.close();
