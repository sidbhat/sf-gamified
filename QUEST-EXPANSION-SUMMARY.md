# Quest Expansion Summary - December 2025

## Overview

Expanded Joule Quest from 10 to 19 total scenarios, organized into progressive waves that unlock as users complete quests. All new scenarios follow proven patterns from existing quests and comply with the NO DATA SUBMISSION policy.

---

## 📊 Quest Structure

### **Total: 19 Quests**
- **Employee Journey:** 9 quests (3 waves)
- **Manager Journey:** 9 quests (3 waves)
- **AI Agent Workflows:** 1 quest

---

## 🎮 Employee Journey (9 Quests)

### **Wave 1: Always Visible (3 quests)**
1. ⏱️ **Quick Check: Time Off Stash** - "View my leave balance" ✅ Existing
2. 🎯 **Mission Control: My Goals** - "Show me my goals" ✅ Existing
3. 💰 **Money Trail: Find My Cost Center** - "Show me my cost center" ✅ Existing

### **Wave 2: Unlock at 3 completions (3 quests)**
4. 🚗 **Road Rules: Rental Policy** - "What is the company policy on rental cars?" ✅ Existing
5. 🌴 **Boss Level: Tomorrow Off** - "Request time off for tomorrow" ✅ Existing
6. 📚 **Power-Up: Learning Path** - "View my assigned learning" ✅ Existing

### **Wave 3: Unlock at 6 completions (3 quests) - NEW**
7. 📧 **Contact Check: View My Email** - "View email" ⭐ NEW
8. 💼 **Career Path: View My Job Info** - "View job" ⭐ NEW
9. 🎂 **Birthday Tracker: My Celebration** - "View birthday" ⭐ NEW

---

## 👔 Manager Journey (9 Quests)

### **Wave 1: Always Visible (2 quests)**
1. ⚡ **Lightning Round: Approval Spree** - "Show my pending approvals" ✅ Existing
2. 👥 **Squad Check: Meet Your Team** - "Show my direct reports" ✅ Existing

### **Wave 2: Unlock at 2 completions (3 quests)**
3. 🏅 **Hero Moment: Recognize Excellence** - "Give Spot Award" → "Jada Baker" → "1" → Message ✅ Existing
4. 💬 **Feedback Master: Give Kudos** - "Give feedback" → "Jada Baker" ⭐ NEW
5. 📊 **Team Intel: Hire Dates** - "View team's hire dates" ⭐ NEW

### **Wave 3: Unlock at 5 completions (4 quests) - NEW**
6. 💰 **Compensation Wizard: Team Insights** - "Show me compensation insight" → "Jada Baker" ⭐ NEW
7. 📈 **Data Detective: View Metrics** - "Show me some workforce metrics" ⭐ NEW
8. 🎯 **Goal Guru: Request Feedback** - "Request feedback" → "Jada Baker" ⭐ NEW
9. 🔍 **People Search: Team Profiles** - "View worker profile" → "Jada Baker" ⭐ NEW

---

## 🤖 AI Agent Workflows (1 Quest)

1. 🤖 **AI Wizard: Goal Generator** - Navigate to goals + AI generation ✅ Existing

---

## 🔧 Implementation Details

### **Step Patterns Used**

#### **Pattern 1: Simple View Query (Single Prompt)**
Used for: Employee email, job, birthday, Manager team hire dates, metrics

```javascript
Steps:
1. Open Joule (click joule.chatButton)
2. Type prompt and send (e.g., "View email")
```

#### **Pattern 2: Query with Employee Name (Two Prompts)**
Used for: Manager feedback, compensation, request feedback, worker profile

```javascript
Steps:
1. Open Joule (click joule.chatButton)
2. Type prompt (e.g., "Give feedback")
3. Type "Jada Baker" when asked
```

### **Progressive Unlock Logic**

All new quests use the `requiresQuests` array:

```javascript
"requiresQuests": [
  "employee-leave-balance",
  "employee-my-goals",
  "employee-cost-center",
  "employee-rental-policy",
  "employee-request-time-off",
  "employee-assigned-learning"
]
```

### **NO DATA SUBMISSION Policy**

All quests stop before any Submit/Send/Confirm buttons:
- Final step is `action: "wait"` with message "Quest complete! Click 'Send' to submit (optional)"
- Uses `optional: true` flag on steps that approach submission
- Maintains demo/documentation purpose without creating real data

---

## 📝 Source: Demo Companion Guide

All new scenarios extracted from:
- **Document:** `DemoCompanionGuide (3).pdf`
- **Date:** August 2025
- **Section:** 3.1 Employee & 3.3 Manager scenarios
- **Pages:** 8-77 (Joule-specific scenarios only)

Excluded scenarios:
- ❌ Create HR Case (data creation)
- ❌ Change Working Time (data modification)
- ❌ Change Address (data modification)
- ❌ WalkMe scenarios (non-Joule)
- ❌ ESM case management (non-Joule)

---

## 🎯 Key Features

### **1. Browse All Scenarios**
- All 19 quests visible in quests.json
- Main journey view shows only unlocked quests
- "Browse All" feature shows complete list with lock status

### **2. Progressive Reveal**
- Wave 1: Always visible (starter quests)
- Wave 2: Unlocks after completing Wave 1
- Wave 3: Unlocks after completing Waves 1-2

### **3. Consistent Patterns**
- All new quests follow existing working implementations
- Same step structure as proven quests
- Consistent success messages and keywords
- Rock-solid error handling

### **4. Engaging Names**
- Quest names use action-oriented language
- Taglines provide quick context
- Victory texts celebrate completion
- Emojis enhance visual appeal

---

## 📚 Usage as Documentation

The quest system now serves dual purpose:

1. **Interactive Tutorial:** Progressive learning path for users
2. **Documentation Cheatsheet:** "Browse All" shows complete Joule command reference

Users can:
- Search for specific Joule commands
- See exact prompts and expected responses
- Learn multi-step flows (e.g., Spot Award)
- Test scenarios without creating data

---

## 🚀 Next Steps (Optional Enhancements)

### **Phase 2 Expansion (Future)**
Additional scenarios from Demo Guide that could be added:
- View phone number
- View pronouns
- View timezone
- View title
- View department/division
- View peers
- Show HR cases

### **UI Enhancements**
- Search/filter in "Browse All" modal
- Quest categories/tags
- Completion stats dashboard
- Export quest list as PDF/CSV

---

## ✅ Validation Checklist

- [x] All 19 quests follow existing patterns
- [x] Progressive unlock logic implemented
- [x] NO DATA SUBMISSION policy enforced
- [x] Consistent step structure
- [x] Employee name standardized (Jada Baker)
- [x] Engaging names and descriptions
- [x] Source documentation referenced
- [x] Ready for "Browse All Scenarios" feature

---

## 📦 Files Modified

1. **src/config/quests.json** - Expanded from 10 to 19 quests
2. **QUEST-EXPANSION-SUMMARY.md** - This documentation file

---

**Status:** ✅ Complete and ready for testing
**Date:** December 10, 2025
**Version:** v1.1.0 (Quest Expansion)
