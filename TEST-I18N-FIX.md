# i18n Translation Fix Test Plan

## Issue Summary
The extension was displaying translation KEYS (like "ui.headers.questSelection", "quests.employee-leave-balance.name") instead of the actual translated text in English and German.

## Root Cause
The overlay was capturing a reference to `window.JouleQuestI18n` in its constructor before the i18n system was initialized and translations were loaded. This caused the `t()` method to return keys instead of translated text.

## Solution Implemented
Changed `src/ui/overlay.js` to use a lazy getter for the i18n instance:

```javascript
// BEFORE (in constructor):
this.i18n = window.JouleQuestI18n;

// AFTER (lazy getter):
get i18n() {
  const i18n = window.JouleQuestI18n;
  if (i18n && (!i18n.translations || Object.keys(i18n.translations).length === 0)) {
    console.warn('[Overlay] i18n translations not loaded yet, returning fallback');
  }
  return i18n;
}
```

## Testing Steps

### 1. Load the Extension
- Open Chrome and navigate to `chrome://extensions/`
- Enable Developer Mode
- Click "Load unpacked"
- Select the `/Users/I806232/Downloads/gamified-sf` directory

### 2. Navigate to SAP SuccessFactors
- Go to a SuccessFactors instance
- Wait for page to fully load

### 3. Test Quest Selection Screen
- Click the extension icon to open quest selection
- **Expected**: Headers, buttons, and quest names show in English (not keys like "ui.headers.questSelection")
- **Verify**:
  - Header shows "Quest Selection" (not "ui.headers.questSelection")
  - Stats show "Points" and "Quests" (not "ui.labels.points", "ui.labels.quests")
  - Quest names show proper names (not "quests.employee-leave-balance.name")
  - Buttons show "Start", "Reset", etc. (not "ui.buttons.start")

### 4. Test Quest Execution
- Start a quest
- **Expected**: All step messages show in proper English
- **Verify**:
  - Step counter shows "Step X of Y" (not "ui.labels.step")
  - Instructions show properly
  - Success/error messages show in English
  - Completion screen shows "Quest Complete!" (not "ui.headers.questComplete")

### 5. Test German Translations (if SAP language is set to German)
- If SuccessFactors is in German, verify German translations load
- **Expected**: All text appears in German
- **Verify**: Same elements as English test, but in German

### 6. Check Browser Console
- Open DevTools Console (F12)
- Look for warnings/errors related to i18n
- **Expected**: No errors about missing translation keys
- **Expected**: Should see `[I18n] Initialized with language: en-US` (or de-DE)

## Success Criteria
- ✅ No translation keys visible in UI
- ✅ All text displays in proper English
- ✅ German translations work when SAP language is German
- ✅ No console errors about missing translations
- ✅ Lazy getter ensures translations are available when needed

## Rollback Plan
If the fix doesn't work, the previous approach would be to ensure i18n.init() is called BEFORE overlay.init() in content.js, but that approach was already tried. The lazy getter is the correct architectural solution.
