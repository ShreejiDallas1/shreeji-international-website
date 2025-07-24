// Script to completely clear Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCJ0aw7AYsGr365JKkR3YgFw3tQ_pK6NRE",
  authDomain: "shreeji-international.firebaseapp.com",
  projectId: "shreeji-international",
  storageBucket: "shreeji-international.firebasestorage.app",
  messagingSenderId: "310139617669",
  appId: "1:310139617669:web:541ebb6debb186327e44ec"
};

async function clearAll() {
  try {
    console.log('🗑️ CLEARING ALL FIREBASE DATA...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Clear products
    console.log('Clearing products...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log(`Found ${productsSnapshot.size} products to delete`);
    
    for (const productDoc of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', productDoc.id));
      console.log(`Deleted product: ${productDoc.id}`);
    }
    
    // Clear categories
    console.log('Clearing categories...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`Found ${categoriesSnapshot.size} categories to delete`);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', categoryDoc.id));
      console.log(`Deleted category: ${categoryDoc.id}`);
    }
    
    console.log('✅ ALL SAMPLE DATA DELETED FROM FIREBASE!');
    console.log('💾 Database is now empty and ready for Google Sheets sync');
    
  } catch (error) {
    console.error('❌ Error clearing Firebase:', error);
  }
}

clearAll();