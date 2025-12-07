# Textarea Selector Update - Based on Screenshots

## Date: December 7, 2025

## Problem Identified
The iframe handler couldn't find the textarea because it was looking for generic selectors, but Joule uses UI5 Web Components with specific attributes.

## Actual Textarea Structure (from screenshot)

```html
<textarea 
  id="ui5wc_10-inner" 
  class="ui5-textarea-inner" 
  part="textarea"
  placeholder="Message Joule..." 
  aria-label="Message Joule..." 
  aria-required="false" 
  maxlength="2000" 
  data-sap-focus-ref="true" 
  rows="1">
</textarea>
```

## Updated Selectors (Priority Order)

1. ✅ `textarea.ui5-textarea-inner` - Class selector (stable)
2. ✅ `textarea[placeholder*="Message Joule"]` - Placeholder match
3. ✅ `textarea[aria-label*="Message Joule"]` - Aria-label match
4. ✅ `textarea[data-sap-focus-ref="true"]` - SAP attribute
5. ✅ `textarea#ui5wc_10-inner` - ID (might be dynamic)
6. ✅ `textarea` - Generic fallback

## Why Previous Selectors Failed

**Old selectors:**
```javascript
['textarea', 'textarea[placeholder*="Message"]', '[role="textbox"]']
```

**Issues:**
- Generic `textarea` should work BUT the script might not be injecting
- The `[role="textbox"]` doesn't exist - UI5 uses standard textarea
- MAIN ISSUE: Script probably not loading in iframe at all

## Key Findings from Screenshots

### Screenshot 1: Response Container
- Container: `<div class="mainAppLive__message-container">`
- Messages: `<div id="UserBotGroup1">`, `<div id="UserBotGroup2">`, etc.
- Bot responses: `<div id="UserBotGroup4" aria-live="polite">`
- Selector for response: `.mainAppLive__message-container` or `[aria-live="polite"]`

### Screenshot 2: Input Textarea
- Element: `<textarea class="ui5-textarea-inner">`
- ID: `ui5wc_10-inner` (might be dynamic - use class instead)
- Placeholder: "Message Joule..."
- Selector: `textarea.ui5-textarea-inner` (BEST - stable class name)

## Next Steps

1. ✅ Updated selectors in iframe handler
2. **User must reload extension** (chrome://extensions/)
3. **User must refresh SF page** (F5)
4. Test Quest 1 again
5. Check if textarea is now found

## Testing

After reloading:
1. Open Joule manually
2. Open DevTools
3. Switch to iframe context (dropdown: select sapdas.cloud.sap)
4. Run: `document.querySelector('textarea.ui5-textarea-inner')`
5. Should return the textarea element

## Expected Console Output (After Fix)

**Iframe Console:**
```
[Joule Iframe] ✅ Joule iframe handler initialized
[Joule Iframe] Received message from parent: type_text
[Joule Iframe] ℹ️ Document ready state: complete
[Joule Iframe] ℹ️ Body innerHTML length: XXXXX
[Joule Iframe] ℹ️ Found input with selector: textarea.ui5-textarea-inner
[Joule Iframe] ✅ Text typed successfully
```

## Files Modified

- `src/joule-iframe-handler.js` - Updated textarea selectors based on actual DOM

---

**Status**: Selectors updated, ready for testing
**Action Required**: Reload extension + Refresh page + Test
