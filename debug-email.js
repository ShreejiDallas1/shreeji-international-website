// Simple test script to debug email functionality
const testEmail = async () => {
  try {
    console.log('🧪 Testing email API...');
    
    const response = await fetch('http://localhost:3000/api/test-email-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    const data = await response.json();
    console.log('📧 API Response:', data);
    
    if (data.success) {
      console.log('✅ Email system is working!');
      console.log('📧 Test Code:', data.testCode);
    } else {
      console.log('❌ Email system failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the test
testEmail();