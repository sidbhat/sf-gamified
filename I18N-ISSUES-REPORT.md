# i18n Template Issues & Errors Report

## Executive Summary

**Status**: ⚠️ CRITICAL ISSUES FOUND  
**Date**: December 11, 2025  
**Total Issues**: 8 major categories of problems

This report documents all internationalization (i18n) issues discovered in the Joule Quest codebase, including missing translation keys, incorrect key references, and potential runtime errors.

---

## 🔴 CRITICAL ISSUES

### 1. **Missing Translation Key: `ui.icons.sales`**

**Location**: `src/ui/overlay.js:609`

```javascript
label: this.i18n.t('ui.tabs.sales'),
icon: this.i18n.t('ui.icons.sales'),  // ❌ KEY DOESN'T EXIST
```

**Problem**: The code tries to look up `ui.icons.sales` but this key doesn't exist in `en-US.json`. The translation file only has:
- `ui.icons.employee`
- `ui.icons.manager` 
- `ui.icons.agent`

**Impact**: Returns the literal string `"ui.icons.sales"` instead of an emoji, breaking the UI display.

**Fix Required**:
```json
// Add to en-US.json under ui.icons:
"sales": "📊"
```

---

### 2. **Quest i18nKey References Not Validated**

**Location**: `src/core/quest-runner.js:65-75`

```javascript
const i18nQuest = {
  name: this.overlay.i18n.t(`${quest.i18nKey}.name`),  // Potential missing keys
  description: this.overlay.i18n.t(`${quest.i18nKey}.description`),
  tagline: this.overlay.i18n.t(`${quest.i18nKey}.tagline`),
  victoryText: this.overlay.i18n.t(`${quest.i18nKey}.victoryText`),
  // ... etc
};
```

**Problem**: The code dynamically constructs translation keys from `quest.i18nKey` but doesn't validate if:
1. The quest has an `i18nKey` property
2. All required sub-keys exist in translations (`.name`, `.description`, etc.)

**Impact**: If a quest's i18nKey is missing or incomplete in translations, returns literal key strings like `"quests.employee-leave-balance.name"`.

**Example Missing Quest Keys**:
Looking at the code, every quest needs these 9 keys:
- `.name`
- `.description`
- `.tagline`
- `.victoryText`
- `.storyArc`
- `.storyChapter`
- `.storyIntro`
- `.storyOutro`
- `.nextQuestHint`

Need to validate all quests in `quests.json` have complete translations.

---

### 3. **Dynamic Placeholder Replacement Issues**

**Location**: `src/ui/overlay.js:1078`

```javascript
lockMessage = `<div class="quest-lock-info">${this.i18n.t('ui.messages.questLockedInfo', { count, s: plural })}</div>`;
```

**Translation String**:
```json
"questLockedInfo": "🔒 Complete {count} more quest{s} to unlock"
```

**Problem**: The code passes `s: plural` where `plural` is either `'s'` or `''` (empty string), creating awkward grammar:
- 1 quest: "Complete 1 more quest to unlock" ✅
- 2 quests: "Complete 2 more quests to unlock" ✅

But the replacement logic is fragile - it relies on inserting `{s}` which could break in other languages.

**Recommendation**: Use proper pluralization:
```json
"questLockedInfo": {
  "singular": "🔒 Complete {count} more quest to unlock",
  "plural": "🔒 Complete {count} more quests to unlock"
}
```

---

### 4. **Fallback Strings with `||` Operator**

**Location**: Multiple places in `overlay.js`

```javascript
✏️ ${this.i18n.t('ui.hints.canChangeInput') || 'You can change this input field'}
👆 ${this.i18n.t('ui.hints.canClickButton') || 'You can click on save or submit'}
```

**Problem**: These exist in `en-US.json`, so the `||` fallback never triggers. However:
1. If i18n fails to load, returns the key itself, not the fallback
2. Creates maintenance burden (strings in two places)
3. Other languages may not have these keys yet

