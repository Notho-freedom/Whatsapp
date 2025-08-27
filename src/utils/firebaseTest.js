import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Test de connexion Firebase...');
    
    // Test 1: Vérifier que la connexion Firestore fonctionne
    const testCollection = collection(db, 'test');
    const testQuery = query(testCollection, where('test', '==', true));
    await getDocs(testQuery);
    
    console.log('✅ Connexion Firestore réussie');
    
    // Test 2: Créer un document de test
    const testDoc = await addDoc(testCollection, {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Test de connexion Firebase'
    });
    
    console.log(`✅ Document de test créé avec l'ID: ${testDoc.id}`);
    
    return {
      success: true,
      message: 'Connexion Firebase réussie',
      testDocId: testDoc.id
    };
  } catch (error) {
    console.error('❌ Erreur lors du test Firebase:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};
