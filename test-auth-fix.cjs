const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAuthentication() {
  console.log('🔐 Testing authentication with new credentials...\n');
  
  try {
    // Test 1: Login with username
    console.log('1️⃣ Testing login with username "admin":');
    const response1 = await makeRequest('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'P@ssword#123'
    });
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Success: ${response1.data.success}`);
    console.log(`   Message: ${response1.data.message}`);
    if (response1.data.data?.user) {
      console.log(`   User ID: ${response1.data.data.user.id}`);
      console.log(`   Username: ${response1.data.data.user.username}`);
      console.log(`   Email: ${response1.data.data.user.email}`);
      console.log(`   Role: ${response1.data.data.user.role}`);
    }
    
    if (response1.status !== 200 || !response1.data.success) {
      throw new Error('❌ Username login failed!');
    }
    console.log('   ✅ PASS: Username login successful\n');

    // Test 2: Login with email
    console.log('2️⃣ Testing login with email "rased@almstkshf.com":');
    const response2 = await makeRequest('/api/auth/login', 'POST', {
      username: 'rased@almstkshf.com',
      password: 'P@ssword#123'
    });
    
    console.log(`   Status: ${response2.status}`);
    console.log(`   Success: ${response2.data.success}`);
    console.log(`   Message: ${response2.data.message}`);
    if (response2.data.data?.user) {
      console.log(`   User ID: ${response2.data.data.user.id}`);
      console.log(`   Username: ${response2.data.data.user.username}`);
      console.log(`   Email: ${response2.data.data.user.email}`);
      console.log(`   Role: ${response2.data.data.user.role}`);
    }
    
    if (response2.status !== 200 || !response2.data.success) {
      throw new Error('❌ Email login failed!');
    }
    console.log('   ✅ PASS: Email login successful\n');

    // Test 3: Login with wrong password
    console.log('3️⃣ Testing login with wrong password:');
    const response3 = await makeRequest('/api/auth/login', 'POST', {
      username: 'admin',
      password: 'wrongpassword'
    });
    
    console.log(`   Status: ${response3.status}`);
    console.log(`   Success: ${response3.data.success}`);
    console.log(`   Message: ${response3.data.message}`);
    
    if (response3.status === 200 || response3.data.success) {
      throw new Error('❌ Wrong password should fail!');
    }
    console.log('   ✅ PASS: Wrong password correctly rejected\n');

    // Test 4: Login with wrong username
    console.log('4️⃣ Testing login with wrong username:');
    const response4 = await makeRequest('/api/auth/login', 'POST', {
      username: 'wronguser',
      password: 'P@ssword#123'
    });
    
    console.log(`   Status: ${response4.status}`);
    console.log(`   Success: ${response4.data.success}`);
    console.log(`   Message: ${response4.data.message}`);
    
    if (response4.status === 200 || response4.data.success) {
      throw new Error('❌ Wrong username should fail!');
    }
    console.log('   ✅ PASS: Wrong username correctly rejected\n');

    console.log('🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Username "admin" login works');
    console.log('   ✅ Email "rased@almstkshf.com" login works');
    console.log('   ✅ Password "P@ssword#123" is correctly validated');
    console.log('   ✅ Invalid credentials are properly rejected');
    console.log('\n🌐 You can now login to https://calm-rabanadas-ab5c62.netlify.app/ with:');
    console.log('   Username: admin (or rased@almstkshf.com)');
    console.log('   Password: P@ssword#123');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
testAuthentication();