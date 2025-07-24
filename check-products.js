const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "shreeji-international.firebaseapp.com",
  projectId: "shreeji-international",
  storageBucket: "shreeji-international.appspot.com",
  messagingSenderId: "310139617669",
  appId: "1:310139617669:web:541ebb6debb186327e44ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log(`Found ${snapshot.size} products:`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.name} (ID: ${doc.id})`);
      console.log(`  Price: $${data.price}`);
      console.log(`  Category: ${data.category}`);
      console.log(`  Stock: ${data.stock || 'N/A'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

checkProducts();