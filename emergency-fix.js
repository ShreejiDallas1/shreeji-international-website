// Emergency fix script - run this in browser console on localhost:3000

async function emergencyCleanup() {
  console.log('🚨 EMERGENCY CLEANUP STARTING...');
  
  try {
    // Delete all orders
    const deleteResponse = await fetch('/api/admin/cleanup', {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('🗑️ Orders cleanup result:', deleteResult);
    
    // Check products
    const productsResponse = await fetch('/api/products');
    const productsResult = await productsResponse.json();
    console.log('📦 Products check:', productsResult);
    
    // Refresh the page
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
  }
}

// Run the cleanup
emergencyCleanup();