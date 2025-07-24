/**
 * This script helps you set up the Google Service Account for the Shreeji International website.
 * 
 * Instructions:
 * 1. Download the JSON key file from Google Cloud Console
 * 2. Run this script with the path to the JSON file:
 *    node scripts/setup-google-service-account.js path/to/your-key-file.json
 * 
 * The script will output the environment variables you need to add to your .env.local file.
 */

const fs = require('fs');

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide the path to your Google Service Account JSON key file.');
  console.error('Usage: node scripts/setup-google-service-account.js path/to/your-key-file.json');
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const serviceAccount = JSON.parse(fileContent);
  
  // Extract the needed values
  const { client_email, private_key } = serviceAccount;
  
  if (!client_email || !private_key) {
    console.error('The JSON file does not contain the required client_email and private_key fields.');
    process.exit(1);
  }
  
  // Format the private key for .env file
  // Note: We need to escape newlines for the .env file
  const formattedPrivateKey = private_key.replace(/\n/g, '\\n');
  
  // Output the environment variables
  console.log('\n=== Add these lines to your .env.local file ===\n');
  console.log(`GOOGLE_SERVICE_ACCOUNT_EMAIL=${client_email}`);
  console.log(`GOOGLE_PRIVATE_KEY="${formattedPrivateKey}"`);
  console.log('\n=== End of environment variables ===\n');
  
  console.log('Remember to also set your GOOGLE_SHEET_ID in the .env.local file.');
  console.log('You can find this ID in the URL of your Google Sheet:');
  console.log('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit');
  
} catch (error) {
  console.error('Error processing the JSON file:', error.message);
  process.exit(1);
}