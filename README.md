# 🎮 SF Joule Mario Quest

> Transform SAP SuccessFactors Joule training into fun, Mario-themed quests!

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## What is This?

A Chrome extension that makes learning SAP Joule **actually fun**. Complete Mario-themed quests by interacting with Joule AI assistant. Earn stars ⭐, unlock badges 🏆, and celebrate with confetti 🎉!

**Perfect for:**
- 🎓 Training new SF users on Joule
- 🎯 Demonstrating Joule capabilities in sales demos
- 🧪 Testing Joule scenarios safely (Demo mode)
- 🎮 Making SAP training enjoyable

---

## Quick Start

### 1. Install Extension

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the `sf-joule-mario-quest` folder

### 2. Configure Users

Edit `src/config/users.json` with your SF credentials:

```json
{
  "users": [
    {
      "id": 1,
      "name": "Your Name",
      "username": "your_sf_username",
      "password": "your_password",
      "roles": ["employee", "manager"],
      "tenant_url": "https://your-tenant.successfactors.com/sf/home",
      "avatar": "👨‍💼"
    }
  ]
}
```

⚠️ **Security Note**: Keep `users.json` private. Do NOT commit credentials to Git.

### 3. Start a Quest

1. Open your SAP SuccessFactors page
2. Click the extension icon (🍄)
3. Select **Demo mode** (safe, no real actions) or **Real mode**
4. Click **"🎮 Start Quest"**
5. Watch the magic happen! ✨

---

## Features

### 🎯 Current Quests

#### Quest 1: View Cost Center (Easy)
- **Steps**: Open Joule → Send prompt → Get response
- **Rewards**: ⭐⭐⭐ + 🏆 Cost Center Master badge
- **Time**: ~30 seconds

### 🎭 Two Modes

**Demo Mode** (Recommended for learning):
- Safe simulated responses
- No actual Joule interaction
- Perfect for training and screenshots

**Real Mode** (For power users):
- Actual Joule AI interaction
- Real data from your SF tenant
- Requires Joule to be enabled

### 🎨 Mario Theme

- 🍄 Mushroom power-ups
- ⭐ Star rewards
- 🏰 Castle checkpoints
- 🎊 Confetti celebrations
- Emoji-based graphics (no copyright issues!)

---

## How It Works

```
1. You click "Start Quest"
        ↓
2. Extension opens Joule panel
        ↓
3. Sends prompt: "view cost center"
        ↓
4. Waits for Joule response
        ↓
5. Shows progress overlay
        ↓
6. 🎉 Confetti celebration!
```

---

## Configuration

### Add More Quests

Edit `src/config/quests.json`:

```json
{
  "quests": [
    {
      "id": "quest_your_quest",
      "name": "🎯 Your Quest Name",
      "steps": [
        {
          "action": "open_joule",
          "name": "Step 1"
        },
        {
          "action": "send_prompt",
          "prompt": "your joule prompt here"
        }
      ]
    }
  ]
}
```

### Add More Users

Add entries to `src/config/users.json` with different roles (employee, manager, recruiter).

---

## Troubleshooting

### Extension doesn't load
- Check Chrome version (need 90+)
- Verify "Developer mode" is enabled
- Check Console for errors (F12)

### Joule button not found
- Ensure Joule is enabled on your SF tenant
- Check `src/config/selectors.json` for selector updates
- Try Demo mode first to verify extension works

### Quest times out
- Increase timeout in quest config
- Check network connection
- Verify Joule is responding (try manual interaction)

### WalkMe blocking the view
- Extension auto-dismisses WalkMe
- If it persists, close manually once

---

## Development

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md)

### Project Structure
```
src/
├── core/         # Business logic
├── ui/           # UI components
├── config/       # JSON configurations
└── utils/        # Helper functions

docs/             # All documentation
tests/            # Test files
assets/           # Icons and static files
```

### Key Technologies
- Vanilla JavaScript (ES6+)
- Chrome Extension APIs (Manifest V3)
- JSON-driven configuration
- MutationObserver for async detection

---

## Roadmap

- ✅ **Phase 1** (Week 1): MVP with 1 quest
- 🔄 **Phase 2** (Week 2-3): 5 quests covering all Joule use cases
- 📅 **Phase 3** (Month 2): Analytics dashboard, badges
- 🚀 **Phase 4** (Month 3+): Quest builder, community features

See [ROADMAP.md](docs/ROADMAP.md) for details.

---

## FAQ

**Q: Is this official SAP software?**  
A: No, this is an independent community project.

**Q: Do I need SAP Joule enabled?**  
A: For Real mode, yes. Demo mode works without Joule.

**Q: Can I create custom quests?**  
A: Yes! Edit `src/config/quests.json` (visual builder coming in Phase 4).

**Q: Is my data safe?**  
A: Yes. Everything stays local in your browser. No data sent to external servers.

**Q: Can I use this for training my team?**  
A: Absolutely! Demo mode is perfect for safe training.

---

## Credits

- **Joule Selectors**: Extracted from [sf_automation_portal](https://github.com/user/sf_automation_portal)
- **Confetti Animation**: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC License)
- **Emoji Graphics**: Public domain emoji fonts

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

- 📖 Read the [docs](docs/)
- 🐛 Report bugs via GitHub Issues
- 💡 Request features via GitHub Discussions
- 📧 Contact: [Your email]

---

**Made with ❤️ for the SAP Community**

🍄 Press Start to Begin Your Quest! 🍄
