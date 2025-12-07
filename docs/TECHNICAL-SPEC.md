# Technical Specification
## SF Joule Mario Quest Chrome Extension

**Version**: 1.0.0  
**Last Updated**: 2025-12-07

---

## Technology Stack

### Core
- **JavaScript**: ES6+ (async/await, classes, modules)
- **Chrome APIs**: Manifest V3, storage, tabs, runtime, scripting
- **JSON**: Configuration management (quests, users, selectors)

### UI
- **HTML5**: Semantic markup
- **CSS3**: Modern animations, flexbox, gradients
- **Emoji**: Sprite replacement (copyright-free)

### External Libraries
- **Confetti.js**: Lightweight celebration animations (~8KB)
- No other external dependencies (keep it simple)

---

## Project Structure

```
sf-joule-mario-quest/
├── manifest.json                    # Chrome extension config
├── README.md                        # User guide
├── CONTRIBUTING.md                  # Developer guide
├── .clinerules                      # AI development rules
│
├── docs/                            # All documentation
│   ├── PRD.md
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL-SPEC.md
│   ├── CHANGELOG.md
│   └── ROADMAP.md
│
├── src/                             # All source code
│   ├── core/                        # Business logic
│   │   ├── joule-handler.js
│   │   ├── quest-runner.js
│   │   └── storage-manager.js
│   │
│   ├── ui/                          # UI components
│   │   ├── popup/
│   │   │   ├── popup.html
│   │   │   ├── popup.js
│   │   │   └── popup.css
│   │   └── overlay/
│   │       ├── overlay.js
│   │       └── overlay.css
│   │
│   ├── config/                      # JSON configs
│   │   ├── quests.json
│   │   ├── users.json
│   │   └── selectors.json
│   │
│   └── utils/                       # Utilities
│       ├── dom-utils.js
│       └── logger.js
│
├── assets/                          # Static files
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── confetti.min.js
│
├── tests/                           # Test files
│   ├── unit/
│   └── integration/
│
└── background.js                    # Service worker
```

---

## Key Components

### 1. Joule Handler (`src/core/joule-handler.js`)

**Purpose**: Interact with SAP Joule AI assistant

**Class Methods**:
```javascript
class JouleHandler {
  constructor()                                    // Initialize, load selectors
  async openJoule()                               // Find and click Joule button
  async sendPrompt(text)                          // Type and send prompt
  async waitForResponse(keywords, timeout)        // Wait for Joule response
  findElement(selectors)                          // Universal element finder
  async dismissOverlays()                         // Handle WalkMe/dialogs
  traverseShadowDOM(selectors, root, depth)       // Shadow DOM traversal
  searchIframes(selectors)                        // Check iframes
  wait(ms)                                        // Promise-based delay
}
```

**Dependencies**:
- `src/config/selectors.json` - Selector library
- DOM APIs (querySelector, XPath evaluator)

**Key Algorithms**:
- **Element Finding**: Try 5 selectors → shadow DOM → iframes → fail
- **Response Detection**: MutationObserver + keyword matching
- **Event Dispatching**: input, change, keydown events for shadow DOM

---

### 2. Quest Runner (`src/core/quest-runner.js`)

**Purpose**: Execute quest workflows step-by-step

**Class Methods**:
```javascript
class QuestRunner {
  constructor()                              // Initialize JouleHandler
  async loadQuest(questId)                   // Load from quests.json
  async runQuest(questId, options)           // Execute full quest
  async executeStep(step)                    // Run single step
  async completeQuest()                      // Finish and reward
  updateProgress(step, total)                // Update UI
  showOverlay(message, type)                 // Display feedback
}
```

**Dependencies**:
- `JouleHandler` - For Joule interactions
- `StorageManager` - For saving progress
- `src/config/quests.json` - Quest definitions

**Key Algorithms**:
- **Step Execution**: Load step → Execute action → Verify success → Next
- **Demo Mode**: Skip actual execution, show fake responses with delays
- **Error Recovery**: Try step 2x, then fail gracefully

---

### 3. Storage Manager (`src/core/storage-manager.js`)

**Purpose**: Wrapper for chrome.storage APIs

**Class Methods**:
```javascript
class StorageManager {
  async saveProgress(questId, stepIndex)     // Save current progress
  async loadProgress(questId)                // Load saved state
  async clearProgress(questId)               // Reset quest
  async saveCompletion(questId, rewards)     // Save completed quest
  async getCompletions()                     // Get all completions
  async saveSettings(settings)               // Save user preferences
  async loadSettings()                       // Load preferences
}
```

