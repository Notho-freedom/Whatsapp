const Database = require('better-sqlite3');

try {
  const db = new Database('./database/whatsapp.db');
  
  console.log('Structure de la table users:');
  const columns = db.prepare('PRAGMA table_info(users)').all();
  columns.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  db.close();
} catch (error) {
  console.error('Erreur:', error.message);
}