**Recommendation**: Remove `||` fallbacks since i18n.t() already returns the key on failure:
```javascript
✏️ ${this.i18n.t('ui.hints.canChangeInput')}
```

---

### 5. **Inconsistent Error Key Format**

**Location**: `src/i18n/en-US.json` and `src/ui/popup.js`

```json
"unknownError": {
  "icon": "❌",
  "title": "Something Went Wrong",
  ...
},
"unknownerror": {  // ❌ DUPLICATE with lowercase
  "title": "Something Went Wrong",
  ...
}
```

**Problem**: Duplicate error definitions with different casing:
- `errors.unknownError` (camelCase) - has icon
- `errors.unknownerror` (lowercase) - missing icon field

**Impact**: Inconsistent error displays depending on which key is used.

**Fix Required**: Remove duplicate, standardize on camelCase:
```json
// REMOVE the "unknownerror" entry
```

---

### 6. **Missing Quest Name Translations in Overlay**

**Location**: `src/ui/overlay.js:1097`

```javascript
<div class="quest-name" style="opacity: ${isLocked ? '0.6' : '1'}">${this.i18n.t(`${quest.i18nKey}.name`)}</div>
```

**Problem**: Assumes all quests have their names translated under `quests.{quest-id}.name`. If a quest doesn't have this translation:
- Returns literal string `"quests.missing-quest.name"`
- Breaks quest selection UI

**Recommendation**: Add validation in quest-runner.js:
```javascript
if (!quest.i18nKey) {
  throw new Error(`Quest ${quest.id} missing i18nKey property`);
}
```

---

## ⚠️ MODERATE ISSUES

### 7. **Error Handling in popup.js Uses Complex Nested Keys**

**Location**: `src/ui/popup.js:74-85`

```javascript
const errorObj = i18n ? {
  icon: '🔄',
  title: i18n.t('errors.contentScriptNotLoaded.title'),
  message: errorMsg,
  causes: [
    i18n.t('errors.contentScriptNotLoaded.causes.0'),  // Array indexing
    i18n.t('errors.contentScriptNotLoaded.causes.1'),
    i18n.t('errors.contentScriptNotLoaded.causes.2')
  ],
  // ...
}
```

**Problem**: Uses array index notation (`causes.0`, `causes.1`) which:
1. Is fragile - adding/removing items breaks indexes
2. Doesn't match how arrays are stored in JSON (they're actual arrays)
3. Harder to maintain

**Current Translation Structure** (CORRECT):
```json
"causes": [
  "Extension was just installed or updated",
  "Page was already open before extension installed",
  "Page is still loading in the background"
]
```

**Code Issue**: The `i18n.t()` method doesn't support array indexing. It will return the entire array as a string or fail.

**Fix Required**: Update code to handle arrays properly:
```javascript
const errorData = i18n.t('errors.contentScriptNotLoaded');
const causes = errorData.causes || [];
```

---

### 8. **Step Hints May Be Missing Translations**

**Location**: `src/ui/overlay.js:1558-1559`

```javascript
${step.hint ? `<p class="hint">💡 ${this.i18n.t('ui.labels.hint')}: ${step.hint}</p>` : ''}
```

**Problem**: `step.hint` is taken directly from quest configuration (probably English), not translated. The label "Hint" is translated, but the actual hint content isn't.

**Impact**: Mixed-language UI - label in user's language, content in English.

**Recommendation**: Either:
1. Make hints use i18n keys: `${this.i18n.t(step.hintKey)}`
2. Or accept hints are English-only (document this)

---

## 📋 MISSING TRANSLATION KEYS SUMMARY

### Confirmed Missing:
1. ❌ `ui.icons.sales` - Used but doesn't exist
2. ❌ Potential duplicate: `errors.unknownerror` (should be removed)

### Needs Validation:
1. ⚠️ All quest i18nKey references in `quests.json`
2. ⚠️ All journey keys: `journeys.*.name` and `journeys.*.description`
3. ⚠️ Error array access patterns in popup.js

---

## 🔧 RECOMMENDED FIXES

