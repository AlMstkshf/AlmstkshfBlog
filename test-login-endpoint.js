import fetch from 'node-fetch';

async function testLoginEndpoint() {
  const baseURL = 'http://localhost:5000';
  const credentials = {
    username: 'admin',
    password: 'P@ssword#123'
  };

  console.log('Testing login endpoint...');
  console.log('URL:', `${baseURL}/api/auth/login`);
  console.log('Credentials:', credentials);

  try {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Access token received:', !!data.data?.accessToken);
      console.log('User data:', data.data?.user);
    } else {
      console.log('❌ Login failed:', data.message);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    // Test if server is running
    try {
      const healthCheck = await fetch(`${baseURL}/`);
      console.log('Server health check status:', healthCheck.status);
    } catch (healthError) {
      console.error('❌ Server appears to be down:', healthError.message);
    }
  }
}

testLoginEndpoint();