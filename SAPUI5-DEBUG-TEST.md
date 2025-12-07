# SAPUI5 Debug Test Instructions

## What We Just Added

The iframe handler now has comprehensive debug logging that will detect:

1. **SAPUI5 Elements**: `.sapMInputBaseInner`, `.sapMInputBase`, `.sapMTextArea`
2. **ARIA Roles**: `[role="textbox"]`, `[role="log"]`, `[aria-live="polite"]`
3. **Standard Inputs**: `textarea`, `input[type="text"]`, `input`
4. **Shadow DOM**: Checks for Shadow DOM and textareas inside it
5. **First 500 chars of body HTML**: To see the actual structure

## Testing Steps

### 1. Reload Extension
1. Go to `chrome://extensions`
2. Find "SF Joule Mario Quest"
3. Click **Reload** button
4. Verify no errors

### 2. Open Joule and Wait
1. Navigate to SAP SuccessFactors
2. **Open browser console** (F12)
3. Click Joule button to open chat
4. **Wait 3-5 seconds** for the debug analysis to run

### 3. Look for These Console Messages

You should see:

```
[Joule Iframe] ℹ️ Initializing Joule iframe handler
[Joule Iframe] ℹ️ Iframe URL: https://...sapdas.cloud.sap...
[Joule Iframe] ✅ Joule iframe handler initialized
[Joule Iframe] ℹ️ ═══ IFRAME CONTENT ANALYSIS ═══
[Joule Iframe] ℹ️ Total elements: XXX
[Joule Iframe] ℹ️ Body HTML (first 500 chars): ...
[Joule Iframe] ℹ️ 
--- SAPUI5 Elements ---
[Joule Iframe] ℹ️ sapMInputBaseInner: X
[Joule Iframe] ℹ️ sapMInputBase: X
[Joule Iframe] ℹ️ sapMTextArea: X
[Joule Iframe] ℹ️ 
--- ARIA Roles ---
[Joule Iframe] ℹ️ [role="textbox"]: X
[Joule Iframe] ℹ️ [role="log"]: X
[Joule Iframe] ℹ️ [aria-live="polite"]: X
[Joule Iframe] ℹ️ 
--- Standard Inputs ---
[Joule Iframe] ℹ️ textarea: X
[Joule Iframe] ℹ️ input[type="text"]: X
[Joule Iframe] ℹ️ input: X
```

### 4. Copy Console Output

**IMPORTANT**: Copy the ENTIRE console output between the `═══` markers and send it to me:

```
[Joule Iframe] ℹ️ ═══ IFRAME CONTENT ANALYSIS ═══
... everything ...
[Joule Iframe] ℹ️ ═══ END ANALYSIS ═══
```

## What I'm Looking For

The console output will tell us:

✅ **If SAPUI5 elements exist** → Number next to `sapMInputBaseInner`  
✅ **If ARIA roles exist** → Number next to `[role="textbox"]`  
✅ **Exact element details** → id, class, placeholder of found inputs  
✅ **If Shadow DOM is involved** → Will log "Found Shadow DOM in..."  
✅ **Actual HTML structure** → First 500 chars shows what's really there  

## Expected Outcomes

### Scenario 1: SAPUI5 Input Found
```
[Joule Iframe] ✅ Found 1 SAPUI5 input(s):
[Joule Iframe] ✅   [0] tag="INPUT" id="xxx" class="sapMInputBaseInner" role="textbox"
```
→ **Action**: I'll update code to use `.sapMInputBaseInner` selector

### Scenario 2: Standard Textarea Found
```
[Joule Iframe] ✅ Found 1 textarea(s):
[Joule Iframe] ✅   [0] id="ui5wc_10-inner" class="ui5-textarea-inner" placeholder="Message Joule..."
```
→ **Action**: I'll update code to use exact ID/class

### Scenario 3: Nothing Found
```
[Joule Iframe] ❌ NO INPUT FIELDS FOUND
[Joule Iframe] ❌ First 20 elements in body:
[Joule Iframe] ❌   [0] DIV.someClass#someId
```
→ **Action**: I'll analyze the element structure to find the actual input

### Scenario 4: Shadow DOM
```
[Joule Iframe] ❌ Found Shadow DOM in: UI5-TEXTAREA.someclass#someid
[Joule Iframe] ❌   ⚡ FOUND TEXTAREA IN SHADOW DOM!
```
→ **Action**: I'll add Shadow DOM piercing code

## Next Steps

Once you send me the console output, I will:

1. **Identify the correct selector** (SAPUI5, ARIA, or standard)
2. **Update the `typeText()` method** with the working selector
3. **Remove fallback attempts** that don't work
4. **Test the updated code**

---

**Ready to test?** Reload the extension, open Joule, wait 3-5 seconds, then copy/paste the console output!
