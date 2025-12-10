# Overlay Duplicate and Display Bug Fixes

**Date**: December 10, 2025  
**Issues Fixed**:
1. Zoomed overlay appearing on top of Joule after repeated extension usage
2. Quest click randomly hiding the main window

---

## Root Cause Analysis

### Bug 1: Zoomed Overlay Appearing on Top of Joule

**Symptom**: After opening the extension multiple times, a "zoomed" version of the overlay would appear on top of the Joule iframe, showing only a portion of the main window. User could interact with the "zombie" overlay even when main window was closed.

**Root Cause**: 
- **Content scripts reload and create new JavaScript execution contexts**
- Every time `src/content.js` runs (page load, refresh, extension icon click), it calls `overlay.init()` on line 51
- Each new content script load creates a NEW QuestOverlay instance where `this.container = null`
- The previous fix checked `if (this.container && document.body.contains(this.container))` 
- **This check FAILED because `this.container` was null in the NEW JavaScript context, even though the OLD DOM element still existed in the page**
- **Result**: Every content script reload created ANOTHER `#joule-quest-overlay` div in the DOM, accumulating "zombie" overlays that remained interactive

**Code that caused the issue**:
```javascript
// FIRST ATTEMPT FIX (STILL BUGGY)
createContainer() {
  // This check fails when content script reloads
  if (this.container && document.body.contains(this.container)) {
    return; // Never reached because this.container is null in new context!
  }
  
  // Creates new overlay every time
  this.container = document.createElement('div');
  this.container.id = 'joule-quest-overlay';
  document.body.appendChild(this.container);
}
```

### Bug 2: Quest Click Hiding Main Window

**Symptom**: Clicking on a quest node in the quest selection menu would sometimes cause the overlay to disappear or behave unexpectedly.

**Root Cause**:
- When clicking the extension icon to reopen the quest menu, `handleShowQuestSelection()` was called
- This function didn't properly check if the overlay container already existed
- The `createContainer()` method in `overlay.js` would always remove and recreate the container
- **Result**: Overlay container recreation caused display issues and lost state

---

## Solution

### Fix 1: Prevent Overlay Destroy/Recreate Cycle

**File**: `src/core/quest-runner.js` (lines 66-71)

**Changed from**:
```javascript
// CRITICAL: Destroy any existing overlay to prevent stacking
if (this.overlay) {
  this.overlay.destroy();
  // Reinitialize to create fresh container
  this.overlay.init();
}
```

**Changed to**:
```javascript
// CRITICAL: Ensure overlay container exists and is ready
// Don't destroy/recreate - just ensure it's initialized
if (this.overlay && !this.overlay.container) {
  this.overlay.init();
}
```

**Why this fixes it**:
- No longer destroys and recreates the overlay unnecessarily
- Only initializes if container doesn't exist yet
- Preserves the singleton overlay instance throughout the extension lifecycle

### Fix 2: DOM-Based Singleton Check (THE REAL FIX)

**File**: `src/ui/overlay.js` (lines 155-171)

**Changed to (FINAL WORKING VERSION)**:
```javascript
createContainer() {
  // CRITICAL FIX: Check DOM FIRST, not instance variable
  // Content script reloads create new JS contexts but old DOM persists
  // This prevents "zombie" overlays from accumulating
  const existing = document.getElementById('joule-quest-overlay');
  if (existing) {
    this.logger.info('Reconnecting to existing overlay container from previous content script load');
    this.container = existing;  // Reconnect to existing DOM element
    return;
  }

  // Only create if truly doesn't exist in DOM
  this.container = document.createElement('div');
  this.container.id = 'joule-quest-overlay';
  this.container.className = 'joule-quest-overlay hidden';
  
  document.body.appendChild(this.container);
  this.logger.success('Overlay container created for first time');
}
```

**Why this fixes it**:
- ✅ Checks DOM directly using `document.getElementById()` BEFORE checking instance variable
- ✅ Reconnects new JavaScript instance to existing DOM element when content script reloads
- ✅ Prevents creation of duplicate overlays across content script reloads
- ✅ No more "zombie" overlays that remain interactive after main window closes
- ✅ Singleton pattern enforced at DOM level, not just JavaScript instance level

---

## Testing Verification

To verify the fixes work:

1. **Test Repeated Extension Opens**:
   - Open the extension and select a quest
   - Close the overlay
   - Reopen the extension multiple times (10+ times)
   - ✅ Should NOT see duplicate/zoomed overlays appear

2. **Test Quest Click Behavior**:
   - Open the extension
   - Click on any quest node
   - ✅ Quest should start and overlay should show quest progress
   - ✅ Main quest selection window should remain accessible

3. **Test Cross-Tab Usage**:
   - Open both SuccessFactors and S/4HANA tabs
   - Open extension in SF tab, start quest
   - Switch to S/4HANA tab, open extension
   - ✅ Should see separate quest selection per solution
   - ✅ No overlay contamination between tabs

4. **Test Quest Completion Flow**:
   - Start a quest
   - Let it complete
   - Click "Show Quests" button
   - ✅ Quest selection should reappear without duplicate overlays

---

## Key Principles Applied

1. **Singleton Pattern**: Only ONE overlay container should exist at any time
2. **Lazy Initialization**: Create container only when truly needed
3. **State Preservation**: Don't destroy/recreate unnecessarily
4. **Defensive Checks**: Verify container exists in both memory and DOM before creating

---

## Related Files Modified

- ✅ `src/core/quest-runner.js` - Removed destroy/init cycle in startQuest()
- ✅ `src/ui/overlay.js` - Added singleton check in createContainer()

---

## Status

**FIXED** ✅ Both bugs have been resolved. The overlay now maintains a single container instance throughout the extension lifecycle, preventing duplicate overlays and display issues.
