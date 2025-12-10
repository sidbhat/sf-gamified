/**
 * Unified Error Handler - Consistent error handling across all SAP solutions
 * 
 * Architecture:
 * - Solution-aware error messages
 * - Graceful degradation for optional steps
 * - Detailed logging for debugging
 * - User-friendly error presentation
 */

window.JouleQuestErrorHandler = (function() {
  'use strict';

  const logger = window.JouleQuestLogger;

  class QuestErrorHandler {
    constructor(solution) {
      this.solution = solution;
      this.errorMessages = {
        JOULE_NOT_FOUND: {
          title: "Joule Not Available",
          message: `Joule AI assistant is not available on this ${solution.name} page`,
          recovery: "Navigate to a page with Joule enabled",
          severity: "critical"
        },
        JOULE_BUTTON_NOT_FOUND: {
          title: "Joule Button Missing",
          message: "Could not find the Joule chat button on the page",
          recovery: "Ensure Joule is enabled for your user",
          severity: "critical"
        },
        BUTTON_NOT_FOUND: {
          title: "Button Not Found",
          message: "Expected button not found in Joule's response",
          recovery: "Quest will continue (button click is optional)",
          severity: "warning"
        },
        CARD_NOT_FOUND: {
          title: "Card Not Found",
          message: "No clickable card found in the response",
          recovery: "Quest will continue (card interaction is optional)",
          severity: "warning"
        },
        RESPONSE_TIMEOUT: {
          title: "Response Timeout",
          message: `Joule took too long to respond`,
          recovery: "Retrying or moving to next step",
          severity: "warning"
        },
        RESPONSE_ERROR: {
          title: "Response Error",
          message: "Joule returned an error or unexpected response",
          recovery: "Quest will attempt to continue",
          severity: "warning"
        },
        NAVIGATION_FAILED: {
          title: "Navigation Failed",
          message: "Could not navigate to the target page",
          recovery: "Check URL and try again",
          severity: "critical"
        },
        SELECTOR_NOT_FOUND: {
          title: "Element Not Found",
          message: "Could not find the required element on the page",
          recovery: "Page structure may have changed",
          severity: "error"
        },
        STEP_EXECUTION_FAILED: {
          title: "Step Failed",
          message: "Quest step could not be completed",
          recovery: "Moving to next step if possible",
          severity: "error"
        },
        UNKNOWN_ERROR: {
          title: "Unexpected Error",
          message: "An unexpected error occurred",
          recovery: "Quest will attempt to continue",
          severity: "error"
        }
      };

      logger.info('Error Handler initialized', {
        solution: solution.name,
        errorTypesCount: Object.keys(this.errorMessages).length
      });
    }

    /**
     * Handle an error with solution context
     * 
     * @param {string} errorType - Error type from errorMessages
     * @param {Object} context - Additional error context
     * @returns {Object} Formatted error object
     */
    handle(errorType, context = {}) {
      const errorDef = this.errorMessages[errorType];
      
      if (!errorDef) {
        return this.handleUnknownError(errorType, context);
      }

      const errorObj = {
        type: errorType,
        ...errorDef,
        solution: this.solution.name,
        solutionId: this.solution.id,
        context,
        timestamp: Date.now()
      };

      // Log based on severity
      switch (errorDef.severity) {
        case 'critical':
          logger.error(`[${errorType}] ${errorDef.message}`, errorObj);
          break;
        case 'error':
          logger.error(`[${errorType}] ${errorDef.message}`, errorObj);
          break;
        case 'warning':
          logger.warn(`[${errorType}] ${errorDef.message}`, errorObj);
          break;
        default:
          logger.info(`[${errorType}] ${errorDef.message}`, errorObj);
      }

      return errorObj;
    }

    /**
     * Handle unknown error type
     * 
     * @param {string} type - Unknown error type
     * @param {Object} context - Error context
     * @returns {Object} Formatted error object
     */
    handleUnknownError(type, context) {
      const errorObj = {
        type: 'UNKNOWN_ERROR',
        title: "Unexpected Error",
        message: `An unexpected error occurred: ${type}`,
        recovery: "Quest will attempt to continue",
        severity: "error",
        solution: this.solution.name,
        solutionId: this.solution.id,
        context: { originalType: type, ...context },
        timestamp: Date.now()
      };

      logger.error(`[UNKNOWN_ERROR] ${type}`, errorObj);
      return errorObj;
    }

    /**
     * Check if error is recoverable (non-critical)
     * 
     * @param {Object} error - Error object
     * @returns {boolean} True if recoverable
     */
    isRecoverable(error) {
      return error.severity !== 'critical';
    }

    /**
     * Check if error allows quest continuation
     * 
     * @param {Object} error - Error object
     * @param {boolean} stepOptional - Whether the step is optional
     * @returns {boolean} True if quest can continue
     */
    canContinue(error, stepOptional = false) {
      // Optional steps always allow continuation
      if (stepOptional) {
        logger.info('Error in optional step - continuing quest', {
          errorType: error.type,
          stepOptional
        });
        return true;
      }

      // Non-critical errors allow continuation
      return error.severity !== 'critical';
    }

    /**
     * Format error for UI display
     * 
     * @param {Object} error - Error object
     * @returns {string} Formatted error message
     */
    formatForUI(error) {
      let message = `❌ ${error.title}\n\n`;
      message += `${error.message}\n\n`;
      
      if (error.recovery) {
        message += `💡 ${error.recovery}`;
      }

      return message;
    }

    /**
     * Get error color for UI
     * 
     * @param {Object} error - Error object
     * @returns {string} CSS color value
     */
    getErrorColor(error) {
      switch (error.severity) {
        case 'critical':
          return '#ef4444'; // red
        case 'error':
          return '#f97316'; // orange
        case 'warning':
          return '#eab308'; // yellow
        default:
          return '#6b7280'; // gray
      }
    }

    /**
     * Create error from exception
     * 
     * @param {Error} exception - JavaScript error
     * @param {Object} context - Additional context
     * @returns {Object} Formatted error object
     */
    fromException(exception, context = {}) {
      logger.error('Exception caught', { exception, context });

      return {
        type: 'EXCEPTION',
        title: "Exception Occurred",
        message: exception.message || 'Unknown exception',
        recovery: "Quest will attempt to continue",
        severity: "error",
        solution: this.solution.name,
        solutionId: this.solution.id,
        context: {
          ...context,
          stack: exception.stack,
          name: exception.name
        },
        timestamp: Date.now()
      };
    }

    /**
     * Update solution context
     * 
     * @param {Object} solution - New solution configuration
     */
    updateSolution(solution) {
      this.solution = solution;
      logger.info('Error handler solution updated', { solution: solution.name });
    }
  }

  // Return constructor
  return QuestErrorHandler;
})();
