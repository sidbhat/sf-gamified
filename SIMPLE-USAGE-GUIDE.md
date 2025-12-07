# Simple Usage Guide - SF Joule Mario Quest

## 📋 Prerequisites

**BEFORE running the quest, YOU MUST**:
1. ✅ Open Joule panel manually (click Joule button in SAP SF)
2. ✅ Make sure Joule panel is visible and ready

## 🎮 How to Use

### Step 1: Open Joule Manually
- Log into SAP SuccessFactors
- Click the Joule button (usually in top navigation bar)
- Wait for Joule panel to open
- **DO NOT close it** - leave it open!

### Step 2: Run the Extension
1. Click the extension icon in Chrome toolbar
2. Click "View Cost Center Quest" card
3. Extension popup will close automatically
4. **Watch the magic happen!** ✨

### Step 3: What Happens
- Purple overlay appears in top-right corner
- Extension types "Show me my cost center" into Joule
- Waits for Joule's response
- Shows "Quest Complete! 🏆" with confetti when done!

## ⚠️ Important Notes

### Quest is Now SUPER SIMPLE
- **Only 1 step**: Send prompt and wait for response
- **No opening Joule** - You must open it manually first!
- **No closing Joule** - Quest ends after response detected

### Why Manual Joule Opening?
Opening Joule automatically was causing:
- ❌ Multiple overlays stacking
- ❌ Timing issues finding input field
- ❌ Confusion about what's happening

Opening Joule manually:
- ✅ You control when it's ready
- ✅ Clear what extension will do
- ✅ No overlap or timing issues
- ✅ Extension only sends prompt

## 🐛 Troubleshooting

### "Quest moves too fast"
- This is expected! Quest is only 1 step now
- Overlay shows: "Quest Started" → "Quest Complete"
- Focus is on Joule panel showing the response

### "Nothing happens after prompt sent"
- Extension is waiting for Joule to respond
- Check console (F12) for "Waiting for response" message
- Maximum wait time: 30 seconds

### "Overlays still stacking"
- Reload extension: chrome://extensions/ → Click reload
- Refresh SAP SF page (F5)
- Clear browser cache if needed

### "Popup doesn't close"
- This is normal in some cases
- Just minimize it or click away
- Overlay will still appear on top

## 📊 Expected Flow

```
1. You: Open Joule manually
   ↓
2. You: Click extension → Start Quest
   ↓
3. Extension: Close popup (automatic)
   ↓
4. Extension: Show purple overlay "Quest Started"
   ↓
5. Extension: Type "Show me my cost center" in Joule
   ↓
6. Extension: Send prompt (click send or press Enter)
   ↓
7. Extension: Wait for Joule's response (watching Shadow DOM)
   ↓
8. Extension: Detect keywords: "cost", "center", "CC"
   ↓
9. Extension: Show "Quest Complete! 🏆" with confetti
   ↓
10. Extension: Auto-hide overlay after 5 seconds
```

## 🎯 What Makes This Work

### Maximum Overlay Z-Index
- `z-index: 2147483647` (maximum possible value)
- Overlay appears above EVERYTHING
- Even above Joule panel and SF UI

### Generic Response Detection
- Monitors ALL Shadow DOM elements
- Detects ANY new text that appears
- Checks for keywords: "cost", "center", "CC"
- Works regardless of Joule's HTML structure

### Simplified Quest
- Only 1 step (send prompt)
- No opening/closing Joule
- Clear expectations
- Fast execution

## 💡 Pro Tips

1. **Open Joule before running quest** - This is KEY!
2. **Watch the overlay** - It shows quest progress
3. **Check console** - F12 shows detailed logs
4. **Multiple runs** - Old overlay destroyed each time, no stacking
5. **Wait for response** - Don't close Joule while quest running

## 🎉 Success Looks Like

When working correctly:
- ✅ Popup closes immediately
- ✅ Purple overlay appears top-right
- ✅ Prompt appears in Joule input
- ✅ Prompt sent automatically
- ✅ "Waiting for response..." in console
- ✅ Joule shows cost center information
- ✅ Overlay changes to "Quest Complete! 🏆"
- ✅ Confetti animation plays
- ✅ Overlay auto-hides after 5s

## 📝 Summary

**This is now the SIMPLEST possible quest**:
1. YOU open Joule
2. EXTENSION sends prompt
3. EXTENSION waits for response
4. DONE! 🎉

No complexity, no confusion, just works!
