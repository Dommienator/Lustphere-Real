const fs = require('fs');
const path = require('path');

console.log('🚀 Creating folder structure...\n');

// Create src/modals folder
const modalsPath = path.join(__dirname, 'src', 'modals');

if (!fs.existsSync(modalsPath)) {
  fs.mkdirSync(modalsPath, { recursive: true });
  console.log('✅ Created: src/modals/');
} else {
  console.log('📁 Already exists: src/modals/');
}

console.log('\n✨ Done! Folder created.');
console.log('\nNext: I will give you the modal files one by one.');