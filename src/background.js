/**
 * Background Service Worker - Handles extension lifecycle and message routing
 * Manifest V3 service worker for Chrome extension
 */

console.log('[MarioQuest] Background service worker loaded');

// Track active tabs with content script
const activeTabs = new Set();

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[MarioQuest] Extension installed', details);

  if (details.reason === 'install') {
    // First time installation
    console.log('[MarioQuest] First time installation');
    
    // Set default settings
    chrome.storage.local.set({
      settings: {
        mode: 'demo',
        soundEnabled: true,
        autoStart: false
      }
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[MarioQuest] Extension updated from', details.previousVersion);
  }
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[MarioQuest] Message received in background', message);

  (async () => {
    try {
      switch (message.action) {
        case 'contentScriptReady':
          // Content script has loaded
          if (sender.tab) {
            activeTabs.add(sender.tab.id);
            console.log('[MarioQuest] Content script ready in tab', sender.tab.id);
          }
          sendResponse({ success: true });
          break;

        case 'startQuestInTab':
          // Forward quest start command to active tab
          await startQuestInTab(message.tabId, message.questId, message.mode);
          sendResponse({ success: true });
          break;

        case 'getActiveTabs':
          // Return list of tabs with content script
          sendResponse({ success: true, tabs: Array.from(activeTabs) });
          break;

        case 'reopenPopup':
          // Reopen popup after quest completion
          console.log('[MarioQuest] Reopening popup to show points', message);
          try {
            await chrome.action.openPopup();
            console.log('[MarioQuest] Popup reopened successfully');
          } catch (error) {
            console.warn('[MarioQuest] Could not reopen popup automatically', error);
            // User will need to click icon manually to see updated points
          }
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('[MarioQuest] Background error', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  // Return true for async response
  return true;
});

/**
 * Start quest in specific tab
 * @param {number} tabId - Tab ID
 * @param {string} questId - Quest ID
 * @param {string} mode - 'demo' or 'real'
 */
async function startQuestInTab(tabId, questId, mode) {
  console.log('[MarioQuest] Starting quest in tab', { tabId, questId, mode });

  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'startQuest',
      questId: questId,
      mode: mode
    });

    console.log('[MarioQuest] Quest started', response);
    return response;
  } catch (error) {
    console.error('[MarioQuest] Failed to start quest', error);
    throw error;
  }
}

/**
 * Handle tab removal
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabs.has(tabId)) {
    activeTabs.delete(tabId);
    console.log('[MarioQuest] Tab removed', tabId);
  }
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[MarioQuest] Extension icon clicked', tab);
  
  // Check if we're on a supported SAP page (SuccessFactors or S/4HANA)
  if (tab.url && (
    tab.url.includes('successfactors.com') ||
    tab.url.includes('successfactors.eu') ||
    tab.url.includes('hr.cloud.sap') ||
    tab.url.includes('sfsales') ||
    tab.url.includes('hcm') ||
    tab.url.toLowerCase().includes('s4hana') ||
    tab.url.toLowerCase().includes('s/4hana')
  )) {
    console.log('[MarioQuest] On supported SAP page, popup will open');
  } else {
    console.log('[MarioQuest] Not on supported SAP page');
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon-48.png',
      title: 'Joule Quest',
      message: 'Please navigate to SAP SuccessFactors or S/4HANA to use this extension.'
    });
  }
});

console.log('[MarioQuest] Background service worker initialization complete');
