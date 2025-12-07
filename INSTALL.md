# Installation & Testing Guide

## Prerequisites

- Google Chrome browser (version 88 or later)
- Access to SAP SuccessFactors instance
- Valid SAP SF credentials (see `src/config/users.json`)

## Installation Steps

### 1. Prepare Icons (Optional for Testing)

The extension references icon files that need to be created:

```bash
# Create placeholder icons (or skip this step - extension will work without icons)
# You need: assets/icon16.png, assets/icon48.png, assets/icon128.png
# See assets/README.md for details
```

**Temporary workaround**: You can test without icons - Chrome will use default icon.

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **Load unpacked**

4. Select the project root directory (`gamified-sf/`)

5. The extension should now appear in your extensions list

### 3. Verify Installation

Check that you see:
- ✅ Extension name: "SF Joule Mario Quest"
- ✅ Version: 0.1.0
- ✅ Status: Enabled
- ✅ No errors in the console

## Testing the Extension

### Test 1: Verify Content Script Loads

1. Navigate to your SAP SuccessFactors instance:
   ```
   https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182
   ```

2. Open Chrome DevTools (F12)

3. Check Console for:
   ```
   [MarioQuest] Content script loaded
   [MarioQuest] Configurations loaded
   [MarioQuest] All components initialized
   ```

### Test 2: Open Popup

1. Click the extension icon in Chrome toolbar

2. You should see:
   - Mario Quest header with 🍄 icon
   - Stats section (0 points, 0 quests initially)
   - Mode selector (Demo/Real)
   - Quest list with "View Cost Center Quest"

### Test 3: Run Demo Mode Quest

1. Make sure you're logged into SAP SuccessFactors

2. Click the extension icon

3. Ensure **Demo** mode is selected (🎮 Demo button is highlighted)

4. Click on "View Cost Center Quest"

5. Watch as the quest runs automatically:
   - Step 1: Opens Joule chat
   - Step 2: Sends prompt "Show me my cost center"
   - Step 3: Closes Joule chat

6. You should see:
   - Overlay notifications in top-right corner
   - Progress bar updates
   - Success messages
   - Confetti animation on completion 🎉

### Test 4: Run Real Mode Quest

1. Click the extension icon

2. Select **Real** mode (👆 Real button)

3. Click on "View Cost Center Quest"

4. Follow the instructions in the overlay:
   - Manually click Joule button
   - Type and send the prompt
   - Close Joule

5. The extension will verify each step as you complete it

## Troubleshooting

### Extension doesn't load

**Problem**: Extension shows errors on chrome://extensions/

**Solution**:
- Check all JSON files are valid (no syntax errors)
- Verify all file paths in manifest.json are correct
- Try removing and re-adding the extension

### Content script not loading

**Problem**: No console messages in DevTools

**Solution**:
- Verify you're on a SAP SF page (check URL matches host_permissions)
- Reload the page (F5)
- Check extension is enabled on chrome://extensions/

### Joule elements not found

**Problem**: Quest fails with "Element not found" errors

**Solution**:
- Joule selectors in `src/config/selectors.json` may need updating
- Open DevTools and inspect Joule elements
- Update selectors to match your SF instance
- SAP may have changed their UI - selectors need adjustment

### Quest completes but no confetti

**Problem**: Quest succeeds but no celebration animation

**Solution**:
- Check browser console for JavaScript errors
- Confetti canvas may be blocked by SF page CSS
- Verify `src/ui/confetti.js` loaded correctly

### Storage/Stats not persisting

**Problem**: Quest completion doesn't save

**Solution**:
- Check Chrome storage permissions in manifest.json
- Open DevTools > Application > Storage > Local Storage
- Look for quest_progress_* and user_stats entries
- Clear storage and try again if corrupted

## Development Workflow

### Making Changes

1. **Edit code files** in your IDE

2. **Reload extension**:
   - Go to chrome://extensions/
   - Click reload icon 🔄 on your extension
   - Or use keyboard: `Ctrl+R` (Windows) / `Cmd+R` (Mac)

3. **Reload SAP SF page** to test changes

4. **Check console** for errors in:
   - Extension service worker (chrome://extensions/)
   - Page console (F12 on SF page)
   - Popup console (F12 with popup open)

### Testing New Quests

1. Add quest to `src/config/quests.json`

2. Add any new selectors to `src/config/selectors.json`

3. Reload extension

4. Test in both Demo and Real modes

### Debugging Tips

**Enable verbose logging**:
```javascript
// In any file, logger is available globally
window.MarioQuestLogger.setEnabled(true);
```

**Check storage contents**:
```javascript
// In console
chrome.storage.local.get(null, (data) => console.log(data));
```

**Clear all data**:
```javascript
// In console  
chrome.storage.local.clear();
```

## Next Steps

After successful testing:

1. ✅ Add custom icons (see assets/README.md)
2. ✅ Create more quests (edit quests.json)
3. ✅ Customize selectors for your SF instance
4. ✅ Add more user credentials (edit users.json)
5. ✅ Share with team for testing
6. ✅ Collect feedback and iterate

## Support

For issues or questions:
- Check docs/ directory for detailed documentation
- Review console logs for error messages
- Verify selector configuration matches your SF instance
- Test in incognito mode to rule out extension conflicts

## Known Limitations (MVP)

- Only 1 quest implemented (View Cost Center)
- Demo mode user credentials hardcoded
- Selectors may need adjustment for your SF tenant
- No analytics or progress tracking beyond local storage
- Icons are placeholders

See `docs/ROADMAP.md` for planned improvements.
