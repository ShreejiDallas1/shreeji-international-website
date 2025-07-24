// Debug what's actually in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuL-9UDX7gKqZ8B6V-fBv4LrPCKTNKSSI",
  authDomain: "shreeji-international.firebaseapp.com",
  projectId: "shreeji-international",
  storageBucket: "shreeji-international.firebasestorage.app",
  messagingSenderId: "294107820613",
  appId: "1:294107820613:web:7a7e9a5b8f8e5c6d8c8c1b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugProducts() {
  try {
    console.log('🔍 Fetching products from Firebase...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    console.log(`📦 Found ${productsSnapshot.size} products in Firebase:`);
    
    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      console.log(`\n📦 Product ID: ${doc.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Price: ${product.price}`);
      console.log(`   Image: "${product.image}"`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Updated: ${product.updatedAt?.toDate()}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugProducts();