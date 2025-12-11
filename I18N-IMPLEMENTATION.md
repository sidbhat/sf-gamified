# Multi-Language Support Implementation

## Overview

Joule Quest now supports **11 languages** with automatic language detection from SAP UI5 settings and browser preferences. The extension seamlessly adapts to the user's language without any manual configuration.

## Supported Languages

1. **English (US)** - `en-US` (default/fallback)
2. **German (Germany)** - `de-DE`
3. **French (France)** - `fr-FR`
4. **Spanish (Spain)** - `es-ES`
5. **Portuguese (Brazil)** - `pt-BR`
6. **Japanese** - `ja-JP`
7. **Korean** - `ko-KR`
8. **Chinese (Simplified)** - `zh-CN`
9. **Vietnamese** - `vi-VN`
10. **Greek** - `el-GR`
11. **Polish** - `pl-PL`

These languages align with the 11 officially supported languages for SAP Joule.

## Architecture

### Core Components

#### 1. **I18n Manager** (`src/i18n/i18n-manager.js`)
- Central internationalization system
- Handles language detection with priority chain
- Loads and manages translations
- Provides `t(key, replacements)` method for text translation

#### 2. **Translation Files** (`src/i18n/*.json`)
- One JSON file per language
- Structured with nested keys using dot notation
- Contains all user-facing text: UI labels, messages, errors, journey names

#### 3. **Integration Points**
- **content.js**: Initializes i18n before other components
- **overlay.js**: All UI strings translated
- **popup.js**: Error messages and labels translated
- **error-messages.js**: Dynamic error translation support

## Language Detection Priority

The system detects user language in this order:

1. **Saved Preference** (Chrome storage)
2. **SAP UI5 URL Parameter** (`sap-language`, `sap-ui-language`)
3. **SAP UI5 Storage** (localStorage/sessionStorage)
4. **SAP UI5 Framework** (`sap.ui.getCore().getConfiguration().getLanguage()`)
5. **Browser Language** (navigator.language)
6. **English Fallback** (if none detected)

### SAP Language Code Mapping

SAP uses short codes that are automatically normalized:

```javascript
'EN' → 'en-US'
'DE' → 'de-DE'
'FR' → 'fr-FR'
'ES' → 'es-ES'
'PT' → 'pt-BR'
'JA' → 'ja-JP'
'KO' → 'ko-KR'
'ZH' → 'zh-CN'
'VI' → 'vi-VN'
'EL' → 'el-GR'
'PL' → 'pl-PL'
```

## Translation Structure

### JSON File Format

```json
{
  "ui": {
    "buttons": { "start": "Start Quest", "cancel": "Cancel", ... },
    "headers": { "questSelection": "Joule Quest", ... },
    "labels": { "points": "POINTS", "step": "Step {current}/{total}", ... },
    "messages": { "resetConfirm": "This will...", ... },
    "tabs": { "employee": "Employee", "manager": "Manager", ... },
    "icons": { "employee": "👤", "manager": "👔", ... }
  },
  "journeys": {
    "employee": { "name": "...", "description": "..." },
    "manager": { "name": "...", "description": "..." },
    "agent": { "name": "...", "description": "..." }
  },
  "errors": {
    "contentscriptnotloaded": {
      "icon": "🔄",
      "title": "Extension Setup Needed",
      "message": "...",
      "causes": ["...", "...", "..."],
      "solutions": ["...", "...", "..."]
    }
  }
}
```

### Using Translations

#### Basic Translation
```javascript
const i18n = window.JouleQuestI18n;
const text = i18n.t('ui.buttons.start'); // "Start Quest"
```

#### With Placeholders
```javascript
const stepLabel = i18n.t('ui.labels.step', { current: 1, total: 5 });
// "Step 1/5"
```

#### Nested Keys
```javascript
const journeyName = i18n.t('journeys.employee.name');
// "Your First Week"
```

## Implementation Details

### 1. Initialization Flow

```
content.js loads
  ↓
i18n-manager.js initializes
  ↓
Detect language (SAP UI5 → browser → fallback)
  ↓
Load appropriate JSON file
  ↓
Make translations available via window.JouleQuestI18n
  ↓
Other components use i18n.t() for all text
```

