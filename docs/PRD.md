# Product Requirements Document
## SF Joule Mario Quest Chrome Extension

**Version**: 1.0.0  
**Last Updated**: 2025-12-07  
**Status**: Planning

---

## Executive Summary

A Chrome extension that gamifies SAP SuccessFactors Joule interactions by turning them into Mario-themed quests. Users complete quests by successfully interacting with Joule AI assistant.

---

## Goals

1. **Primary**: Make Joule interactions engaging through gamification
2. **Secondary**: Train users on Joule capabilities
3. **Tertiary**: Demonstrate Joule use cases in a fun, memorable way

---

## User Stories

### As an SF Employee
- I want to learn Joule features through fun quests
- I want to see my progress visually
- I want to earn rewards (stars, badges)

### As an SF Manager
- I want to try different Joule scenarios safely (demo mode)
- I want to explore Joule capabilities without affecting real data

### As an SF Administrator
- I want to showcase Joule functionality in demos
- I want to train teams on Joule usage

---

## Features (MVP - Phase 1)

### Must Have
- [ ] Load Chrome extension on SF pages
- [ ] Display popup with quest selection
- [ ] Execute ONE quest: "View Cost Center"
  - Step 1: Open Joule panel
  - Step 2: Send prompt "view cost center"
  - Step 3: Wait for response
- [ ] Show progress overlay on page
- [ ] Confetti animation on completion
- [ ] Demo mode (simulated responses with delays)
- [ ] Real mode (actual Joule interaction)
- [ ] Load user credentials from config
- [ ] Handle WalkMe dismissal automatically

### Nice to Have (Phase 2)
- [ ] Multiple quests (5+ scenarios covering informational/navigational/transactional)
- [ ] Multi-user support (10 user configs)
- [ ] Progress tracking with localStorage
- [ ] Quest completion history
- [ ] Shadow DOM deep traversal

### Future (Phase 3)
- [ ] AI-powered selector detection
- [ ] Custom quest creation UI
- [ ] Team leaderboards
- [ ] Analytics dashboard
- [ ] Quest builder (visual editor)

---

## Technical Requirements

### Browser Support
- Chrome 90+
- Manifest V3

### SF Compatibility
- SuccessFactors Q2 2024+
- Joule-enabled tenants
- Works with existing Playwright automation URLs

### Performance
- Extension load time: <100ms
- Quest execution: <30s per quest
- Memory footprint: <50MB

---

## User Experience

### Quest Flow
1. User clicks extension icon
2. Popup shows "View Cost Center" quest
3. User selects Demo/Real mode
4. User clicks "Start Quest"
5. Overlay appears showing progress (Step 1/3, 2/3, 3/3)
6. Each step shows emoji feedback (🔄 → ✅)
7. On completion: Confetti + "🏆 Quest Complete! ⭐⭐⭐"

### Error Handling
- If Joule button not found: Show friendly error
- If prompt fails: Retry once, then show error
- If timeout: Suggest manual completion
- Always provide clear next steps

---

## Success Metrics

- 70% quest completion rate
- <5% error rate
- User can complete quest in <2 minutes
- Works on 95% of Joule-enabled SF tenants

---

## Non-Goals (Out of Scope)

- ❌ Not a replacement for official Joule training
- ❌ Not a Joule API wrapper
- ❌ No data collection beyond local usage stats
- ❌ No modifications to SF core functionality
- ❌ No user authentication system (uses config file)

---

## Dependencies

- User's existing Playwright automation setup at:
  `/Users/I806232/Downloads/sf_automation_portal`
- Credentials from `.env` file:
  - Base URL: `https://hcm-us20-sales.hr.cloud.sap/sf/home?bplte_company=SFSALES010182`
  - Username: `m_i8062320423130513`
  - Password: `oneapp@123`
- Joule selectors from Playwright code

---

## Constraints

- Must work without backend server
- All data stored in chrome.storage
- No external API calls
- Respects SF security policies
- No credential storage in code (JSON config only)
