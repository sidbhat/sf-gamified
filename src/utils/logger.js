/**
 * Logger utility for debugging and tracking actions
 */
class Logger {
  constructor(namespace = 'JouleQuest') {
    this.namespace = namespace;
    this.enabled = true;
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {*} data - Optional data to log
   */
  info(message, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.namespace}] ℹ️ ${message}`);
    if (data) console.log(data);
  }

  /**
   * Log success message
   * @param {string} message - Message to log
   * @param {*} data - Optional data to log
   */
  success(message, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.namespace}] ✅ ${message}`);
    if (data) console.log(data);
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {*} data - Optional data to log
   */
  warn(message, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${this.namespace}] ⚠️ ${message}`);
    if (data) console.warn(data);
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error} error - Optional error object
   */
  error(message, error = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.namespace}] ❌ ${message}`);
    if (error) console.error(error);
  }

  /**
   * Log quest action
   * @param {string} questName - Quest name
   * @param {string} action - Action taken
   * @param {*} data - Optional data
   */
  quest(questName, action, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.namespace}] 🎮 Quest: ${questName} | ${action}`);
    if (data) console.log(data);
  }

  /**
   * Enable/disable logging
   * @param {boolean} enabled - Enable flag
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Create global logger instance
window.JouleQuestLogger = new Logger('JouleQuest');