### 2. Files Modified

| File | Changes |
|------|---------|
| `manifest.json` | Added i18n files to web_accessible_resources |
| `src/content.js` | Initialize i18n before loading other components |
| `src/ui/overlay.js` | All UI strings use `i18n.t()` |
| `src/ui/popup.js` | Error messages and labels translated |
| `src/ui/popup.html` | Load i18n-manager.js script |
| `src/utils/error-messages.js` | Dynamic error translation support |

### 3. Translation Coverage

**Overlay UI** (overlay.js):
- ✅ 15+ button labels
- ✅ 10+ header texts  
- ✅ 8+ UI labels
- ✅ 6+ messages
- ✅ 6+ tab labels
- ✅ 6+ journey names
- ✅ Icon emojis for tabs

**Popup** (popup.js):
- ✅ Error messages
- ✅ Loading text
- ✅ Header labels

**Error System** (error-messages.js):
- ✅ All error types
- ✅ Error titles, messages
- ✅ Causes and solutions
- ✅ Technical detail labels

## Testing Language Detection

### Test with SAP UI5 URL Parameter
```
https://your-sap-instance.com?sap-language=DE
```

### Test with Browser Language
1. Change Chrome language settings
2. Restart browser
3. Extension will detect new language

### Test with localStorage
```javascript
localStorage.setItem('sap-language', 'FR');
location.reload();
```

## Fallback Behavior

- If translation key missing: Returns key name for debugging
- If language not supported: Falls back to English
- If i18n fails to load: Components use hardcoded English strings

## Adding New Languages

To add a new language:

1. **Create Translation File**
   ```bash
   cp src/i18n/en-US.json src/i18n/xx-XX.json
   ```

2. **Translate All Strings**
   - Maintain JSON structure
   - Keep placeholder syntax: `{variable}`
   - Keep icon emojis consistent

3. **Add to Supported Languages**
   ```javascript
   // In i18n-manager.js
   this.supportedLanguages = [
     'en-US', 'de-DE', ..., 'xx-XX'
   ];
   ```

4. **Add Language Name**
   ```javascript
   this.languageNames = {
     'xx-XX': 'Language Name'
   };
   ```

5. **Add Normalization Mapping** (if needed)
   ```javascript
   normalizeSAPLanguageCode(code) {
     const mapping = {
       'XX': 'xx-XX'
     };
   }
   ```

## Performance Considerations

- **Lazy Loading**: Translations loaded only when needed
- **Caching**: Language preference saved to Chrome storage
- **Single Load**: Translation JSON loaded once per session
- **Minimal Overhead**: ~10-20KB per language file

## Browser Console Debugging

Enable i18n debugging in console:

```javascript
// Check current language
window.JouleQuestI18n.getCurrentLanguage()

// Get available languages
window.JouleQuestI18n.getSupportedLanguages()

// Test translation
window.JouleQuestI18n.t('ui.buttons.start')

// Change language manually
window.JouleQuestI18n.changeLanguage('de-DE')
```

## Known Limitations

1. **Quest Content**: Quest names, descriptions, and story text are NOT translated (remain in English)
2. **Dynamic Content**: User-generated content (goals, etc.) not translated
3. **Joule Responses**: SAP Joule's responses follow SAP's language settings independently

## Future Enhancements

- [ ] Add language switcher in settings
- [ ] Translate quest content (requires separate quest JSON per language)
- [ ] Add RTL support for Arabic/Hebrew if needed
- [ ] Add language-specific date/time formatting
- [ ] Add language-specific number formatting

## Maintenance

### Updating Translations

1. Edit base `en-US.json` file
2. Run translation update script (if available)
3. Manually update other language files
4. Test each language for proper formatting

### Translation Quality

- Keep translations concise (UI space constraints)
- Maintain tone consistency (friendly, encouraging)
- Test with native speakers when possible
- Use SAP's official terminology where applicable

## Summary

The i18n implementation provides seamless multi-language support across all 11 SAP Joule languages, with automatic detection from SAP UI5 settings and browser preferences. The system is maintainable, extensible, and provides graceful fallbacks for missing translations or unsupported languages.