**Storage Keys**:
- `quest_progress_${questId}` - Current step index
- `quest_completed_${questId}` - Completion data
- `user_settings` - Demo mode, selected user
- `analytics_${timestamp}` - Event logs (Phase 2)

---

## Data Models

### Quest Definition (quests.json)

```json
{
  "id": "quest_cost_center",
  "name": "🏰 View Cost Center Quest",
  "description": "Ask Joule to show your cost center",
  "category": "informational",
  "difficulty": "easy",
  "roles": ["employee", "manager"],
  "steps": [
    {
      "id": "step_1",
      "name": "Open Joule Panel",
      "action": "open_joule",
      "success_criteria": {
        "type": "element_visible",
        "selector_key": "joule_panel"
      },
      "demo_response": "✅ Joule panel opened (Demo)"
    },
    {
      "id": "step_2",
      "name": "Send Prompt",
      "action": "send_prompt",
      "prompt": "view cost center",
      "success_criteria": {
        "type": "prompt_sent",
        "timeout_ms": 2000
      },
      "demo_response": "✅ Prompt sent (Demo)"
    },
    {
      "id": "step_3",
      "name": "Wait for Response",
      "action": "wait_for_response",
      "success_criteria": {
        "type": "text_match",
        "keywords": ["cost center", "department", "organization"],
        "timeout_ms": 10000
      },
      "demo_response": "Your cost center is 12345-IT (Demo)"
    }
  ],
  "rewards": {
    "stars": 3,
    "coins": 100,
    "badge": "🏆 Cost Center Master"
  }
}
```

### User Configuration (users.json)

```json
{
  "users": [
    {
      "id": 1,
      "name": "Manager User (Pilot)",
      "username": "m_i8062320423130513",
      "password": "oneapp@123",
      "roles": ["employee", "manager"],
      "tenant_url": "https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182",
      "avatar": "👨‍💼"
    }
  ]
}
```

### Selector Library (selectors.json)

```json
{
  "joule_button": [
    {"type": "xpath", "value": "//button[@aria-label='Joule']"},
    {"type": "xpath", "value": "//*[@data-testid='joule-button']"},
    {"type": "xpath", "value": "//span[text()='Joule']/ancestor::button"},
    {"type": "css", "value": "[aria-label*='Joule']"},
    {"type": "xpath", "value": "//button[contains(@class,'assistant')]"}
  ],
  "joule_panel": [
    {"type": "xpath", "value": "//*[@role='dialog'][contains(@aria-label,'Joule')]"},
    {"type": "css", "value": "[role='dialog'][aria-label*='Joule']"}
  ],
  "joule_input": [
    {"type": "xpath", "value": "//textarea[contains(@placeholder,'Ask')]"},
    {"type": "xpath", "value": "//input[contains(@placeholder,'Ask')]"},
    {"type": "css", "value": "textarea[placeholder*='Ask']"},
    {"type": "xpath", "value": "//textarea[contains(@class,'chat')]"},
    {"type": "css", "value": "input[placeholder*='question']"}
  ]
}
```

---

## Chrome Extension APIs Used

### Manifest V3 APIs
- `chrome.storage` - Persist data locally and sync
- `chrome.runtime` - Message passing, extension lifecycle
- `chrome.tabs` - Query and message active tabs
- `chrome.scripting` - Execute content scripts
- `chrome.action` - Extension icon, badge, popup

### Permissions Required
```json
{
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://*.successfactors.com/*",
    "https://*.sap.com/*",
    "https://*.cloud.sap/*"
  ]
}
```

---

## DOM Manipulation Techniques

### Standard DOM Queries
```javascript
// XPath
document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)

// CSS Selector
document.querySelector(selector)
```

### Shadow DOM Traversal
```javascript
// Access shadow root
const shadowRoot = element.shadowRoot;

// Recursive traversal
function findInShadow(selectors, root = document, depth = 3) {
  // Try current root
  const el = trySelectors(selectors, root);
  if (el) return el;
  
  // Traverse shadow DOMs
  if (depth > 0) {
    const hosts = root.querySelectorAll('*');
    for (const host of hosts) {
      if (host.shadowRoot) {
        const found = findInShadow(selectors, host.shadowRoot, depth - 1);
        if (found) return found;
      }
    }
  }
  
  return null;
}
```

