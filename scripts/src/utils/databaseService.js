const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour convertir les valeurs pour SQLite
function convertValueForSQLite(value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (value === null || value === undefined) {
    return null;
  }
  return value;
}

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'whatsapp.db');
    this.init();
  }

  init() {
    try {
      // Initialiser la connexion à la base de données
      this.db = new Database(this.dbPath);
      
      // Activer les contraintes de clés étrangères
      this.db.pragma('foreign_keys = ON');
      
      // Activer le mode WAL pour de meilleures performances
      this.db.pragma('journal_mode = WAL');
      
      console.log('✅ Base de données SQLite initialisée avec succès');
      
      // Créer les tables si elles n'existent pas
      this.createTables();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  createTables() {
    try {
      // Lire et exécuter les schémas SQL
      const schemas = [
        'database_schema_part1.sql',
        'database_schema_part2.sql', 
        'database_schema_part3.sql',
        'database_schema_part4.sql'
      ];

      schemas.forEach(schemaFile => {
        const schemaPath = path.join(process.cwd(), schemaFile);
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          
          // Diviser le schéma en instructions individuelles
          const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
          
          // Exécuter chaque instruction séparément
          statements.forEach(statement => {
            if (statement.length > 0) {
              try {
                this.db.exec(statement + ';');
              } catch (stmtError) {
                // Ignorer les erreurs de tables déjà existantes
                if (!stmtError.message.includes('already exists') && 
                    !stmtError.message.includes('duplicate column name')) {
                  console.warn(`⚠️ Erreur lors de l'exécution de: ${statement.substring(0, 50)}...`);
                  console.warn(`   Erreur: ${stmtError.message}`);
                }
              }
            }
          });
          
          console.log(`✅ Schéma ${schemaFile} appliqué avec succès`);
        } else {
          console.warn(`⚠️ Fichier de schéma ${schemaFile} non trouvé`);
        }
      });

      console.log('✅ Toutes les tables ont été créées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables:', error);
      throw error;
    }
  }

  // Méthodes utilitaires pour les requêtes
  get(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      const convertedParams = params.map(convertValueForSQLite);
      return stmt.get(...convertedParams);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête get:', error);
      throw error;
    }
  }

  all(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      const convertedParams = params.map(convertValueForSQLite);
      return stmt.all(...convertedParams);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête all:', error);
      throw error;
    }
  }

  run(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      const convertedParams = params.map(convertValueForSQLite);
      return stmt.run(...convertedParams);
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête run:', error);
      throw error;
    }
  }

  transaction(callback) {
    try {
      return this.db.transaction(callback)();
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la transaction:', error);
      throw error;
    }
  }

  // Méthode pour fermer la connexion
  close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Connexion à la base de données fermée');
    }
  }

  // Méthode pour obtenir des informations sur la base de données
  getDatabaseInfo() {
    try {
      const tables = this.all("SELECT name FROM sqlite_master WHERE type='table'");
      const tableCount = tables.length;
      const dbSize = fs.statSync(this.dbPath).size;
      
      return {
        path: this.dbPath,
        tableCount,
        tables: tables.map(t => t.name),
        size: `${(dbSize / 1024 / 1024).toFixed(2)} MB`
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des informations de la base de données:', error);
      return null;
    }
  }
}

// Créer une instance singleton
const databaseService = new DatabaseService();

// Gestion propre de la fermeture lors de l'arrêt de l'application
process.on('SIGINT', () => {
  console.log('\n🔄 Fermeture de l\'application...');
  databaseService.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Fermeture de l\'application...');
  databaseService.close();
  process.exit(0);
});

module.exports = databaseService;
