const bcrypt = require('bcryptjs');

async function testAuth() {
  const password = 'P@ssword#123';
  
  // Generate a fresh hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('Fresh hash:', newHash);
  
  // Test the hash from NETLIFY_ENV_VARS.txt
  const existingHash = '$2b$12$bfQRBT3BT25ARgfa.0UnCOPOE.1pKDzxoOOtpozBoxRM50T8cedne';
  console.log('Existing hash:', existingHash);
  
  // Test both hashes
  const isValidNew = await bcrypt.compare(password, newHash);
  const isValidExisting = await bcrypt.compare(password, existingHash);
  
  console.log('Password:', password);
  console.log('New hash valid:', isValidNew);
  console.log('Existing hash valid:', isValidExisting);
  
  // Test with different password variations
  const variations = [
    'P@ssword#123',
    'P@ssword#123 ',
    ' P@ssword#123',
    'p@ssword#123',
    'P@SSWORD#123'
  ];
  
  console.log('\nTesting password variations:');
  for (const variant of variations) {
    const isValid = await bcrypt.compare(variant, existingHash);
    console.log(`"${variant}" -> ${isValid}`);
  }
}

testAuth().catch(console.error);