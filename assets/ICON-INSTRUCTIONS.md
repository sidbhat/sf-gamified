# Icon Creation Instructions for Joule Quest

## Required Icons

You need to create 3 PNG icons for Chrome Web Store submission:

1. **icon-16.png** (16x16 pixels)
2. **icon-48.png** (48x48 pixels)
3. **icon-128.png** (128x128 pixels)

## Design Specifications

### Visual Elements
- **Primary Symbol**: 🎯 Target/bullseye (represents quests and goals)
- **Background**: Purple gradient (#667eea to #764ba2)
- **Style**: Modern, flat design with subtle depth
- **Optional**: Add sparkle/star elements to represent gamification

### Design Guidelines

**Color Palette:**
- Primary Purple: #667eea
- Secondary Purple: #764ba2
- Accent Gold: #ffd700 (for sparkle/achievement elements)
- White: #ffffff (for target symbol)

**Layout:**
```
┌─────────────────┐
│   ╭─────────╮   │
│   │  PURPLE │   │
│   │ GRADIENT│   │
│   │    🎯   │   │
│   │         │   │
│   ╰─────────╯   │
└─────────────────┘
```

### Quick Creation Options

#### Option 1: Use Online Tools
1. Go to https://favicon.io/ or https://www.canva.com
2. Create 128x128 square design
3. Use target emoji 🎯 on purple gradient background
4. Export as PNG
5. Resize to create 48x48 and 16x16 versions

#### Option 2: Use Figma/Sketch
1. Create 128x128 artboard
2. Add purple gradient background (#667eea to #764ba2, diagonal)
3. Add white target/bullseye symbol in center
4. Optional: Add small gold star/sparkle in corner
5. Export at 1x, 0.375x (48px), and 0.125x (16px)

#### Option 3: Simple Placeholder (For Testing)
Create simple colored squares as placeholders:
```bash
# Using ImageMagick (if installed):
convert -size 128x128 gradient:#667eea-#764ba2 assets/icon-128.png
convert -size 48x48 gradient:#667eea-#764ba2 assets/icon-48.png
convert -size 16x16 gradient:#667eea-#764ba2 assets/icon-16.png
```

## Icon Checklist

- [ ] Create icon-128.png (primary for Chrome Web Store)
- [ ] Create icon-48.png (extensions page)
- [ ] Create icon-16.png (browser toolbar)
- [ ] Verify all are PNG format
- [ ] Verify exact pixel dimensions
- [ ] Test icons look good at all sizes
- [ ] Place in `/assets/` directory

## Testing Your Icons

After creating icons:
1. Place them in `/assets/` directory
2. Reload extension in chrome://extensions
3. Check toolbar icon (16x16)
4. Check extensions page (48x48)
5. Verify they're clear and recognizable

## Professional Icon Services (Optional)

If you want professional icons:
- **Fiverr**: Search "chrome extension icon design" ($10-50)
- **99designs**: Contest-based icon design ($199+)
- **Upwork**: Hire a designer ($50-200)

Provide them with:
- This document
- Purple gradient colors
- Target/quest theme
- Gamification concept

## Current Status

⚠️ **PLACEHOLDER ICONS NEEDED**

The manifest.json references these icons but they don't exist yet. You must create them before submitting to Chrome Web Store.

Temporary workaround for local testing:
- Extension will work without icons
- Chrome will show default extension icon
- Must add real icons before store submission
