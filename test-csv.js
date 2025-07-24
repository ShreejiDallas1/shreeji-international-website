// Simple CSV test
const spreadsheetId = '1WD86GGsqR5eBtw-Qhohc-UZGvZBLsL7IR0JQq7DjtsU';
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;

async function testCSV() {
  try {
    console.log('🔄 Testing CSV export...');
    console.log('URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const csvText = await response.text();
      console.log('📄 CSV Response (first 500 chars):', csvText.substring(0, 500));
      console.log('📄 Full CSV Response:');
      console.log(csvText);
      
      const lines = csvText.split('\n').filter(line => line.trim());
      console.log('📋 Number of lines:', lines.length);
      
      lines.forEach((line, index) => {
        console.log(`Line ${index}:`, line);
      });
      
    } else {
      console.log('❌ Failed to fetch CSV');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCSV();