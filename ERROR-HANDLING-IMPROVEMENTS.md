# Error Handling Improvements

## Overview
Enhanced quest error handling to gracefully handle real-world scenarios where Joule responses may not match expected patterns, users lack permissions, or features are unavailable.

## Changes Made

### 1. **Added Error Keywords to Quest Steps** (`src/config/quests.json`)

All Spot Award quest steps now include `errorKeywords` for detection:

```json
{
  "id": 2,
  "name": "Request Spot Award",
  "errorKeywords": ["sorry", "couldn't", "unable", "don't have", "not available", 
                    "not found", "permission", "not authorized", "can't find"]
}
```

**Error scenarios detected:**
- User not a manager: "You don't have permission"
- Feature unavailable: "Spot awards are not available"
- Joule can't find feature: "I couldn't find that"

### 2. **Made Steps 3-5 Optional** (`src/config/quests.json`)

Employee selection, amount, and message steps are now optional:

```json
{
  "id": 3,
  "name": "Enter Employee Name",
  "optional": true,
  "errorKeywords": ["not found", "couldn't find", "don't recognize"]
}
```

**Benefits:**
- Quest continues even if employee name invalid
- Graceful degradation for permission issues
- Better user experience - no hard failures

### 3. **Smart Response Analysis** (`src/core/joule-handler.js`)

New `analyzeJouleResponse()` method with 6-layer detection:

```javascript
analyzeJouleResponse(response, successKeywords, errorKeywords) {
  // Returns: { type, confidence, indicators, suggestedAction, message }
}
```

**Detection layers:**
1. **Empty Response**: No response received → retry
2. **Error Keywords**: "sorry", "couldn't" → skip step
3. **Success Keywords**: Expected words found → continue
4. **Quick Actions**: "select an option" → click first button
5. **Clarification**: "can you clarify" → continue
6. **Partial Success**: "here's what I found" → continue with caution

**Response types:**
- `error` → Skip step (if optional) or fail quest
- `success` → Continue to next step  
- `quick_actions` → Auto-click first button
- `clarification` → Continue (Joule needs more info)
- `partial` → Continue (Joule gave partial data)

### 4. **Enhanced Quest Runner** (`src/core/quest-runner.js`)

Updated `executeTypeAndSendAction()` to use response analysis:

```javascript
// Analyze Joule's response
const analysis = this.jouleHandler.analyzeJouleResponse(
  result.response,
  step.responseKeywords,
  step.errorKeywords
);

// Handle errors gracefully
if (analysis.type === 'error') {
  if (step.optional) {
    // Skip this step, continue quest
    this.stepResults.push({ status: 'skipped', error: analysis.message });
    return;
  }
  throw new Error(errorMsg); // Not optional, fail
}

// Auto-handle quick actions
if (analysis.type === 'quick_actions') {
  await this.jouleHandler.selectFirstOption();
}
```

**Key improvements:**
- Optional steps can be skipped without failing quest
- Quick action menus auto-handled
- Clear error messaging to user
- Quest continues through minor failures

### 5. **User-Friendly Skip Messages** (`src/ui/overlay.js`)

New `showStepSkipped()` method displays friendly messages:

```html
⏭️ Step Skipped
Employee Name Entry
⚠️ Employee "Jada Baker" not found in your team
💡 This step is optional - continuing quest...
```

**Styling:**
- Warning icon (not error icon)
- Clear explanation of why skipped
- Reassurance that quest continues
- Auto-dismisses after 3 seconds

## Real-World Scenarios Handled

### Scenario 1: User Not a Manager

**Before:**
```
❌ Quest fails immediately
"Employee name not found"
```

**After:**
```
Step 2: Request Spot Award
⚠️ Joule responded: "You don't have permission to give spot awards"
⏭️ Skipping optional steps 3-5
✅ Quest completed (partial) - 50% points awarded
```

### Scenario 2: Employee Name Doesn't Exist

**Before:**
```
❌ Quest fails at Step 3
"Element not found"
```

**After:**
```
Step 3: Enter Employee Name
⏭️ Step Skipped: "Jada Baker" not found
💡 Continuing quest...
```

### Scenario 3: Spot Awards Feature Unavailable

**Before:**
```
❌ Quest fails immediately
Generic error message
```

**After:**
```
Step 2: Request Spot Award
⚠️ Feature not available: Spot awards are not enabled in your instance
⏭️ Skipping to next quest
```

### Scenario 4: Quick Action Menu Instead of Text

**Before:**
```
⏳ Waiting for response keywords...
⏳ Timeout after 30 seconds
```

**After:**
```
✅ Detected quick action menu
🖱️ Auto-clicking first option
✅ Continuing quest
```

## Error Detection Patterns

### Error Keywords (High Priority)
```javascript
errorKeywords: [
  "sorry", "couldn't", "unable", "don't have", 
  "not available", "not found", "permission", 
  "not authorized", "can't find", "invalid",
  "doesn't exist", "no matches", "must be"
]
```

### Quick Action Indicators
```javascript
quickActionIndicators: [
  "select an option", "choose from", "please select",
  "pick one", "which would you like", "here are your options"
]
```

### Clarification Requests
```javascript
clarificationIndicators: [
  "can you clarify", "which one", "did you mean",
  "please specify", "could you be more specific"
]
```

## Benefits

### For Users
- ✅ No hard failures on permission issues
- ✅ Clear explanation of why steps skipped
- ✅ Quest completes even with partial success
- ✅ Still earn points (50% for partial completion)

### For Developers
- ✅ Better error visibility in logs
- ✅ Confidence scores for debugging
- ✅ Easy to add new error patterns
- ✅ Graceful degradation built-in

### For Product
- ✅ Works across different SF configurations
- ✅ Adapts to user permission levels
- ✅ Handles Joule quick actions automatically
- ✅ Reduces support tickets

## Configuration Guidelines

### Adding Error Keywords to New Quests

```json
{
  "action": "type_and_send",
  "prompt": "Your prompt here",
  "responseKeywords": ["expected", "success", "words"],
  "errorKeywords": ["error", "failed", "unavailable"],
  "optional": true  // Set to true if step can be skipped
}
```

### When to Make Steps Optional

**Make optional** if:
- Depends on user permissions (manager features)
- Relies on specific data (employee names)
- Feature may not be available (instance-specific)
- Purely informational (can be skipped)

**Keep required** if:
- Core navigation step
- Fundamental to quest flow
- Always available functionality

## Testing Recommendations

1. **Test as non-manager**: Verify Spot Award quest handles permission errors
2. **Test with invalid employee**: Verify employee name step skips gracefully
3. **Test in instance without spot awards**: Verify feature unavailable detection
4. **Test quick action responses**: Verify auto-clicking works
5. **Monitor logs**: Check confidence scores and detection accuracy

## Future Enhancements

1. **Pre-Quest Validation**: Check permissions before starting quest
2. **Dynamic Employee Selection**: Extract names from "Show my team" response
3. **Retry Logic**: Retry failed steps before skipping
4. **User Feedback**: Collect telemetry on skip patterns
5. **Smart Suggestions**: Recommend alternative quests based on role

---

**Version**: 1.0.4+error-handling  
**Date**: December 9, 2024  
**Status**: ✅ Implemented and ready for testing
