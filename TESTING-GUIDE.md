# Testing Guide - Iframe Implementation

## ⚠️ IMPORTANT: Extension Reload Required

The error "Could not establish connection. Receiving end does not exist" means the extension must be reloaded after code changes.

## Step 1: Reload Extension

1. Open Chrome and go to `chrome://extensions/`
2. Find "SF Joule Mario Quest" extension
3. Click the **reload icon** (🔄) to reload the extension
4. Verify both content scripts are loaded:
   - Main content script: `src/content.js`
   - Iframe content script: `src/joule-iframe-handler.js`

## Step 2: Navigate to SAP SF Page

1. Open a new tab
2. Go to: `https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182&_s.crb=g%252bDy8glprkWTcVPuxpEFAc1QjVllkFhieC%252fY1C4n1nc%253d`
3. Wait for page to fully load
4. Open Chrome DevTools (F12)

## Step 3: Verify Extension is Loaded

**Check Main Page Console:**
```
[Mario Quest] Logger initialized
[Mario Quest] Initializing JouleHandler with iframe message passing
```

**Check if Joule button exists:**
- Look for "Joule" button in the top navigation bar

## Step 4: Test Manual Joule Opening

**Before testing the extension:**
1. Click the Joule button manually
2. Verify Joule panel opens
3. **Check for Iframe** - Open DevTools Elements tab:
   - Search for `<iframe` 
   - Look for iframe with URL containing `sapdas.cloud.sap`
   - This confirms Joule is using iframe architecture

**Check Iframe Console:**
1. In DevTools, click on the dropdown that says "top"
2. Select the iframe with `sapdas.cloud.sap` in its name
3. You should see:
   ```
   [Joule Iframe] ℹ️ Initializing Joule iframe handler
   [Joule Iframe] ✅ Joule iframe handler initialized
   ```

## Step 5: Test Extension Demo Mode

1. **Close Joule** (if still open)
2. Click the extension icon to open popup
3. Click **"Demo Mode"** section
4. Click **"Quest 1: View Cost Center"**

## Step 6: Expected Behavior

### What Should Happen:
1. ✅ Joule button is clicked automatically
2. ✅ Joule panel opens
3. ✅ Iframe loads
4. ✅ Text "show my cost center" appears in Joule input
5. ✅ Send button is clicked
6. ✅ Response appears with cost center info
7. ✅ Confetti animation plays
8. ✅ Points awarded (100)
9. ✅ Extension popup reopens showing 100 points

### Console Logs to Watch For:

**Main Page Console:**
```javascript
[Mario Quest] Opening Joule chat
[Mario Quest] Joule is not open, searching for Joule button
[Mario Quest] Found Joule button, clicking to open
[Mario Quest] Waiting for Joule iframe to load...
[Mario Quest] Found Joule iframe: https://...sapdas.cloud.sap/...
[Mario Quest] Sending prompt to Joule via iframe
[Mario Quest] Sending message to iframe: type_text
[Mario Quest] Received message from iframe: text_typed
[Mario Quest] Text typed successfully in iframe
[Mario Quest] Sending message to iframe: click_send
[Mario Quest] Received message from iframe: send_clicked
[Mario Quest] Send button clicked successfully in iframe
[Mario Quest] Waiting for Joule response via iframe
[Mario Quest] Received message from iframe: response_detected
[Mario Quest] Response received from Joule
```

**Iframe Console (select iframe in DevTools dropdown):**
```javascript
[Joule Iframe] ℹ️ Initializing Joule iframe handler
[Joule Iframe] ✅ Joule iframe handler initialized
[Joule Iframe] Received message from parent: type_text
[Joule Iframe] ℹ️ Typing text: show my cost center
[Joule Iframe] ✅ Text typed successfully
[Joule Iframe] Received message from parent: click_send
[Joule Iframe] ℹ️ Clicking send button
[Joule Iframe] ✅ Found send button, clicking
[Joule Iframe] Received message from parent: wait_for_response
[Joule Iframe] ℹ️ Waiting for response with keywords: cost,center
[Joule Iframe] ✅ Found keyword: cost
```

