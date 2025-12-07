# Cross-Origin Fix Testing Instructions

## Important: Complete Testing Steps

Follow these steps EXACTLY to test the cross-origin fix:

### Step 1: Reload Extension

1. Open Chrome and go to `chrome://extensions`
2. Find "SF Joule Mario Quest"
3. Click the **Reload** button (circular arrow icon)
4. Verify no errors appear

### Step 2: Open SAP SuccessFactors

1. Navigate to your SAP SuccessFactors instance
2. Open the browser console (F12 or Right-click → Inspect → Console)
3. Keep console open to see logs

### Step 3: Open Joule

1. Click the Joule button in the SAP interface
2. Wait for Joule iframe to load
3. **Look for these console messages**:
   ```
   [Mario Quest] Found Joule iframe: https://...sapdas.cloud.sap...
   [Mario Quest] Iframe handler should be active via content_scripts
   [Joule Iframe] ℹ️ Initializing Joule iframe handler
   [Joule Iframe] ✅ Joule iframe handler initialized
   ```

### Step 4: Start a Quest

1. Click the extension icon
2. Click "Start Quest"
3. **Watch the console carefully**

### Expected Console Output (Success)

```
[Mario Quest] Sending type_text message to iframe
[Joule Iframe] ℹ️ Received message from parent
[Joule Iframe] ℹ️ Typing text: [your quest prompt]
[Joule Iframe] ℹ️ Document ready state: complete
[Joule Iframe] ℹ️ Waiting for textarea#ui5wc_10-inner.ui5-textarea-inner...
[Joule Iframe] ✅ Element textarea#ui5wc_10-inner.ui5-textarea-inner found after XXXms
[Joule Iframe] ✅ Found textarea: id="ui5wc_10-inner" class="ui5-textarea-inner"
[Joule Iframe] ℹ️ Found input with selector: textarea#ui5wc_10-inner
[Joule Iframe] ✅ Text typed successfully
[Mario Quest] ✅ Text typed successfully via postMessage
```

### What to Check in Joule Interface

1. **Text appears in textarea**: The prompt text should be visible in the Joule input field
2. **No cross-origin errors**: Console should NOT show any "Blocked a frame with origin" errors
3. **Message sends**: After typing, the message should be sent to Joule

### Step 5: Verify Message Sending

After text is typed, watch for:

```
[Mario Quest] Sending click_send message to iframe
[Joule Iframe] ℹ️ Sending message (trying Enter key first, then button click)
[Joule Iframe] ℹ️ Pressing Enter key on textarea to send
[Joule Iframe] ✅ Enter key pressed on textarea
[Mario Quest] ✅ Message sent successfully via enter_key
```

## Troubleshooting

### Problem: "Textarea not found"

If you see this error:
```
[Joule Iframe] ❌ TEXTAREA NOT FOUND. Analyzing iframe content:
[Joule Iframe] ❌ Found 0 textarea elements:
```

**Possible causes**:
1. Iframe handler script not injected properly
2. Joule interface changed or not fully loaded
3. URL pattern in manifest.json doesn't match

**Action**: Copy the console output showing:
- Current URL
- Total elements found
- All textarea elements (with id, class, placeholder)

### Problem: "Joule iframe not found"

If you see:
```
[Mario Quest] ⚠️ Joule iframe not found yet, but continuing
```

**Action**: 
1. Check that Joule is actually open (not just the button)
2. Look for iframe with src containing "sapdas.cloud.sap"
3. Run this in console: `document.querySelectorAll('iframe')`

### Problem: Cross-origin error still appears

If you still see:
```
Failed to read a named property 'document' from 'Window': Blocked a frame...
```

**This means**: The old code is still running. 

**Action**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache and reload extension
3. Close all SAP tabs and reopen

## Success Criteria

✅ **Extension loaded** without errors  
✅ **Iframe handler initializes** when Joule opens  
✅ **Textarea detected** using exact selector  
✅ **Text typed** into textarea successfully  
✅ **Message sent** via Enter key or button  
✅ **NO cross-origin errors** in console  

## Reporting Issues

If testing fails, provide:

1. **Full console output** (copy/paste entire console log)
2. **Screenshot** of Joule interface showing textarea
3. **Browser version** (chrome://version)
4. **SAP instance URL** (domain only, no sensitive info)
5. **Specific error message** that appeared

---

**Created**: December 7, 2025  
**Purpose**: Test cross-origin iframe communication fix  
**Status**: Ready for testing
