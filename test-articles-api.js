// Test script to verify the /api/articles endpoint returns the correct format
const fetch = require('node-fetch');

async function testArticlesAPI() {
  try {
    console.log('Testing /api/articles endpoint...');
    
    // Test 1: Default request (should return array)
    console.log('\n1. Testing default request (should return array):');
    const response1 = await fetch('http://localhost:5000/api/articles?limit=5');
    const data1 = await response1.json();
    
    console.log('Response status:', response1.status);
    console.log('Is array:', Array.isArray(data1));
    console.log('Data type:', typeof data1);
    console.log('First item keys:', data1[0] ? Object.keys(data1[0]) : 'No items');
    
    // Test 2: Paginated request (should return object with data and pagination)
    console.log('\n2. Testing paginated request (should return object):');
    const response2 = await fetch('http://localhost:5000/api/articles?limit=5&paginated=true');
    const data2 = await response2.json();
    
    console.log('Response status:', response2.status);
    console.log('Is array:', Array.isArray(data2));
    console.log('Has data property:', 'data' in data2);
    console.log('Has pagination property:', 'pagination' in data2);
    console.log('Data.data is array:', Array.isArray(data2.data));
    
    // Test 3: Request with offset (should return paginated)
    console.log('\n3. Testing request with offset (should return paginated):');
    const response3 = await fetch('http://localhost:5000/api/articles?limit=5&offset=1');
    const data3 = await response3.json();
    
    console.log('Response status:', response3.status);
    console.log('Is array:', Array.isArray(data3));
    console.log('Has data property:', 'data' in data3);
    console.log('Has pagination property:', 'pagination' in data3);
    
    console.log('\n✅ API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testArticlesAPI();