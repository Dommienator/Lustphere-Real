
# Refactoring Instructions

## ✅ Completed
- Created 25+ files organized in folders
- Backed up original App.js
- Added starter code to utils and services

## 📝 Next Steps

### Phase 1: Update App.js imports (5 min)
Add these at the top of App.js:

```javascript
import { TOKEN_TO_KSH, API_URL, PRICING_TIERS } from './utils/constants';
import { validatePassword, formatTime } from './utils/validation';
import { authAPI, profileAPI, callAPI, tokenAPI, earningsAPI } from './services/api';
import { getAgoraToken } from './services/agora';
import { useNotifications } from './hooks/useNotifications';
import { Notification } from './components/Notification';
```

### Phase 2: Remove duplicates from App.js
Delete these from App.js (they're now in utils/constants.js):
- `const TOKEN_TO_KSH = 23;`
- `const API_URL = ...`
- `const pricingTiers = [...]` (use PRICING_TIERS instead)

Delete these functions (now in utils/validation.js):
- `const validatePassword = ...`
- `const formatTime = ...`

Delete this function (now in services/agora.js):
- `const getAgoraToken = ...`

### Phase 3: Use the notification hook
Replace in App.js:
```javascript
// OLD:
const [notification, setNotification] = useState(null);
const showNotification = ...

// NEW:
const { notification, showNotification } = useNotifications();
```

Replace notification JSX with:
```javascript
<Notification notification={notification} />
```

### Phase 4: Extract modals (one at a time)
Each modal in src/components/modals/ is ready for code.
Extract one modal, test, commit. Repeat.

## 🎯 Result
App.js will go from 1000+ lines to ~300 lines!

## 📊 File Count
- Before: 1 file (1000+ lines)
- After: 28 files (~50 lines each)
