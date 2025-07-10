import bcrypt from 'bcryptjs';

const hash = '$2b$12$bfQRBT3BT25ARgfa.0UnCOPOE.1pKDzxoOOtpozBoxRM50T8cedne';

const testPasswords = [
  'P@ssword#123', // Correct password
  'admin123',
  'password',
  'admin',
  'almstkshf',
  'rased123',
  'admin@123',
  'Almstkshf123',
  'almstkshf123'
];

async function testPassword() {
  console.log('Testing passwords against hash:', hash);
  
  for (const password of testPasswords) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      console.log(`Password "${password}": ${isMatch ? 'MATCH ✓' : 'No match'}`);
      
      if (isMatch) {
        console.log(`\n*** FOUND CORRECT PASSWORD: "${password}" ***\n`);
        break;
      }
    } catch (error) {
      console.log(`Error testing "${password}":`, error.message);
    }
  }
}

testPassword();