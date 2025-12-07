# Privacy Policy for Joule Quest

**Last Updated:** December 7, 2024

## Overview

Joule Quest for SAP SuccessFactors ("the Extension") is committed to protecting your privacy. This privacy policy explains how we handle data in our Chrome extension.

## Data Collection

**We do not collect any personal data.**

Joule Quest does not:
- Collect personal information
- Track user behavior
- Send data to external servers
- Use analytics or tracking services
- Store data in the cloud
- Share data with third parties

## Local Storage Only

All data is stored **locally** in your browser using Chrome's secure storage API:

**What we store locally:**
- Quest completion status (which quests you've completed)
- Points earned (your total score)
- Quest progress (your current position in active quests)
- User preferences (demo mode vs. practice mode)

**Important:**
- This data NEVER leaves your device
- No network transmission occurs
- You can delete all data at any time using the "Reset" button
- Uninstalling the extension removes all stored data

## Permissions Explained

The extension requires specific permissions to function:

### storage
**Purpose:** Save your quest progress and points locally in your browser  
**Data:** Quest completion status, points, preferences  
**Location:** Local browser storage only  

### activeTab
**Purpose:** Interact with SAP SuccessFactors pages you're viewing  
**Scope:** Only active when you're on SAP pages  
**Use:** Display quest overlays and guidance  

### scripting
**Purpose:** Inject quest interface elements into SAP pages  
**Scope:** Limited to SAP SuccessFactors domains  
**Use:** Show step-by-step quest guidance  

### host_permissions
**Domains:** Only SAP domains (*.successfactors.com, *.hr.cloud.sap, etc.)  
**Purpose:** Ensure extension only works on authorized SAP sites  
**Security:** Prevents extension from running on non-SAP pages  

## Third-Party Services

**We do not use any third-party services:**
- No analytics (Google Analytics, etc.)
- No tracking pixels
- No advertising networks
- No data brokers
- No cloud storage services
- No external APIs (except SAP's own Joule)

## SAP SuccessFactors Integration

The extension interacts with SAP's Joule AI feature:
- Sends prompts to Joule (same as typing manually)
- Reads Joule responses (same as viewing in the UI)
- Does NOT intercept or store SAP data
- Does NOT access HR records or sensitive information
- Only automates user actions you could perform manually

## Data Security

**Local Storage Security:**
- Uses Chrome's secure storage API
- Protected by Chrome's sandboxing
- Encrypted by Chrome's built-in security
- Only accessible by this extension

**No Network Transmission:**
- Zero data leaves your device
- No external servers contacted
- No API calls to third parties
- All operations are local

## User Control

**You have complete control:**
- ✅ Reset all data anytime (Reset button)
- ✅ Uninstall extension to remove all data
- ✅ View quest progress anytime
- ✅ No account creation required
- ✅ No registration or login

## Children's Privacy

This extension is intended for SAP SuccessFactors users (typically employees and managers in enterprise environments). We do not knowingly collect information from children under 13.

## Changes to This Policy

If we make changes to this privacy policy:
- We will update the "Last Updated" date above
- Significant changes will be announced in extension updates
- Continued use after changes indicates acceptance

## Open Source

Joule Quest is open source:
- Review the code: https://github.com/sidbhat/sf-gamified
- Verify our privacy claims
- Audit the code yourself
- Contribute improvements

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- No data collection = no compliance concerns

## Contact & Support

**Questions about privacy?**
- Email: [Add your support email]
- GitHub Issues: https://github.com/sidbhat/sf-gamified/issues
- Review the code: https://github.com/sidbhat/sf-gamified

**Report Security Issues:**
If you discover a security vulnerability, please report it responsibly via email rather than public GitHub issues.

## Your Rights

Since we don't collect any data:
- No data to request
- No data to delete (except local storage you control)
- No data to export
- No data to correct

You have complete control via your browser's extension settings and the Reset button.

## Legal Disclaimer

This extension is an **unofficial training tool** created to enhance SAP Joule learning. It is not affiliated with, endorsed by, or officially connected to SAP SE or any of its subsidiaries.

SAP and SuccessFactors are trademarks of SAP SE.

## Summary

**In Plain English:**
- We don't collect anything
- Everything stays on your computer
- You can delete everything anytime
- No tracking, no analytics, no servers
- Just local quest progress tracking

That's it. Simple and private.

---

*This privacy policy is effective as of December 7, 2024 and applies to version 1.0.0 and later.*
