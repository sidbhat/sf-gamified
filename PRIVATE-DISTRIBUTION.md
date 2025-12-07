# Private Distribution Guide - Joule Quest

## Yes, You Can Keep It Private!

Chrome Web Store offers multiple distribution options including **private/unlisted** distribution for select users only.

---

## Distribution Options

### 1. 🔒 **Private (Unlisted)** - RECOMMENDED FOR YOU
**Best for:** Internal company use, select testers, specific user groups

**How it works:**
- Extension is uploaded to Chrome Web Store
- **NOT listed in public search results**
- Only accessible via direct link
- You control who gets the link
- Can share with specific email addresses

**Advantages:**
✅ Google handles hosting and updates  
✅ Automatic updates for users  
✅ Professional installation experience  
✅ Chrome's security scanning  
✅ Easy to share via link  
✅ Can restrict to specific Google Workspace domains  

**Setup:**
1. Upload extension to Chrome Web Store
2. In "Distribution" section, select **"Unlisted"**
3. Share the extension URL only with intended users
4. Optionally: Restrict to specific email domains

---

### 2. 🏢 **Google Workspace Domain** - BEST FOR ENTERPRISES
**Best for:** Company-wide deployment within your organization

**How it works:**
- Upload as private extension
- Restrict to your company's Google Workspace domain
- Only users with `@yourcompany.com` emails can install
- IT admin can force-install for entire organization

**Advantages:**
✅ Complete control over who can access  
✅ Automatic deployment to employee devices  
✅ Centralized management  
✅ No public visibility  

**Requirements:**
- Google Workspace account (formerly G Suite)
- Admin access to manage apps

---

### 3. 📧 **Trusted Testers** - FOR BETA TESTING
**Best for:** Small group of beta testers before wider release

**How it works:**
- Add specific Google account emails as trusted testers
- Only those email addresses can install
- Perfect for pre-launch testing
- Maximum 100 trusted testers

**Setup:**
1. Upload extension as "Private"
2. Add tester email addresses in "Trusted Testers" section
3. Testers receive email with installation link

---

### 4. 📦 **Self-Hosted (No Chrome Store)** - MOST PRIVATE
**Best for:** Maximum control, no Google involvement

**How it works:**
- Package extension as `.crx` file
- Host on your own server
- Users manually install via Chrome settings
- NO Chrome Web Store involvement

**Disadvantages:**
❌ No automatic updates  
❌ Users must enable "Developer mode"  
❌ Security warnings on installation  
❌ More technical for end users  

---

## Recommended Approach: Private/Unlisted on Chrome Store

### Step-by-Step Setup

#### 1. Upload Extension
```bash
# Package your extension
./package-for-chrome-store.sh

# Go to Chrome Web Store Developer Dashboard
# https://chrome.google.com/webstore/devconsole

# Click "New Item" and upload ZIP
```

#### 2. Configure Privacy Settings
In the **Distribution** tab:

**Visibility:**
- Select: **"Unlisted"** (not "Public")

**This means:**
- Extension won't appear in Chrome Web Store search
- Only people with direct link can access
- Still hosted and managed by Google
- Users get automatic updates

#### 3. Optional: Restrict to Domain
If your company uses Google Workspace:

**Distribution settings:**
- Enable "Limit distribution to Google Workspace users"
- Add your domain: `yourcompany.com`
- Now ONLY users with `@yourcompany.com` can install

#### 4. Get Your Private Link
After publishing, you'll get a URL like:
```
https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID
```

**Share this link ONLY with:**
- Internal team members
- Select beta testers
- Specific departments
- Trusted users

**The link will NOT appear in:**
- Chrome Web Store search
- Public listings
- Google search results (if configured correctly)

---

## Privacy Levels Comparison

| Feature | Public | Unlisted | Google Workspace | Self-Hosted |
|---------|--------|----------|------------------|-------------|
| **Searchable** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Anyone can install** | ✅ Yes | ⚠️ With link | ❌ No | ❌ No |
| **Domain restriction** | ❌ No | ⚠️ Optional | ✅ Yes | N/A |
| **Automatic updates** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Chrome Store hosting** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **User-friendly install** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Complex |
| **Privacy level** | Low | Medium | High | Highest |

