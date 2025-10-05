// Simple deployment test script
const https = require('https');
const http = require('http');

const testEndpoint = (url, name) => {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${name}: ${res.statusCode} - ${parsed.message || 'OK'}`);
          resolve(true);
        } catch (e) {
          console.log(`✅ ${name}: ${res.statusCode} - Response received`);
          resolve(true);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${name}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

async function testDeployment() {
  console.log('🚀 Testing OfficePulse Deployment...\n');
  
  // Test local development
  console.log('Testing Local Development:');
  await testEndpoint('http://localhost:5000/api/health', 'Backend Health');
  await testEndpoint('http://localhost:5000/api/socket-health', 'Socket Health');
  
  console.log('\nTesting Production Deployment:');
  await testEndpoint('https://officepulse-backend.onrender.com/api/health', 'Production Backend');
  await testEndpoint('https://officepulse-backend.onrender.com/api/socket-health', 'Production Socket');
  await testEndpoint('https://officepulse-frontend.onrender.com', 'Frontend');
  
  console.log('\n✨ Deployment test completed!');
}

testDeployment().catch(console.error);