const Database = require('better-sqlite3');

try {
  const db = new Database('./database/whatsapp.db');
  
  console.log('Structure de la table messages:');
  const messageColumns = db.prepare('PRAGMA table_info(messages)').all();
  messageColumns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  console.log('\nStructure de la table conversations:');
  const conversationColumns = db.prepare('PRAGMA table_info(conversations)').all();
  conversationColumns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  db.close();
} catch (error) {
  console.error('Erreur:', error.message);
}
