# Overlay Overlap Fix - CRITICAL FIXES APPLIED

## Problem
Multiple quest overlays were stacking on top of each other when running the extension multiple times, creating a confusing UI mess.

## Root Causes
1. **No cleanup between runs**: Old overlays weren't being destroyed before creating new ones
2. **Joule panel not fullscreen**: Joule panel was overlapping with our overlay
3. **Multiple instances**: Running quest multiple times created multiple overlay containers

## Fixes Applied

### Fix 1: Overlay Cleanup (src/core/quest-runner.js)
**Added cleanup before each quest start:**
```javascript
// CRITICAL: Destroy any existing overlay to prevent stacking
if (this.overlay) {
  this.overlay.destroy();  // Remove old overlay from DOM
  this.overlay.init();     // Create fresh container
}
```

**What this does**:
- Removes ANY existing overlay from previous runs
- Creates a fresh, clean overlay container
- Prevents stacking of multiple overlays

### Fix 2: Joule Panel Maximize (src/core/joule-handler.js)
**Added automatic panel maximization:**
```javascript
// Try to maximize/fullscreen the Joule panel to prevent overlapping
this.logger.info('Attempting to maximize Joule panel...');
await this.maximizeJoulePanel();
```

**What this does**:
1. Looks for "Maximize" or "Expand" button in Joule panel
2. If found, clicks it to make panel fullscreen
3. If not found, applies CSS to force fullscreen:
   - `width: 100vw` (full viewport width)
   - `height: 100vh` (full viewport height)
   - `position: fixed` with `zIndex: 9999`
4. Ensures Joule takes up whole screen, no overlap with our overlay

### Fix 3: Improved Overlay Creation (src/ui/overlay.js)
**Existing code already had cleanup:**
```javascript
// Remove existing overlay if any
const existing = document.getElementById('mario-quest-overlay');
if (existing) {
  existing.remove();
}
```

This was already good - it removes any existing overlay by ID before creating new one.

## Testing the Fixes

### Step 1: Reload Extension
```
1. Go to chrome://extensions/
2. Find "SF Joule Mario Quest"
3. Click reload icon
```

### Step 2: Test Multiple Runs
```
1. Run quest → Should work normally
2. Run quest AGAIN → Old overlay destroyed, new one created
3. Run quest THIRD time → Still clean, no stacking
```

### Expected Behavior
✅ **Before**: Overlays stacked on each other, confusing mess
✅ **After**: Only ONE overlay visible, clean UI every time

✅ **Before**: Joule panel small, overlapping with our overlay
✅ **After**: Joule panel fullscreen, no overlap

## Console Logs to Watch For

When running quest, you should see:
```
[QUEST] Starting quest...
[JOULE] Opening Joule chat
[JOULE] Found Joule button, clicking to open panel
[JOULE] Attempting to maximize Joule panel...
[JOULE] Found maximize button, clicking to expand panel
   OR
[JOULE] No maximize button found, trying CSS approach
[JOULE] Found panel container, applying fullscreen styles
[JOULE] Waiting for input field to appear...
[JOULE] Joule chat opened successfully
```

## Verification Checklist

After reloading extension, verify:

- [ ] Run quest once → Overlay appears correctly
- [ ] Run quest again → Old overlay gone, new one appears
- [ ] Run quest third time → Still only ONE overlay
- [ ] Joule panel is fullscreen/maximized
- [ ] No overlapping UI elements
- [ ] Console shows "Attempting to maximize Joule panel..."

## If Still Having Issues

If overlays still overlap after these fixes:

1. **Check console** for errors during cleanup
2. **Inspect DOM** - Search for `#mario-quest-overlay` 
   - Should only find ONE element
   - If multiple, something blocking destroy()
3. **Share error** - Copy full console log

## Technical Details

**Why destroy() + init() pattern?**
- `destroy()` removes old overlay from DOM completely
- `init()` creates fresh new container with clean state
- This is more reliable than trying to reuse existing container

**Why CSS fallback for fullscreen?**
- Some Joule versions may not have maximize button
- CSS approach forces fullscreen regardless
- Ensures consistency across different Joule UI versions

## Summary

✅ **Overlay cleanup**: Destroy old overlay before creating new one
✅ **Joule fullscreen**: Maximize panel to prevent overlap
✅ **Clean state**: Each quest run starts with fresh UI

**Result**: Professional, clean UI experience with no overlapping elements!
