# 🎮 God Mode Testing Guide

## Overview

God Mode is a **testing feature** that allows you to automatically run all quests in a category without any user interaction. Perfect for regression testing, demos, and validating quest flows.

---

## Features

### 🔓 Bypasses ALL Restrictions

God Mode ignores:
- ✅ **Quest Prerequisites** (`requiresQuests`) - Runs quests even if prereqs not met
- ✅ **"Start Quest" Confirmation** - Auto-starts after 2 second story view
- ✅ **"Another Quest Running" Lock** - Force resets state between quests
- ✅ **Completion Status** - Re-runs quests even if already completed
- ✅ **Manual Progression** - Auto-advances from quest 1 → 2 → 3 → ... → N

### 📊 Result Tracking

Automatically tracks and reports:
- Total quests run
- Successful completions
- Failed quests with error details
- Success rate percentage
- Total execution duration
- Detailed error log for debugging

---

## How to Use

### Method 1: UI Button (Easiest)

1. **Open Extension**: Click the Joule Quest extension icon
2. **Select Category**: Click the tab for the journey you want to test (Employee, Manager, Agent, Sales, etc.)
3. **Click "Run All Quests"**: Red button at the top of the quest list
4. **Confirm**: Dialog will show quest count - click "Run X Quests" to start
5. **Watch**: Quests execute automatically - check console for detailed logs
6. **Review Results**: Final summary shows completion stats and errors

**Available Categories:**
- **SuccessFactors**:
  - 👤 Employee (9 quests)
  - 👔 Manager (10 quests)
  - ⚡ Agent (1 quest)

- **S/4HANA**:
  - 📊 Sales (15 quests)
  - 📦 Procurement (8 quests)
  - 🚚 Delivery (6 quests)

### Method 2: Browser Console (Advanced)

```javascript
// Run all Employee quests
await window.JouleQuestRunner.runAllQuests('employee', 'successfactors');

// Run all Manager quests
await window.JouleQuestRunner.runAllQuests('manager', 'successfactors');

// Run all Agent quests
await window.JouleQuestRunner.runAllQuests('agent', 'successfactors');

// Run all S/4HANA Sales quests
await window.JouleQuestRunner.runAllQuests('s4hana-sales', 's4hana');

// Run all S/4HANA Procurement quests
await window.JouleQuestRunner.runAllQuests('s4hana-procurement', 's4hana');

// Run all S/4HANA Delivery quests
await window.JouleQuestRunner.runAllQuests('s4hana-delivery', 's4hana');
```

---

## Console Output

### During Execution

God Mode provides color-coded console logs:

```
🎮 GOD MODE ACTIVATED: Running 9 quests in employee
📋 Quest sequence: [Quest names...]

▶️  GOD MODE [1/9] Quick Check: Time Off Stash
  [Detailed step logs...]
✅ [1/9] Quick Check: Time Off Stash COMPLETE

▶️  GOD MODE [2/9] Mission Control: My Goals
  [Detailed step logs...]
✅ [2/9] Mission Control: My Goals COMPLETE

...
```

### Final Summary

```
🎉 GOD MODE COMPLETE! 🎉
✅ Completed: 8/9
❌ Failed: 1/9
⏱️  Duration: 4m 23s

⚠️  ERRORS:
  [5] Quest Name Here
     Error details here...
```

---

## Use Cases

### 1. **Regression Testing**
After making code changes, run god mode to verify all quests still work:
```javascript
// Test all SuccessFactors quests
await window.JouleQuestRunner.runAllQuests('employee', 'successfactors');
await window.JouleQuestRunner.runAllQuests('manager', 'successfactors');
await window.JouleQuestRunner.runAllQuests('agent', 'successfactors');
```

### 2. **Demo Recordings**
Show complete journey flows for demos:
```javascript
// Run entire Sales journey for demo
await window.JouleQuestRunner.runAllQuests('s4hana-sales', 's4hana');
```

### 3. **Performance Testing**
Measure how long complete journeys take:
```javascript
// Time the full Employee journey
console.time('employee-journey');
await window.JouleQuestRunner.runAllQuests('employee', 'successfactors');
console.timeEnd('employee-journey');
```

### 4. **Error Detection**
Find which quests break in sequence:
```javascript
// Run all and check console for red ❌ failures
const results = await window.JouleQuestRunner.runAllQuests('manager', 'successfactors');
console.log('Failed quests:', results.errors);
```

---

## Technical Details

### Auto-Start Flow

```
User clicks "Run All Quests"
  ↓
Confirmation dialog shown
  ↓
User confirms → Loop starts
  ↓
For each quest:
  1. forceReset() - Clear any stuck state
  2. startQuest(quest, 'demo', true) - autoStart=true
     ↓
     showQuestStart() - Story intro (2 sec view)
     ↓
     Skip waitForQuestStartConfirmation() - Auto-proceed
     ↓
     runDemoMode() - Execute all steps automatically
     ↓
     showQuestComplete() - Brief completion view (3 sec)
  3. Continue to next quest
  ↓
All quests complete → showGodModeComplete()
```

