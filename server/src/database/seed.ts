import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'fanafody.db');

if (!fs.existsSync(DATA_DIR)) {
  console.error('Database not found. Run migration first.');
  process.exit(1);
}

const db = new Database(DB_PATH);

const insertUser = db.prepare(`
  INSERT INTO users (email, name, password)
  VALUES (?, ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO items (user_id, title, description, status)
  VALUES (?, ?, ?, ?)
`);

const insertSettings = db.prepare(`
  INSERT INTO settings (user_id, theme, language)
  VALUES (?, ?, ?)
`);

const seed = db.transaction(() => {
  const userResult = insertUser.run('admin@fanafody.app', 'Admin', 'password123');
  const userId = userResult.lastInsertRowid;

  insertItem.run(userId, 'Bienvenue sur Fanafody', 'Premier élément de démonstration', 'active');
  insertItem.run(userId, 'Apprendre React Native', 'Tutoriel pour débuter avec Expo', 'active');
  insertItem.run(userId, 'Configurer le backend', 'Mettre en place Express et SQLite', 'done');

  insertSettings.run(userId, 'dark', 'fr');
});

seed();
console.log('Seed completed successfully.');
db.close();
