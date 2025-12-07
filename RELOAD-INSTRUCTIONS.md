# Extension Reload Instructions

## Error: "Could not establish connection. Receiving end does not exist."

This error occurs when the content scripts are not properly injected into the page. Follow these steps:

## Step 1: Reload the Extension

1. Go to `chrome://extensions/` in Chrome
2. Find "SF Joule Mario Quest"
3. Click the **reload icon** (🔄) button
4. You should see "Last updated: Just now"

## Step 2: Reload the SAP SuccessFactors Page

**IMPORTANT**: After reloading the extension, you MUST reload the SAP page!

1. Go to your SAP SuccessFactors tab
2. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) for a hard reload
3. Wait for the page to fully load

## Step 3: Verify Extension is Loaded

Open browser console (F12) and look for these messages:

```
[Mario Quest] Content script initialized
[Mario Quest] Extension loaded successfully
```

If you don't see these messages, the extension is NOT loaded on the page.

## Step 4: Check Console for Errors

In the console, look for any red error messages that might indicate why the extension isn't loading:

- **"Manifest version X is not supported"** - Check manifest.json
- **"Failed to load resource"** - Check file paths in manifest.json
- **"Script execution blocked"** - Check CSP settings
- **No messages at all** - Extension not injected, check `matches` pattern in manifest.json

## Step 5: Verify URL Match

The content script only loads on pages matching:
```
https://*.hr.cloud.sap/*
```

Check that your SAP SuccessFactors URL matches this pattern. If your URL is different, we need to update the manifest.json.

## Step 6: Check Extension Popup

1. Click the extension icon in Chrome toolbar
2. The popup should open showing "Demo Mode" and "Real Mode" buttons
3. If popup doesn't open or shows errors, check console in popup (right-click extension icon > Inspect popup)

## Common Issues and Fixes

### Issue: Extension icon is grayed out
**Fix**: The page URL doesn't match the content_scripts pattern in manifest.json

### Issue: Popup opens but buttons don't work
**Fix**: Content script not loaded on page - follow Steps 1-2 above

### Issue: Console shows "port disconnected" errors
**Fix**: Extension was reloaded while page was open - must reload both extension AND page

### Issue: No console messages at all
**Fix**: Content script blocked or not injected - check manifest.json matches pattern

## Quick Verification Checklist

- [ ] Extension reloaded in chrome://extensions/
- [ ] SAP page hard-reloaded (Ctrl+Shift+R)
- [ ] Console shows "[Mario Quest]" messages
- [ ] Extension popup opens and shows buttons
- [ ] SAP SuccessFactors URL matches `*.hr.cloud.sap` pattern

## Still Not Working?

If after following all steps the extension still doesn't work:

1. **Share your SAP SuccessFactors URL** (redact any sensitive parts, but keep the domain structure)
2. **Share console output** (F12 > Console tab, copy all messages)
3. **Share any error messages** from chrome://extensions/ page (click "Errors" button)

This will help diagnose the exact issue.
