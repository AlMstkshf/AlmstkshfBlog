const https = require('https');

async function testProductionAuth() {
  const data = JSON.stringify({
    username: 'admin',
    password: 'P@ssword#123'
  });

  const options = {
    hostname: 'almstkshfblog.netlify.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', responseData);
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Also test the health endpoint
async function testHealthEndpoint() {
  const options = {
    hostname: 'almstkshfblog.netlify.app',
    port: 443,
    path: '/api/health',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log('\n=== HEALTH CHECK ===');
      console.log('Status Code:', res.statusCode);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Health Response:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Health check error:', error);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing production authentication...');
  
  try {
    await testHealthEndpoint();
    console.log('\n=== AUTH TEST ===');
    await testProductionAuth();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();