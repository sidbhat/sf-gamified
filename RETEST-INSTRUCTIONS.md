# Retest Instructions - Timing Fix Applied

## Changes Made

### 1. Increased Wait Times (src/core/joule-handler.js)
- Added **1.5 second delay** after clicking Joule button
- Increased input field timeout from **5s to 10s**
- Added better logging: "Waiting for input field to appear..."

### 2. Broader Input Selectors (src/config/selectors.json)
Added generic fallbacks:
- `textarea` (any textarea)
- `textarea[role='textbox']`
- `textarea[placeholder*='message']` (lowercase)
- `input[type='text']`

## How to Retest

### Step 1: Reload Extension
```
1. Go to chrome://extensions/
2. Find "SF Joule Mario Quest"
3. Click the reload icon (circular arrow)
```

### Step 2: Refresh SAP SF Page
```
1. Go back to SAP SuccessFactors tab
2. Press F5 or Cmd+R to refresh
3. Wait for page to fully load
```

### Step 3: Run Quest Again
```
1. Click extension icon in toolbar
2. Click "Start Quest" button
3. Watch console for logs (F12 → Console tab)
```

## What to Look For

### Success Indicators ✅
Console logs should show:
```
[JOULE] Found Joule button, clicking to open panel
[JOULE] Waiting for input field to appear...
[JOULE] Joule chat opened successfully
[JOULE] Typing prompt into input field
[JOULE] Prompt sent successfully
```

### If Still Fails ❌
Look for specific error:
- "Input field did not appear" → Panel opened but wrong selector
- "Joule button not found" → Button selector issue
- Other error → Copy full error message

## Advanced Debug: Check What Elements Exist

If it still fails, run this in console after clicking extension:

```javascript
// Wait 3 seconds after clicking Joule button, then check
setTimeout(() => {
  // Check for textareas
  console.log('All textareas:', document.querySelectorAll('textarea'));
  
  // Check Shadow DOM
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.shadowRoot) {
      const textareas = el.shadowRoot.querySelectorAll('textarea');
      if (textareas.length > 0) {
        console.log('Found textarea in Shadow DOM:', el, textareas);
      }
    }
  });
}, 3000);
```

This will help identify the actual element structure.

## Expected Behavior

**Timeline**:
1. Click "Start Quest" → Popup closes immediately
2. 0-1s: Extension finds Joule button, clicks it
3. 1.5s: Wait for panel animation
4. 2-5s: Search for input field in Shadow DOM
5. 5-6s: Type prompt, click send
6. 6s+: Display success overlay

**Total time**: ~6-10 seconds from start to completion

## Next Steps

- If it works → Quest will complete with Mario overlay! 🎉
- If it fails → Share the console error and I'll adjust selectors further
