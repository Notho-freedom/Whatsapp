// Script de test Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.firebasestorage.app",
  messagingSenderId: "263142174492",
  appId: "1:263142174492:web:8d8abbe4bf5e831211d4d9",
  measurementId: "G-PDDCJR1CZ8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('🧪 Test de connexion Firebase...');
    
    // Test 1: Créer un document de test
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Test de connexion Firebase',
      timestamp: new Date().toISOString(),
      test: true
    });
    
    console.log(`✅ Document de test créé avec l'ID: ${testDoc.id}`);
    
    // Test 2: Lire les documents
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log(`✅ ${querySnapshot.size} documents trouvés dans la collection 'test'`);
    
    querySnapshot.forEach((doc) => {
      console.log(`📄 Document ${doc.id}:`, doc.data());
    });
    
    return { success: true, testDocId: testDoc.id };
  } catch (error) {
    console.error('❌ Erreur lors du test Firebase:', error);
    return { success: false, error: error.message };
  }
}

// Exécuter le test
testFirebase().then(result => {
  console.log('🎯 Résultat du test:', result);
  process.exit(result.success ? 0 : 1);
});
