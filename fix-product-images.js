// Fix product image fields in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function fixProductImages() {
  try {
    console.log('🔧 Fixing product image fields...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    
    console.log(`📦 Found ${productsSnapshot.size} products to fix:`);
    
    let fixed = 0;
    
    for (const docSnapshot of productsSnapshot.docs) {
      const product = docSnapshot.data();
      const updates = {};
      
      // If product has image but not imageUrl, copy image to imageUrl
      if (product.image && !product.imageUrl) {
        updates.imageUrl = product.image;
        console.log(`✅ Product ${docSnapshot.id}: Adding imageUrl field`);
        fixed++;
      }
      
      // If product has imageUrl but not image, copy imageUrl to image
      if (product.imageUrl && !product.image) {
        updates.image = product.imageUrl;
        console.log(`✅ Product ${docSnapshot.id}: Adding image field`);
        fixed++;
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'products', docSnapshot.id), updates);
        console.log(`✅ Updated product ${docSnapshot.id}`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixed} products!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixProductImages();