# Joule Iframe Selector Discovery

## CRITICAL DISCOVERY: Joule is in an IFRAME

**Date**: December 7, 2025
**Finding**: All previous selectors were wrong because they searched Shadow DOM, but Joule is actually in an iframe.

## Iframe Details

- **Location**: `uid=5_1153 Iframe "Joule"`
- **URL**: `https://sfsales010182-lxaj3a61.us10.sapdas.cloud.sap/resources/webclient/webclient.html?botName=sap_digital_assistant&defaultTheme=sap_horizon`
- **Main Domain**: Main SF page at `https://hcm-us20-sales.hr.cloud.sap/`
- **Iframe Domain**: Different domain `https://sfsales010182-lxaj3a61.us10.sapdas.cloud.sap/`

## Key Elements Inside Iframe

### 1. Input Field
- **UID**: `uid=5_1530`
- **Type**: `textbox "Message Joule..."`
- **Attributes**: `focusable focused multiline`
- **Selector**: `textbox[placeholder*="Message Joule"]` OR `textarea` (it's multiline)

### 2. Send Button
- **UID**: `uid=5_1534`
- **Type**: `button "Send"`
- **Description**: "Send"
- **Selector**: `button[description="Send"]` OR `button:has-text("Send")`

### 3. Close Button
- **UID**: `uid=5_1245`
- **Type**: `button "Close"`
- **Selector**: `button:has-text("Close")`

### 4. Fullscreen Button
- **UID**: `uid=5_1241`
- **Type**: `button "Fullscreen"`
- **Selector**: `button:has-text("Fullscreen")`

### 5. Response Container
The conversation messages are in a structured format:
- User messages: `uid=5_1307 StaticText "show me my cost center"`
- Bot responses: `uid=5_1316 StaticText "Your cost center information can be found below:"`
- Structured in `generic` containers with conversation flow

## Why Previous Selectors Failed

1. **Shadow DOM vs Iframe**: We were using `ShadowDOMHelper` to search Shadow DOM, but Joule is in a cross-origin iframe
2. **Cross-Origin Restrictions**: Cannot directly access iframe content from main page JavaScript
3. **Different DOM Trees**: Main page DOM and iframe DOM are completely separate

## Solution Required

### Option 1: Content Script Injection (RECOMMENDED)
Inject content script INTO the iframe using `manifest.json`:
```json
{
  "content_scripts": [{
    "matches": ["https://sfsales010182-lxaj3a61.us10.sapdas.cloud.sap/resources/webclient/*"],
    "js": ["src/joule-iframe-handler.js"],
    "all_frames": true
  }]
}
```

### Option 2: Message Passing Architecture
1. Main content script detects iframe
2. Posts message to iframe
3. Iframe content script receives message
4. Iframe script interacts with Joule elements
5. Iframe script posts response back
6. Main content script receives confirmation

## New Selectors (For Use INSIDE Iframe)

```json
{
  "joule": {
    "inputField": [
      "textarea",
      "textbox[placeholder*='Message Joule']",
      "[role='textbox']"
    ],
    "sendButton": [
      "button[description='Send']",
      "button:has-text('Send')"
    ],
    "closeButton": [
      "button:has-text('Close')"
    ],
    "fullscreenButton": [
      "button:has-text('Fullscreen')"
    ],
    "responseContainer": [
      "[role='main']",
      "main"
    ]
  }
}
```

## Implementation Steps

1. ✅ **DONE**: Discovered Joule is in iframe
2. ✅ **DONE**: Identified iframe URL and elements
3. **TODO**: Create `src/joule-iframe-handler.js` for iframe interaction
4. **TODO**: Update `manifest.json` to inject into iframe
5. **TODO**: Implement message passing between main page and iframe
6. **TODO**: Update `joule-handler.js` to use message passing
7. **TODO**: Test complete flow

## Testing Plan

1. Load extension
2. Open Joule (verify iframe loads)
3. Send message from extension to iframe
4. Iframe script types into input field
5. Iframe script clicks send button
6. Iframe script detects response
7. Iframe script sends confirmation back
8. Extension shows success

## Notes

- Iframe is same-origin restricted due to different subdomain
- Must use message passing or content script injection
- Cannot use `shadowDOM.findElement()` from main page
- All Joule interactions must happen INSIDE the iframe context
