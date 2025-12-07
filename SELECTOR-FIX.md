# How to Fix Joule Selectors

## The Problem

The extension is looking for: `button[aria-label='Chat with Joule']`

But this selector doesn't exist on your SAP SF page.

## How to Find the Correct Selector

### Step 1: Find Joule Button on Your Page

1. Look at your SAP SF page
2. Find the Joule/AI assistant button (usually bottom-right corner)
3. **Right-click on the button** → **Inspect**

### Step 2: Identify the Button's Attributes

In the DevTools Elements panel, you'll see something like:

```html
<!-- Example - your actual HTML may be different -->
<button class="sapMBtn" data-sap-ui="..." aria-label="AI Assistant">
  <span>Joule</span>
</button>
```

**Look for these attributes**:
- `class` - e.g., `class="joule-btn"` or `class="sapMBtn"`
- `aria-label` - e.g., `aria-label="AI Assistant"`
- `id` - e.g., `id="joule-button"`
- `data-*` attributes - e.g., `data-control-name="jouleChat"`

### Step 3: Update selectors.json

Open: `/Users/I806232/Downloads/gamified-sf/src/config/selectors.json`

Find the `chatButton` section:
```json
"chatButton": [
  "button[aria-label='Chat with Joule']",
  ...
]
```

Replace with YOUR button's selector:
```json
"chatButton": [
  "button[aria-label='YOUR_ACTUAL_ARIA_LABEL']",
  "button.YOUR_ACTUAL_CLASS",
  "#YOUR_BUTTON_ID",
  "//button[contains(text(), 'Joule')]"
]
```

### Step 4: Reload and Test

1. Go to `chrome://extensions/`
2. Click reload 🔄 on "SF Joule Mario Quest"
3. Refresh your SAP SF page (F5)
4. Try the quest again

## Common SAP SF Joule Selectors

Try these if you can't inspect the button:

```json
"chatButton": [
  "button[aria-label='AI Assistant']",
  "button[title='Joule']",
  "button.sapMBtn[aria-label*='Joule']",
  "button[data-control-name*='joule']",
  "#joule-chat-button",
  "button.joule-button",
  "//button[contains(@aria-label, 'AI')]",
  "//button[contains(text(), 'Joule')]"
]
```

## Quick Test Method

**In DevTools Console**, try these commands to find your button:

```javascript
// Test different selectors
document.querySelector("button[aria-label='AI Assistant']")
document.querySelector("button[title='Joule']")
document.querySelector("button.sapMBtn")

// Look for all buttons with "Joule" or "AI" in text
Array.from(document.querySelectorAll('button')).filter(b => 
  b.textContent.includes('Joule') || b.textContent.includes('AI')
)
```

Whichever command returns the button is your correct selector!

## Example: Complete Fix

If you find the button is: `<button class="ai-chat-btn" aria-label="AI Assistant">`

Update `src/config/selectors.json`:

```json
{
  "joule": {
    "chatButton": [
      "button.ai-chat-btn",
      "button[aria-label='AI Assistant']",
      "//button[contains(@class, 'ai-chat')]"
    ],
    "inputField": [
      "textarea[placeholder*='Ask']",
      "input[placeholder*='Ask']",
      "//textarea[contains(@placeholder, 'Ask')]"
    ],
    ...
  }
}
```

## Need Help?

If you can't find the selector:
1. Take a screenshot of the button's HTML in DevTools
2. Or tell me what attributes you see
3. I'll help you create the correct selector

---

**Once selectors are fixed, the quest will run perfectly!** 🍄
