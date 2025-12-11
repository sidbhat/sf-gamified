/**
 * Popup JavaScript - Simplified Trigger
 * Opens quest selection as centered overlay on SAP page
 */

// Initialize i18n for popup
let i18n = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[JouleQuest Popup] Opening quest selection overlay');
  
  // Initialize i18n
  try {
    i18n = new I18nManager();
    await i18n.init();
    console.log('[JouleQuest Popup] i18n initialized:', i18n.getCurrentLanguage());
  } catch (error) {
    console.warn('[JouleQuest Popup] i18n init failed, using fallback:', error);
  }

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showError('No active tab found');
      return;
    }

    // Check if on supported SAP page (SuccessFactors or S/4HANA)
    if (!tab.url || (
      !tab.url.includes('successfactors.com') &&
      !tab.url.includes('successfactors.eu') &&
      !tab.url.includes('hr.cloud.sap') &&
      !tab.url.includes('sfsales') &&
      !tab.url.includes('hcm') &&
      !tab.url.toLowerCase().includes('s4hana') &&
      !tab.url.toLowerCase().includes('s/4hana') &&
      !tab.url.toLowerCase().includes('nqo')
    )) {
      const errorMsg = i18n ? i18n.t('errors.contentScriptNotLoaded.message') : 'Please navigate to SAP SuccessFactors or S/4HANA first';
      showError(errorMsg);
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
      // Use i18n error message if available
      const errorMsg = i18n 
        ? i18n.t('errors.contentScriptNotLoaded.message')
        : 'Content script loading... Please wait a few seconds and try again.';
      
      // Get full error object for display if available
      const errorObj = i18n ? {
        icon: '🔄',
        title: i18n.t('errors.contentScriptNotLoaded.title'),
        message: errorMsg,
        causes: [
          i18n.t('errors.contentScriptNotLoaded.causes.0'),
          i18n.t('errors.contentScriptNotLoaded.causes.1'),
          i18n.t('errors.contentScriptNotLoaded.causes.2')
        ],
        solutions: [
          { icon: '⏱️', text: i18n.t('errors.contentScriptNotLoaded.solutions.0') },
          { icon: '⌘', text: i18n.t('errors.contentScriptNotLoaded.solutions.1') },
          { icon: '🔌', text: i18n.t('errors.contentScriptNotLoaded.solutions.2') }
        ]
      } : null;
      
      showError(errorMsg, errorObj);
    } else {
      const fallbackMsg = i18n ? i18n.t('errors.unknownError.message') : 'Failed to open quest selection';
      showError(error.message || fallbackMsg);
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
    if (errorObj) {
      // Format error display with translated content
      const causesList = errorObj.causes
        .map(cause => `• ${cause}`)
        .join('<br>');
      
      const solutionsList = errorObj.solutions
        .map(sol => `${sol.icon} ${sol.text}`)
        .join('<br>');
      
      const whyLabel = i18n ? i18n.t('errors.whyThisHappened') : 'Why this happened:';
      const whatLabel = i18n ? i18n.t('errors.whatToDo') : 'What to do:';
      
      container.innerHTML = `
        <div class="message-icon">${errorObj.icon}</div>
        <h2>${errorObj.title}</h2>
        <p style="color: #ffe0e0; font-size: 13px; line-height: 1.4; margin-bottom: 16px;">${errorObj.message}</p>
        
        <div style="text-align: left; margin-top: 16px; font-size: 12px;">
          <strong style="color: #fff;">${whyLabel}</strong>
          <div style="color: #ffe0e0; margin: 8px 0; line-height: 1.5;">${causesList}</div>
          
          <strong style="color: #fff; margin-top: 12px; display: block;">${whatLabel}</strong>
          <div style="color: #ffe0e0; margin: 8px 0; line-height: 1.5;">${solutionsList}</div>
        </div>
      `;
    } else {
      // Fallback to simple error display
      const oopsTitle = i18n ? i18n.t('ui.headers.oops') : 'Oops!';
      container.innerHTML = `
        <div class="message-icon">⚠️</div>
        <h2>${oopsTitle}</h2>
        <p style="color: #ffe0e0; font-size: 13px; line-height: 1.4;">${message}</p>
      `;
    }
  }
}
