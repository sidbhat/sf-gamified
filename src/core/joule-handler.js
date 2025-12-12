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
   * OPTIMIZED: Reduced timeout from 10s to 3s since iframe is usually immediate
   */
  async waitForJouleIframe(timeout = 3000) {
    this.logger.info('Checking for Joule iframe (quick check)');
    
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
          this.logger.info('Joule iframe not found yet (this is OK - will check again when needed)');
          resolve(null);
          return;
        }

        setTimeout(checkForIframe, 300);
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
   * Analyze Joule response to detect patterns and determine next action
   * CONTEXT-AWARE: Checks success indicators BEFORE error keywords to prevent false positives
   * @param {string} response - Joule's response text
   * @param {string[]} successKeywords - Expected success keywords
   * @param {string[]} errorKeywords - Error detection keywords
   * @returns {Object} Analysis result with type, confidence, and suggested action
   */
  analyzeJouleResponse(response, successKeywords = [], errorKeywords = []) {
    if (!response) {
      return {
        type: 'empty',
        confidence: 100,
        indicators: ['No response received'],
        suggestedAction: 'retry',
        message: 'No response from Joule'
      };
    }

    const lowerResponse = response.toLowerCase();
    const indicators = [];
    let type = 'unknown';
    let confidence = 0;
    let suggestedAction = 'continue';
    let message = '';

    // 1. Check for success keywords FIRST (prevents false positives)
    if (successKeywords && successKeywords.length > 0) {
      const successMatches = successKeywords.filter(keyword =>
        lowerResponse.includes(keyword.toLowerCase())
      );
      
      if (successMatches.length > 0) {
        type = 'success';
        confidence = Math.min(100, 50 + (successMatches.length * 15));
        indicators.push(...successMatches.map(k => `Success keyword: "${k}"`));
        suggestedAction = 'continue';
        message = 'Response matches expected keywords';
        
        return { type, confidence, indicators, suggestedAction, message };
      }
    }

    // 2. Check for SUCCESS CONTEXT PHRASES (override error keywords)
    const successPhrases = [
      "here's what i found",
      "here is what i found",
      "i found",
      "found the following",
      "successfully",
      "completed",
      "here are the",
      "showing you",
      "retrieved"
    ];
    
    const hasSuccessContext = successPhrases.some(phrase =>
      lowerResponse.includes(phrase)
    );
    
    if (hasSuccessContext) {
      type = 'success';
      confidence = 70;
      indicators.push('Success context detected');
      suggestedAction = 'continue';
      message = 'Response indicates successful operation';
      
      return { type, confidence, indicators, suggestedAction, message };
    }

    // 3. Check for explicit errors (only after checking success context)
    if (errorKeywords && errorKeywords.length > 0) {
      const errorMatches = errorKeywords.filter(keyword => 
        lowerResponse.includes(keyword.toLowerCase())
      );
      
      if (errorMatches.length > 0) {
        type = 'error';
        confidence = Math.min(100, 60 + (errorMatches.length * 20));
        indicators.push(...errorMatches.map(k => `Error keyword: "${k}"`));
        suggestedAction = 'skip';
        message = `Joule indicated an error or limitation: ${errorMatches.join(', ')}`;
        
        return { type, confidence, indicators, suggestedAction, message };
      }
    }

    // 4. Check for success keywords again (if not checked above)
    if (successKeywords && successKeywords.length > 0) {
      const successMatches = successKeywords.filter(keyword =>
        lowerResponse.includes(keyword.toLowerCase())
      );
      
      if (successMatches.length > 0) {
        type = 'success';
        confidence = Math.min(100, 50 + (successMatches.length * 15));
        indicators.push(...successMatches.map(k => `Success keyword: "${k}"`));
        suggestedAction = 'continue';
        message = 'Response matches expected keywords';
        
        return { type, confidence, indicators, suggestedAction, message };
      }
    }

    // 3. Detect quick actions (button/option lists)
    const quickActionIndicators = [
      'select an option',
      'choose from',
      'please select',
      'pick one',
      'which would you like',
      'here are your options'
    ];
    
    const hasQuickActions = quickActionIndicators.some(indicator =>
      lowerResponse.includes(indicator)
    );
    
    if (hasQuickActions) {
      type = 'quick_actions';
      confidence = 80;
      indicators.push('Quick action menu detected');
      suggestedAction = 'click_first_button';
      message = 'Joule presented a list of options to choose from';
      
      return { type, confidence, indicators, suggestedAction, message };
    }

    // 4. Detect clarification requests
    const clarificationIndicators = [
      'can you clarify',
      'which one',
      'did you mean',
      'please specify',
      'could you be more specific',
      'i need more information'
    ];
    
    const needsClarification = clarificationIndicators.some(indicator =>
      lowerResponse.includes(indicator)
    );
    
    if (needsClarification) {
      type = 'clarification';
      confidence = 75;
      indicators.push('Clarification request detected');
      suggestedAction = 'continue';
      message = 'Joule needs additional information';
      
      return { type, confidence, indicators, suggestedAction, message };
    }

    // 5. Detect partial success
    const partialIndicators = [
      "here's what i found",
      'some information',
      'limited results',
      'partial',
      'only showing'
    ];
    
    const isPartial = partialIndicators.some(indicator =>
      lowerResponse.includes(indicator)
    );
    
    if (isPartial) {
      type = 'partial';
      confidence = 60;
      indicators.push('Partial result detected');
      suggestedAction = 'continue';
      message = 'Joule provided partial information';
      
      return { type, confidence, indicators, suggestedAction, message };
    }

    // 6. Default: unknown but likely successful if response exists
    type = 'success';
    confidence = 40;
    indicators.push('Response received but pattern unclear');
    suggestedAction = 'continue';
    message = 'Response received, proceeding with caution';

    return { type, confidence, indicators, suggestedAction, message };
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

  /**
   * Detect current UI language
   * Returns ISO 639-1 code (en, de, fr, etc.)
   * @returns {string} Language code
   */
  detectLanguage() {
    // Try document lang attribute
    let lang = document.documentElement.lang || 
               document.querySelector('html')?.getAttribute('lang');
    
    // Try browser language
    if (!lang) {
      lang = navigator.language || navigator.userLanguage;
    }
    
    // Normalize to 2-letter code
    if (lang) {
      lang = lang.substring(0, 2).toLowerCase();
    }
    
    // Default to English
    const detectedLang = lang || 'en';
    this.logger.info('Detected language:', detectedLang);
    return detectedLang;
  }

  /**
   * Universal element finder with multi-strategy approach
   * Tries selectors in priority order (1 = highest priority)
   * @param {Array} selectors - Array of selector objects with type, value, priority
   * @param {number} retries - Number of retry attempts
   * @returns {Promise<HTMLElement|null>}
   */
  async findElement(selectors, retries = 3) {
    this.logger.info('Finding element with priority-based multi-strategy', { 
      selectorCount: selectors.length,
      retries 
    });
    
    // Handle both old format (array of strings) and new format (array of objects)
    const normalizedSelectors = selectors.map(sel => {
      if (typeof sel === 'string') {
        // Old format: convert to new format
        return {
          type: sel.startsWith('//') ? 'xpath' : 'css',
          value: sel,
          priority: 999
        };
      }
      return sel;
    });
    
    // Sort selectors by priority (1 = highest)
    const sortedSelectors = [...normalizedSelectors].sort((a, b) => 
      (a.priority || 999) - (b.priority || 999)
    );
    
    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        this.logger.info(`Retry attempt ${attempt}/${retries}`);
        await this.sleep(1000);
      }
      
      for (const selector of sortedSelectors) {
        try {
          const element = await this.trySelector(selector);
          
          if (element && this.isElementVisible(element) && !element.disabled) {
            this.logger.success('Element found with strategy', { 
              type: selector.type,
              priority: selector.priority,
              description: selector.description
            });
            return element;
          }
          
        } catch (error) {
          this.logger.warn('Selector strategy failed', { 
            type: selector.type, 
            error: error.message 
          });
        }
      }
    }
    
    this.logger.error('Element not found after all strategies and retries');
    return null;
  }

  /**
   * Try a single selector strategy
   * @param {Object} selector - Selector configuration
   * @returns {Promise<HTMLElement|null>}
   */
  async trySelector(selector) {
    switch (selector.type) {
      case 'dataHelpId':
        return this.findByDataHelpId(selector.value);
        
      case 'icon':
        return this.findByIcon(selector.value, selector.element || 'button');
        
      case 'accessibleName':
        return this.findByAccessibleName(selector.value);
        
      case 'ariaLabel':
        return this.findByAriaLabel(selector.value);
        
      case 'partialText':
        return this.findByPartialText(selector.value);
        
      case 'css':
        return this.findByCSS(selector.value);
        
      case 'xpath':
        return this.findByXPath(selector.value);
        
      default:
        this.logger.warn('Unknown selector type', { type: selector.type });
        return null;
    }
  }

  /**
   * Find by data-help-id (language-neutral)
   * BEST STRATEGY - Works in all languages
   * @param {string|Array} helpIds - Help ID(s) to search for
   * @returns {HTMLElement|null}
   */
  findByDataHelpId(helpIds) {
    const idArray = Array.isArray(helpIds) ? helpIds : [helpIds];
    
    for (const helpId of idArray) {
      // Try standard DOM
      let element = document.querySelector(`[data-help-id="${helpId}"]`);
      if (element) {
        this.logger.info('Found by data-help-id (DOM)', { helpId });
        return element;
      }
      
      // Try shadow DOM
      element = this.searchShadowDOMForAttribute('data-help-id', helpId);
      if (element) {
        this.logger.info('Found by data-help-id (Shadow DOM)', { helpId });
        return element;
      }
    }
    
    return null;
  }

  /**
   * Find by icon name (visual identifier)
   * GOOD STRATEGY - Language-neutral
   * @param {string|Array} iconNames - Icon name(s) to search for
   * @param {string} elementType - Type of element to find (default: 'button')
   * @returns {HTMLElement|null}
   */
  findByIcon(iconNames, elementType = 'button') {
    const iconArray = Array.isArray(iconNames) ? iconNames : [iconNames];
    
    for (const iconName of iconArray) {
      // Find icon elements with various patterns
      const iconSelectors = [
        `ui5-icon[name="${iconName}"]`,
        `[icon="${iconName}"]`,
        `[data-icon="${iconName}"]`,
        `.sapUi5Icon[data-icon-name="${iconName}"]`
      ];
      
      for (const iconSelector of iconSelectors) {
        // Search in regular DOM
        const icons = document.querySelectorAll(iconSelector);
        
        for (const icon of icons) {
          // Find closest button/element
          const button = icon.closest(elementType) || 
                        icon.parentElement?.closest(elementType);
          
          if (button) {
            this.logger.info('Found by icon (DOM)', { iconName, elementType });
            return button;
          }
        }
        
        // Try shadow DOM
        const shadowIcon = this.searchShadowDOMForSelector(iconSelector);
        if (shadowIcon) {
          const button = shadowIcon.closest(elementType) || 
                        shadowIcon.parentElement?.closest(elementType);
          if (button) {
            this.logger.info('Found by icon (Shadow DOM)', { iconName });
            return button;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Find by accessible-name attribute (UI5 Web Components)
   * FALLBACK STRATEGY - Requires language mapping
   * @param {string|Object|Array} accessibleNames - Text or language map
   * @returns {HTMLElement|null}
   */
  findByAccessibleName(accessibleNames) {
    let searchTexts;
    
    if (typeof accessibleNames === 'object' && !Array.isArray(accessibleNames)) {
      // Language map provided - detect current language
      const currentLang = this.detectLanguage();
      searchTexts = [accessibleNames[currentLang]];
      
      // Add English as fallback
      if (currentLang !== 'en' && accessibleNames.en) {
        searchTexts.push(accessibleNames.en);
      }
    } else {
      // Array of texts or single text provided
      searchTexts = Array.isArray(accessibleNames) ? accessibleNames : [accessibleNames];
    }
    
    for (const text of searchTexts) {
      if (!text) continue;
      
      // Try accessible-name attribute (UI5 Web Components)
      let element = document.querySelector(`[accessible-name="${text}"]`);
      if (element) {
        this.logger.info('Found by accessible-name (exact)', { text });
        return element;
      }
      
      // Try partial match
      element = document.querySelector(`[accessible-name*="${text}"]`);
      if (element) {
        this.logger.info('Found by accessible-name (partial)', { text });
        return element;
      }
      
      // Try aria-label
      element = document.querySelector(`[aria-label*="${text}"]`);
      if (element) {
        this.logger.info('Found by aria-label', { text });
        return element;
      }
      
      // Try shadow DOM
      element = this.searchShadowDOMForAttribute('accessible-name', text);
      if (element) {
        this.logger.info('Found by accessible-name (Shadow DOM)', { text });
        return element;
      }
      
      element = this.searchShadowDOMForAttribute('aria-label', text);
      if (element) {
        this.logger.info('Found by aria-label (Shadow DOM)', { text });
        return element;
      }
    }
    
    return null;
  }

  /**
   * Find by aria-label (multi-language)
   * @param {string|Array} ariaLabels - Aria label(s) to search for
   * @returns {HTMLElement|null}
   */
  findByAriaLabel(ariaLabels) {
    const labelArray = Array.isArray(ariaLabels) ? ariaLabels : [ariaLabels];
    
    for (const label of labelArray) {
      // Exact match
      let element = document.querySelector(`[aria-label="${label}"]`);
      if (element) {
        this.logger.info('Found by aria-label (exact)', { label });
        return element;
      }
      
      // Partial match
      element = document.querySelector(`[aria-label*="${label}"]`);
      if (element) {
        this.logger.info('Found by aria-label (partial)', { label });
        return element;
      }
      
      // Shadow DOM
      element = this.searchShadowDOMForAttribute('aria-label', label);
      if (element) {
        this.logger.info('Found by aria-label (Shadow DOM)', { label });
        return element;
      }
    }
    
    return null;
  }

  /**
   * Find by partial text match
   * LAST RESORT - Works but least reliable
   * @param {string|Array} texts - Text(s) to search for
   * @returns {HTMLElement|null}
   */
  findByPartialText(texts) {
    const textArray = Array.isArray(texts) ? texts : [texts];
    
    for (const text of textArray) {
      const textLower = text.toLowerCase();
      
      // Search all buttons
      const buttons = document.querySelectorAll('button, [role="button"]');
      
      for (const button of buttons) {
        const buttonText = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const accessibleName = button.getAttribute('accessible-name')?.toLowerCase() || '';
        
        if (buttonText.includes(textLower) || 
            ariaLabel.includes(textLower) ||
            accessibleName.includes(textLower)) {
          this.logger.info('Found by partial text (DOM)', { text });
          return button;
        }
      }
      
      // Try shadow DOM
      const shadowButton = this.searchShadowDOMForText(textLower);
      if (shadowButton) {
        this.logger.info('Found by partial text (Shadow DOM)', { text });
        return shadowButton;
      }
    }
    
    return null;
  }

  /**
   * Find by CSS selector
   * @param {string} cssSelector - CSS selector
   * @returns {HTMLElement|null}
   */
  findByCSS(cssSelector) {
    let element = document.querySelector(cssSelector);
    if (element) {
      this.logger.info('Found by CSS (DOM)', { cssSelector });
      return element;
    }
    
    // Try shadow DOM
    element = this.searchShadowDOMForSelector(cssSelector);
    if (element) {
      this.logger.info('Found by CSS (Shadow DOM)', { cssSelector });
      return element;
    }
    
    return null;
  }

  /**
   * Find by XPath selector
   * @param {string} xpathSelector - XPath selector
   * @returns {HTMLElement|null}
   */
  findByXPath(xpathSelector) {
    try {
      const xpathResult = document.evaluate(
        xpathSelector,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const element = xpathResult.singleNodeValue;
      
      if (element) {
        this.logger.info('Found by XPath', { xpathSelector });
        return element;
      }
    } catch (error) {
      this.logger.warn('XPath evaluation failed', { xpathSelector, error: error.message });
    }
    
    return null;
  }

  /**
   * Check if element is visible
   * @param {HTMLElement} element - Element to check
   * @returns {boolean}
   */
  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  /**
   * Search shadow DOM for element with specific attribute
   * @param {string} attributeName - Attribute name to search for
   * @param {string} attributeValue - Attribute value to match
   * @returns {HTMLElement|null}
   */
  searchShadowDOMForAttribute(attributeName, attributeValue) {
    const allElements = document.querySelectorAll('*');
    
    for (const element of allElements) {
      if (element.shadowRoot) {
        // Try exact match
        let found = element.shadowRoot.querySelector(
          `[${attributeName}="${attributeValue}"]`
        );
        
        if (found) return found;
        
        // Try partial match
        found = element.shadowRoot.querySelector(
          `[${attributeName}*="${attributeValue}"]`
        );
        
        if (found) return found;
        
        // Recurse into nested shadow roots
        const nested = this.searchNestedShadowForAttribute(
          element.shadowRoot, 
          attributeName, 
          attributeValue
        );
        if (nested) return nested;
      }
    }
    
    return null;
  }

  /**
   * Recursively search nested shadow DOMs for attribute
   * @param {ShadowRoot} shadowRoot - Shadow root to search
   * @param {string} attributeName - Attribute name
   * @param {string} attributeValue - Attribute value
   * @returns {HTMLElement|null}
   */
  searchNestedShadowForAttribute(shadowRoot, attributeName, attributeValue) {
    const elements = shadowRoot.querySelectorAll('*');
    
    for (const element of elements) {
      if (element.shadowRoot) {
        // Try exact match
        let found = element.shadowRoot.querySelector(
          `[${attributeName}="${attributeValue}"]`
        );
        
        if (found) return found;
        
        // Try partial match
        found = element.shadowRoot.querySelector(
          `[${attributeName}*="${attributeValue}"]`
        );
        
        if (found) return found;
        
        const nested = this.searchNestedShadowForAttribute(
          element.shadowRoot,
          attributeName,
          attributeValue
        );
        if (nested) return nested;
      }
    }
    
    return null;
  }

  /**
   * Search shadow DOM for CSS selector
   * @param {string} cssSelector - CSS selector
   * @returns {HTMLElement|null}
   */
  searchShadowDOMForSelector(cssSelector) {
    const allElements = document.querySelectorAll('*');
    
    for (const element of allElements) {
      if (element.shadowRoot) {
        const found = element.shadowRoot.querySelector(cssSelector);
        if (found) return found;
        
        // Recurse
        const nested = this.searchNestedShadowForSelector(element.shadowRoot, cssSelector);
        if (nested) return nested;
      }
    }
    
    return null;
  }

  /**
   * Recursively search nested shadow DOMs for CSS selector
   * @param {ShadowRoot} shadowRoot - Shadow root to search
   * @param {string} cssSelector - CSS selector
   * @returns {HTMLElement|null}
   */
  searchNestedShadowForSelector(shadowRoot, cssSelector) {
    const elements = shadowRoot.querySelectorAll('*');
    
    for (const element of elements) {
      if (element.shadowRoot) {
        const found = element.shadowRoot.querySelector(cssSelector);
        if (found) return found;
        
        const nested = this.searchNestedShadowForSelector(element.shadowRoot, cssSelector);
        if (nested) return nested;
      }
    }
    
    return null;
  }

  /**
   * Search shadow DOM for text content
   * @param {string} searchText - Text to search for (lowercase)
   * @returns {HTMLElement|null}
   */
  searchShadowDOMForText(searchText) {
    const allElements = document.querySelectorAll('*');
    
    for (const element of allElements) {
      if (element.shadowRoot) {
        const buttons = element.shadowRoot.querySelectorAll('button, [role="button"]');
        
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const accessibleName = button.getAttribute('accessible-name')?.toLowerCase() || '';
          
          if (text.includes(searchText) || 
              ariaLabel.includes(searchText) ||
              accessibleName.includes(searchText)) {
            return button;
          }
        }
        
        // Recurse
        const nested = this.searchNestedShadowForText(element.shadowRoot, searchText);
        if (nested) return nested;
      }
    }
    
    return null;
  }

  /**
   * Recursively search nested shadow DOMs for text
   * @param {ShadowRoot} shadowRoot - Shadow root to search
   * @param {string} searchText - Text to search for (lowercase)
   * @returns {HTMLElement|null}
   */
  searchNestedShadowForText(shadowRoot, searchText) {
    const elements = shadowRoot.querySelectorAll('*');
    
    for (const element of elements) {
      if (element.shadowRoot) {
        const buttons = element.shadowRoot.querySelectorAll('button, [role="button"]');
        
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const accessibleName = button.getAttribute('accessible-name')?.toLowerCase() || '';
          
          if (text.includes(searchText) || 
              ariaLabel.includes(searchText) ||
              accessibleName.includes(searchText)) {
            return button;
          }
        }
        
        const nested = this.searchNestedShadowForText(element.shadowRoot, searchText);
        if (nested) return nested;
      }
    }
    
    return null;
  }
}

// Create global handler instance
window.JouleQuestJouleHandler = new JouleHandler();
