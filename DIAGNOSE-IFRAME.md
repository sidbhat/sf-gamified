# Diagnose Iframe Script Loading

## Problem
Getting error "Input field not found" but unclear if iframe script is even loading.

## How to Check Console for Iframe

### Step 1: Open DevTools
Press F12 to open Chrome DevTools

### Step 2: Find Console Context Dropdown
Look at the **top of the Console tab** - you'll see a dropdown that says "top"

```
Console | [top ▼] | [Filter] | [×]
```

### Step 3: Click the Dropdown
Click on "top" to see all available contexts

### Step 4: Find Iframe Context
You should see options like:
```
top
└─ [iframe] https://sfsales010182-lxaj3a61.us10.sapdas.cloud.sap/...
```

### Step 5: Select Iframe
Click on the iframe option with `sapdas.cloud.sap` in the URL

### Step 6: Check Logs
Now look at the console. You should see logs from the iframe.

## What to Look For

### SCENARIO A: You See `[Joule Iframe]` Logs ✅
```
[Joule Iframe] ℹ️ Initializing Joule iframe handler
[Joule Iframe] ✅ Joule iframe handler initialized
[Joule Iframe] Received message from parent
[Joule Iframe] ℹ️ Typing text: show my cost center
[Joule Iframe] ℹ️ Document ready state: complete
[Joule Iframe] ℹ️ Body innerHTML length: 12345
[Joule Iframe] ❌ Could not find input field. Found 0 total inputs: []
```

**This means**: Script is loading, but DOM is empty or textarea not found
**Next step**: We need to wait longer or use different approach

### SCENARIO B: You DON'T See Any `[Joule Iframe]` Logs ❌
```
(just browser warnings and SAP errors, no [Joule Iframe] logs)
```

**This means**: Iframe content script is NOT loading at all
**Possible causes**:
1. Cross-origin blocking (CORB error you mentioned)
2. Manifest.json not configured correctly
3. Script not injected into iframe

## CORB Error Analysis

You mentioned: "Response was blocked by CORB (Cross-Origin Read Blocking)"

**This is CRITICAL** - it means Chrome is blocking the content script from being injected into the iframe because of cross-origin security.

## Alternative Solution Needed

If CORB is blocking the script injection, we have TWO options:

### Option 1: Use Puppeteer-style Execution (RECOMMENDED)
Instead of injecting a content script, execute JavaScript directly in the iframe context:

```javascript
// From main content script:
const iframe = document.querySelector('iframe[src*="sapdas.cloud.sap"]');
const result = await chrome.scripting.executeScript({
  target: { frameId: iframe.frameId },
  func: () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'show my cost center';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return { success: true };
    }
    return { success: false, error: 'textarea not found' };
  }
});
```

### Option 2: Use chrome.scripting API
Execute scripts in iframe without content script injection.

## Next Steps

1. **First confirm**: Do you see `[Joule Iframe]` logs or not?
2. **If NO logs**: We need to switch to chrome.scripting API approach
3. **If YES logs but no textarea**: We need to investigate the iframe DOM structure

---

## Quick Test Script

Run this in the **main page console** to check if iframe script is loaded:

```javascript
// Find iframe
const iframe = document.querySelector('iframe[src*="sapdas.cloud.sap"]');
if (iframe) {
  console.log('✅ Iframe found');
  
  // Try to send message
  iframe.contentWindow.postMessage({
    source: 'mario-quest-main',
    type: 'check_if_open',
    requestId: 999,
    data: {}
  }, '*');
  
  // Listen for response
  let responded = false;
  const handler = (event) => {
    if (event.data && event.data.source === 'mario-quest-iframe') {
      console.log('✅ Iframe script responded!', event.data);
      responded = true;
    }
  };
  window.addEventListener('message', handler);
  
  // Check after 2 seconds
  setTimeout(() => {
    if (!responded) {
      console.log('❌ No response from iframe - script not loaded');
    }
    window.removeEventListener('message', handler);
  }, 2000);
} else {
  console.log('❌ Iframe not found');
}
```

Run this and tell me what it says!
