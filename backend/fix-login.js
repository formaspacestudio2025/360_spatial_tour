const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Generate fresh hash
const password = 'admin123';
const hash = bcryptjs.hashSync(password, 10);

console.log('Generated hash:', hash);
console.log('Verification test:', bcryptjs.compareSync(password, hash));

// Update database
if (db.users && db.users.length > 0) {
  db.users[0].password_hash = hash;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('\n✅ Database updated successfully');
  console.log('\nLogin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
} else {
  console.log('❌ No users found');
}
