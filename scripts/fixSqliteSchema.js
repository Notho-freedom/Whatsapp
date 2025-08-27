const fs = require('fs');
const path = require('path');

// Fonction pour convertir ENUM en CHECK constraint
function convertEnumToCheck(sql) {
  // Remplacer tous les ENUM par des VARCHAR avec CHECK constraints
  return sql.replace(
    /(\w+)\s+ENUM\(([^)]+)\)/g,
    (match, columnName, enumValues) => {
      const values = enumValues.split(',').map(v => v.trim().replace(/'/g, ''));
      const checkConstraint = values.map(v => `'${v}'`).join(', ');
      return `${columnName} VARCHAR(50) CHECK (${columnName} IN (${checkConstraint}))`;
    }
  );
}

// Fonction pour traiter un fichier SQL
function processSqlFile(filePath) {
  try {
    console.log(`📝 Traitement du fichier: ${filePath}`);
    
    // Lire le fichier
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Convertir les ENUM
    const fixedContent = convertEnumToCheck(content);
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    console.log(`✅ Fichier corrigé: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

// Fonction principale
function fixAllSchemaFiles() {
  console.log('🔧 Correction des schémas SQL pour SQLite...');
  
  const schemaFiles = [
    'database_schema_part1.sql',
    'database_schema_part2.sql',
    'database_schema_part3.sql',
    'database_schema_part4.sql'
  ];
  
  schemaFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      processSqlFile(filePath);
    } else {
      console.log(`⚠️ Fichier non trouvé: ${filePath}`);
    }
  });
  
  console.log('✅ Correction des schémas terminée !');
}

// Exécuter le script
fixAllSchemaFiles();
