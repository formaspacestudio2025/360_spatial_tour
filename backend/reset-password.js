// Reset admin password script
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'db.json');

// Read database
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Generate new password hash
const newPassword = 'admin123';
const passwordHash = bcryptjs.hashSync(newPassword, 10);

// Update admin user password
if (db.users && db.users.length > 0) {
  const adminUser = db.users.find(u => u.username === 'admin');
  if (adminUser) {
    adminUser.password_hash = passwordHash;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('✅ Admin password reset successfully!');
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');
  } else {
    console.log('❌ Admin user not found in database');
  }
} else {
  console.log('❌ No users found in database');
}
