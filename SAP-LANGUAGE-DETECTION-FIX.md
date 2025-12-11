# SAP UI5 Language Detection Fix

## Problem Solved
Extension was not detecting SAP SuccessFactors language setting and was defaulting to browser language instead. When SAP was set to German (de_DE), the extension UI remained in English.

## Root Cause
1. SAP SuccessFactors stores language in `document.documentElement.lang` attribute
2. Previous detection only checked SAP UI5 Core API methods
3. Missing detection strategy for HTML document language attribute

## Solution Implemented

### 1. Multiple Detection Strategies
Enhanced `detectSAPLanguageFromFramework()` with 7 different strategies:

```javascript
// Strategy 1: Document element lang attribute (SAP SuccessFactors) ✅ WORKING
document.documentElement.lang

// Strategy 2: SAP UI5 Core Configuration API
window.sap.ui.getCore().getConfiguration().getLanguage()

// Strategy 3: Direct Core configuration object
window.sap.ui.getCore().oConfiguration.language

// Strategy 4: Global SAP config object
window['sap-ui-config'].language

// Strategy 5: Script tag data attributes
<script data-sap-ui-language="de_DE">

// Strategy 6: Bootstrap script src parameters
<script src="...sap-ui-core.js?sap-language=de_DE">

// Strategy 7: Meta tags
<meta name="sap-ui-language" content="de_DE">
```

**Key Discovery:** SAP SuccessFactors sets the language on the HTML document element itself (`<html lang="de-DE">`), which is now checked first for immediate detection.

### 2. Retry Logic for Initialization
Added `detectLanguageWithRetry()` method that:
- Attempts immediate detection
- Waits 500ms and retries if only browser language found
- Waits 1000ms more and retries again
- Falls back to browser language after 3 attempts

This handles cases where SAP UI5 Core loads after our content script.

### 3. Language Code Normalization
Fixed handling of SAP's underscore format:
- `de_DE` → `de-DE`
- `EN` → `en-US`
- Properly normalizes both formats

## Detection Priority Order

1. **SAP UI5 URL parameter** (highest priority)
   - `?sap-language=de_DE`
   - `?sap-ui-language=de`

2. **SAP localStorage/sessionStorage**
   - `localStorage.getItem('sap-language')`
   - `localStorage.getItem('sap-ui-language')`

3. **SAP UI5 Framework Objects**
   - Multiple strategies to find language in SAP Core

4. **Browser Language** (lowest priority, fallback only)
   - `navigator.language`

## Testing Instructions

### Test 1: Verify German Detection in SAP
1. Open SAP SuccessFactors in Chrome
2. Switch SAP language to German (Deutsch)
3. Reload the page
4. Open Chrome DevTools Console
5. Look for these log messages:

**Expected Console Output:**
```
[I18n] Only browser language detected, waiting for SAP initialization...
[I18n] Checking SAP framework for language...
[I18n] Found language from UI5 Core: de_DE
[I18n] Detected from SAP framework: de-DE
[I18n] SAP language detected on retry: de-DE
[I18n] Detected language: de-DE
[I18n] Translations loaded for: de-DE
```

6. Open Joule Quest extension popup
7. **Verify UI is in German:**
   - "Quest Auswahl" (not "Quest Selection")
   - "Schwierigkeit: Leicht" (not "Difficulty: Easy")
   - "Quest starten" (not "Start Quest")

### Test 2: Verify English Detection
1. Switch SAP back to English
2. Reload the page
3. Check console logs show: `[I18n] Detected language: en-US`
4. Verify extension UI is in English

### Test 3: Verify URL Parameter Override
1. Add `?sap-language=de` to SAP URL
2. Reload page
3. Console should show: `[I18n] Detected from URL: de-DE`
4. Extension UI should be in German

### Test 4: Verify Browser Fallback
1. Open SAP in a non-German/English browser (e.g., French)
2. Keep SAP in English
3. Extension should use SAP language (English), not browser language (French)

## Debug Console Commands

Run these in Chrome DevTools Console to check SAP language status:

```javascript
// Check if SAP UI5 is loaded
console.log('SAP loaded:', !!window.sap);
console.log('SAP UI loaded:', !!window.sap?.ui);
console.log('SAP Core loaded:', !!window.sap?.ui?.getCore);

// Check SAP language
if (window.sap?.ui?.getCore) {
  const core = window.sap.ui.getCore();
  console.log('SAP Core initialized:', !!core);
  console.log('SAP Language:', core?.getConfiguration?.()?.getLanguage?.());
}

// Check storage
console.log('localStorage sap-language:', localStorage.getItem('sap-language'));
console.log('sessionStorage sap-language:', sessionStorage.getItem('sap-language'));

// Check extension's detected language
console.log('Extension language:', window.JouleQuestI18n?.getCurrentLanguage());
```

## Files Modified

1. **src/i18n/i18n-manager.js**
   - Added `detectLanguageWithRetry()` method
   - Enhanced `detectSAPLanguageFromFramework()` with 6 strategies
   - Added retry logic with 500ms and 1000ms delays
   - Fixed underscore format handling in `normalizeSAPLanguageCode()`

## Expected Behavior

✅ **When SAP is in German:**
- Extension UI displays in German
- Console shows: `[I18n] Found language from document.documentElement.lang: de-DE`
- Console shows: `[I18n] SAP language detected immediately: de-DE`

✅ **When SAP is in English:**
- Extension UI displays in English
- Console shows: `[I18n] Found language from document.documentElement.lang: en-US`

✅ **SAP language ALWAYS takes priority over browser language**

## ✅ VERIFIED WORKING

User confirmation: "Its working now"

Console output showing successful detection:
```
[I18n] Found language from document.documentElement.lang: de-DE
[I18n] SAP language detected immediately: de-DE
[I18n] Detected language: de-DE
[I18n] Initialized with language: de-DE
```

## Troubleshooting

### Issue: Extension still shows English when SAP is German

**Check Console Logs:**
```
[I18n] Checking SAP framework for language...
[I18n] No SAP framework language found
```

**Solutions:**
1. Wait 2-3 seconds after page load, then reload extension
2. Check if SAP UI5 Core is initialized: `window.sap?.ui?.getCore()`
3. Check browser console for SAP initialization errors
4. Verify SAP page is fully loaded (not still loading)

### Issue: Console shows "language: de_DE" but extension uses en-US

This was the original bug - now fixed with:
- Multiple detection strategies
- Retry logic for late SAP initialization
- Proper underscore format handling

## Verification Checklist

- [ ] Extension detects German when SAP is in German
- [ ] Extension detects English when SAP is in English  
- [ ] Console logs show detection strategy used
- [ ] UI translations match detected language
- [ ] SAP language overrides browser language
- [ ] URL parameters override other detection methods
- [ ] Retry logic works (see 500ms/1000ms delay logs)

## Success Criteria

The fix is successful when:
1. Opening SAP in German → Extension UI is in German
2. Opening SAP in English → Extension UI is in English
3. Console shows SAP language detected (not browser language)
4. User's explicit requirement met: **"UI5 Language takes top preference over browser language"** ✅