---

## Best Practice: Start Unlisted, Go Public Later

### Phase 1: Unlisted Beta (Weeks 1-4)
- Upload as "Unlisted"
- Share with 10-20 internal users
- Gather feedback
- Fix bugs
- Iterate quickly

### Phase 2: Unlisted Limited (Weeks 5-8)
- Expand to 50-100 users within company
- Monitor usage
- Collect feature requests
- Refine based on real usage

### Phase 3: Public Release (Optional)
- Change visibility to "Public"
- Open to all Chrome Web Store users
- Benefit from wider adoption
- Help other SAP customers

**You can stay in Phase 1/2 forever if you prefer!**

---

## How to Keep It Private

### ✅ DO:
1. Select "Unlisted" visibility
2. Only share link with trusted users
3. Use Google Workspace domain restriction if available
4. Monitor installation analytics
5. Keep Chrome Store listing minimal (no screenshots if preferred)

### ❌ DON'T:
1. Post extension link publicly (Twitter, LinkedIn, blogs)
2. Submit to extension directories
3. Share installation link in public forums
4. Enable "Public" visibility accidentally

---

## Manifest Changes for Private Distribution

Your manifest.json is already perfect for private distribution:

```json
{
  "name": "Joule Quest for SAP SuccessFactors",
  "version": "1.0.0",
  "description": "Master SAP Joule AI through gamified quests...",
  // No changes needed!
}
```

**No special configuration required** - just upload and select "Unlisted".

---

## Updating Private Extensions

### Version Updates
When you update the extension:

1. Increment version in manifest.json
   ```json
   "version": "1.0.1"  // was 1.0.0
   ```

2. Upload new ZIP to Chrome Web Store
3. Submit for review
4. After approval, users get **automatic updates**

**Users don't need to do anything** - Chrome auto-updates installed extensions.

---

## Cost

**Chrome Web Store Developer Account:**
- One-time registration fee: **$5**
- No recurring costs
- Unlimited extensions
- Unlimited updates
- Free hosting

**Worth it for:**
- Professional distribution
- Automatic updates
- User-friendly installation
- Chrome's security scanning

---

## FAQ

### Q: Can people find my unlisted extension?
**A:** No, it won't appear in Chrome Web Store search or Google search results. Only people with your direct link can access it.

### Q: Can I change from unlisted to public later?
**A:** Yes, you can change visibility settings anytime in the Developer Dashboard.

### Q: How many people can install an unlisted extension?
**A:** No limit. Whether 10 users or 10,000 users, all can install via the link.

### Q: Do I need a privacy policy for unlisted extensions?
**A:** Yes, Chrome Web Store requires a privacy policy for ALL extensions (public or private).

### Q: Can I have both private and public versions?
**A:** No, each extension ID can only have one visibility setting. But you can create separate extensions with different names.

### Q: Will Google review my private extension?
**A:** Yes, ALL Chrome Web Store extensions go through automated security review, even unlisted ones.

---

## Recommendation for Joule Quest

Based on your use case, I recommend:

### 🎯 **Option: Unlisted with Google Workspace Domain Restriction**

**Setup:**
1. Upload to Chrome Web Store as "Unlisted"
2. Restrict to your company's Google Workspace domain
3. Share link with specific teams/departments
4. Monitor usage and gather feedback
5. Iterate based on real-world use

**Benefits:**
- Private to your organization
- Professional deployment
- Automatic updates
- Easy to manage
- Can expand or go public later if desired

**Timeline:**
- Week 1: Upload and configure as unlisted
- Week 2-4: Internal testing with 10-20 users
- Month 2-3: Expand to broader company use
- Month 4+: Decide if you want to go public or stay private

---

## Next Steps

1. **Create icons** (see assets/ICON-INSTRUCTIONS.md)
2. **Take screenshots** (see CHROME-STORE-SUBMISSION.md)
3. **Upload to Chrome Web Store**
4. **Select "Unlisted" visibility**
5. **Share private link with select users**

No public listing required!

---

**Questions?**
- Chrome Web Store visibility settings: https://developer.chrome.com/docs/webstore/publish/#distribution
- Google Workspace app deployment: https://support.google.com/chrome/a/answer/9296680
