const Database = require('better-sqlite3');

try {
  const db = new Database('./database/whatsapp.db');
  
  console.log('Structure de la table conversations:');
  const columns = db.prepare('PRAGMA table_info(conversations)').all();
  columns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  console.log('\nStructure de la table contacts:');
  const contactColumns = db.prepare('PRAGMA table_info(contacts)').all();
  contactColumns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  console.log('\nStructure de la table conversation_participants:');
  const participantColumns = db.prepare('PRAGMA table_info(conversation_participants)').all();
  participantColumns.forEach(col => {
    console.log(`- ${col.name}: ${col.type}`);
  });
  
  db.close();
} catch (error) {
  console.error('Erreur:', error.message);
}
