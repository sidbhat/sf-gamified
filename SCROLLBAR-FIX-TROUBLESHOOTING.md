# Scrollbar Visibility Issue - Troubleshooting Guide

## Problem
Dark/low-opacity scrollbars keep appearing even after CSS fixes are applied.

## Root Causes & Solutions

### 1. Browser Cache (Most Likely)
**Symptom**: Changes don't appear after reloading extension  
**Solution**:
```bash
# For Chrome/Edge:
1. Go to chrome://extensions/
2. Toggle extension OFF then ON
3. Or click "Remove" and reload the unpacked extension
4. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

# For development:
- Use "Disable cache" in DevTools Network tab (must keep DevTools open)
- Or use Incognito/Private mode for testing
```

### 2. CSS Specificity Issues
**Problem**: Browser default styles or other CSS rules overriding scrollbar styles  
**Solution**: Add `!important` to critical scrollbar properties

**Updated CSS** (if cache clearing doesn't work):
```css
.quest-map-selection::-webkit-scrollbar {
  width: 8px !important;
}

.quest-map-selection::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.25) !important;
  border-radius: 4px !important;
}

.quest-map-selection::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.6) !important;
  border-radius: 4px !important;
}

.quest-map-selection::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8) !important;
}
```

### 3. Content Script CSS Injection Timing
**Problem**: CSS loads after page renders, causing flash of unstyled scrollbars  
**Current setup**: CSS injected via manifest.json content_scripts (correct approach)

### 4. Browser Dark Mode Override
**Problem**: System dark mode affecting scrollbar colors  
**Solution**: Explicitly set scrollbar colors (already done in v1.0.2)

### 5. Multiple CSS Files Conflicting
**Check**: Ensure no other stylesheets override these rules  
**Status**: ✅ Only `overlay.css` has scrollbar styles for `.quest-map-selection`

## Verification Steps

### For Development Testing:
1. **Clear extension cache**:
   ```bash
   # Remove and reload extension
   chrome://extensions/ → Remove → Load unpacked
   ```

2. **Verify CSS is loaded**:
   ```javascript
   // In DevTools Console on SF page:
   const overlay = document.querySelector('.quest-map-selection');
   const styles = window.getComputedStyle(overlay, '::-webkit-scrollbar');
   console.log(styles); // Should show width: 8px
   ```

3. **Check CSS file**:
   ```bash
   # Verify overlay.css contains updated rules
   grep -A 10 "quest-map-selection::-webkit-scrollbar" src/ui/overlay.css
   ```

### For Production (Chrome Web Store):
1. **Increment version**: Done (v1.0.2)
2. **Create new zip**: Done
3. **Upload to store**: Users will get fresh CSS automatically

## Current Implementation (v1.0.2)

**File**: `src/ui/overlay.css` (lines ~553-568)
```css
.quest-map-selection::-webkit-scrollbar {
  width: 8px;
}

.quest-map-selection::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}

.quest-map-selection::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.quest-map-selection::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8);
}
```

**Changes from original**:
- Width: 4px → 8px (more visible)
- Track: 8% → 25% opacity (3x lighter)
- Thumb: 15% → 60% opacity (4x lighter)
- Hover: 30% → 80% opacity (2.6x lighter)

## If Problem Persists

### Add `!important` flags:
```bash
# Update src/ui/overlay.css with !important
sed -i '' 's/width: 8px;/width: 8px !important;/g' src/ui/overlay.css
sed -i '' 's/background: rgba(255, 255, 255, 0.25);/background: rgba(255, 255, 255, 0.25) !important;/g' src/ui/overlay.css
# ... etc for all properties
```

### Or use inline styles (last resort):
```javascript
// In overlay.js, after creating .quest-map-selection element:
const style = document.createElement('style');
style.textContent = `
  .quest-map-selection::-webkit-scrollbar { width: 8px !important; }
  .quest-map-selection::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.25) !important; }
  .quest-map-selection::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.6) !important; }
  .quest-map-selection::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.8) !important; }
`;
document.head.appendChild(style);
```

## Testing Checklist

- [ ] Extension reloaded (toggle OFF/ON)
- [ ] Browser hard refresh (Cmd+Shift+R)
- [ ] DevTools cache disabled
- [ ] Inspected scrollbar in DevTools (computed styles)
- [ ] Tested in Incognito mode
- [ ] Verified overlay.css contains new values
- [ ] Checked for CSS conflicts with other rules

---

**Last Updated**: December 9, 2025  
**Version**: 1.0.2  
**Status**: Fixed in code, may require cache clearing to see changes
