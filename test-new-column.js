// Test script for new Minimum Order column
const spreadsheetId = '1WD86GGsqR5eBtw-Qhohc-UZGvZBLsL7IR0JQq7DjtsU';
const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function testNewColumn() {
  try {
    console.log('🔍 Testing new Minimum Order column...');
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📋 Header:', lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = parseCSVLine(line);
      
      console.log(`\n📦 Product ${i}:`);
      console.log(`   - ID: "${cols[0]}"`);
      console.log(`   - Name: "${cols[1]}"`);
      console.log(`   - Description: "${cols[2]}"`);
      console.log(`   - Price: "${cols[3]}"`);
      console.log(`   - Category: "${cols[4]}"`);
      console.log(`   - Image: "${cols[5]}"`);
      console.log(`   - Stock: "${cols[6]}"`);
      console.log(`   - Brand: "${cols[7]}"`);
      console.log(`   - Featured: "${cols[8]}"`);
      console.log(`   - Min Order: "${cols[9] || 'MISSING'}"`);
      console.log(`   - Total columns: ${cols.length}`);
      
      // Parse minimum order
      if (cols[9]) {
        const minOrderStr = cols[9].toString().replace(/[^\d.]/g, '');
        const minOrderQuantity = parseInt(minOrderStr) || 1;
        console.log(`   ✅ Parsed Min Order: ${minOrderQuantity}`);
      } else {
        console.log(`   ⚠️ No Min Order column found!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testNewColumn();