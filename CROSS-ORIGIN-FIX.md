# Cross-Origin Iframe Access Fix

## Problem

The extension was encountering a cross-origin security error:

```
Failed to read a named property 'document' from 'Window': 
Blocked a frame with origin "https://hcm-us20-sales.hr.cloud.sap" 
from accessing a cross-origin frame.
```

## Root Cause

The `sendPrompt` method in `src/core/joule-handler.js` was attempting to directly access the Joule iframe's DOM:

```javascript
// ❌ WRONG: Violates cross-origin policy
const iframeDoc = this.jouleIframe.contentDocument || 
                  this.jouleIframe.contentWindow.document;
const textarea = iframeDoc.querySelector('textarea');
```

This is blocked by browsers because:
- The parent page is on `hcm-us20-sales.hr.cloud.sap`
- The Joule iframe is on `sapdas.cloud.sap`
- These are different origins (different subdomains)

## Solution

Changed to use **postMessage API** for secure cross-origin communication:

### Architecture

```
┌─────────────────────────────────────┐
│  Parent Page                         │
│  (hcm-us20-sales.hr.cloud.sap)      │
│                                      │
│  ┌──────────────────────┐           │
│  │ joule-handler.js     │           │
│  │                      │           │
│  │ - sendPrompt()       │           │
│  │ - Sends postMessage  │           │
│  └──────────┬───────────┘           │
│             │                        │
│             │ postMessage            │
│             ▼                        │
│  ┌─────────────────────────────┐   │
│  │ Joule Iframe                │   │
│  │ (sapdas.cloud.sap)          │   │
│  │                             │   │
│  │ ┌─────────────────────────┐│   │
│  │ │joule-iframe-handler.js  ││   │
│  │ │                         ││   │
│  │ │ - Listens for messages  ││   │
│  │ │ - Accesses DOM          ││   │
│  │ │ - Sends response back   ││   │
│  │ └─────────────────────────┘│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Code Changes

**Before (Direct DOM Access - BLOCKED):**

```javascript
async sendPrompt(prompt) {
  // ❌ This fails with cross-origin error
  const iframeDoc = this.jouleIframe.contentDocument;
  const textarea = iframeDoc.querySelector('textarea');
  textarea.value = prompt;
  textarea.dispatchEvent(new Event('input'));
}
```

**After (postMessage API - SECURE):**

```javascript
async sendPrompt(prompt) {
  // ✅ Send message to iframe handler
  const typeResult = await this.sendMessageToIframe('type_text', { 
    text: prompt 
  });
  
  // ✅ Iframe handler accesses DOM from inside iframe
  const sendResult = await this.sendMessageToIframe('click_send');
  
  return {
    success: true,
    message: 'Prompt sent successfully via postMessage'
  };
}
```

## How It Works

### 1. Main Script (joule-handler.js)

Sends messages to iframe:

```javascript
async sendMessageToIframe(type, data = {}, timeout = 30000) {
  const requestId = ++this.requestIdCounter;
  
  return new Promise((resolve, reject) => {
    // Set up callback for response
    this.messageCallbacks.set(requestId, (response) => {
      resolve(response);
    });

    // Send message to iframe
    const message = {
      source: 'mario-quest-main',
      type: type,
      requestId: requestId,
      data: data
    };

    this.jouleIframe.contentWindow.postMessage(message, '*');
  });
}
```

### 2. Iframe Script (joule-iframe-handler.js)

Receives messages and accesses DOM:

```javascript
async handleMessage(message) {
  switch (message.type) {
    case 'type_text':
      await this.typeText(message.data.text, message.requestId);
      break;
    
    case 'click_send':
      await this.clickSendButton(message.requestId);
      break;
  }
}

async typeText(text, requestId) {
  // ✅ Can access DOM because script runs inside iframe
  const textarea = document.querySelector('textarea');
  textarea.value = text;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Send response back
  this.sendMessageToParent({
    type: 'text_typed',
    requestId: requestId,
    data: { success: true }
  });
}
```

## Message Flow

1. **User triggers quest** → `quest-runner.js` calls `sendPrompt()`
2. **sendPrompt()** → Sends `type_text` message via postMessage
3. **Iframe handler** → Receives message, types text into textarea
4. **Iframe handler** → Sends confirmation back
5. **sendPrompt()** → Receives confirmation, sends `click_send` message
6. **Iframe handler** → Clicks send button
7. **Iframe handler** → Sends confirmation back
8. **sendPrompt()** → Returns success

## Security Benefits

✅ **Browser-approved** communication method  
✅ **No origin violations** - each script operates in its own context  
✅ **Message authentication** - verifies message source  
✅ **Timeout protection** - prevents hanging on failed messages  
✅ **Error handling** - graceful failure if iframe not ready

## Testing

To verify the fix works:

1. **Reload extension** in Chrome
2. **Open SAP SuccessFactors** page
3. **Start a quest** that uses Joule
4. **Check console** - should see:
   ```
   [Mario Quest] Sending type_text message to iframe
   [Joule Iframe] Received message from parent
   [Joule Iframe] ✅ Text typed successfully
   [Mario Quest] ✅ Text typed successfully via postMessage
   ```
5. **No cross-origin errors** should appear

## Files Modified

1. **src/core/joule-handler.js**
   - Removed direct DOM access in `sendPrompt()`
   - Removed direct injection in `injectIframeHandler()`
   - Now uses postMessage exclusively

2. **src/joule-iframe-handler.js**
   - Already implemented (no changes needed)
   - Handles all DOM operations from inside iframe

3. **manifest.json**
   - Already configured correctly
   - Content script injected into `*.sapdas.cloud.sap/*`

## Migration Notes

No migration needed for users. The extension will:

1. Automatically use postMessage for all iframe communication
2. Fall back gracefully if iframe handler not ready
3. Log clear error messages if problems occur

## Related Documentation

- [IFRAME-IMPLEMENTATION-COMPLETE.md](IFRAME-IMPLEMENTATION-COMPLETE.md) - Original iframe implementation
- [TESTING-GUIDE.md](TESTING-GUIDE.md) - How to test the extension
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Overall system architecture

---

**Fix Applied**: December 7, 2025  
**Issue**: Cross-origin iframe access violation  
**Resolution**: Switched from direct DOM access to postMessage API  
**Status**: ✅ RESOLVED
