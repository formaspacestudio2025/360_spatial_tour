const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Update with fresh hash
db.users[0].password_hash = '$2b$10$1Cynbg5g/TUG9XYQVze2We9YSTKSW9JWtjuQC1WZTwekWnLQI/as6';

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('✅ Password updated in database');
console.log('Username: admin');
console.log('Password: admin123');
console.log('\nIMPORTANT: You MUST restart the backend server for this to take effect!');
console.log('The backend caches the database in memory at startup.');
