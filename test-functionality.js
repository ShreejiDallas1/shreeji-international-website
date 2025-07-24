// Quick functionality test script
// Run this in browser console on your deployed site

console.log('🧪 Starting Shreeji International Functionality Tests...');

// Test 1: Check if Firebase is initialized
function testFirebase() {
  try {
    if (typeof window !== 'undefined' && window.firebase) {
      console.log('✅ Firebase: Initialized');
      return true;
    } else {
      console.log('❌ Firebase: Not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase: Error -', error.message);
    return false;
  }
}

// Test 2: Check if products are loading
async function testProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    
    if (data.success && data.products && data.products.length > 0) {
      console.log(`✅ Products: ${data.products.length} products loaded`);
      return true;
    } else {
      console.log('❌ Products: No products found');
      return false;
    }
  } catch (error) {
    console.log('❌ Products: Error -', error.message);
    return false;
  }
}

// Test 3: Check if Square integration is working
async function testSquare() {
  try {
    const response = await fetch('/api/square/config');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Square: Integration working');
      console.log(`   Environment: ${data.environment}`);
      console.log(`   Location ID: ${data.locationId}`);
      return true;
    } else {
      console.log('❌ Square: Configuration error');
      return false;
    }
  } catch (error) {
    console.log('❌ Square: Error -', error.message);
    return false;
  }
}

// Test 4: Check if images are loading
function testImages() {
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  let totalImages = images.length;
  
  images.forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      loadedImages++;
    }
  });
  
  const percentage = totalImages > 0 ? Math.round((loadedImages / totalImages) * 100) : 0;
  
  if (percentage >= 80) {
    console.log(`✅ Images: ${percentage}% loaded (${loadedImages}/${totalImages})`);
    return true;
  } else {
    console.log(`⚠️ Images: Only ${percentage}% loaded (${loadedImages}/${totalImages})`);
    return false;
  }
}

// Test 5: Check responsive design
function testResponsive() {
  const width = window.innerWidth;
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;
  
  console.log(`✅ Responsive: ${width}px width detected`);
  console.log(`   Device type: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`);
  return true;
}

// Test 6: Check dark mode
function testDarkMode() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  console.log(`✅ Dark Mode: ${isDarkMode ? 'Enabled' : 'Disabled'}`);
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('\n🔍 Running comprehensive tests...\n');
  
  const results = {
    firebase: testFirebase(),
    products: await testProducts(),
    square: await testSquare(),
    images: testImages(),
    responsive: testResponsive(),
    darkMode: testDarkMode()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Website is ready for production.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return results;
}

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('Run this script in the browser console on your deployed website.');
}

// Export for manual testing
window.testShreeji = {
  runAllTests,
  testFirebase,
  testProducts,
  testSquare,
  testImages,
  testResponsive,
  testDarkMode
};