const databaseService = require('../src/utils/databaseService');

function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure des tables...\n');
    
    // Vérifier la structure de la table users
    console.log('📋 Structure de la table users:');
    const userColumns = databaseService.all("PRAGMA table_info(users);");
    userColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n📋 Structure de la table contacts:');
    const contactColumns = databaseService.all("PRAGMA table_info(contacts);");
    contactColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n📋 Structure de la table conversations:');
    const conversationColumns = databaseService.all("PRAGMA table_info(conversations);");
    conversationColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    console.log('\n📋 Structure de la table auth_sessions:');
    const sessionColumns = databaseService.all("PRAGMA table_info(auth_sessions);");
    sessionColumns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    databaseService.close();
  }
}

checkTableStructure();