### Iframe Handling
```javascript
// Try all iframes
const iframes = document.querySelectorAll('iframe');
for (const iframe of iframes) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const el = doc.querySelector(selector);
    if (el) return el;
  } catch (e) {
    // Cross-origin, skip
  }
}
```

---

## Event Dispatching for Shadow DOM

### Problem
Shadow DOM inputs don't respond to `.value =` alone

### Solution
Dispatch events to trigger framework listeners:

```javascript
input.value = promptText;

// Dispatch input event
input.dispatchEvent(new Event('input', { bubbles: true }));

// Dispatch change event
input.dispatchEvent(new Event('change', { bubbles: true }));

// Dispatch Enter key
const enterEvent = new KeyboardEvent('keydown', {
  key: 'Enter',
  code: 'Enter',
  keyCode: 13,
  bubbles: true
});
input.dispatchEvent(enterEvent);
```

---

## Response Detection with MutationObserver

### Problem
Joule responses appear asynchronously; need to detect when ready

### Solution
```javascript
async waitForResponse(keywords, timeout = 10000) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      const panel = this.findElement(this.selectors.joule_panel);
      if (!panel) return;
      
      const text = panel.textContent || '';
      const hasKeyword = keywords.some(kw => 
        text.toLowerCase().includes(kw.toLowerCase())
      );
      
      if (hasKeyword) {
        observer.disconnect();
        resolve(text);
      }
      
      if (Date.now() - startTime > timeout) {
        observer.disconnect();
        reject(new Error('Response timeout'));
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });
}
```

---

## Message Passing Architecture

### Popup → Background → Content Script

```javascript
// In popup.js
chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
  chrome.tabs.sendMessage(tab.id, {
    action: 'START_QUEST',
    payload: { questId: 'quest_cost_center', demoMode: true }
  });
});

// In background.js (relay if needed)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPDATE_PROGRESS') {
    chrome.action.setBadgeText({ text: `${request.step}/3` });
  }
});

// In content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_QUEST') {
    const runner = new QuestRunner();
    runner.runQuest(request.payload.questId, request.payload);
  }
});
```

---

## Error Handling Patterns

### Try-Catch Wrapper
```javascript
async executeStep(step) {
  try {
    // Attempt step execution
    await this.joule.openJoule();
  } catch (error) {
    console.error(`Step failed: ${step.name}`, error);
    this.showOverlay(`❌ ${step.name} failed: ${error.message}`, 'error');
    throw error; // Propagate to quest runner
  }
}
```

### Retry Logic
```javascript
async openJouleWithRetry(maxAttempts = 2) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await this.openJoule();
      return true;
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await this.wait(1000); // Wait before retry
    }
  }
}
```

---

## Performance Considerations

### Lazy Loading
```javascript
// Load configs only when needed
class QuestRunner {
  async loadQuest(questId) {
    if (!this.quests) {
      const response = await fetch(chrome.runtime.getURL('src/config/quests.json'));
      this.quests = await response.json();
    }
    return this.quests.find(q => q.id === questId);
  }
}
```

### Debouncing
```javascript
// Wait 500ms after mutations before checking
let debounceTimer;
observer.observe(document.body, {
  callback: () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => checkForResponse(), 500);
  }
});
```

---

## Security Implementation

### Credential Handling
- **Phase 1 (MVP)**: Plain text in `users.json`
- **Phase 2**: Web Crypto API encryption
- **Phase 3**: Chrome identity API for SSO

### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### No Eval
- Never use `eval()`, `Function()`, or `setTimeout(string)`
- All scripts loaded from chrome-extension:// URLs

---

## Testing Strategy

### Unit Tests (Phase 2)
- Test each class method independently
- Mock chrome APIs
- Use Jest or Mocha

### Integration Tests (Phase 2)
- Test full quest execution
- Mock Joule responses
- Verify state management

### Manual Testing Checklist
- [ ] Load extension in Chrome
- [ ] Open SF page with Joule
- [ ] Click extension icon → popup appears
- [ ] Select Demo mode → start quest
- [ ] Verify 3 steps complete
- [ ] Verify confetti plays
- [ ] Select Real mode → start quest
- [ ] Verify actual Joule interaction
- [ ] Verify error handling (disable Joule, test)

