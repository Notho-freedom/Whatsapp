# 🔧 Résolution des problèmes - WhatsApp Clone Electron

## ❌ Problème : L'application ne charge pas dans Electron

### 🔍 Diagnostic

**Symptômes :**
- Fenêtre Electron blanche
- Erreur "Failed to load URL"
- Application ne s'affiche pas

### ✅ Solutions

#### 1. **Variable d'environnement incorrecte**
```bash
# ❌ Incorrect
NEXT_NODE_ENV=development

# ✅ Correct
NODE_ENV=development
```

**Solution :** Utilisez `cross-env` pour une compatibilité cross-platform :
```bash
npm run electron-dev
```

#### 2. **Serveur Next.js non démarré**
```bash
# Vérifier que le serveur fonctionne
curl http://localhost:3000

# Si pas de réponse, démarrer le serveur
npm run dev
```

#### 3. **Port 3000 occupé**
```bash
# Arrêter tous les processus Node.js
taskkill /F /IM node.exe

# Relancer l'application
npm run electron-dev
```

#### 4. **Fichiers manquants**
```bash
# Vérifier que tous les fichiers sont présents
ls electron/
ls src/components/
ls public/
```

## 🚀 Commandes de débogage

### Test du serveur Next.js
```bash
# Test simple
curl http://localhost:3000

# Test avec Node.js
node -e "
const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log('Status:', res.statusCode);
  process.exit(0);
});
req.on('error', (err) => {
  console.log('Erreur:', err.message);
  process.exit(1);
});
req.end();
"
```

### Test d'Electron
```bash
# Mode développement avec logs
npm run electron-dev

# Mode production
npm run build
npm run electron
```

## 🔧 Configuration vérifiée

### package.json
```json
{
  "scripts": {
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && cross-env NODE_ENV=development electron .\""
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

### electron/main.js
```javascript
const isDev = process.env.NODE_ENV === 'development';

// Logs de débogage
console.log('🔧 Mode de développement:', isDev);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
} else {
  mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
}
```

## 📋 Checklist de résolution

- [ ] Serveur Next.js fonctionne (`npm run dev`)
- [ ] Variable `NODE_ENV=development` définie
- [ ] Port 3000 disponible
- [ ] Tous les fichiers Electron présents
- [ ] Dépendances installées (`npm install`)
- [ ] Logs Electron visibles dans la console

## 🎯 Commandes de récupération

```bash
# 1. Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# 2. Redémarrer le serveur
npm run dev

# 3. Lancer Electron
npm run electron-dev
```

## 📞 Support

Si les problèmes persistent :
1. Vérifiez les logs dans la console
2. Ouvrez les outils de développement (Ctrl+Shift+I)
3. Vérifiez que tous les fichiers sont présents
4. Redémarrez complètement l'application
