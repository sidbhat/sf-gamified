/**
 * JouleHandler - Core class for interacting with SAP Joule via iframe message passing
 * Sends messages to iframe handler and waits for responses
 */
class JouleHandler {
  constructor() {
    this.logger = window.JouleQuestLogger;
    this.selectors = null;
    this.isOpen = false;
    this.currentResponse = null;
    this.messageCallbacks = new Map();
    this.requestIdCounter = 0;
    this.jouleIframe = null;
    
    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'joule-quest-iframe') {
        this.handleIframeMessage(event.data);
      }
    });
  }

  /**
   * Initialize handler with selectors (kept for compatibility but not used)
   * @param {Object} selectors - Selector configuration from JSON
   */
  async init(selectors) {
    this.logger.info('Initializing JouleHandler with iframe message passing');
    this.selectors = selectors;
    
    // Wait for iframe to be available
    await this.waitForJouleIframe();
  }

  /**
   * Wait for Joule iframe to exist in DOM and inject handler script
   */
  async waitForJouleIframe(timeout = 10000) {
    this.logger.info('Waiting for Joule iframe to be available');
    
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkForIframe = () => {
        // Look for iframe with Joule URL pattern
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          if (iframe.src && iframe.src.includes('sapdas.cloud.sap')) {
            this.jouleIframe = iframe;
            this.logger.success('Found Joule iframe:', iframe.src);
            
            // CRITICAL: Manually inject iframe handler script
            this.injectIframeHandler(iframe);
            
            resolve(iframe);
            return;
          }
        }

        if (Date.now() - startTime > timeout) {
          this.logger.warn('Joule iframe not found yet, but continuing');
          resolve(null);
          return;
        }

        setTimeout(checkForIframe, 500);
      };

      checkForIframe();
    });
  }

  /**
   * Note: Iframe handler injection is handled by manifest.json content_scripts
   * This method is kept for logging purposes only
   */
  async injectIframeHandler(iframe) {
    this.logger.info('Iframe handler will be injected by manifest.json content_scripts');
    this.logger.info('Iframe URL:', iframe.src);
    
    // The iframe handler script (src/joule-iframe-handler.js) is automatically
    // injected by Chrome when the iframe matches the pattern in manifest.json:
    // "matches": ["https://*.sapdas.cloud.sap/*"]
    
    // Wait for iframe handler to initialize
    await this.sleep(2000);
    
    this.logger.success('Iframe handler should be active via content_scripts');
  }

  /**
   * Handle messages from iframe
   */
  handleIframeMessage(message) {
    this.logger.info('Received message from iframe', message);

    // Handle iframe_ready message
    if (message.type === 'iframe_ready') {
      this.logger.success('Joule iframe is ready');
      this.isOpen = true;
      return;
    }

    // Handle responses to requests
    if (message.requestId) {
      const callback = this.messageCallbacks.get(message.requestId);
      if (callback) {
        callback(message);
        this.messageCallbacks.delete(message.requestId);
      }
    }
  }

  /**
   * Send message to iframe and wait for response
   */
  async sendMessageToIframe(type, data = {}, timeout = 30000) {
    // Wait for iframe if not found yet
    if (!this.jouleIframe) {
      await this.waitForJouleIframe();
    }

    if (!this.jouleIframe) {
      throw new Error('Joule iframe not found. Is Joule open?');
    }

    const requestId = ++this.requestIdCounter;
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.messageCallbacks.delete(requestId);
        reject(new Error(`Timeout waiting for iframe response to ${type}`));
      }, timeout);

      // Set up callback
      this.messageCallbacks.set(requestId, (response) => {
        clearTimeout(timeoutId);
        resolve(response);
      });

      // Send message to iframe
      const message = {
        source: 'joule-quest-main',
        type: type,
        requestId: requestId,
        data: data
      };

      this.logger.info('Sending message to iframe', message);
      this.jouleIframe.contentWindow.postMessage(message, '*');
    });
  }

  /**
   * Open Joule chat interface (or verify it's already open)
   * @returns {Promise<Object>} Result object with success status and alreadyOpen flag
   */
  async openChat() {
    this.logger.info('Opening Joule chat');

    try {
      // First check if Joule iframe exists (means Joule is open)
      await this.waitForJouleIframe(5000);
      
      if (this.jouleIframe) {
        // Joule is already open
        this.logger.success('✅ Joule iframe found - Joule is already open!');
        
        // Verify it's actually open by checking with iframe
        try {
          const status = await this.sendMessageToIframe('check_if_open', {}, 5000);
          if (status.data && status.data.isOpen) {
            this.isOpen = true;
            this.logger.success('✅ Confirmed: Joule is open and ready');
            return { success: true, alreadyOpen: true };
          }
        } catch (e) {
          this.logger.warn('Could not verify Joule status, assuming open');
          this.isOpen = true;
          return { success: true, alreadyOpen: true };
        }
      }

      // Joule is not open, need to click button to open it
      this.logger.info('Joule is not open, searching for Joule button');
      
      // Find Joule button in main page
      const jouleButton = await this.findJouleButton();
      if (!jouleButton) {
        throw new Error('Joule button not found in top bar');
      }

      this.logger.success('Found Joule button, clicking to open');
      jouleButton.click();
      
      // Wait for iframe to appear
      this.logger.info('Waiting for Joule iframe to load...');
      await this.sleep(3000);
      await this.waitForJouleIframe(10000);
      
      if (!this.jouleIframe) {
        throw new Error('Joule iframe did not load after clicking button');
      }

      // Wait for iframe to be ready
      await this.sleep(2000);
      
      this.isOpen = true;
      this.logger.success('Joule chat opened successfully');
      return { success: true, alreadyOpen: false };
    } catch (error) {
      this.logger.error('Failed to open Joule chat', error);
      throw error;
    }
  }

  /**
   * Find Joule button in main page
   */
  async findJouleButton() {
    // Try multiple selectors
    const selectors = [
      'button[aria-label*="Joule"]',
      'button[title*="Joule"]',
      'button:has-text("Joule")'
    ];

    for (const selector of selectors) {
      try {
        const button = document.querySelector(selector);
        if (button) return button;
      } catch (e) {
        // Continue to next selector
      }
    }

    // Try finding by text content
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent?.includes('Joule') || 
          button.getAttribute('aria-label')?.includes('Joule')) {
        return button;
      }
    }

    return null;
  }

  /**
   * Send prompt to Joule via iframe message passing
   * @param {string} prompt - Prompt text to send
   * @param {boolean} waitForResponse - Whether to wait for response
   * @param {string[]} responseKeywords - Keywords to detect in response
   * @returns {Promise<Object>} Response object with success and message
   */
  async sendPrompt(prompt, waitForResponse = false, responseKeywords = []) {
    this.logger.info('Sending prompt to Joule via postMessage', { prompt });

    try {
      // Make sure iframe is available
      if (!this.jouleIframe) {
        await this.waitForJouleIframe();
      }

      if (!this.jouleIframe) {
        throw new Error('Joule iframe not available');
      }

      // Step 1: Type text via postMessage
      this.logger.info('Sending type_text message to iframe');
      const typeResult = await this.sendMessageToIframe('type_text', { text: prompt });
      
      if (!typeResult.data || !typeResult.data.success) {
        throw new Error(`Failed to type text: ${typeResult.data?.error || 'Unknown error'}`);
      }
      
      this.logger.success('Text typed successfully via postMessage');

      // Wait a bit for text to be ready
      await this.sleep(500);

      // Step 2: Send message via postMessage
      this.logger.info('Sending click_send message to iframe');
      const sendResult = await this.sendMessageToIframe('click_send');
      
      if (!sendResult.data || !sendResult.data.success) {
        throw new Error(`Failed to send message: ${sendResult.data?.error || 'Unknown error'}`);
      }
      
      this.logger.success(`Message sent successfully via ${sendResult.data.method}`);

      // Step 3: Wait for response if requested
      if (waitForResponse) {
        this.logger.info('Waiting for response with keywords:', responseKeywords);
        const responseResult = await this.sendMessageToIframe('wait_for_response', {
          keywords: responseKeywords,
          timeout: 30000
        }, 35000);
        
        if (responseResult.data && responseResult.data.found) {
          // Format response to proper sentence case
          const formattedText = this.formatToSentenceCase(responseResult.data.text);
          this.currentResponse = formattedText;
          this.logger.success('Response received and formatted:', formattedText?.substring(0, 100));
          return {
            success: true,
            message: 'Prompt sent and response received',
            response: formattedText,
            keyword: responseResult.data.keyword
          };
        } else {
          this.logger.warn('Response not detected or timeout');
          return {
            success: true,
            message: 'Prompt sent but response not detected',
            response: null
          };
        }
      }

      return {
        success: true,
        message: 'Prompt sent successfully via postMessage'
      };

    } catch (error) {
      this.logger.error('Failed to send prompt via postMessage', error);
      throw error;
    }
  }

  /**
   * Close Joule chat interface
   * @returns {Promise<boolean>} Success status
   */
  async closeChat() {
    this.logger.info('Closing Joule chat');

    try {
      // Check if iframe exists
      if (!this.jouleIframe) {
        this.logger.info('Joule iframe not found, already closed');
        this.isOpen = false;
        return true;
      }

      // Try to find and click close button in main page
      // The close button is likely in the main page, not the iframe
      const closeButton = document.querySelector('button[aria-label*="Close"]');
      if (closeButton) {
        closeButton.click();
        this.isOpen = false;
        this.jouleIframe = null;
        this.logger.success('Joule chat closed');
        return true;
      }

      // If no close button, try clicking Joule button again to toggle
      const jouleButton = await this.findJouleButton();
      if (jouleButton) {
        jouleButton.click();
        this.isOpen = false;
        this.jouleIframe = null;
        this.logger.success('Joule toggled closed');
        return true;
      }

      this.logger.warn('Could not find way to close Joule');
      return false;
    } catch (error) {
      this.logger.error('Failed to close Joule chat', error);
      this.isOpen = false;
      return false;
    }
  }

  /**
   * Check if Joule is currently open
   * @returns {boolean} Open status
   */
  isChatOpen() {
    return this.isOpen && this.jouleIframe !== null;
  }

  /**
   * Get last response
   * @returns {string|null} Last response text
   */
  getLastResponse() {
    return this.currentResponse;
  }

  /**
   * Select first interactive option (button/link) in latest Joule response
   * Also detects input fields and returns type info
   * @returns {Promise<Object>} Result object with success status and type info
   */
  async selectFirstOption() {
    this.logger.info('Selecting first interactive option via postMessage');

    try {
      if (!this.jouleIframe) {
        await this.waitForJouleIframe();
      }

      if (!this.jouleIframe) {
        throw new Error('Joule iframe not available');
      }

      // Click first button OR detect input via postMessage
      this.logger.info('Sending click_first_button message to iframe');
      const result = await this.sendMessageToIframe('click_first_button', {}, 10000);
      
      if (!result.data || !result.data.success) {
        throw new Error(`Failed to interact with first option: ${result.data?.error || 'Unknown error'}`);
      }
      
      // Return different result based on what was found
      if (result.data.type === 'input') {
        this.logger.info(`Input field detected: ${result.data.inputType}`);
        return {
          success: true,
          type: 'input',
          inputType: result.data.inputType,
          inputId: result.data.inputId,
          message: result.data.message
        };
      } else {
        this.logger.success(`First option clicked (button): ${result.data.buttonText}`);
        return {
          success: true,
          type: 'button',
          buttonText: result.data.buttonText,
          message: 'First option clicked successfully'
        };
      }

    } catch (error) {
      this.logger.error('Failed to select first option', error);
      throw error;
    }
  }

  /**
   * Click button matching specific text
   * @param {string} buttonText - Text to search for in buttons
   * @returns {Promise<Object>} Result object with success status
   */
  async clickButtonByText(buttonText) {
    this.logger.info(`Clicking button by text: "${buttonText}" via postMessage`);

    try {
      if (!this.jouleIframe) {
        await this.waitForJouleIframe();
      }

      if (!this.jouleIframe) {
        throw new Error('Joule iframe not available');
      }

      // Click button by text via postMessage
      this.logger.info('Sending click_button_by_text message to iframe');
      const result = await this.sendMessageToIframe('click_button_by_text', { text: buttonText }, 10000);
      
      if (!result.data || !result.data.success) {
        throw new Error(`Failed to click button: ${result.data?.error || 'Unknown error'}`);
      }
      
      this.logger.success(`Button clicked: ${result.data.buttonText}`);

      return {
        success: true,
        message: 'Button clicked successfully',
        buttonText: result.data.buttonText
      };

    } catch (error) {
      this.logger.error(`Failed to click button "${buttonText}"`, error);
      throw error;
    }
  }

  /**
   * Find all interactive elements in latest Joule response
   * @returns {Promise<Object>} Result with list of interactive elements
   */
  async findInteractiveElements() {
    this.logger.info('Finding interactive elements via postMessage');

    try {
      if (!this.jouleIframe) {
        await this.waitForJouleIframe();
      }

      if (!this.jouleIframe) {
        throw new Error('Joule iframe not available');
      }

      // Find interactive elements via postMessage
      this.logger.info('Sending find_interactive_elements message to iframe');
      const result = await this.sendMessageToIframe('find_interactive_elements', {}, 10000);
      
      if (!result.data || !result.data.success) {
        throw new Error('Failed to find interactive elements');
      }
      
      this.logger.success(`Found ${result.data.count} interactive elements`);

      return {
        success: true,
        elements: result.data.elements,
        count: result.data.count
      };

    } catch (error) {
      this.logger.error('Failed to find interactive elements', error);
      throw error;
    }
  }

  /**
   * Format text to proper sentence case
   * Capitalizes first letter of sentences (after . ! ?)
   * @param {string} text - Text to format
   * @returns {string} Formatted text
   */
  formatToSentenceCase(text) {
    if (!text) return text;
    
    return text
      // Capitalize first letter
      .replace(/^\s*\w/, (match) => match.toUpperCase())
      // Capitalize after period + space
      .replace(/\.\s+\w/g, (match) => match.toUpperCase())
      // Capitalize after exclamation + space
      .replace(/!\s+\w/g, (match) => match.toUpperCase())
      // Capitalize after question mark + space
      .replace(/\?\s+\w/g, (match) => match.toUpperCase());
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global handler instance
window.JouleQuestJouleHandler = new JouleHandler();
