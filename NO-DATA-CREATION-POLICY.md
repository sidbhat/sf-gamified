# No Data Creation Policy

## Overview
All quests are designed to be **read-only demonstrations** that do NOT create or submit any real data in the SAP SuccessFactors system. The extension shows users the complete workflow but stops short of actually submitting data.

## Data-Safe Quest Design

### Modified Quests

The following quests were modified to prevent data creation:

#### 1. **"Give Spot Award"** (manager-spot-award)
- **Original**: Step 6 clicked "Send" button to submit award
- **Modified**: Step 6 is now "Review Award" (wait action)
- **User Experience**: Quest completes showing the filled-out award form
- **Message**: "✨ Quest complete! Click 'Send' to submit the award (optional). 🏆"
- **Result**: User can manually click Send if they want, but extension doesn't do it

#### 2. **"AI Goal Creation"** (agent-create-goal-ai)
- **Original**: Step 7 clicked "Save" button to save goal
- **Modified**: Step 7 is now "Review Generated Goal" (wait action)
- **User Experience**: Quest completes showing the AI-generated goal
- **Message**: "🎉 Quest complete! Click 'Save' to create the goal (optional). 🏆"
- **Result**: User can manually click Save if they want, but extension doesn't do it

### Read-Only Quests (No Changes Needed)

These quests only READ data and never create/modify anything:

✅ **Employee Journey:**
- View Leave Balance - Queries Joule for leave info
- Show My Goals - Displays existing goals
- View Cost Center - Shows cost center info
- Company Rental Car Policy - Reads policy document
- Request Time Off - Only shows the form, doesn't submit
- View My Assigned Learning - Displays learning courses

✅ **Manager Journey:**
- Pending Approvals - Lists pending items
- Show My Team - Displays team members + clicks Profile (read-only)

## Technical Implementation

### Wait Action Pattern

Both modified quests use the `wait` action for their final step:

```json
{
  "id": 6,
  "name": "Review Award",
  "description": "Quest complete! You can now click 'Send' if you want to submit the award.",
  "action": "wait",
  "duration": 3000,
  "successMessage": "✨ Quest complete! Click 'Send' to submit the award (optional). 🏆"
}
```

**Benefits:**
- Quest completes successfully
- User sees the complete workflow
- No data is committed to system
- User has option to manually submit if desired
- Clear messaging about optional manual submission

### What About "Request Time Off"?

The **"Request Time Off"** quest sends "Request time off for tomorrow" to Joule, which might:
- Show a form for the user to fill out (read-only)
- OR start a submission flow (potential write)

**Current Status**: Left unchanged because:
1. Joule typically shows a form for review before submission
2. User would need to confirm/submit manually
3. Quest ends after Joule's response, before any final submission

If this quest is found to auto-submit, it should be modified similarly.

## User Experience Flow

### Spot Award Quest (Manager)
```
1. Open Joule ✓
2. Request Spot Award ✓
3. Enter Employee Name (Jada Baker) ✓
4. Enter Award Amount (1) ✓
5. Enter Award Message ✓
6. Review Award ✓ → Shows filled form
   💡 User can manually click "Send" if desired
```

### Goal Creation Quest (Agent)
```
1. Navigate to Goals List ✓
2. Open Goal Creation Form ✓
3. Enter Goal Description ✓
4. Generate Goal with AI ✓
5. Wait for AI Generation ✓
6. View Complete Goal ✓
7. Review Generated Goal ✓ → Shows AI-generated content
   💡 User can manually click "Save" if desired
```

## Benefits of This Approach

### For Users:
- ✅ Complete workflow demonstration
- ✅ No risk of accidental data creation
- ✅ Can practice without consequences
- ✅ Option to manually submit if they want

### For Developers:
- ✅ Safe for demos and presentations
- ✅ No cleanup needed after quest runs
- ✅ Works in production without side effects
- ✅ Can be run repeatedly on same account

### For Organizations:
- ✅ No test data pollution
- ✅ Safe for training environments
- ✅ No audit trail clutter
- ✅ Respects data governance policies

## Verification Checklist

Before adding new quests, verify:

- [ ] Does quest click any "Submit", "Send", "Save", or "Create" buttons?
- [ ] Does quest call any API endpoints that write data?
- [ ] Does quest trigger any approval workflows?
- [ ] Does quest modify any system records?
- [ ] Does quest create any transactions?

If **YES** to any above:
→ Change final step to `wait` action with optional manual submission message

## Future Quest Guidelines

### ✅ SAFE Actions:
- Reading/viewing data
- Navigating between pages
- Typing into fields (without submitting)
- Clicking buttons that open read-only views
- Scrolling, expanding sections
- Clicking "Generate" for AI suggestions (if no auto-save)

### ⚠️ UNSAFE Actions (Need Review):
- Clicking Submit/Send/Save buttons
- Clicking Approve/Reject on workflows
- Clicking Delete/Remove
- Any action that commits changes
- Any action that sends notifications

### 🔴 FORBIDDEN Actions:
- Auto-submitting forms
- Auto-saving generated content
- Auto-approving requests
- Auto-creating records
- Any destructive operations

---

**Policy Established**: December 9, 2024  
**Version**: 1.0.4  
**Status**: ✅ All quests verified safe
