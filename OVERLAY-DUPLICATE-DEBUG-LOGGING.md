# Overlay Duplicate Issue - Debug Logging Added

## Problem Summary

Duplicate overlays appear ONLY when clicking the extension icon to reopen quest selection (NOT on first page load). The duplicates show different quest states, indicating multiple independent QuestRunner instances.

## Debug Logging Added

### 1. src/content.js

**Message Handler Tracking:**
- `messageHandlerCallCount`: Counts how many times the message handler is invoked
- Logs: `[DEBUG] Message received (#N)` and `[DEBUG] showQuestSelection triggered (#N)`

**handleShowQuestSelection() Tracking:**
- `showQuestSelectionCallCount`: Counts how many times this function is called
- **Before processing:** Logs existing overlays in DOM
- **After processing:** Logs overlays in DOM again to detect if new ones were created

**Key Debug Messages:**
```javascript
// When message arrives
logger.info(`[DEBUG] Message received (#${messageHandlerCallCount})`, message);

// When showQuestSelection is triggered
logger.info(`[DEBUG] showQuestSelection triggered (#${messageHandlerCallCount})`);

// Function entry
logger.info(`[DEBUG] handleShowQuestSelection called (#${showQuestSelectionCallCount})`);

// DOM state BEFORE
logger.info(`[DEBUG] Existing overlays in DOM BEFORE processing: ${existingOverlays.length}`);

// DOM state AFTER
logger.info(`[DEBUG] Overlays in DOM AFTER processing: ${overlaysAfter.length}`);
```

### 2. src/ui/overlay.js

**showQuestSelection() Tracking:**
- Logs when function is called
- Logs container state (exists, in DOM, visible)
- **Key:** Logs existing overlays in DOM at START of showQuestSelection

**Key Debug Messages:**
```javascript
// Function entry
this.logger.info('[DEBUG] overlay.showQuestSelection() called');

// Container state
this.logger.info('[DEBUG] Container state:', {
  containerExists: !!this.container,
  containerInDOM: this.container && document.body.contains(this.container),
  isVisible: this.isVisible
});

// DOM state at function start
this.logger.info(`[DEBUG] Existing overlays in DOM at START of showQuestSelection: ${existingOverlays.length}`);
```

## What to Look For

### Step 1: Load the extension
1. Open Developer Tools Console
2. Navigate to SAP page
3. Click extension icon ONCE
4. **Expected:** Should see ONE of each log

### Step 2: Click extension icon again
1. Close quest selection overlay
2. Click extension icon AGAIN
3. **Look for:**
   - Is `messageHandlerCallCount` incrementing more than once per click?
   - Is `showQuestSelectionCallCount` incrementing more than once per click?
   - Do the "BEFORE processing" and "AFTER processing" overlay counts differ?
   - Does "Container state" show container already exists?
   - Does "START of showQuestSelection" show existing overlays?

## Expected Behaviors

### ✅ CORRECT (Single Click Flow)
```
[DEBUG] Message received (#1) {action: "showQuestSelection"}
[DEBUG] showQuestSelection triggered (#1)
[DEBUG] handleShowQuestSelection called (#1)
[DEBUG] Existing overlays in DOM BEFORE processing: 1 (the existing container)
[DEBUG] Safety reset of quest runner state
[DEBUG] Calling overlay.showQuestSelection()
[DEBUG] overlay.showQuestSelection() called
[DEBUG] Container state: {containerExists: true, containerInDOM: true, isVisible: false}
[DEBUG] Existing overlays in DOM at START of showQuestSelection: 1
[DEBUG] Overlays in DOM AFTER processing: 1
```

### ❌ PROBLEM INDICATORS

**Multiple Message Handler Calls:**
```
[DEBUG] Message received (#1)
[DEBUG] Message received (#2)  // <-- DUPLICATE MESSAGE!
```

**Multiple Function Calls:**
```
[DEBUG] handleShowQuestSelection called (#1)
[DEBUG] handleShowQuestSelection called (#2)  // <-- CALLED TWICE!
```

**Overlay Count Increases:**
```
[DEBUG] Existing overlays in DOM BEFORE processing: 1
[DEBUG] Overlays in DOM AFTER processing: 2  // <-- NEW OVERLAY CREATED!
```

**Container Created Multiple Times:**
```
[DEBUG] Container state: {containerExists: false, containerInDOM: false}
// ^-- Container was destroyed but shouldn't have been
```

## Next Steps Based on Findings

### If messageHandlerCallCount > 1
- **Cause:** Message sent multiple times by popup.js
- **Fix:** Add debouncing or flag to prevent duplicate sends

### If showQuestSelectionCallCount > messageHandlerCallCount
- **Cause:** window.postMessage also triggering the function
- **Fix:** Prevent duplicate calls from window message listener

### If overlay count increases AFTER processing
- **Cause:** New overlay created instead of reusing existing
- **Fix:** Strengthen container reuse logic in overlay.showQuestSelection()

### If container doesn't exist when it should
- **Cause:** Container being destroyed somewhere
- **Fix:** Find where overlay.destroy() or container.remove() is called

## Testing Instructions

1. **Reload extension** to ensure clean state
2. **Open DevTools Console** (F12)
3. **Navigate to SAP page**
4. **Click extension icon** → observe logs
5. **Close overlay** (click X)
6. **Click extension icon AGAIN** → compare logs
7. **Take screenshot of console** showing the duplicate issue
8. **Share console logs** with findings

## Files Modified

- `src/content.js`: Added message tracking and DOM state logging
- `src/ui/overlay.js`: Added container state and DOM tracking
- `OVERLAY-DUPLICATE-DEBUG-LOGGING.md`: This documentation

---

**Status:** Debug logging deployed, awaiting test results to identify root cause.
