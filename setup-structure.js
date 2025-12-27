const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up refactored project structure...\n');

// Define structure
const structure = {
  'src/utils': ['constants.js', 'validation.js', 'helpers.js'],
  'src/services': ['api.js', 'agora.js'],
  'src/hooks': ['useAuth.js', 'useNotifications.js', 'useProfiles.js', 'useCallManagement.js'],
  'src/components': ['Header.jsx', 'CallScreen.jsx', 'ModelDashboard.jsx', 'ProfileGrid.jsx', 'Notification.jsx'],
  'src/components/modals': [
    'AuthModal.jsx',
    'VerificationModal.jsx', 
    'ProfileEditModal.jsx',
    'ModelProfileModal.jsx',
    'PaymentSetupModal.jsx',
    'TokenPurchaseModal.jsx',
    'WithdrawModal.jsx',
    'CallHistoryModal.jsx',
    'EarningsHistoryModal.jsx',
    'SafetyWarningModal.jsx',
    'IncomingCallModal.jsx',
    'GiftModal.jsx'
  ]
};

// File templates with actual content
const templates = {
  'src/utils/constants.js': `export const TOKEN_TO_KSH = 23;
export const API_URL = 'http://localhost:5000/api';
export const PROFILES_PER_PAGE = 20;

export const PRICING_TIERS = [
  { tokens: 10, price: 230, perToken: 23, savings: 0 },
  { tokens: 25, price: 550, perToken: 22, savings: 4 },
  { tokens: 50, price: 1050, perToken: 21, savings: 9 },
  { tokens: 100, price: 2000, perToken: 20, savings: 13 },
  { tokens: 200, price: 3800, perToken: 19, savings: 17 },
];
`,

  'src/utils/validation.js': `export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
};
`,

  'src/utils/helpers.js': `// Helper functions
export const getRandomOnlineCount = () => ({
  clients: Math.floor(Math.random() * 50) + 20,
});

export const parseUserId = (profile) => {
  return typeof profile.userId === 'object' ? profile.userId._id : profile.userId;
};
`,

  'src/services/api.js': `import { API_URL } from '../utils/constants';

export const authAPI = {
  signup: (data) => fetch(\`\${API_URL}/auth/signup\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  login: (data) => fetch(\`\${API_URL}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  verifyEmail: (data) => fetch(\`\${API_URL}/auth/verify\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const profileAPI = {
  getAll: () => fetch(\`\${API_URL}/profiles\`),
  update: (data) => fetch(\`\${API_URL}/profile/update\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updatePaymentMethod: (data) => fetch(\`\${API_URL}/profile/payment-method\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const callAPI = {
  checkIncoming: (userId) => fetch(\`\${API_URL}/calls/check/\${userId}\`),
  create: (data) => fetch(\`\${API_URL}/calls/create\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  accept: (data) => fetch(\`\${API_URL}/calls/accept\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  end: (data) => fetch(\`\${API_URL}/calls/end\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getHistory: (userId) => fetch(\`\${API_URL}/calls/history/\${userId}\`),
};

export const tokenAPI = {
  purchase: (data) => fetch(\`\${API_URL}/tokens/purchase\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const earningsAPI = {
  withdraw: (data) => fetch(\`\${API_URL}/earnings/withdraw\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getHistory: (userId) => fetch(\`\${API_URL}/earnings/history/\${userId}\`),
};
`,

  'src/services/agora.js': `import { API_URL } from '../utils/constants';

export const getAgoraToken = async (channelName, uid) => {
  try {
    const response = await fetch(\`\${API_URL}/agora/token\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, uid }),
    });
    const data = await response.json();
    if (!data.token || !data.appId) return null;
    return { token: data.token, appId: data.appId };
  } catch (error) {
    return null;
  }
};
`,

  'src/hooks/useNotifications.js': `import { useState } from 'react';

export const useNotifications = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return { notification, showNotification };
};
`,

  'src/components/Notification.jsx': `import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={\`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 \${notification.type === 'success' ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gradient-to-r from-pink-600 to-purple-700'} text-white\`}>
      {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-semibold">{notification.message}</span>
    </div>
  );
};
`,
};

// Create everything
Object.entries(structure).forEach(([dir, files]) => {
  const dirPath = path.join(__dirname, dir);
  
  // Create directory
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dir}/`);
  } else {
    console.log(`📁 Exists: ${dir}/`);
  }
  
  // Create files
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const templateKey = `${dir}/${file}`;
    
    if (!fs.existsSync(filePath)) {
      const content = templates[templateKey] || `// ${file}\n// TODO: Extract from App.js\n\nexport default {};\n`;
      fs.writeFileSync(filePath, content);
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   📄 ${file} (exists)`);
    }
  });
});

// Backup App.js
const appPath = path.join(__dirname, 'src/App.js');
if (fs.existsSync(appPath)) {
  const backupPath = path.join(__dirname, 'src/App.js.ORIGINAL.backup');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(appPath, backupPath);
    console.log('\n💾 Backed up: src/App.js.ORIGINAL.backup');
  }
}

// Create instruction file
const instructions = `
# Refactoring Instructions

## ✅ Completed
- Created 25+ files organized in folders
- Backed up original App.js
- Added starter code to utils and services

## 📝 Next Steps

### Phase 1: Update App.js imports (5 min)
Add these at the top of App.js:

\`\`\`javascript
import { TOKEN_TO_KSH, API_URL, PRICING_TIERS } from './utils/constants';
import { validatePassword, formatTime } from './utils/validation';
import { authAPI, profileAPI, callAPI, tokenAPI, earningsAPI } from './services/api';
import { getAgoraToken } from './services/agora';
import { useNotifications } from './hooks/useNotifications';
import { Notification } from './components/Notification';
\`\`\`

### Phase 2: Remove duplicates from App.js
Delete these from App.js (they're now in utils/constants.js):
- \`const TOKEN_TO_KSH = 23;\`
- \`const API_URL = ...\`
- \`const pricingTiers = [...]\` (use PRICING_TIERS instead)

Delete these functions (now in utils/validation.js):
- \`const validatePassword = ...\`
- \`const formatTime = ...\`

Delete this function (now in services/agora.js):
- \`const getAgoraToken = ...\`

### Phase 3: Use the notification hook
Replace in App.js:
\`\`\`javascript
// OLD:
const [notification, setNotification] = useState(null);
const showNotification = ...

// NEW:
const { notification, showNotification } = useNotifications();
\`\`\`

Replace notification JSX with:
\`\`\`javascript
<Notification notification={notification} />
\`\`\`

### Phase 4: Extract modals (one at a time)
Each modal in src/components/modals/ is ready for code.
Extract one modal, test, commit. Repeat.

## 🎯 Result
App.js will go from 1000+ lines to ~300 lines!

## 📊 File Count
- Before: 1 file (1000+ lines)
- After: 28 files (~50 lines each)
`;

fs.writeFileSync(path.join(__dirname, 'REFACTORING_GUIDE.md'), instructions);

console.log('\n📚 Created: REFACTORING_GUIDE.md');
console.log('\n✨ Setup complete!');
console.log('\n📋 Next: Read REFACTORING_GUIDE.md for step-by-step instructions');
console.log('⚠️  Your original App.js is safe in App.js.ORIGINAL.backup\n');