# Chrome Web Store Submission Guide

## Pre-Submission Checklist

### ✅ Required Files
- [x] manifest.json (updated with v1.0.0)
- [ ] Icon files (icon-16.png, icon-48.png, icon-128.png)
- [x] All source files in /src/
- [x] README.md
- [x] Privacy-related documentation

### ✅ Code Quality
- [x] No console errors
- [x] All features working
- [x] Tested in Chrome
- [x] No security vulnerabilities
- [x] Proper error handling

### 📝 Store Listing Content
- [x] Extension name
- [x] Short description (132 chars)
- [x] Detailed description
- [x] Category (Productivity)
- [x] Permission justifications
- [ ] Screenshots (5 required)
- [ ] Promotional images
- [ ] Privacy policy URL
- [ ] Support email

## Submission Steps

### Step 1: Create Developer Account
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay one-time $5 registration fee
4. Complete developer profile

### Step 2: Prepare Package
1. **Create icons** (see assets/ICON-INSTRUCTIONS.md)
2. **Take screenshots** (see screenshot guidelines below)
3. **Create promotional tiles** (optional but recommended)
4. **Write privacy policy** (required for store submission)

### Step 3: Package Extension
```bash
# From project root
zip -r joule-quest-v1.0.0.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "*.md" \
  -x ".DS_Store" \
  -x "CHROME-STORE-*"
```

Or manually:
1. Create new folder: `joule-quest-package`
2. Copy these files/folders:
   - manifest.json
   - /src/ (entire folder)
   - /assets/ (with icons)
3. Zip the `joule-quest-package` folder

### Step 4: Upload to Chrome Web Store

1. Go to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload ZIP file
4. Fill in store listing:

   **Product details:**
   - Name: Joule Quest for SAP SuccessFactors
   - Summary: (copy from CHROME-STORE-LISTING.md)
   - Description: (copy detailed description)
   - Category: Productivity
   - Language: English

   **Store listing assets:**
   - Icon: 128x128 PNG
   - Screenshots: Upload 5 screenshots
   - Promotional tile: 440x280 (optional)
   - Marquee: 1400x560 (optional)

   **Privacy practices:**
   - Single purpose: (copy from CHROME-STORE-LISTING.md)
   - Permission justifications: (copy from CHROME-STORE-LISTING.md)
   - Data usage: "This extension does not collect, store, or transmit any user data"
   - Privacy policy URL: (your hosted privacy policy)

   **Distribution:**
   - Visibility: Public
   - Countries: All countries (or specify)
   - Pricing: Free

5. Click "Submit for Review"

### Step 5: Wait for Review
- Initial review: 1-3 business days
- Check email for status updates
- Respond promptly to any rejection reasons

## Screenshot Guidelines

### Required Screenshots (5 minimum, up to 5)

**Screenshot 1: Quest Selection Screen**
- **Size**: 1280x800 pixels
- **Title**: "Choose Your Learning Path - Employee or Manager Quests"
- **Capture**: Full quest selection overlay showing both tabs
- **Highlight**: Points, quest completion stats, quest map

**Screenshot 2: Quest Start**
- **Size**: 1280x800 pixels
- **Title**: "Quest Started - Interactive Step-by-Step Guidance"
- **Capture**: Quest start overlay with quest info

**Screenshot 3: Quest in Progress**
- **Size**: 1280x800 pixels
- **Title**: "Learn by Doing - Real Joule AI Interaction"
- **Capture**: Step overlay showing Joule response

**Screenshot 4: Quest Complete**
- **Size**: 1280x800 pixels
- **Title**: "Celebrate Success - Earn Points and Achievements"
- **Capture**: Completion screen with confetti

**Screenshot 5: Employee Quest Map**
- **Size**: 1280x800 pixels
- **Title**: "Track Your Progress - Complete All Quests"
- **Capture**: Employee quest category showing progress bar and quest nodes

### How to Capture Screenshots

