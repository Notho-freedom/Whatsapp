const Database = require('better-sqlite3');

try {
  const db = new Database('./database/whatsapp.db');
  
  console.log('Structure de la table contact_groups:');
  const columns = db.prepare('PRAGMA table_info(contact_groups)').all();
  columns.forEach(col => {
    console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  db.close();
} catch (error) {
  console.error('Erreur:', error.message);
}
