/**
 * Popup JavaScript - Simplified Trigger
 * Opens quest selection as centered overlay on SAP page
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[JouleQuest Popup] Opening quest selection overlay');

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showError('No active tab found');
      return;
    }

    // Check if on SAP SF page
    if (!tab.url || (
      !tab.url.includes('successfactors.com') &&
      !tab.url.includes('successfactors.eu') &&
      !tab.url.includes('hr.cloud.sap')
    )) {
      showError('Please navigate to SAP SuccessFactors first');
      return;
    }

    // Retry logic to handle content script loading delays
    let retries = 3;
    let lastError = null;

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[JouleQuest Popup] Attempt ${i + 1} of ${retries}`);
        
        // Send message to show quest selection overlay (centered on page)
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'showQuestSelection'
        });

        if (response && response.success) {
          console.log('[JouleQuest Popup] Quest selection overlay opened');
          // Close popup immediately - user will interact with centered overlay
          window.close();
          return;
        } else {
          throw new Error('Failed to show quest selection');
        }
      } catch (error) {
        lastError = error;
        
        if (i < retries - 1) {
          // Wait before retry (exponential backoff: 500ms, 1000ms)
          const delay = 500 * Math.pow(2, i);
          console.log(`[JouleQuest Popup] Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // All retries failed
    throw lastError;

  } catch (error) {
    console.error('[JouleQuest Popup] Error:', error);
    
    if (error.message && (
      error.message.includes('Could not establish connection') ||
      error.message.includes('Receiving end does not exist')
    )) {
      // Use error catalog for better messaging
      if (window.JouleQuestErrorMessages) {
        const errorMsg = window.JouleQuestErrorMessages.getErrorMessage('CONTENT_SCRIPT_NOT_LOADED');
        showError(errorMsg.message, errorMsg);
      } else {
        showError('Content script not loaded. Please refresh the SAP page and try again.');
      }
    } else {
      showError(error.message || 'Failed to open quest selection');
    }
  }
});

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show error in popup
 * @param {string} message - Error message
 * @param {Object} errorObj - Optional error object from error catalog
 */
function showError(message, errorObj = null) {
  const container = document.querySelector('.popup-message');
  if (container) {
    if (errorObj && window.JouleQuestErrorMessages) {
      // Use formatted error display from catalog
      const formatted = window.JouleQuestErrorMessages.formatErrorForDisplay(errorObj);
      container.innerHTML = `
        <div class="message-icon">${errorObj.icon}</div>
        <h2>${errorObj.title}</h2>
        ${formatted}
      `;
    } else {
      // Fallback to simple error display
      container.innerHTML = `
        <div class="message-icon">⚠️</div>
        <h2>Oops!</h2>
        <p style="color: #ffe0e0; font-size: 13px; line-height: 1.4;">${message}</p>
      `;
    }
  }
}
