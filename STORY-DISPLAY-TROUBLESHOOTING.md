# Story Narrative Display Troubleshooting

## Issue: Story context not showing at quest start

The story narrative fields (`storyChapter`, `storyIntro`, `storyOutro`, `nextQuestHint`) have been added to all quests in `src/config/quests.json`, but they may not display if the browser has cached the old version.

## Root Cause

Chrome extensions cache configuration files (like `quests.json`). Even after reloading the extension, the browser may still use the cached version of the quest data.

## Solution: Hard Reload the Extension

### Method 1: Remove and Re-add Extension (Most Reliable)

1. Go to `chrome://extensions/`
2. Find "Joule Quest"
3. Click **"Remove"** button
4. Confirm removal
5. Click **"Load unpacked"** button
6. Select the `/Users/I806232/Downloads/gamified-sf` directory
7. Extension will reload with fresh configuration

### Method 2: Force Cache Clear (Alternative)

1. Go to `chrome://extensions/`
2. Find "Joule Quest"  
3. Toggle extension **OFF**
4. Close ALL SAP tabs (SuccessFactors or S/4HANA)
5. Close Chrome completely
6. Reopen Chrome
7. Go back to `chrome://extensions/`
8. Toggle "Joule Quest" back **ON**
9. Open fresh SAP tab
10. Test quest

### Method 3: Developer Hard Reload (For Development)

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Find "Joule Quest"
4. Click **"Reload"** button
5. Click **"Update"** button (appears after reload)
6. Hard refresh SAP page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)

## Verification Steps

After reloading, verify story narratives work:

1. Open SAP SuccessFactors or S/4HANA
2. Click Joule Quest extension icon
3. Select any quest from the map
4. **Quest Start Screen** should show:
   - ✅ 📖 Story Chapter (white text, e.g., "Day 1: Welcome Aboard")
   - ✅ Story Intro paragraph (italic text explaining context)
5. Complete the quest
6. **Quest Complete Screen** should show:
   - ✅ Story Outro paragraph (italic text about what happened)
   - ✅ Next Quest Hint box (white text with "🔜 Next:")

## What You Should See

### Quest Start Example:
```
┌─────────────────────────────────────┐
│ [Joule Icon]                        │
│                                     │
│ ┌───────────────────────────────┐ │
│ │ 📖 DAY 1: WELCOME ABOARD      │ │
│ │                               │ │
│ │ Welcome to your new company!  │ │
│ │ It's Monday morning, 9 AM...  │ │
│ └───────────────────────────────┘ │
│                                     │
│ Quest Started!                      │
│ Check My Vacation Balance           │
└─────────────────────────────────────┘
```

### Quest Complete Example:
```
┌─────────────────────────────────────┐
│ 🏆                                  │
│ Quest Complete!                      │
│ Check My Vacation Balance            │
│                                     │
│ ┌───────────────────────────────┐ │
│ │ Great! You found your 25 PTO  │ │
│ │ days. Tomorrow you'll learn...│ │
│ │                               │ │
│ │ 🔜 Next: Learn the rental car │ │
│ │         policy                │ │
│ └───────────────────────────────┘ │
│                                     │
│ +25 points                           │
└─────────────────────────────────────┘
```

## Still Not Working?

If story narratives still don't appear after trying all methods:

1. Check browser console for errors:
   - Press `F12` to open DevTools
   - Go to Console tab
   - Look for errors mentioning "quests.json" or "story"

2. Verify quest data loaded correctly:
   - In Console, type: `chrome.runtime.getURL('src/config/quests.json')`
   - Open that URL in new tab
   - Verify you see `"storyChapter"` and `"storyIntro"` fields in the first quest

3. Check if extension files are up to date:
   - Go to extension directory: `/Users/I806232/Downloads/gamified-sf`
   - Verify `src/config/quests.json` contains story fields
   - Run: `git log --oneline -5` to see recent commits
   - Should see commits like "feat: Implement story-driven narratives"

## Files Modified

The story narrative feature required changes to these files:

1. **src/config/quests.json** - Added story fields to all 33 quests
2. **src/ui/overlay.js** - Enhanced `showQuestStart()` and `showQuestComplete()` methods
3. **src/ui/overlay.css** - Added `.story-context`, `.story-continuation`, `.next-hint` classes

All changes committed in:
- Commit `0b3acc6`: Initial story narrative implementation
- Commit `b10a76d`: Fixed color contrast (gold → white)
- Commit `4d9e1f6`: Removed auto-disappear from complete screen
