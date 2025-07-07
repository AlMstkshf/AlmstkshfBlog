const fetch = require('node-fetch');

async function testPagination() {
  try {
    console.log('Testing pagination API...');
    
    // Test basic pagination
    const response = await fetch('http://localhost:5000/api/articles?limit=5&offset=0');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.pagination) {
      console.log('\n✅ Pagination metadata found:');
      console.log('- Total articles:', data.pagination.total);
      console.log('- Has next page:', data.pagination.hasNext);
      console.log('- Current page:', data.pagination.currentPage);
      console.log('- Total pages:', data.pagination.totalPages);
    }
    
    if (data.data && data.data.length > 0) {
      console.log('\n✅ Articles found:', data.data.length);
      console.log('- First article title:', data.data[0].title);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPagination();