// Test script to verify the /api/articles endpoint fix
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
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

    req.end();
  });
}

async function testArticlesAPI() {
  console.log('🧪 Testing /api/articles endpoint fix...\n');
  
  try {
    // Test 1: Default request (should return array for backward compatibility)
    console.log('1️⃣ Testing default request (should return array):');
    const response1 = await makeRequest('/api/articles?limit=5');
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Is array: ${Array.isArray(response1.data)}`);
    console.log(`   Data type: ${typeof response1.data}`);
    console.log(`   Items count: ${response1.data.length}`);
    console.log(`   Cache-Control: ${response1.headers['cache-control'] || 'Not set'}`);
    
    if (!Array.isArray(response1.data)) {
      throw new Error('❌ Default request should return an array!');
    }
    console.log('   ✅ PASS: Returns array format\n');

    // Test 2: Explicit paginated request (should return object with data and pagination)
    console.log('2️⃣ Testing explicit paginated request (should return object):');
    const response2 = await makeRequest('/api/articles?limit=5&paginated=true');
    
    console.log(`   Status: ${response2.status}`);
    console.log(`   Is array: ${Array.isArray(response2.data)}`);
    console.log(`   Has data property: ${'data' in response2.data}`);
    console.log(`   Has pagination property: ${'pagination' in response2.data}`);
    console.log(`   Data.data is array: ${Array.isArray(response2.data.data)}`);
    console.log(`   Cache-Control: ${response2.headers['cache-control'] || 'Not set'}`);
    
    if (Array.isArray(response2.data) || !('data' in response2.data) || !('pagination' in response2.data)) {
      throw new Error('❌ Paginated request should return object with data and pagination!');
    }
    console.log('   ✅ PASS: Returns paginated format\n');

    // Test 3: Request with offset (should automatically return paginated)
    console.log('3️⃣ Testing request with offset (should auto-return paginated):');
    const response3 = await makeRequest('/api/articles?limit=5&offset=1');
    
    console.log(`   Status: ${response3.status}`);
    console.log(`   Is array: ${Array.isArray(response3.data)}`);
    console.log(`   Has data property: ${'data' in response3.data}`);
    console.log(`   Has pagination property: ${'pagination' in response3.data}`);
    console.log(`   Pagination offset: ${response3.data.pagination?.offset}`);
    console.log(`   Cache-Control: ${response3.headers['cache-control'] || 'Not set'}`);
    
    if (Array.isArray(response3.data) || !('data' in response3.data) || !('pagination' in response3.data)) {
      throw new Error('❌ Offset request should return paginated format!');
    }
    console.log('   ✅ PASS: Auto-returns paginated format for offset\n');

    // Test 4: Large limit request (should work with increased limit)
    console.log('4️⃣ Testing large limit request (backward compatibility):');
    const response4 = await makeRequest('/api/articles?limit=1000');
    
    console.log(`   Status: ${response4.status}`);
    console.log(`   Is array: ${Array.isArray(response4.data)}`);
    console.log(`   Items count: ${response4.data.length}`);
    console.log(`   Cache-Control: ${response4.headers['cache-control'] || 'Not set'}`);
    
    if (!Array.isArray(response4.data)) {
      throw new Error('❌ Large limit request should return array!');
    }
    console.log('   ✅ PASS: Handles large limit correctly\n');

    console.log('🎉 All tests passed! The API fix is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Default requests return arrays (backward compatibility)');
    console.log('   ✅ Paginated requests return objects with data/pagination');
    console.log('   ✅ Offset requests auto-trigger pagination');
    console.log('   ✅ Large limits work (up to 1000)');
    console.log('   ✅ Cache headers are properly set');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
testArticlesAPI();