/**
 * This script starts the development server and initializes the database with sample products.
 * 
 * Usage:
 * node scripts/start-dev.js
 */

const { spawn } = require('child_process');
const http = require('http');

// Start the Next.js development server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

console.log('Starting Next.js development server...');

// Wait for the server to start
setTimeout(() => {
  console.log('Initializing database with sample products...');
  
  // Call the init-db API endpoint
  const apiKey = process.env.SYNC_API_KEY || 'shreeji_sync_api_2024';
  const url = `http://localhost:3000/api/init-db?key=${apiKey}`;
  
  http.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log(response.message);
          console.log('Database initialized successfully!');
        } else {
          console.error('Error initializing database:', response.error);
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('Error calling init-db API:', error.message);
  });
}, 10000); // Wait 10 seconds for the server to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping development server...');
  nextDev.kill();
  process.exit();
});