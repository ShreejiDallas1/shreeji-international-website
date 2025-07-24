const https = require('https');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox';

if (!SQUARE_ACCESS_TOKEN) {
  console.error('SQUARE_ACCESS_TOKEN not found in environment variables');
  process.exit(1);
}

const baseUrl = SQUARE_ENVIRONMENT === 'production' 
  ? 'https://connect.squareup.com' 
  : 'https://connect.squareupsandbox.com';

function makeSquareRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SQUARE_ENVIRONMENT === 'production' ? 'connect.squareup.com' : 'connect.squareupsandbox.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkSquareProducts() {
  try {
    console.log('Checking Square products...');
    const response = await makeSquareRequest('/v2/catalog/list?types=ITEM');
    
    if (response.objects) {
      console.log(`Found ${response.objects.length} products in Square:`);
      
      response.objects.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item_data.name}`);
        console.log(`   ID: ${item.id}`);
        if (item.item_data.variations && item.item_data.variations[0]) {
          const variation = item.item_data.variations[0];
          if (variation.item_variation_data.price_money) {
            const price = variation.item_variation_data.price_money.amount / 100;
            console.log(`   Price: $${price}`);
          }
        }
        console.log('---');
      });
    } else {
      console.log('No products found in Square');
      if (response.errors) {
        console.log('Errors:', response.errors);
      }
    }
  } catch (error) {
    console.error('Error checking Square products:', error);
  }
}

checkSquareProducts();