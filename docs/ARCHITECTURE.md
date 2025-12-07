# System Architecture
## SF Joule Mario Quest Chrome Extension

**Version**: 1.0.0  
**Last Updated**: 2025-12-07

---

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│         Chrome Extension (Manifest V3)       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐      ┌─────────────────┐    │
│  │  Popup   │─────→│    Background   │    │
│  │   UI     │      │  Service Worker │    │
│  └──────────┘      └─────────────────┘    │
│       ↓                     ↓               │
│  ┌─────────────────────────────────┐       │
│  │      Content Script Layer       │       │
│  │  - joule-handler.js             │       │
│  │  - quest-runner.js              │       │
│  │  - overlay.js                   │       │
│  └─────────────────────────────────┘       │
│                    ↓                        │
└────────────────────┼────────────────────────┘
                     ↓
         ┌───────────────────────┐
         │  SAP SuccessFactors   │
         │  (Joule-enabled page) │
         └───────────────────────┘
```

---

## Component Responsibilities

### 1. Popup UI (`src/ui/popup/`)
**Purpose**: User interface for quest selection and configuration

**Responsibilities**:
- Display available quests
- Toggle Demo/Real mode
- Select user credentials
- Start quest execution
- Show basic progress

**Technology**: HTML, CSS, vanilla JavaScript

---

### 2. Background Service Worker (`background.js`)
**Purpose**: Coordinate between popup and content scripts

**Responsibilities**:
- Message passing between components
- State management
- Badge updates (progress indicator)
- chrome.storage orchestration

**Technology**: Service Worker API

---

### 3. Content Scripts (`src/core/` + `src/ui/overlay/`)
**Purpose**: Execute quests on SF pages

**Responsibilities**:
- Inject into SF pages automatically
- Execute quest steps
- Interact with Joule AI
- Display progress overlay
- Handle errors gracefully

**Technology**: JavaScript (ES6+), DOM manipulation

---

## Data Flow

### Quest Execution Flow

```
User clicks "Start Quest"
       ↓
Popup sends message to Background
       ↓
Background sends message to Content Script
       ↓
Content Script loads quest config
       ↓
Quest Runner executes steps:
  Step 1: Open Joule (joule-handler.openJoule)
  Step 2: Send Prompt (joule-handler.sendPrompt)
  Step 3: Wait Response (joule-handler.waitForResponse)
       ↓
Update overlay on each step
       ↓
On completion: Confetti + Save to chrome.storage
       ↓
Send completion message to Background
       ↓
Background updates popup badge
```

---

## File Organization

### Configuration Files (`src/config/`)

**quests.json**:
```json
{
  "quests": [
    {
      "id": "quest_cost_center",
      "steps": [...],
      "rewards": {...}
    }
  ]
}
```

**users.json**:
```json
{
  "users": [
    {
      "id": 1,
      "username": "...",
      "roles": ["employee", "manager"]
    }
  ]
}
```

**selectors.json**:
```json
{
  "joule_button": [
    {"type": "xpath", "value": "..."},
    {"type": "css", "value": "..."}
  ]
}
```

---

## Core Classes

### JouleHandler (`src/core/joule-handler.js`)

```javascript
class JouleHandler {
  async openJoule()           // Find and click Joule button
  async sendPrompt(text)      // Type and send prompt
  async waitForResponse(keywords, timeout)  // Wait for response
  findElement(selectors)      // Universal element finder
  dismissOverlays()           // Handle WalkMe/dialogs
}
```

### QuestRunner (`src/core/quest-runner.js`)

```javascript
class QuestRunner {
  async loadQuest(questId)    // Load from quests.json
  async executeStep(step)     // Execute single step
  async completeQuest()       // Finish and reward
  updateProgress()            // Update UI overlay
}
```

### StorageManager (`src/core/storage-manager.js`)

```javascript
class StorageManager {
  async saveProgress(data)    // Save to chrome.storage.local
  async loadProgress(questId) // Load saved state
  async clearProgress()       // Reset state
}
```

---

## Shadow DOM Handling

### Challenge
SAP SuccessFactors uses shadow DOM for components, which blocks standard DOM queries.

### Solution
1. Try standard selectors first (XPath, CSS)
2. If not found, traverse shadow roots recursively
3. Check iframes as fallback
4. Use multiple selector patterns per element

### Implementation
```javascript
// In joule-handler.js
findElement(selectors) {
  // Try each selector
  for (const sel of selectors) {
    const el = this.trySelector(sel);
    if (el) return el;
  }
  
  // Try shadow DOM traversal
  const shadowEl = this.traverseShadowDOM(selectors);
  if (shadowEl) return shadowEl;
  
  // Try iframes
  const iframeEl = this.searchIframes(selectors);
  return iframeEl;
}
```

---

## Error Handling Strategy

### Levels of Error Handling

1. **Element Not Found**: Retry with fallback selectors
2. **Timeout**: Wait longer, then show user-friendly message
3. **Joule Not Responding**: Suggest manual completion
4. **Network Issues**: Detect offline, suggest reconnect
5. **Unknown Errors**: Log to console, show generic error

### User Messaging
- Never show technical error details to users
- Always provide actionable next steps
- Use emoji for visual feedback (❌ ✅ ⏳)

---

## Storage Architecture

### chrome.storage.local (Per-device)
- Quest progress
- Completion history
- Error logs
- Analytics events

### chrome.storage.sync (Cross-device)
- User preferences
- Demo/Real mode setting
- Selected user ID

---

## Performance Optimization

### Key Strategies
1. **Lazy Loading**: Load configs only when needed
2. **Debouncing**: Wait 500ms after mutations before checking
3. **Selector Caching**: Store successful selectors
4. **Minimal DOM Operations**: Batch updates
5. **Memory Management**: Clean up observers on completion

### Targets
- Extension load: <100ms
- Quest execution: <30s
- Memory usage: <50MB
- Zero memory leaks

---

## Security Considerations

### Credential Handling
- Stored in `users.json` (local file)
- TODO: Encrypt in production using Web Crypto API
- Never sent to external servers
- User must manually update JSON file

### Content Security Policy
- No inline scripts
- No eval() usage
- All resources from chrome-extension:// URLs

### Permissions
- Minimal: `storage`, `activeTab`, `scripting`
- NO broad permissions like `<all_urls>`

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Primary target |
| Edge 90+ | ✅ Full | Chromium-based |
| Brave | ⚠️ Partial | May need manifest tweaks |
| Firefox | ❌ No | Manifest V3 differences |

---

## Deployment Strategy

### Phase 1: Local Development
- Load unpacked extension in Chrome
- Test on live SF instance
- Iterate based on feedback

### Phase 2: Private Distribution
- Package as .crx file
- Share with beta testers
- Collect feedback

### Phase 3: Chrome Web Store
- Submit for review
- Public release
- Monitor ratings/reviews

---

## Technical Debt

_To be tracked as project progresses_

---

## Future Considerations

- WebAssembly for performance-critical code
- IndexedDB for large analytics datasets
- Service Worker caching strategies
- Progressive Web App features
