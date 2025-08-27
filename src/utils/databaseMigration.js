const databaseService = require('./databaseService');

/**
 * Script de migration pour ajouter la colonne is_temporary
 */
async function migrateDatabase() {
  try {
    console.log('🔄 Début de la migration de la base de données...');

    // Vérifier si la colonne is_temporary existe déjà
    const tableInfo = await databaseService.all(`
      PRAGMA table_info(conversations)
    `);

    const hasIsTemporaryColumn = tableInfo.some(column => column.name === 'is_temporary');

    if (!hasIsTemporaryColumn) {
      console.log('📝 Ajout de la colonne is_temporary à la table conversations...');
      
      // Ajouter la colonne is_temporary
      await databaseService.run(`
        ALTER TABLE conversations 
        ADD COLUMN is_temporary BOOLEAN DEFAULT FALSE
      `);

      // Créer l'index pour les conversations temporaires
      await databaseService.run(`
        CREATE INDEX IF NOT EXISTS idx_conversations_temporary 
        ON conversations(is_temporary)
      `);

      console.log('✅ Colonne is_temporary ajoutée avec succès');
    } else {
      console.log('ℹ️ La colonne is_temporary existe déjà');
    }

    // Vérifier si la colonne is_virtual_contact existe dans conversation_participants
    const participantsTableInfo = await databaseService.all(`
      PRAGMA table_info(conversation_participants)
    `);

    const hasIsVirtualContactColumn = participantsTableInfo.some(column => column.name === 'is_virtual_contact');

    if (!hasIsVirtualContactColumn) {
      console.log('📝 Ajout de la colonne is_virtual_contact à la table conversation_participants...');
      
      // Ajouter la colonne is_virtual_contact
      await databaseService.run(`
        ALTER TABLE conversation_participants 
        ADD COLUMN is_virtual_contact BOOLEAN DEFAULT FALSE
      `);

      console.log('✅ Colonne is_virtual_contact ajoutée avec succès');
    } else {
      console.log('ℹ️ La colonne is_virtual_contact existe déjà');
    }

    console.log('✅ Migration terminée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return false;
  }
}

// Exporter la fonction de migration
module.exports = { migrateDatabase };

// Exécuter la migration si le fichier est appelé directement
if (require.main === module) {
  migrateDatabase().then(success => {
    if (success) {
      console.log('🎉 Migration réussie !');
      process.exit(0);
    } else {
      console.error('💥 Migration échouée !');
      process.exit(1);
    }
  });
}
