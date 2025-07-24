// Manual sync test
const { fetchProductsFromSheet, syncProductsToFirestore } = require('./src/lib/googleSheets.ts');

async function manualSync() {
  try {
    console.log('🔄 Starting manual sync...');
    
    const products = await fetchProductsFromSheet();
    console.log('📦 Products fetched:', products);
    
    if (products && products.length > 0) {
      console.log('💾 Syncing to Firestore...');
      const count = await syncProductsToFirestore();
      console.log(`✅ Successfully synced ${count} products!`);
    } else {
      console.log('❌ No products found to sync');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

manualSync();