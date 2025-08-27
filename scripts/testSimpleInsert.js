const databaseService = require('../src/utils/databaseService');

try {
  console.log('Test d\'insertion simple avec notre service...');
  
  // Test d'insertion d'un utilisateur
  const testUser = {
    username: 'testuser2',
    email: 'test2@example.com',
    password_hash: 'hashedpassword',
    phone: '+33123456789',
    first_name: 'Test',
    last_name: 'User',
    profile_photo_url: '/api/avatar/test',
    status_message: 'Test status',
    is_online: false,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Données utilisateur:', testUser);
  console.log('Types des valeurs:');
  Object.entries(testUser).forEach(([key, value]) => {
    console.log(`  ${key}: ${typeof value} = ${value}`);
  });
  
  const result = databaseService.run(`
    INSERT INTO users (
      username, email, password_hash, salt, phone, first_name, last_name,
      profile_photo_url, status_message, is_online, last_seen, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    testUser.username, testUser.email, testUser.password_hash, 'testsalt', testUser.phone, 
    testUser.first_name, testUser.last_name, testUser.profile_photo_url, 
    testUser.status_message, testUser.is_online, testUser.last_seen, 
    testUser.created_at, testUser.updated_at
  ]);
  
  console.log('✅ Insertion réussie, ID:', result.lastInsertRowid);
  
  databaseService.close();
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
