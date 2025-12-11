/**
 * UserFriendlyErrors - Maps technical errors to user-friendly messages
 * Provides actionable guidance and recovery steps
 */
class UserFriendlyErrors {
  constructor() {
    this.errorCatalog = {
      // Joule availability errors
      'JOULE_NOT_FOUND': {
        icon: '🔍',
        title: 'Joule Not Found',
        message: 'Joule isn\'t available on this page.',
        userAction: 'Please navigate to a SuccessFactors page where Joule is enabled.',
        technical: 'Joule iframe not detected in DOM',
        severity: 'critical'
      },
      'JOULE_IFRAME_NOT_FOUND': {
        icon: '🔍',
        title: 'Joule Not Responding',
        message: 'Joule didn\'t open properly.',
        userAction: 'Try clicking the Joule button in the top bar manually.',
        technical: 'Joule iframe element not found after open attempt',
        severity: 'critical'
      },
      
      // Timeout errors
      'RESPONSE_TIMEOUT': {
        icon: '⏱️',
        title: 'Taking Too Long',
        message: 'Joule is taking longer than expected to respond.',
        userAction: 'The system might be busy. We\'ll continue with the next step.',
        technical: 'Response not received within timeout period',
        severity: 'warning'
      },
      'STEP_TIMEOUT': {
        icon: '⏱️',
        title: 'Step Timed Out',
        message: 'This step took too long to complete.',
        userAction: 'We\'ll skip this step and continue the quest.',
        technical: 'Step execution exceeded maximum time limit',
        severity: 'warning'
      },
      
      // Data errors
      'DATA_NOT_AVAILABLE': {
        icon: '📭',
        title: 'Data Not Found',
        message: 'Joule couldn\'t find that information.',
        userAction: 'This data might not be available in your system.',
        technical: 'Joule returned empty result set',
        severity: 'warning'
      },
      'NO_RESULTS': {
        icon: '📭',
        title: 'No Results',
        message: 'No matching data was found.',
        userAction: 'Try adjusting your search criteria or check with your administrator.',
        technical: 'Query returned zero results',
        severity: 'warning'
      },
      
      // Element/UI errors
      'BUTTON_NOT_FOUND': {
        icon: '🔘',
        title: 'Button Not Found',
        message: 'The expected button isn\'t showing up.',
        userAction: 'The page layout might have changed. We\'ll continue anyway.',
        technical: 'Button element not found in DOM',
        severity: 'warning'
      },
      'ELEMENT_NOT_FOUND': {
        icon: '🔍',
        title: 'Element Not Found',
        message: 'A required page element is missing.',
        userAction: 'The page might not have loaded completely. Try refreshing.',
        technical: 'Required DOM element not found',
        severity: 'error'
      },
      'INPUT_FIELD_NOT_FOUND': {
        icon: '📝',
        title: 'Input Field Missing',
        message: 'The input field we need isn\'t available.',
        userAction: 'The form might not be ready yet. We\'ll continue to the next step.',
        technical: 'Input field element not found',
        severity: 'warning'
      },
      
      // Communication errors
      'PROMPT_SEND_FAILED': {
        icon: '📤',
        title: 'Message Failed',
        message: 'Couldn\'t send the message to Joule.',
        userAction: 'Try refreshing the page and starting the quest again.',
        technical: 'Failed to execute sendPrompt() in iframe',
        severity: 'error'
      },
      'IFRAME_COMMUNICATION_ERROR': {
        icon: '🔌',
        title: 'Connection Issue',
        message: 'Lost connection with Joule.',
        userAction: 'Refresh the page to restore the connection.',
        technical: 'postMessage communication failed',
        severity: 'critical'
      },
      
      // Joule response errors
      'CLARIFICATION_NEEDED': {
        icon: '❓',
        title: 'Joule Needs Help',
        message: 'Joule didn\'t understand the request.',
        userAction: 'This is okay - we\'ll continue with the quest.',
        technical: 'Joule requested clarification',
        severity: 'info'
      },
      'AMBIGUOUS_REQUEST': {
        icon: '🤔',
        title: 'Unclear Request',
        message: 'Joule needs more specific information.',
        userAction: 'In a real scenario, you\'d provide more details. We\'ll continue.',
        technical: 'Joule indicated ambiguous query',
        severity: 'info'
      },
      
      // Generic errors
      'UNKNOWN_ERROR': {
        icon: '⚠️',
        title: 'Unexpected Error',
        message: 'Something unexpected happened.',
        userAction: 'We\'ll continue with the quest, but you might want to report this.',
        technical: 'Unclassified error occurred',
        severity: 'error'
      },
      'NETWORK_ERROR': {
        icon: '🌐',
        title: 'Network Issue',
        message: 'There was a network problem.',
        userAction: 'Check your internet connection and try again.',
        technical: 'Network request failed',
        severity: 'error'
      }
    };
  }

  /**
   * Get user-friendly error message
   * @param {string} errorType - Error type code
   * @param {Object} context - Additional context
   * @returns {Object} Error message object
   */
  getError(errorType, context = {}) {
    const error = this.errorCatalog[errorType] || this.errorCatalog['UNKNOWN_ERROR'];
    
    return {
      ...error,
      errorType,
      context,
      timestamp: Date.now()
    };
  }

  /**
   * Format error for overlay display
   * @param {Object} error - Error object from getError()
   * @returns {string} HTML formatted error
   */
  formatForDisplay(error) {
    return `
      <div class="error-display">
        <div class="error-icon">${error.icon}</div>
        <div class="error-content">
          <div class="error-title">${error.title}</div>
          <div class="error-message">${error.message}</div>
          <div class="error-action">${error.userAction}</div>
        </div>
      </div>
    `;
  }

  /**
   * Determine if error allows quest continuation
   * @param {string} errorType - Error type code
   * @returns {boolean} True if quest can continue
   */
  canContinue(errorType) {
    const error = this.errorCatalog[errorType];
    if (!error) return false;
    
    // Critical errors stop the quest
    if (error.severity === 'critical') {
      return false;
    }
    
    // Warnings and info allow continuation
    return error.severity === 'warning' || error.severity === 'info';
  }

  /**
   * Get severity level
   * @param {string} errorType - Error type code
   * @returns {string} Severity level
   */
  getSeverity(errorType) {
    const error = this.errorCatalog[errorType];
    return error ? error.severity : 'error';
  }

  /**
   * Map exception to error type
   * @param {Error} exception - JavaScript error object
   * @returns {string} Error type code
   */
  classifyException(exception) {
    const message = exception.message.toLowerCase();
    
    // Check message content to classify
    if (message.includes('joule') && message.includes('not found')) {
      return 'JOULE_NOT_FOUND';
    }
    if (message.includes('timeout')) {
      return 'RESPONSE_TIMEOUT';
    }
    if (message.includes('button')) {
      return 'BUTTON_NOT_FOUND';
    }
    if (message.includes('element')) {
      return 'ELEMENT_NOT_FOUND';
    }
    if (message.includes('input')) {
      return 'INPUT_FIELD_NOT_FOUND';
    }
    if (message.includes('send') || message.includes('prompt')) {
      return 'PROMPT_SEND_FAILED';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.UserFriendlyErrors = UserFriendlyErrors;
}
