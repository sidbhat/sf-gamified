# Quick Start - Test in 5 Minutes

## Prerequisites
✅ You have the SAP SF credentials: `m_i8062320423130513` / `oneapp@123`
✅ Chrome browser installed

## Step 1: Load Extension (2 minutes)

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer mode** ON (top-right)
3. Click **Load unpacked**
4. Navigate to and select: `/Users/I806232/Downloads/gamified-sf`
5. Extension should load with NO errors

**Verify**: You should see "SF Joule Mario Quest v0.1.0" in your extensions list

## Step 2: Login to SAP SF (1 minute)

1. Open new tab
2. Navigate to: `https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182`
3. Login with:
   - Username: `m_i8062320423130513`
   - Password: `oneapp@123`
4. Wait for home page to load

## Step 3: Check Extension Loaded (30 seconds)

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for these messages:
   ```
   [MarioQuest] Content script loaded
   [MarioQuest] Configurations loaded
   [MarioQuest] All components initialized
   ```

**If you see these messages**: ✅ Extension is working!

**If you DON'T see them**:
- Refresh the page (F5)
- Check extension is enabled on chrome://extensions/
- Check for any error messages in console

## Step 4: Run Your First Quest (1 minute)

### Demo Mode (Automated):

1. Click the extension icon 🍄 in Chrome toolbar
2. Make sure **Demo** mode is selected (should be default)
3. Click **"View Cost Center Quest"**
4. Watch the magic! The extension will:
   - ✨ Open Joule chat automatically
   - ✨ Type and send "Show me my cost center"
   - ✨ Wait for Joule response
   - ✨ Close Joule
   - 🎉 Show confetti celebration!

### Real Mode (Manual):

1. Click extension icon 🍄
2. Select **Real** mode (👆 Real button)
3. Click **"View Cost Center Quest"**
4. Follow instructions in the overlay:
   - You click Joule button
   - You type "Show me my cost center" and send
   - You close Joule
5. Extension verifies each step as you complete it

## Troubleshooting

### Extension won't load
- **Problem**: Errors on chrome://extensions/
- **Fix**: Make sure you selected the root directory `/Users/I806232/Downloads/gamified-sf` (not a subdirectory)

### No console messages
- **Problem**: Extension not running on SF page
- **Fix 1**: Reload page (F5)
- **Fix 2**: Check you're on the correct URL (must include `successfactors.com`, `successfactors.eu`, or `hr.cloud.sap`)
- **Fix 3**: Go to chrome://extensions/ and click reload on the extension

### "Element not found" error
- **Problem**: Joule selectors don't match your SF instance
- **Fix**: The selectors in `src/config/selectors.json` may need adjustment for your specific SF tenant. This is expected for MVP - selectors may vary by tenant.

### Quest runs but nothing happens
- **Problem**: Joule button not found or different on your instance
- **Fix**: 
  1. Look at the SF page - where is the Joule button?
  2. Right-click it → Inspect
  3. Update selectors in `src/config/selectors.json` to match

### Confetti doesn't show
- **Problem**: Canvas blocked or JavaScript error
- **Fix**: Check console for errors, but quest still completed successfully

## Expected Behavior

✅ **Demo Mode**: Fully automated, no user action needed
✅ **Real Mode**: You perform actions, extension validates
✅ **Stats Update**: Points and quest count increase after completion
✅ **Overlay Shows**: Mario-themed notifications in top-right
✅ **Confetti Plays**: Celebration animation on completion

## Quick Test Checklist

Run through this to verify everything works:

- [ ] Extension loads without errors
- [ ] Can login to SAP SF with provided credentials
- [ ] Console shows content script loaded messages
- [ ] Popup opens when clicking extension icon
- [ ] Quest list shows "View Cost Center Quest"
- [ ] Demo mode runs automatically
- [ ] Can see overlay notifications
- [ ] Confetti shows on completion
- [ ] Stats update (points, quests completed)
- [ ] Real mode waits for user actions

## What to Do After Testing

1. ✅ **Works?** Great! Read full `INSTALL.md` for more details
2. ✅ **Add Icons**: See `assets/README.md` to create proper icons
3. ✅ **Customize**: Edit `src/config/quests.json` to add more quests
4. ✅ **Share**: Give to team members to test

## Need Help?

- Check `INSTALL.md` for detailed troubleshooting
- Review console logs for error messages
- Verify selectors match your SF tenant UI
- Make sure you're logged into SF before running quest

---

**Expected Result**: Quest completes successfully with confetti! 🎉

Your Playwright automation is now a Chrome extension! 🍄
