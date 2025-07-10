const bcrypt = require('bcryptjs');

async function verifyPassword() {
  const hash = '$2b$12$bfQRBT3BT25ARgfa.0UnCOPOE.1pKDzxoOOtpozBoxRM50T8cedne';
  const passwords = [
    'admin123',
    'P@ssword#123',
    'password',
    'admin',
    'Password123',
    'Admin123'
  ];
  
  console.log('Testing passwords against hash:', hash);
  console.log('');
  
  for (const password of passwords) {
    const isMatch = await bcrypt.compare(password, hash);
    console.log(`Password: "${password}" - Match: ${isMatch}`);
  }
}

verifyPassword().catch(console.error);