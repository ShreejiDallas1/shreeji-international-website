// Test Google Sheets sync
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

async function testSync() {
  try {
    console.log('🔍 Testing Google Sheets sync...');
    
    // Create JWT client
    const credentials = {
      client_email: 'shreeji-products@shreeji-international.iam.gserviceaccount.com',
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFBotwPKtMxb2S
MmRY8Ou7qvWo02YZfnxt/74kdgRtv6WWfTBYGGCgTUt3k0Jonqy2MMYO91iZtNKy
FGYElmyoau9H4rG1+1D+LQAcEwhBl9dXA8P1xgrUXcVnvqUxrDp+kkeEZD1GF5RX
Ixnn2RxsDPBJ/OoKtECvPkNGI2K6ZJb1ceFxCBgR4gtrh5v6jawFH4IRH5U4QjHo
+5cern6aDsiV/AIq7ORUZNRfEcyzsysCDcIHaVMEW8BI+lDYW8l4+iEg06eXmvNI
bgJXXwUYvwlIRFZum+DqfYjZcJU1+5+LpJV1wS6eVJCUuxSg3U3vsNCtNN3sajIP
Y3OVcYUHAgMBAAECggEABW1k01HDt28t0pFAMctp98PBvAW3jWJuSgqeWCgtS6dy
VJI2DgJjf9CK3VkTBLyOOsyRwCEwvlDJVwd4OFshoVGkx42nYiekndCehqdz9d6Z
aESEL69MM0WYzDIa7QkQaW+QUcWZguZ5lLbn6uEqE8RKRp3iOPfcw+PXe/igkRk4
D+vTTDFQZEy98Xhh+kmTqU2mr3E4xONdUB4ky67uOpFkeed8QsFJxzKzh08iJIbx
H5EuxPVzk1NPExAaO5SuQmzeaXenj7r4ADW9TaYd+R+LlIsZRuCZFjPobaFXekSb
8noh1LaGm3N59D83mnEDqChhGkhdjQHrAmPyiuKZeQKBgQDtrP2MM7nlwhXk5VjG
pL+Cm6Ly+d6bDanbR8jn71tsq2Cr9vjc+ppP1IPjEB4+QaiigjCUiMn9+bMSQzhk
O/otASHgWX9Wm6EtM7pGBlqBU+Wj8qZDceT3P1DxyNLpJMv+gAbxTo4om7zR5AW1
Srex58GKpQ6VflcfHZf/ZwUJyQKBgQDUNz24p/vEhknIiMY3nCzdv3YCWcJbssBM
fj/QQ5lN35bOmcVdrZJb74Kf4fc4yXAEApQko98cb71P96pXvyZfqVSf6QbjC5WH
EN4egPHZoD8uyKcE6Mtk+12QpmFOBVjkYE3yI6kLbisJY8FRxYvSkrMY5ppjSqf3
bualtYeATwKBgQCXcVXxovf91Wib/CNQF6PLth3jUqGsDM3BYoE6gEKyAJVNncW/
EJOI8HHFGf0bUD0Cp5AK5QpIIXYf2eMxwyHK0WDjkkNYTTwrED3N5rh+lZXKnI+i
hA0QGjEajwsM8ZxmIu/JjHN6npl26CNW/DAGVRT2oeukB+e9dN7oJ52HOQKBgHi1
y1fjxWPt9r4ofodXQHYJ1/hSUimSratVDLtMGEGhcsil0wwMFPpSbHzBLbyRaDP/
u4Bz7g7gyFBaUfyDcDJtwQMMq6wuBKnFQHMdaXQeoJHd9JLoT/lqubfzy9lzVTLi
TLP08Mzdp4E5ytbWhUgLxe/eC+d6qbwmyu9rKF4lAoGAaweWC/8qlKhHYAO41VT3
9kEGyhz66fxN19OWKSC9CagXoTwhYgsjj4DKXRBoNB7AooFWs+RXzi+Rycyd9N+v
uehsLdQmfdrMKTlJApfBq71PzeNagVU4UH5bfpBuFiP1Dx/uZjjKBzrNE5D3u+iQ
S0C38lqN99dWf6iyu8aRGnw=
-----END PRIVATE KEY-----`.replace(/\\n/g, '\n'),
    };

    const jwtClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    await jwtClient.authorize();
    console.log('✅ Service account authorized');

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    
    console.log('📊 Fetching sheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1WD86GGsqR5eBtw-Qhohc-UZGvZBLsL7IR0JQq7DjtsU',
      range: 'Shreeji International Products!A:I',
    });
    
    const rows = response.data.values;
    console.log('📋 Raw sheet data:', JSON.stringify(rows, null, 2));
    
    if (rows && rows.length > 1) {
      console.log(`✅ Found ${rows.length - 1} products in sheet`);
      
      rows.slice(1).forEach((row, index) => {
        console.log(`\n🔍 Product ${index + 1}:`);
        console.log(`  ID: ${row[0]}`);
        console.log(`  Name: ${row[1]}`);
        console.log(`  Description: ${row[2]}`);
        console.log(`  Price: ${row[3]}`);
        console.log(`  Category: ${row[4]}`);
        console.log(`  Image: ${row[5]}`);
        console.log(`  Stock: ${row[6]}`);
        console.log(`  Brand: ${row[7]}`);
        console.log(`  Featured: ${row[8]}`);
      });
    } else {
      console.log('❌ No data found in sheet');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSync();