// Script pour nettoyer le localStorage en cas de problème de migration
console.log('🧹 Nettoyage du localStorage...');

const keysToRemove = [
  'whatsapp-auth-storage',
  'whatsapp-chat-storage',
  'whatsapp-user-storage',
  'whatsapp-notification-storage',
  'whatsapp-media-storage',
  'whatsapp-settings-storage',
  'whatsapp-main-storage'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Supprimé: ${key}`);
  } else {
    console.log(`ℹ️ Non trouvé: ${key}`);
  }
});

console.log('✅ Nettoyage terminé !');
console.log('🔄 Rechargez la page pour réinitialiser les stores.');
