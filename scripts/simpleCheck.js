const Database = require('better-sqlite3');
const path = require('path');

try {
  console.log('🔍 Vérification de la structure de la table users...');
  
  const dbPath = path.join(process.cwd(), 'database', 'whatsapp.db');
  const db = new Database(dbPath);
  
  const columns = db.prepare("PRAGMA table_info(users);").all();
  console.log('Colonnes de la table users:');
  columns.forEach(col => {
    console.log(`  ${col.name} (${col.type})`);
  });
  
  db.close();
  
} catch (error) {
  console.error('Erreur:', error);
}
