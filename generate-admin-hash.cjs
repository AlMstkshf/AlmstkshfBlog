const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'P@ssword#123';
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('ADMIN_USERNAME=admin');
  console.log('ADMIN_EMAIL=rased@almstkshf.com');
}

generateHash().catch(console.error);