### Error Handling

- **Non-Critical Errors**: Quest logs error, tracks as failed, continues to next quest
- **Optional Steps**: Marked as "skipped" if they fail, continues quest
- **Quest Continues**: Even if steps fail, quest proceeds (error recovery mode)
- **Complete Results**: All errors logged with quest name and details

### Lock Bypasses

```javascript
// Normal flow: Check prerequisites
if (quest.requiresQuests.every(id => completed.includes(id))) {
  // Can start quest
}

// God Mode: Ignore prerequisites completely
// Just run the quest regardless of requirements
await this.startQuest(quest, 'demo', true);
```

---

## Expected Timing

**Per Quest:**
- Story intro: 2 seconds (god mode)
- Per step: ~5-6 seconds (1.5s display + 3s success view)
- Quest completion: 3 seconds
- **Total per quest**: ~15-30 seconds depending on step count

**Full Journeys:**
- Employee (9 quests): ~3-4 minutes
- Manager (10 quests): ~4-5 minutes
- Agent (1 quest): ~30 seconds
- Sales (15 quests): ~6-8 minutes
- Procurement (8 quests): ~3-4 minutes
- Delivery (6 quests): ~2-3 minutes

---

## Troubleshooting

### "Quest Failed" Errors

**Check console for details:**
```javascript
// Last error details
console.log(window.lastQuestError);

// Full results object
const results = await window.JouleQuestRunner.runAllQuests('employee', 'successfactors');
console.log(results.errors);
```

### Selector Issues

If quests fail due to missing elements:
1. Check `src/config/selectors.json` for correct selectors
2. Verify Joule is available on the page
3. Check browser console for detailed error messages

### Stuck State

If god mode gets stuck:
```javascript
// Force reset quest runner
window.JouleQuestRunner.forceReset();

// Reload page
window.location.reload();
```

---

## Best Practices

### ✅ DO

- Run god mode on clean state (reset progress first if needed)
- Watch console logs for detailed execution info
- Test one category at a time
- Take notes on which quests fail consistently
- Use for regression testing after code changes

### ❌ DON'T

- Don't run god mode in production (testing only!)
- Don't interrupt mid-sequence (let it complete)
- Don't run multiple categories simultaneously
- Don't use for actual user training (defeats gamification purpose)

---

## Development Notes

### Code Structure

**quest-runner.js:**
- `startQuest()` - Added `autoStart` parameter (default: false)
- `runAllQuests()` - New method for sequential execution
- `forceReset()` - Clears stuck state between quests

**overlay.js:**
- "Run All Quests" button in quest selection UI
- `showGodModeComplete()` - Results summary screen
- Confirmation dialog before starting god mode

### Future Enhancements

Potential improvements:
- [ ] Add "Pause/Resume" for god mode execution
- [ ] Export test results to JSON file
- [ ] Add speed control (fast/normal/slow)
- [ ] Take screenshots at each step for visual verification
- [ ] Generate HTML test report
- [ ] Add CLI command for automated testing

---

## Example: Full Test Workflow

```javascript
// 1. Reset progress to clean state
await window.JouleQuestStorage.resetAllProgress('successfactors');

// 2. Run all categories in sequence
const employeeResults = await window.JouleQuestRunner.runAllQuests('employee', 'successfactors');
console.log('Employee:', employeeResults);

const managerResults = await window.JouleQuestRunner.runAllQuests('manager', 'successfactors');
console.log('Manager:', managerResults);

const agentResults = await window.JouleQuestRunner.runAllQuests('agent', 'successfactors');
console.log('Agent:', agentResults);

// 3. Compile overall results
const totalQuests = employeeResults.total + managerResults.total + agentResults.total;
const totalCompleted = employeeResults.completed + managerResults.completed + agentResults.completed;
const totalFailed = employeeResults.failed + managerResults.failed + agentResults.failed;

console.log(`\n📊 FULL TEST SUITE RESULTS:`);
console.log(`Total Quests: ${totalQuests}`);
console.log(`Completed: ${totalCompleted}`);
console.log(`Failed: ${totalFailed}`);
console.log(`Success Rate: ${Math.round((totalCompleted/totalQuests)*100)}%`);
```

---

## Summary

God Mode transforms manual quest testing into automated validation:

**Before God Mode:**
- Click extension → Select quest → Read story → Click Start → Wait for each step → Click Next Quest → Repeat 49 times
- **Time: 2-3 hours for full test**

**With God Mode:**
- Click extension → Click "Run All Quests" → Confirm → Watch it run → Review results
- **Time: 3-8 minutes per category**

Perfect for ensuring quest quality without manual tedium! 🎮✨
