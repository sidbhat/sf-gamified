# Pre-Flight Checklist ✈️

Run through this checklist before testing the extension to ensure everything is ready.

## ✅ File Verification

Check these files exist in your project:

### Core Files (Required)
- [x] `manifest.json` - Extension configuration
- [x] `src/background.js` - Service worker
- [x] `src/content.js` - Content script entry

### Configuration Files (Required)
- [x] `src/config/quests.json` - Quest definitions
- [x] `src/config/users.json` - User credentials
- [x] `src/config/selectors.json` - Element selectors

### Core Classes (Required)
- [x] `src/core/joule-handler.js` - Joule interaction
- [x] `src/core/quest-runner.js` - Quest execution
- [x] `src/core/storage-manager.js` - Storage management

### Utilities (Required)
- [x] `src/utils/logger.js` - Logging system
- [x] `src/utils/shadow-dom-helper.js` - DOM helper

### UI Files (Required)
- [x] `src/ui/popup.html` - Popup interface
- [x] `src/ui/popup.css` - Popup styling
- [x] `src/ui/popup.js` - Popup logic
- [x] `src/ui/overlay.js` - Overlay notifications
- [x] `src/ui/overlay.css` - Overlay styling
- [x] `src/ui/confetti.js` - Celebration animation

## ✅ Configuration Verification

### 1. Check User Credentials

File: `src/config/users.json`

```json
{
  "demoUser": {
    "username": "m_i8062320423130513",
    "password": "oneapp@123",
    "tenantUrl": "https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182",
    "displayName": "Mario (Demo User)"
  }
}
```

✅ **Verified**: Credentials match your Playwright automation

### 2. Check Manifest Permissions

File: `manifest.json`

Required permissions:
- [x] `storage` - For saving progress
- [x] `activeTab` - For current tab access
- [x] `scripting` - For content script injection

Required host_permissions:
- [x] `https://*.successfactors.com/*`
- [x] `https://*.successfactors.eu/*`
- [x] `https://*.hr.cloud.sap/*`

✅ **Verified**: All permissions configured

### 3. Check Quest Configuration

File: `src/config/quests.json`

Quest: "View Cost Center" should have:
- [x] 3 steps (Open Joule, Send Prompt, Close Joule)
- [x] Prompt: "Show me my cost center"
- [x] Response keywords: ["cost center", "cost-center", "CC"]

✅ **Verified**: Quest properly configured

## ✅ Extension Load Test

### Step 1: Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `/Users/I806232/Downloads/gamified-sf`

**Expected Result**: Extension loads with NO errors

**Troubleshooting**:
- ❌ Manifest error → Check `manifest.json` syntax
- ❌ File not found → Verify file paths are correct
- ❌ Permission error → Check host_permissions match

### Step 2: Verify Extension Info

On `chrome://extensions/` page, verify:
- [x] Name: "SF Joule Mario Quest"
- [x] Version: 0.1.0
- [x] Status: Enabled (toggle ON)
- [x] No error messages in extension card

### Step 3: Check Service Worker

1. On `chrome://extensions/` find your extension
2. Click **"service worker"** link (under "Inspect views")
3. Console should show:
   ```
   [MarioQuest] Background service worker loaded
   ```

**If no output**: Refresh the extension (click reload icon)

## ✅ SAP SF Page Test

### Step 1: Login

1. Navigate to: `https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182`
2. Login with credentials from `users.json`
3. Wait for home page to fully load

### Step 2: Check Content Script

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for:
   ```
   [MarioQuest] Content script loaded
   [MarioQuest] Configurations loaded
   [MarioQuest] All components initialized
   ```

**If missing**:
- Refresh page (F5)
- Check URL matches host_permissions
- Check extension is enabled

### Step 3: Check Configuration Loading

In console, check for these specific messages:
```
[MarioQuest] Configurations loaded {selectors: {...}, quests: {...}, users: {...}}
```

**If "Failed to load configurations"**:
- Check `web_accessible_resources` in manifest.json includes `src/config/*.json`
- Check JSON files have no syntax errors

## ✅ Popup Test

### Step 1: Open Popup

1. Click extension icon 🍄 in Chrome toolbar
2. Popup should open (400px width)

**Expected Elements**:
- [x] Header with "Mario Quest" and mushroom 🍄
- [x] Stats section (0 points, 0 quests initially)
- [x] Mode selector (Demo/Real buttons)
- [x] Quest list with "View Cost Center Quest"
- [x] Refresh button at bottom

### Step 2: Verify Quest Display

Quest card should show:
- [x] Icon: 🍄
- [x] Name: "View Cost Center Quest"
- [x] Description: "Learn to use Joule..."
- [x] Difficulty: "Easy"
- [x] Points: "100 pts"

### Step 3: Test Mode Toggle

1. Click **"Real"** button → Should highlight
2. Click **"Demo"** button → Should highlight
3. Demo should be selected by default

## ✅ Quest Execution Test

### Demo Mode Test

1. Ensure you're on SF home page (logged in)
2. Open popup, select **Demo** mode
3. Click **"View Cost Center Quest"**
4. Popup should close

**Watch for**:
- [x] Overlay appears top-right with quest start
- [x] Step 1: "Open Joule" message shows
- [x] Step 2: "Ask about Cost Center" message shows
- [x] Step 3: "Close Joule" message shows
- [x] Success message: "Quest Complete!"
- [x] Confetti animation plays 🎉

**If quest fails**:
- Check console for error messages
- Most likely: Selectors don't match your SF instance
- Update `src/config/selectors.json` with correct selectors

### Real Mode Test

1. Open popup, select **Real** mode
2. Click **"View Cost Center Quest"**
3. Follow overlay instructions manually

**Verify**:
- [x] Overlay shows "Your Turn!" messages
- [x] Extension waits for you to complete each step
- [x] Extension validates your actions
- [x] Completes when all steps done

## ✅ Post-Quest Verification

After completing a quest:

1. Open popup again
2. Check stats updated:
   - Points: Should show 100
   - Quests: Should show 1

3. Check quest card:
   - Should have green border
   - Should show "✓ Completed" badge

4. Check storage:
   - Open DevTools on SF page
   - Go to Application > Storage > Local Storage
   - Should see:
     - `quest_progress_view-cost-center`
     - `user_stats`

## ✅ All Systems Go! 🚀

If all checks pass:
- ✅ Extension loads without errors
- ✅ Content script initializes on SF page
- ✅ Popup displays correctly
- ✅ Quest executes successfully
- ✅ Stats persist properly

**You're ready to use the extension!**

## 🆘 Common Issues

### Extension won't load
→ Check you selected the ROOT directory (`gamified-sf/`), not a subfolder

### Content script doesn't run
→ URL must contain `successfactors.com`, `successfactors.eu`, or `hr.cloud.sap`

### Quest fails immediately
→ Joule selectors likely don't match. Inspect Joule button and update `selectors.json`

### Overlay doesn't show
→ Check console for errors. Extension may still work, just no visual feedback

### Stats don't save
→ Check storage permission in manifest.json. Clear storage and try again.

## 📚 Next Steps

After pre-flight check passes:
1. Read `QUICK-START.md` for quick testing guide
2. Read `INSTALL.md` for full documentation
3. Customize selectors for your SF tenant
4. Add more quests to `quests.json`
5. Share with team!

---

**Status**: ✅ Ready for takeoff!

The extension is fully functional and ready to gamify your Joule training! 🍄🎮
