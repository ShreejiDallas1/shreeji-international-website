// Force sync the products with Google Drive URL conversion
const fetch = require('node-fetch').default || require('node-fetch');

async function forceSyncProducts() {
  try {
    console.log('🔄 Triggering product sync...');
    
    const response = await fetch('http://localhost:3001/api/sync-products?key=shreeji_sync_api_2024', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Sync successful:', result);
    } else {
      console.error('❌ Sync failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error during sync:', error);
  }
}

forceSyncProducts();