## Step 7: Troubleshooting

### Issue: "Could not establish connection"
**Solution:** Reload extension in `chrome://extensions/`

### Issue: No console logs at all
**Cause:** Extension not loaded or manifest error
**Solution:**
1. Check `chrome://extensions/` for errors
2. Verify manifest.json is valid
3. Click "Errors" button if shown

### Issue: "Joule button not found"
**Cause:** Page not fully loaded or button selector changed
**Solution:**
1. Wait longer for page to load
2. Manually verify Joule button exists
3. Check button's actual aria-label in Elements tab

### Issue: "Joule iframe not found"
**Cause:** Joule didn't open or iframe takes time to load
**Solution:**
1. Increase wait time after clicking button (currently 3s)
2. Manually click Joule to verify it works
3. Check if iframe actually appears in DOM

### Issue: "Input field not found in iframe"
**Cause:** Iframe not fully loaded or different structure
**Solution:**
1. Switch to iframe context in console
2. Run: `document.querySelector('textarea')`
3. Verify textarea exists
4. Check if placeholder text is "Message Joule..."

### Issue: "Send button not found"
**Cause:** Button selector doesn't match or not enabled
**Solution:**
1. Switch to iframe context
2. Run: `document.querySelectorAll('button')`
3. Find button with "Send" text
4. Verify it's enabled (not disabled)

### Issue: "Response not detected"
**Cause:** Keywords don't match actual response
**Solution:**
1. Switch to iframe context
2. After sending message, run: `document.body.innerText`
3. Check if response contains "cost" or "center"
4. Update keywords in `src/config/quests.json` if needed

## Step 8: Manual Testing (If Automated Fails)

**Test Message Passing Manually:**

1. Open main page console
2. Click Joule to open it
3. Wait for iframe to load
4. Run this test:

```javascript
// Find iframe
const iframe = Array.from(document.querySelectorAll('iframe'))
  .find(f => f.src.includes('sapdas.cloud.sap'));

if (iframe) {
  console.log('✅ Found Joule iframe');
  
  // Send test message
  iframe.contentWindow.postMessage({
    source: 'mario-quest-main',
    type: 'check_if_open',
    requestId: 1,
    data: {}
  }, '*');
  
  // Listen for response
  window.addEventListener('message', (event) => {
    if (event.data.source === 'mario-quest-iframe') {
      console.log('✅ Received response from iframe:', event.data);
    }
  });
} else {
  console.log('❌ Joule iframe not found');
}
```

Expected result: Should see message confirming Joule is open

## Step 9: Success Criteria Checklist

- [ ] Extension reloaded without errors
- [ ] Main page console shows initialization logs
- [ ] Joule button found and clickable
- [ ] Joule iframe loads when button clicked
- [ ] Iframe console shows handler initialized
- [ ] Message passing works (test or demo mode)
- [ ] Text appears in Joule input field
- [ ] Send button is clicked
- [ ] Response is detected with keywords
- [ ] Confetti animation plays
- [ ] Points are awarded and saved
- [ ] Extension popup shows updated score

## Summary of Changes Made

### New Files:
1. **src/joule-iframe-handler.js** - Runs inside iframe, handles Joule interactions
2. **IFRAME-IMPLEMENTATION-COMPLETE.md** - Technical documentation
3. **IFRAME-SELECTORS-FOUND.md** - Selector discovery details
4. **TESTING-GUIDE.md** - This file

### Modified Files:
1. **manifest.json** - Added iframe domain and content script
2. **src/core/joule-handler.js** - Complete rewrite for message passing

### Key Architecture Change:
- **Before:** Direct Shadow DOM access (failed)
- **After:** Message passing between main page and iframe (correct approach)

---

**Next Step:** Reload the extension and follow steps 1-9 above to test!
