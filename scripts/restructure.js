#!/usr/bin/env node

/**
 * Script de restructuration automatique du projet WhatsApp
 * Ce script aide à maintenir la structure organisée du projet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  srcDir: 'src',
  componentsDir: 'src/components',
  featuresDir: 'src/features',
  hooksDir: 'src/hooks',
  utilsDir: 'src/utils',
  contextDir: 'src/context',
  typesDir: 'src/types',
  constantsDir: 'src/constants',
  stylesDir: 'src/styles'
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Fonctions utilitaires
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logError = (message) => log(`❌ ${message}`, colors.red);

// Vérification de la structure
const checkStructure = () => {
  logInfo('Vérification de la structure du projet...');
  
  const requiredDirs = [
    CONFIG.srcDir,
    CONFIG.componentsDir,
    CONFIG.featuresDir,
    CONFIG.hooksDir,
    CONFIG.utilsDir,
    CONFIG.contextDir,
    CONFIG.typesDir,
    CONFIG.constantsDir,
    CONFIG.stylesDir
  ];

  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missingDirs.length > 0) {
    logWarning(`Dossiers manquants: ${missingDirs.join(', ')}`);
    return false;
  }
  
  logSuccess('Structure de base vérifiée');
  return true;
};

// Création des dossiers manquants
const createMissingDirectories = () => {
  logInfo('Création des dossiers manquants...');
  
  const dirs = [
    CONFIG.srcDir,
    CONFIG.componentsDir,
    CONFIG.featuresDir,
    CONFIG.hooksDir,
    CONFIG.utilsDir,
    CONFIG.contextDir,
    CONFIG.typesDir,
    CONFIG.constantsDir,
    CONFIG.stylesDir
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logSuccess(`Créé: ${dir}`);
    }
  });
};

// Vérification des composants
const checkComponents = () => {
  logInfo('Vérification des composants...');
  
  const componentDirs = [
    'auth',
    'layout', 
    'common',
    'ui',
    'chat',
    'status',
    'calls'
  ];

  componentDirs.forEach(dir => {
    const fullPath = path.join(CONFIG.componentsDir, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.jsx') || file.endsWith('.js'));
      logInfo(`${dir}: ${files.length} composants`);
    } else {
      logWarning(`Dossier manquant: ${dir}`);
    }
  });
};

// Vérification des fichiers d'index
const checkIndexFiles = () => {
  logInfo('Vérification des fichiers d\'index...');
  
  const indexFiles = [
    path.join(CONFIG.componentsDir, 'index.js'),
    path.join(CONFIG.featuresDir, 'index.js'),
    path.join(CONFIG.typesDir, 'index.js'),
    path.join(CONFIG.constantsDir, 'index.js')
  ];

  indexFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`Index trouvé: ${path.relative(CONFIG.projectRoot, file)}`);
    } else {
      logWarning(`Index manquant: ${path.relative(CONFIG.projectRoot, file)}`);
    }
  });
};

// Vérification des imports
const checkImports = () => {
  logInfo('Vérification des imports...');
  
  const jsFiles = [];
  
  const scanDirectory = (dir) => {
    if (fs.existsSync(dir)) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          jsFiles.push(fullPath);
        }
      });
    }
  };

  scanDirectory(CONFIG.srcDir);
  
  let importIssues = 0;
  
  jsFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('import') && line.includes('@/')) {
          const match = line.match(/@\/([^'"]+)/);
          if (match) {
            const alias = match[1];
            const aliasPath = path.join(CONFIG.srcDir, alias);
            if (!fs.existsSync(aliasPath)) {
              logWarning(`Import invalide dans ${path.relative(CONFIG.projectRoot, file)}:${index + 1} - @/${alias}`);
              importIssues++;
            }
          }
        }
      });
    } catch (error) {
      logError(`Erreur lors de la lecture de ${file}: ${error.message}`);
    }
  });
  
  if (importIssues === 0) {
    logSuccess('Aucun problème d\'import détecté');
  } else {
    logWarning(`${importIssues} problèmes d'import détectés`);
  }
};

// Génération du rapport
const generateReport = () => {
  logInfo('Génération du rapport de structure...');
  
  const report = {
    timestamp: new Date().toISOString(),
    project: path.basename(CONFIG.projectRoot),
    structure: {
      src: CONFIG.srcDir,
      components: CONFIG.componentsDir,
      features: CONFIG.featuresDir,
      hooks: CONFIG.hooksDir,
      utils: CONFIG.utilsDir,
      context: CONFIG.contextDir,
      types: CONFIG.typesDir,
      constants: CONFIG.constantsDir,
      styles: CONFIG.stylesDir
    },
    status: 'restructured'
  };
  
  const reportPath = path.join(CONFIG.projectRoot, 'STRUCTURE_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Rapport généré: ${reportPath}`);
};

// Fonction principale
const main = () => {
  log(`${colors.bright}${colors.cyan}🔄 Script de Restructuration WhatsApp${colors.reset}\n`);
  
  try {
    // Vérification de la structure
    if (!checkStructure()) {
      createMissingDirectories();
    }
    
    // Vérifications
    checkComponents();
    checkIndexFiles();
    checkImports();
    
    // Génération du rapport
    generateReport();
    
    logSuccess('\n🎉 Restructuration terminée avec succès !');
    logInfo('Consultez STRUCTURE.md pour plus d\'informations sur la nouvelle organisation.');
    
  } catch (error) {
    logError(`Erreur lors de la restructuration: ${error.message}`);
    process.exit(1);
  }
};

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = {
  checkStructure,
  createMissingDirectories,
  checkComponents,
  checkIndexFiles,
  checkImports,
  generateReport
};