### Priority 1 (CRITICAL - Breaks UI)

1. **Add missing `ui.icons.sales` key**:
   ```json
   // In all translation files (en-US.json, de-DE.json, etc.)
   "ui": {
     "icons": {
       "sales": "📊"
     }
   }
   ```

2. **Remove duplicate `errors.unknownerror`**:
   ```json
   // Delete this block from all translation files
   ```

3. **Fix popup.js array access**:
   ```javascript
   // Change from:
   i18n.t('errors.contentScriptNotLoaded.causes.0')
   
   // To:
   const errorData = i18n.t('errors.contentScriptNotLoaded');
   errorData.causes[0]
   ```

### Priority 2 (MODERATE - May break in edge cases)

4. **Add quest validation**:
   ```javascript
   // In quest-runner.js
   if (!quest.i18nKey) {
     throw new Error(`Quest ${quest.id} missing i18nKey property`);
   }
   
   // Validate all required keys exist
   const requiredKeys = ['name', 'description', 'tagline', 'victoryText', 
                         'storyArc', 'storyChapter', 'storyIntro', 
                         'storyOutro', 'nextQuestHint'];
   requiredKeys.forEach(key => {
     const fullKey = `${quest.i18nKey}.${key}`;
     const value = this.overlay.i18n.t(fullKey);
     if (value === fullKey) {
       console.warn(`Missing translation: ${fullKey}`);
     }
   });
   ```

5. **Remove `||` fallback operators** since i18n.t() already returns key on failure

6. **Improve pluralization** for `questLockedInfo` message

### Priority 3 (ENHANCEMENT - Best practices)

7. **Add i18n validation script** to check all keys are present in all languages

8. **Document step hints** are English-only (or make them translatable)

9. **Add TypeScript/JSDoc types** for translation keys to catch typos at dev time

---

## 🧪 TESTING RECOMMENDATIONS

1. **Test with non-English language** to catch missing translations:
   ```javascript
   // Set language to German and run through all quests
   await i18n.changeLanguage('de-DE');
   ```

2. **Test with missing translation file** to verify fallback behavior:
   ```javascript
   // Temporarily rename en-US.json and test
   ```

3. **Test all error paths** in popup.js to verify error message display

4. **Test quest selection screen** with various quest states (locked/unlocked/completed)

5. **Test all S/4HANA tabs** to verify icons display correctly

---

## 📊 STATISTICS

- **Total i18n.t() calls**: 62 found in codebase
- **Unique translation keys used**: ~50+
- **Missing keys found**: 1 confirmed (`ui.icons.sales`)
- **Duplicate keys**: 1 (`errors.unknownerror`)
- **Potential issues**: 6 patterns identified
- **Languages supported**: 11 (en-US, de-DE, fr-FR, es-ES, pt-BR, ja-JP, ko-KR, zh-CN, vi-VN, el-GR, pl-PL)

---

## 🎯 ACTION ITEMS

### For Immediate Fix:
- [ ] Add `ui.icons.sales` to all translation files
- [ ] Remove `errors.unknownerror` duplicate
- [ ] Fix popup.js error array access pattern
- [ ] Test S/4HANA sales tab display

### For Next Sprint:
- [ ] Add quest i18nKey validation
- [ ] Create i18n validation CI test
- [ ] Improve pluralization handling
- [ ] Document translation architecture
- [ ] Add missing translations to other language files

### For Future:
- [ ] Consider using i18next or similar library for better pluralization
- [ ] Add TypeScript for type-safe translation keys
- [ ] Create translation management workflow
- [ ] Add automated translation testing

---

## 📝 NOTES

- The i18n system is generally well-structured with proper fallback to English
- Most issues are edge cases that may not be hit in normal usage
- The critical issue (`ui.icons.sales`) will definitely break S/4HANA UI
- Other issues are defensive improvements to prevent future bugs

---

**Report Generated**: December 11, 2025  
**Last Updated**: December 11, 2025  
**Status**: Ready for review and fixes