1. Load extension in Chrome
2. Open SAP SuccessFactors page
3. Trigger each screen:
   - Click extension icon for quest selection
   - Start a quest for quest start screen
   - Let quest run for in-progress screen
   - Complete quest for celebration screen
4. Use built-in screenshot tools:
   - Mac: Cmd+Shift+4, then Space, click window
   - Windows: Windows+Shift+S
   - Chrome DevTools: Cmd+Shift+P → "Screenshot"
5. Crop to 1280x800 if needed
6. Save as PNG with descriptive names

## Privacy Policy Template

Create a simple privacy policy (required for Chrome Web Store):

```markdown
# Privacy Policy for Joule Quest

Last Updated: December 7, 2024

## Data Collection
Joule Quest does not collect, store, or transmit any personal data to external servers.

## Local Storage
- Quest progress and points are stored locally in your browser
- No data leaves your device
- You can reset all data at any time using the Reset button

## Permissions
- **storage**: Used to save your quest progress locally
- **activeTab**: Used to interact with SAP SuccessFactors pages
- **scripting**: Used to display quest overlays and guidance
- **host_permissions**: Limited to SAP domains for security

## Third-Party Services
This extension does not use any third-party analytics, tracking, or advertising services.

## Data Security
All data is stored locally using Chrome's secure storage API. No data is transmitted over the network.

## Contact
For questions or concerns: [Your Email]

## Changes to Policy
We will update this policy if our practices change. Check the "Last Updated" date above.
```

Host this on:
- GitHub Pages (free)
- Your website
- Google Sites (free)

## Support Resources

### Support Email
Set up a dedicated support email:
- Format: joulequest.support@[yourdomain].com
- Or use: support+joulequest@gmail.com

### Documentation Links
- GitHub Repository: https://github.com/sidbhat/sf-gamified
- Installation Guide: Link to INSTALL.md
- User Guide: Link to README.md

## Common Rejection Reasons & How to Avoid

### 1. ❌ Missing Icons
- **Solution**: Create all 3 required icon sizes before submission

### 2. ❌ Insufficient Screenshots
- **Solution**: Include at least 5 high-quality screenshots showing key features

### 3. ❌ Unclear Permissions
- **Solution**: Provide detailed justifications for each permission (done in manifest)

### 4. ❌ Missing Privacy Policy
- **Solution**: Host privacy policy and include URL in submission

### 5. ❌ Misleading Description
- **Solution**: Clearly state this is a training tool, not official SAP software

### 6. ❌ Broken Functionality
- **Solution**: Test thoroughly before submission

## After Approval

### 1. Update README.md
Add Chrome Web Store badge:
```markdown
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/YOUR_EXTENSION_ID.svg)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
```

### 2. Promote Your Extension
- Share on LinkedIn
- Post in SAP Community
- Share in SuccessFactors user groups
- Add to company internal tools list

### 3. Monitor Reviews
- Respond to user feedback
- Address bug reports promptly
- Update extension regularly

## Version Updates

When updating the extension:
1. Update version in manifest.json (follow semver)
2. Update CHANGELOG.md
3. Create new ZIP package
4. Upload to Chrome Web Store
5. Provide changelog in update notes

## Estimated Timeline

- **Icon Creation**: 1-4 hours (DIY) or 1-3 days (designer)
- **Screenshots**: 30 minutes
- **Privacy Policy**: 30 minutes
- **Store Setup**: 1 hour
- **Review Process**: 1-3 business days
- **Total**: ~1 week for first submission

## Next Steps

1. ✅ Manifest updated with proper name/description
2. ⏳ Create icons (see assets/ICON-INSTRUCTIONS.md)
3. ⏳ Take 5 screenshots
4. ⏳ Write and host privacy policy
5. ⏳ Set up support email
6. ⏳ Package extension as ZIP
7. ⏳ Submit to Chrome Web Store

## Questions?

- Chrome Web Store Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Chrome Extension Publishing Guide: https://developer.chrome.com/docs/webstore/publish/
