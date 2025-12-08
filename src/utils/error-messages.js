/**
 * Error Message Catalog - User-friendly error messages
 * Provides consistent, helpful error messaging across the extension
 */

const ERROR_CATALOG = {
  // Connection/Setup Errors
  CONTENT_SCRIPT_NOT_LOADED: {
    icon: '🔄',
    title: 'Extension Setup Needed',
    message: 'Joule Quest is connecting to this page. This usually takes a few moments.',
    causes: [
      'Extension was just installed or updated',
      'Page was already open before extension installed',
      'Page is still loading in the background'
    ],
    solutions: [
      { icon: '⏱️', text: 'Wait 5-10 seconds for the page to fully load' },
      { icon: '⌘', text: 'If still not working, refresh this page (⌘R or Ctrl+R)' },
      { icon: '🔌', text: 'Make sure extension is enabled in Chrome' }
    ],
    actionText: 'Refresh Page',
    severity: 'warning'
  },

  // Joule Availability Errors
  JOULE_NOT_FOUND: {
    icon: '🔍',
    title: 'Joule Not Available',
    message: 'Cannot find Joule assistant on this page.',
    causes: [
      'Joule not enabled for your account',
      'Wrong SF page (Joule not available here)',
      'Page still loading'
    ],
    solutions: [
      { icon: '🏠', text: 'Navigate to SF homepage first' },
      { icon: '⏳', text: 'Wait for page to fully load' },
      { icon: '💬', text: 'Contact admin if issue persists' }
    ],
    severity: 'error'
  },

  JOULE_IFRAME_NOT_FOUND: {
    icon: '⚠️',
    title: 'Joule Not Responding',
    message: 'Joule assistant is not responding.',
    causes: [
      'Joule panel may have closed unexpectedly',
      'Connection to Joule interrupted'
    ],
    solutions: [
      { icon: '🔄', text: 'Quest will retry automatically' },
      { icon: '🏠', text: 'Try refreshing page if issue persists' }
    ],
    severity: 'warning'
  },

  // Quest Execution Errors
  STEP_TIMEOUT: {
    icon: '⏱️',
    title: 'Step Timed Out',
    message: 'This step took longer than expected.',
    causes: [
      'Joule is processing a complex request',
      'Network connection is slow',
      'Page element not appearing'
    ],
    solutions: [
      { icon: '⏭️', text: 'Quest will continue to next step' },
      { icon: '🔄', text: 'Replay quest to retry later' }
    ],
    severity: 'warning'
  },

  ELEMENT_NOT_FOUND: {
    icon: '🔍',
    title: 'Element Not Found',
    message: 'Could not find the required element on the page.',
    causes: [
      'Page layout may have changed',
      'Element still loading',
      'Wrong page for this quest'
    ],
    solutions: [
      { icon: '⏭️', text: 'Quest will continue to next step' },
      { icon: '🏠', text: 'Make sure you\'re on the right page' }
    ],
    severity: 'warning'
  },

  PROMPT_SEND_FAILED: {
    icon: '📤',
    title: 'Message Not Sent',
    message: 'Could not send message to Joule.',
    causes: [
      'Joule input field not ready',
      'Connection interrupted',
      'Joule is busy processing'
    ],
    solutions: [
      { icon: '⏭️', text: 'Quest will continue to next step' },
      { icon: '🔄', text: 'Step will retry automatically' }
    ],
    severity: 'warning'
  },

  BUTTON_NOT_FOUND: {
    icon: '🔘',
    title: 'Button Not Found',
    message: 'Could not find the expected button.',
    causes: [
      'Button text may have changed',
      'Page still loading',
      'Joule response format changed'
    ],
    solutions: [
      { icon: '⏭️', text: 'Quest will continue to next step' },
      { icon: '👀', text: 'Check browser console for details' }
    ],
    severity: 'warning'
  },

  INPUT_FIELD_NOT_FOUND: {
    icon: '📝',
    title: 'Input Field Not Found',
    message: 'Could not find the input field to enter data.',
    causes: [
      'Joule response format unexpected',
      'Field still loading',
      'Step configuration may need update'
    ],
    solutions: [
      { icon: '⏭️', text: 'Quest will continue to next step' },
      { icon: '🔄', text: 'Try replaying quest' }
    ],
    severity: 'warning'
  },

  // Generic Errors
  UNKNOWN_ERROR: {
    icon: '❌',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    causes: [
      'Network connection issue',
      'Page conflict with extension',
      'Browser compatibility issue'
    ],
    solutions: [
      { icon: '🔄', text: 'Try refreshing the page' },
      { icon: '💬', text: 'Report issue if it persists' }
    ],
    severity: 'error'
  }
};

/**
 * Get user-friendly error message
 * @param {string} errorType - Error type from catalog
 * @param {string} stepName - Optional step name for context
 * @param {string} technicalDetails - Optional technical error details
 * @returns {Object} Error message object
 */
function getErrorMessage(errorType, stepName = null, technicalDetails = null) {
  const errorConfig = ERROR_CATALOG[errorType] || ERROR_CATALOG.UNKNOWN_ERROR;
  
  return {
    ...errorConfig,
    stepName: stepName,
    technicalDetails: technicalDetails,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format error for display in overlay
 * @param {Object} errorMsg - Error message object from getErrorMessage
 * @returns {string} HTML string for display
 */
function formatErrorForDisplay(errorMsg) {
  const causesList = errorMsg.causes
    .map(cause => `• ${cause}`)
    .join('\n');
  
  const solutionsList = errorMsg.solutions
    .map(sol => `${sol.icon} ${sol.text}`)
    .join('\n');

  return `
    <div class="error-display">
      <div class="error-icon-large">${errorMsg.icon}</div>
      <h3 class="error-title">${errorMsg.title}</h3>
      ${errorMsg.stepName ? `<h4 class="error-step">Step: ${errorMsg.stepName}</h4>` : ''}
      <p class="error-message">${errorMsg.message}</p>
      
      <div class="error-section">
        <strong>Why this happened:</strong>
        <div class="error-list">${causesList}</div>
      </div>
      
      <div class="error-section">
        <strong>What to do:</strong>
        <div class="error-list">${solutionsList}</div>
      </div>
      
      ${errorMsg.technicalDetails ? `
        <details class="error-technical">
          <summary>🔧 Technical Details</summary>
          <pre>${errorMsg.technicalDetails}</pre>
        </details>
      ` : ''}
    </div>
  `;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.JouleQuestErrorMessages = {
    ERROR_CATALOG,
    getErrorMessage,
    formatErrorForDisplay
  };
}