---

## Build & Deployment

### Development Build
```bash
# No build step needed (vanilla JS)
# Just load unpacked extension
```

### Production Build (Phase 3)
```bash
# Minify JS
npm run minify

# Optimize assets
npm run optimize-assets

# Package for Chrome Web Store
npm run package
```

### Chrome Web Store Submission
1. Create developer account
2. Package as .zip
3. Submit for review
4. Wait 3-5 days
5. Publish

---

## Browser API Compatibility

| API | Chrome | Edge | Notes |
|-----|--------|------|-------|
| Manifest V3 | ✅ 88+ | ✅ 88+ | Full support |
| chrome.storage | ✅ | ✅ | Core feature |
| chrome.scripting | ✅ 88+ | ✅ 88+ | Replaces executeScript |
| Service Workers | ✅ 88+ | ✅ 88+ | Replaces background pages |
| MutationObserver | ✅ | ✅ | Standard Web API |

---

## Known Limitations

### Technical Limitations
- **Shadow DOM**: May not access closed shadow roots (need interception)
- **Cross-Origin Iframes**: Cannot access due to CORS
- **Dynamic Selectors**: May break if SF updates UI
- **Network Dependent**: Real mode requires SF to be online

### Functional Limitations
- **Single Tab**: Can only run one quest at a time
- **No Parallel Quests**: Sequential execution only
- **Local Storage**: Limited to 5MB in chrome.storage.local
- **No Backend**: No server-side logic or data sync

---

## Future Technical Improvements

### Phase 2
- Shadow DOM interception (`attachShadow` override)
- Selector caching (remember successful patterns)
- Batch chrome.storage operations

### Phase 3
- TensorFlow.js for ML-powered selectors
- IndexedDB for large analytics datasets
- WebAssembly for performance

---

## Code Quality Standards

### JSDoc Comments
```javascript
/**
 * Opens the Joule AI assistant panel
 * @async
 * @returns {Promise<boolean>} True if panel opened successfully
 * @throws {Error} If Joule button not found after retries
 */
async openJoule() {
  // Implementation
}
```

### Error Messages
```javascript
// Good
throw new Error('Joule button not found - is Joule enabled on this tenant?');

// Bad
throw new Error('Element null');
```

### Logging
```javascript
// Use consistent prefixes
console.log('🎮 [Quest] Starting quest:', questId);
console.error('❌ [Joule] Failed to open panel:', error);
console.warn('⚠️ [Config] Missing selector:', key);
```

---

## Dependencies & Versions

### Required
- Chrome 90+ (for Manifest V3 full support)
- No external npm packages (Phase 1)

### Optional (Phase 2+)
- `confetti-js` v0.0.18
- `jest` v29+ (for testing)

---

## Development Environment

### Required Tools
- Chrome browser
- Text editor (VS Code recommended)
- Git for version control

### Optional Tools
- Chrome DevTools (for debugging)
- Playwright Inspector (for selector testing)
- Postman (for API testing in Phase 2)

---

## Monitoring & Debugging

### Console Logging
```javascript
// Quest lifecycle
console.log('🎮 Quest started:', questId);
console.log('📝 Step executing:', step.name);
console.log('✅ Step completed:', step.name);
console.log('🏆 Quest completed:', questId);

// Errors
console.error('❌ Error:', error.message, error.stack);
```

### Chrome DevTools
- **Sources tab**: Debug content scripts
- **Console tab**: View logs
- **Application tab**: Inspect chrome.storage
- **Network tab**: Check resource loading

---

## Migration Notes

### From Playwright (Python) to Chrome Extension (JavaScript)

| Playwright | Chrome Extension | Notes |
|------------|------------------|-------|
| `page.fill(selector, text)` | `input.value = text` + dispatch events | Need input/change events |
| `page.click(selector)` | `element.click()` | Same API |
| `page.wait_for_selector()` | `await waitForElement()` | Custom implementation |
| `time.sleep(3)` | `await wait(3000)` | Milliseconds, not seconds |
| `page.locator()` | `document.querySelector()` | Different API |
| Python dict | JavaScript object | Syntax differences |

---

## Performance Targets

- **Extension Load**: <100ms
- **Quest Execution**: <30s
- **Memory Usage**: <50MB
- **Storage Usage**: <5MB
- **Network Requests**: 0 (local only)

---

## Accessibility

- Use semantic HTML
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatible
