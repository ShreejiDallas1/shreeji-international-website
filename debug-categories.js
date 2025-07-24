// Debug script to check categories
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

async function debugCategories() {
  try {
    console.log('🔍 Debugging categories...');
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📋 CSV Lines:', lines);
    
    const categories = new Set();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = parseCSVLine(line);
      console.log(`Row ${i}:`, cols);
      
      if (cols[4]) {
        categories.add(cols[4]);
        console.log(`📂 Found category: "${cols[4]}"`);
        console.log(`📂 Category slug: "${cols[4].toLowerCase().replace(/\s+/g, '-')}"`);
      }
    }
    
    console.log('📊 All categories found:', Array.from(categories));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugCategories();