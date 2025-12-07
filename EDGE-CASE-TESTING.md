# Edge Case Testing Checklist

## Overview
This document verifies that all edge cases identified by the user have been implemented and are ready for testing.

## Implemented Edge Cases

### 1. Joule Panel State Detection ✅
**Edge Case**: "joule could be open or close"

**Implementation** (`src/core/joule-handler.js` - `openChat()`):
```javascript
// First check if Joule is already open by looking for input field
const existingInput = this.shadowDOM.findElement(
  this.selectors.joule.inputField
);

if (existingInput) {
  this.logger.info('Joule is already open, no need to click button');
  this.isOpen = true;
  return true;
}
```

**How It Works**:
- Before clicking Joule button, checks if input field already exists
- If found → Skip button click, mark as open, continue
- If not found → Click button to open panel

### 2. Existing Content Handling ✅
**Edge Case**: "conversation window may have existing content or may not have existing content"

**Implementation** (`src/core/joule-handler.js` - `sendPrompt()`):
```javascript
// Clear any existing content first
if (inputField.value && inputField.value.length > 0) {
  this.logger.info('Clearing existing input content');
  this.shadowDOM.setInputValue(inputField, '');
  await this.sleep(300);
}
```

**How It Works**:
- Checks if input field has existing value
- If content exists → Clear it first, wait 300ms
- Then types new prompt with clean slate

### 3. Send Button Fallback ✅
**Edge Case**: Send button might not be found in Shadow DOM

**Implementation** (`src/core/joule-handler.js` - `sendPrompt()`):
```javascript
if (!sendButton) {
  // Try pressing Enter as fallback
  this.logger.warn('Send button not found, trying Enter key');
  inputField.dispatchEvent(new KeyboardEvent('keydown', { 
    key: 'Enter', 
    code: 'Enter',
    bubbles: true, 
    composed: true 
  }));
} else {
  this.shadowDOM.clickElement(sendButton);
}
```

**How It Works**:
- Tries to find send button first
- If not found → Press Enter key as fallback
- Ensures prompt gets sent either way

### 4. Close Button Fallback ✅
**Edge Case**: Close button might not be found, need alternative

**Implementation** (`src/core/joule-handler.js` - `closeChat()`):
```javascript
// Check if already closed first
const inputField = this.shadowDOM.findElement(
  this.selectors.joule.inputField
);

if (!inputField) {
  this.logger.info('Joule is already closed, no action needed');
  this.isOpen = false;
  return true;
}

// Try close button, fallback to toggle button
if (!closeButton) {
  this.logger.warn('Close button not found, trying to toggle via Joule button');
  const chatButton = this.shadowDOM.findElement(
    this.selectors.joule.chatButton
  );
  
  if (chatButton) {
    this.shadowDOM.clickElement(chatButton);
    this.isOpen = false;
    return true;
  }
}
```

**How It Works**:
1. First checks if already closed (no input field)
2. If open, tries dedicated close button
3. If close button not found → Toggle via Joule button
4. If nothing works → Continue anyway (closing is not critical)

### 5. Popup Blocking View ✅
**Edge Case**: Extension popup stays open and blocks quest overlay

**Implementation** (`src/ui/popup.js`):
```javascript
async function startQuest() {
  // ... quest start logic ...
  
  // Close popup immediately so it doesn't block overlay
  setTimeout(() => window.close(), 100);
}
```

**How It Works**:
- After starting quest, popup closes itself after 100ms
- Allows overlay to be visible
- User can see quest progress without popup in the way

## Testing Instructions

### Test Scenario 1: Joule Already Open
1. Log into SAP SF: `https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182`
2. Manually click Joule icon in top bar to open panel
3. Click extension icon → Start quest
4. **Expected**: Quest detects panel is open, skips button click, proceeds to send prompt

### Test Scenario 2: Existing Content in Input
1. Open Joule panel manually
2. Type some random text in the input field (but don't send)
3. Click extension icon → Start quest
4. **Expected**: Quest clears existing text, types "Show me my cost center", sends

### Test Scenario 3: Joule Closed
1. Make sure Joule panel is closed
2. Click extension icon → Start quest
3. **Expected**: Quest clicks Joule button, waits for panel to open, then continues

### Test Scenario 4: Complete Auto-Run
1. Refresh SAP SF page (Joule will be closed)
2. Click extension icon → Start quest
3. **Expected**: 
   - Popup closes immediately
   - Overlay appears with Mario theme
   - Quest runs automatically:
     - Opens Joule
     - Sends prompt
     - Shows success when complete
   - No errors in console

## Console Logging

All edge cases log their actions:
```
[JOULE] Joule is already open, no need to click button
[JOULE] Clearing existing input content
[JOULE] Send button not found, trying Enter key
[JOULE] Close button not found, trying to toggle via Joule button
[JOULE] Joule is already closed, no action needed
```

## Success Criteria

✅ Quest runs without errors regardless of:
- Joule panel state (open/closed)
- Input field content (empty/has text)
- Button availability (send/close buttons present or missing)

✅ Popup closes immediately when quest starts

✅ Overlay is visible and shows progress

✅ Console logs show which edge case handling was triggered

## How to View Logs

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Filter by "[JOULE]" or "[QUEST]" to see relevant logs
4. Look for edge case messages to verify correct path taken

## Files Changed for Edge Cases

1. **src/core/joule-handler.js**
   - `openChat()`: Detects if already open
   - `sendPrompt()`: Clears existing content, Enter key fallback
   - `closeChat()`: Detects if already closed, toggle button fallback

2. **src/ui/popup.js**
   - Added `window.close()` timer to close popup immediately

3. **src/config/selectors.json**
   - Updated with real selectors from SF testing
   - Broader selector patterns for compatibility

## Next Steps

1. Reload extension at `chrome://extensions/`
2. Refresh SAP SF page
3. Run through all 4 test scenarios above
4. Check console for edge case handling logs
5. Verify quest completes successfully in each scenario
