/**
 * Joule Iframe Handler - Runs INSIDE the Joule iframe
 * This script is injected into the Joule iframe to interact with elements
 * Communicates with main content script via window.postMessage
 */

// Simple logger for iframe context
const iframeLogger = {
  log: (msg, data) => console.log(`[Joule Iframe] ${msg}`, data || ''),
  success: (msg) => console.log(`[Joule Iframe] ✅ ${msg}`),
  error: (msg, err) => console.error(`[Joule Iframe] ❌ ${msg}`, err || ''),
  info: (msg) => console.log(`[Joule Iframe] ℹ️ ${msg}`),
  warn: (msg) => console.warn(`[Joule Iframe] ⚠️ ${msg}`)
};

class JouleIframeHandler {
  constructor() {
    this.logger = iframeLogger;
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.logger.info('Initializing Joule iframe handler');
    this.logger.info(`Iframe URL: ${window.location.href}`);
    this.logger.info(`Document ready state: ${document.readyState}`);
    
    // COMPREHENSIVE DEBUG LOGGING
    setTimeout(() => {
      this.logger.info('═══ IFRAME CONTENT ANALYSIS ═══');
      
      // Basic stats
      this.logger.info(`Total elements: ${document.querySelectorAll('*').length}`);
      this.logger.info(`Body HTML (first 500 chars): ${document.body.innerHTML.substring(0, 500)}`);
      
      // SAPUI5-specific elements
      this.logger.info('\n--- SAPUI5 Elements ---');
      this.logger.info(`sapMInputBaseInner: ${document.querySelectorAll('.sapMInputBaseInner').length}`);
      this.logger.info(`sapMInputBase: ${document.querySelectorAll('.sapMInputBase').length}`);
      this.logger.info(`sapMTextArea: ${document.querySelectorAll('.sapMTextArea').length}`);
      
      // ARIA roles
      this.logger.info('\n--- ARIA Roles ---');
      this.logger.info(`[role="textbox"]: ${document.querySelectorAll('[role="textbox"]').length}`);
      this.logger.info(`[role="log"]: ${document.querySelectorAll('[role="log"]').length}`);
      this.logger.info(`[aria-live="polite"]: ${document.querySelectorAll('[aria-live="polite"]').length}`);
      
      // Standard inputs
      this.logger.info('\n--- Standard Inputs ---');
      this.logger.info(`textarea: ${document.querySelectorAll('textarea').length}`);
      this.logger.info(`input[type="text"]: ${document.querySelectorAll('input[type="text"]').length}`);
      this.logger.info(`input: ${document.querySelectorAll('input').length}`);
      
      // List all SAPUI5 inputs with details
      const sapInputs = document.querySelectorAll('.sapMInputBaseInner, [role="textbox"]');
      if (sapInputs.length > 0) {
        this.logger.success(`\n✅ Found ${sapInputs.length} SAPUI5 input(s):`);
        sapInputs.forEach((input, i) => {
          this.logger.success(`  [${i}] tag="${input.tagName}" id="${input.id}" class="${input.className}" role="${input.getAttribute('role')}" placeholder="${input.placeholder}"`);
        });
      }
      
      // List all textareas
      const textareas = document.querySelectorAll('textarea');
      if (textareas.length > 0) {
        this.logger.success(`\n✅ Found ${textareas.length} textarea(s):`);
        textareas.forEach((ta, i) => {
          this.logger.success(`  [${i}] id="${ta.id}" class="${ta.className}" placeholder="${ta.placeholder}"`);
        });
      }
      
      // If nothing found
      if (sapInputs.length === 0 && textareas.length === 0) {
        this.logger.error('\n❌ NO INPUT FIELDS FOUND');
        this.logger.error('First 20 elements in body:');
        Array.from(document.body.querySelectorAll('*')).slice(0, 20).forEach((el, i) => {
          this.logger.error(`  [${i}] ${el.tagName}.${el.className}#${el.id}`);
        });
      }
      
      this.logger.info('═══ END ANALYSIS ═══\n');
    }, 3000); // Wait 3 seconds for DOM to fully load
    
    // Listen for messages from parent window
    window.addEventListener('message', (event) => {
      // Verify message is from our extension
      if (event.data && event.data.source === 'joule-quest-main') {
        this.handleMessage(event.data);
      }
    });

    this.isInitialized = true;
    this.logger.success('Joule iframe handler initialized');
    
    // Notify parent that iframe is ready
    this.sendMessageToParent({
      type: 'iframe_ready',
      data: { url: window.location.href }
    });
  }

  /**
   * Handle messages from parent window
   */
  async handleMessage(message) {
    this.logger.log('Received message from parent', message);

    try {
      switch (message.type) {
        case 'find_input':
          await this.findInputField(message.requestId);
          break;
        
        case 'type_text':
          await this.typeText(message.data.text, message.requestId);
          break;
        
        case 'click_send':
          await this.clickSendButton(message.requestId);
          break;
        
        case 'wait_for_response':
          await this.waitForResponse(message.data.keywords, message.data.timeout, message.requestId);
          break;
        
        case 'check_if_open':
          await this.checkIfOpen(message.requestId);
          break;
        
        case 'find_interactive_elements':
          await this.findInteractiveElements(message.requestId);
          break;
        
        case 'click_first_button':
          await this.clickFirstButton(message.requestId);
          break;
        
        case 'click_button_by_text':
          await this.clickButtonByText(message.data.text, message.requestId);
          break;
        
        default:
          this.logger.error('Unknown message type', message.type);
      }
    } catch (error) {
      this.logger.error('Error handling message', error);
      this.sendMessageToParent({
        type: 'error',
        requestId: message.requestId,
        error: error.message
      });
    }
  }

  /**
   * Find input field in iframe
   */
  async findInputField(requestId) {
    this.logger.info('Finding input field');
    
    // Try multiple selectors
    const selectors = [
      'textarea',
      'textarea[placeholder*="Message"]',
      '[role="textbox"]',
      'input[type="text"]'
    ];

    for (const selector of selectors) {
      const input = document.querySelector(selector);
      if (input) {
        this.logger.success(`Found input field with selector: ${selector}`);
        this.sendMessageToParent({
          type: 'input_found',
          requestId: requestId,
          data: { found: true, selector: selector }
        });
        return;
      }
    }

    this.logger.error('Input field not found');
    this.sendMessageToParent({
      type: 'input_found',
      requestId: requestId,
      data: { found: false }
    });
  }

  /**
   * Type text into input field
   */
  async typeText(text, requestId) {
    this.logger.info(`Typing text: ${text}`);
    
    // Wait for DOM to be ready
    await this.waitForDOMReady();
    
    // Log current document state
    this.logger.info(`Document ready state: ${document.readyState}`);
    this.logger.info(`Current URL: ${window.location.href}`);
    
    // CRITICAL: The textarea is inside a Shadow DOM!
    // UI5-TEXTAREA#footerTextArea contains the actual textarea in its shadowRoot
    this.logger.info('Looking for UI5-TEXTAREA#footerTextArea (Shadow DOM host)...');
    
    // Wait for the UI5-TEXTAREA element (Shadow DOM host)
    const ui5Textarea = await this.waitForElement('ui5-textarea#footerTextArea', 15000);
    
    if (!ui5Textarea) {
      this.logger.error('UI5-TEXTAREA#footerTextArea not found');
      
      // Try alternative selectors for UI5-TEXTAREA
      const altUI5 = await this.waitForElement('ui5-textarea.dasTextAreaInput', 5000);
      if (!altUI5) {
        this.logger.error('No UI5-TEXTAREA element found at all');
      }
    }
    
    let textarea = null;
    
    // Access the Shadow DOM
    if (ui5Textarea && ui5Textarea.shadowRoot) {
      this.logger.success('Found UI5-TEXTAREA with Shadow DOM, accessing shadowRoot...');
      
      // Wait for textarea inside Shadow DOM
      textarea = await this.waitForElementInShadowRoot(ui5Textarea.shadowRoot, 'textarea', 5000);
      
      if (textarea) {
        this.logger.success(`Found textarea in Shadow DOM: id="${textarea.id}" class="${textarea.className}"`);
      }
    }
    
    if (!textarea) {
      // Debug: Log ALL elements in the iframe
      this.logger.error('TEXTAREA NOT FOUND. Analyzing iframe content:');
      this.logger.error(`Total elements: ${document.querySelectorAll('*').length}`);
      this.logger.error(`All textareas: ${document.querySelectorAll('textarea').length}`);
      this.logger.error(`All inputs: ${document.querySelectorAll('input').length}`);
      
      // Log ALL textareas with their full selectors
      const allTextareas = document.querySelectorAll('textarea');
      this.logger.error(`Found ${allTextareas.length} textarea elements:`);
      allTextareas.forEach((ta, i) => {
        this.logger.error(`  [${i}] id="${ta.id}" class="${ta.className}" placeholder="${ta.placeholder}"`);
      });
      
      // Check for Shadow DOM elements
      this.logger.error('Checking for Shadow DOM...');
      const elementsWithShadow = document.querySelectorAll('*');
      let shadowRootCount = 0;
      elementsWithShadow.forEach((el) => {
        if (el.shadowRoot) {
          shadowRootCount++;
          this.logger.error(`Found Shadow DOM in: ${el.tagName}.${el.className}#${el.id}`);
          
          // Check for textarea in shadow root
          const shadowTextarea = el.shadowRoot.querySelector('textarea');
          if (shadowTextarea) {
            this.logger.error(`  ⚡ FOUND TEXTAREA IN SHADOW DOM!`);
            this.logger.error(`  ⚡ id="${shadowTextarea.id}" class="${shadowTextarea.className}" placeholder="${shadowTextarea.placeholder}"`);
          }
        }
      });
      this.logger.error(`Total elements with Shadow DOM: ${shadowRootCount}`);
      
      // Log first 20 elements to see structure
      this.logger.error('First 20 elements in body:');
      Array.from(document.body.querySelectorAll('*')).slice(0, 20).forEach((el, i) => {
        this.logger.error(`  [${i}] ${el.tagName}.${el.className}#${el.id}`);
      });
      
      this.sendMessageToParent({
        type: 'text_typed',
        requestId: requestId,
        data: { 
          success: false, 
          error: 'Textarea not found after trying all selectors',
          debug: {
            url: window.location.href,
            totalElements: document.querySelectorAll('*').length,
            textareas: document.querySelectorAll('textarea').length,
            shadowRoots: shadowRootCount,
            readyState: document.readyState
          }
        }
      });
      return;
    }
    
    this.logger.success(`Found textarea: id="${textarea.id}" class="${textarea.className}"`);
    
    // DIRECTLY TYPE INTO THE TEXTAREA WE FOUND IN SHADOW DOM
    // No need to re-query document - we already have the element!
    
    try {
      // Clear existing content
      textarea.value = '';
      
      // Set new value
      textarea.value = text;
      
      // Focus the textarea
      textarea.focus();
      
      // Dispatch events with bubbles:true and composed:true for Shadow DOM
      // composed:true allows events to cross Shadow DOM boundary
      textarea.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
      textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      
      // Keyboard events
      textarea.dispatchEvent(new KeyboardEvent('keydown', { 
        bubbles: true, 
        composed: true,
        key: text[0] || 'a'
      }));
      textarea.dispatchEvent(new KeyboardEvent('keypress', { 
        bubbles: true, 
        composed: true,
        key: text[0] || 'a'
      }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { 
        bubbles: true, 
        composed: true,
        key: text[text.length - 1] || 'a'
      }));
      
      // Blur and re-focus to trigger any validation
      textarea.blur();
      await new Promise(resolve => setTimeout(resolve, 50));
      textarea.focus();
      
      this.logger.success(`✅ Text typed successfully into Shadow DOM textarea: "${text}"`);
      this.logger.success(`✅ Current textarea value: "${textarea.value}"`);
      
      this.sendMessageToParent({
        type: 'text_typed',
        requestId: requestId,
        data: { 
          success: true, 
          method: 'shadow_dom_direct',
          value: textarea.value,
          textareaId: textarea.id
        }
      });
      
    } catch (error) {
      this.logger.error('Error typing into textarea:', error);
      this.sendMessageToParent({
        type: 'text_typed',
        requestId: requestId,
        data: { 
          success: false, 
          error: error.message,
          method: 'shadow_dom_direct'
        }
      });
    }
  }

  /**
   * Click send button (or press Enter key as alternative)
   */
  async clickSendButton(requestId) {
    this.logger.info('Sending message (trying Enter key on Shadow DOM textarea)');
    
    // APPROACH 1: Press Enter key on textarea in Shadow DOM (most reliable)
    // Find UI5-TEXTAREA host element
    const ui5Textarea = document.querySelector('ui5-textarea#footerTextArea') ||
                        document.querySelector('ui5-textarea.dasTextAreaInput');
    
    let textarea = null;
    
    // Access Shadow DOM
    if (ui5Textarea && ui5Textarea.shadowRoot) {
      textarea = ui5Textarea.shadowRoot.querySelector('textarea');
      this.logger.info('Found textarea in Shadow DOM for sending');
    }
    
    // Fallback: Try to find textarea in main DOM
    if (!textarea) {
      textarea = document.querySelector('textarea');
      this.logger.info('Using fallback: textarea from main DOM');
    }
    
    if (textarea) {
      this.logger.info('Pressing Enter key on textarea to send');
      
      // Focus textarea first
      textarea.focus();
      
      // Press Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        composed: true,
        cancelable: true
      });
      
      textarea.dispatchEvent(enterEvent);
      
      // Also dispatch keyup
      const enterUpEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        composed: true
      });
      
      textarea.dispatchEvent(enterUpEvent);
      
      this.logger.success(`✅ Enter key pressed on textarea (method: ${ui5Textarea ? 'shadow_dom' : 'fallback'})`);
      this.sendMessageToParent({
        type: 'send_clicked',
        requestId: requestId,
        data: { 
          success: true, 
          method: ui5Textarea ? 'enter_key_shadow_dom' : 'enter_key_fallback'
        }
      });
      return;
    }
    
    // APPROACH 2: Find and click send button (fallback)
    this.logger.info('Textarea not found, trying to find send button');
    
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      const hasIcon = button.querySelector('svg, ui5-icon');
      const ariaLabel = button.getAttribute('aria-label') || '';
      const description = button.getAttribute('description') || '';
      
      // Check if it's the send button (might have icon, aria-label, or "Send" text)
      if (hasIcon || 
          ariaLabel.toLowerCase().includes('send') ||
          description.toLowerCase().includes('send') ||
          button.textContent.toLowerCase().includes('send')) {
        
        this.logger.success('Found send button, clicking');
        button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        button.click();
        
        this.sendMessageToParent({
          type: 'send_clicked',
          requestId: requestId,
          data: { success: true, method: 'button_click' }
        });
        return;
      }
    }

    this.logger.error('Could not send message (no textarea or send button found)');
    this.sendMessageToParent({
      type: 'send_clicked',
      requestId: requestId,
      data: { success: false, error: 'No send method available' }
    });
  }

  /**
   * Wait for response with keywords
   */
  async waitForResponse(keywords = [], timeout = 30000, requestId) {
    this.logger.info(`Waiting for response with keywords: ${keywords.join(', ')}`);
    
    const startTime = Date.now();
    
    // Find the message container - try multiple selectors
    // CRITICAL: Use body as ultimate fallback - messages WILL appear somewhere
    let messageContainer = document.querySelector('.mainAppLive__message-container') ||
                          document.querySelector('[class*="message-container"]') ||
                          document.querySelector('[role="log"]') ||
                          document.querySelector('[aria-live="polite"]') ||
                          document.body; // FALLBACK: Just watch the whole body
    
    this.logger.info(`Using message container: ${messageContainer.className || messageContainer.tagName}`);
    
    // Store initial body text to detect ANY changes
    const initialBodyText = document.body.innerText;
    this.logger.info(`Initial body text length: ${initialBodyText.length}`);
    
    // Also count message elements
    const initialMessages = messageContainer.querySelectorAll('[id^="UserBotGroup"], [role="article"], .message, [class*="message"]').length;
    this.logger.info(`Initial message count: ${initialMessages}`);
    
    const checkForKeywords = () => {
      // Check for new message elements (indicates new response)
      const currentMessages = messageContainer.querySelectorAll('[id^="UserBotGroup"], [role="article"], .message, [class*="message"]').length;
      
      // ALSO check if body text changed significantly (response appeared)
      const currentBodyText = document.body.innerText;
      const textChanged = currentBodyText.length > initialBodyText.length + 50; // At least 50 chars added
      
      // If new messages appeared OR body text changed significantly, check for keywords
      if (currentMessages > initialMessages || textChanged) {
        this.logger.info(`New content detected! Messages: ${currentMessages} vs ${initialMessages}, Text changed: ${textChanged}`);
        
        // Get text from latest bot response - try multiple approaches
        let responseText = '';
        
        // Try aria-live="polite" first (common for live regions)
        const liveResponse = messageContainer.querySelector('[aria-live="polite"]');
        if (liveResponse) {
          responseText = liveResponse.innerText;
          this.logger.info('Found response via aria-live="polite"');
        }
        
        // Try getting all messages and taking the last one
        if (!responseText) {
          const allMessages = messageContainer.querySelectorAll('[id^="UserBotGroup"], [role="article"], .message, [class*="message"]');
          if (allMessages.length > 0) {
            responseText = allMessages[allMessages.length - 1].innerText;
            this.logger.info('Found response via last message element');
          }
        }
        
        // Fallback: get all text from container
        if (!responseText) {
          responseText = messageContainer.innerText;
          this.logger.info('Using full container text as fallback');
        }
        
        responseText = responseText.toLowerCase();
        this.logger.info(`Response text (first 200 chars): ${responseText.substring(0, 200)}`);
        
        // If no keywords specified, any response is success
        if (keywords.length === 0) {
          this.logger.success('Response received (no keywords specified)');
          this.sendMessageToParent({
            type: 'response_detected',
            requestId: requestId,
            data: { found: true, text: responseText }
          });
          return true;
        }
        
        // Check for keywords
        for (const keyword of keywords) {
          if (responseText.includes(keyword.toLowerCase())) {
            this.logger.success(`Found keyword: ${keyword}`);
            this.sendMessageToParent({
              type: 'response_detected',
              requestId: requestId,
              data: { found: true, keyword: keyword, text: responseText }
            });
            return true;
          }
        }
        
        // New response but no keyword match
        this.logger.warn('Response received but keywords not found');
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        this.logger.error('Timeout waiting for response');
        const bodyText = document.body.innerText;
        this.sendMessageToParent({
          type: 'response_detected',
          requestId: requestId,
          data: { found: false, error: 'Timeout', text: bodyText.substring(0, 500) }
        });
        return true;
      }

      return false;
    };

    // Return a promise that resolves when response is found or timeout
    return new Promise((resolve) => {
      // Set up MutationObserver on message container
      const observer = new MutationObserver(() => {
        if (checkForKeywords()) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(messageContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-live']
      });

      // Initial check
      if (checkForKeywords()) {
        observer.disconnect();
        resolve();
      }
    });
  }

  /**
   * Check if Joule is open (if this script is running, Joule is open)
   */
  async checkIfOpen(requestId) {
    this.logger.info('Checking if Joule is open');
    
    // If this script is running in the iframe, Joule is open
    const inputField = document.querySelector('textarea');
    
    this.sendMessageToParent({
      type: 'joule_status',
      requestId: requestId,
      data: { 
        isOpen: true,
        hasInputField: !!inputField,
        url: window.location.href
      }
    });
  }

  /**
   * Wait for DOM to be ready
   */
  async waitForDOMReady() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
      // Fallback timeout
      setTimeout(resolve, 5000);
    });
  }

  /**
   * Wait for element to appear in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Max wait time in ms
   * @returns {Promise<Element|null>}
   */
  async waitForElement(selector, timeout = 10000) {
    const startTime = Date.now();
    
    // Check immediately
    let element = document.querySelector(selector);
    if (element) {
      this.logger.info(`Element ${selector} found immediately`);
      return element;
    }
    
    this.logger.info(`Waiting for element: ${selector}`);
    
    return new Promise((resolve) => {
      // Set up interval checking
      const checkInterval = setInterval(() => {
        element = document.querySelector(selector);
        
        if (element) {
          this.logger.success(`Element ${selector} found after ${Date.now() - startTime}ms`);
          clearInterval(checkInterval);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          this.logger.error(`Element ${selector} not found after ${timeout}ms`);
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100); // Check every 100ms
    });
  }

  /**
   * Wait for element to appear in Shadow DOM
   * @param {ShadowRoot} shadowRoot - Shadow root to search in
   * @param {string} selector - CSS selector
   * @param {number} timeout - Max wait time in ms
   * @returns {Promise<Element|null>}
   */
  async waitForElementInShadowRoot(shadowRoot, selector, timeout = 10000) {
    const startTime = Date.now();
    
    // Check immediately
    let element = shadowRoot.querySelector(selector);
    if (element) {
      this.logger.info(`Element ${selector} found immediately in Shadow DOM`);
      return element;
    }
    
    this.logger.info(`Waiting for element in Shadow DOM: ${selector}`);
    
    return new Promise((resolve) => {
      // Set up interval checking
      const checkInterval = setInterval(() => {
        element = shadowRoot.querySelector(selector);
        
        if (element) {
          this.logger.success(`Element ${selector} found in Shadow DOM after ${Date.now() - startTime}ms`);
          clearInterval(checkInterval);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          this.logger.error(`Element ${selector} not found in Shadow DOM after ${timeout}ms`);
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100); // Check every 100ms
    });
  }

  /**
   * Find interactive elements (buttons, links) in latest Joule response
   */
  async findInteractiveElements(requestId) {
    this.logger.info('Finding interactive elements in latest response');
    
    // Wait a bit for response to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find message container
    const messageContainer = document.querySelector('[role="log"]') ||
                            document.querySelector('[aria-live="polite"]') ||
                            document.body;
    
    // Get all buttons and links in latest response
    const buttons = Array.from(messageContainer.querySelectorAll('button, a[role="button"], [role="button"]'));
    
    const interactiveElements = buttons.map((btn, index) => ({
      index: index,
      text: btn.textContent.trim(),
      ariaLabel: btn.getAttribute('aria-label') || '',
      type: btn.tagName.toLowerCase(),
      hasIcon: !!btn.querySelector('svg, ui5-icon')
    }));
    
    this.logger.success(`Found ${interactiveElements.length} interactive elements`);
    interactiveElements.forEach((el, i) => {
      this.logger.info(`  [${i}] ${el.type}: "${el.text}" (aria-label: "${el.ariaLabel}")`);
    });
    
    this.sendMessageToParent({
      type: 'interactive_elements_found',
      requestId: requestId,
      data: { 
        success: true,
        elements: interactiveElements,
        count: interactiveElements.length
      }
    });
  }

  /**
   * Click the first interactive button found in latest response
   * OR enter text/number into input field if available
   */
  async clickFirstButton(requestId) {
    this.logger.info('Looking for first interactive option (button or input)');
    
    // Wait a bit for response to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find message container
    const messageContainer = document.querySelector('[role="log"]') ||
                            document.querySelector('[aria-live="polite"]') ||
                            document.body;
    
    // PRIORITY 1: Check for input fields (text, number, select)
    const inputs = Array.from(messageContainer.querySelectorAll('input[type="text"], input[type="number"], select'));
    
    if (inputs.length > 0) {
      const firstInput = inputs[0];
      this.logger.success(`Found input field: type="${firstInput.type}" id="${firstInput.id}"`);
      
      // Input field detected - need text value from parent
      this.sendMessageToParent({
        type: 'button_clicked',
        requestId: requestId,
        data: { 
          success: true,
          type: 'input',
          inputType: firstInput.type,
          inputId: firstInput.id,
          message: 'Input field detected - use type_and_send action to enter value'
        }
      });
      return;
    }
    
    // PRIORITY 2: Look for buttons
    const allButtons = Array.from(messageContainer.querySelectorAll('button, a[role="button"], [role="button"]'));
    
    if (allButtons.length === 0) {
      this.logger.error('No interactive buttons or inputs found');
      this.sendMessageToParent({
        type: 'button_clicked',
        requestId: requestId,
        data: { success: false, error: 'No buttons or inputs found' }
      });
      return;
    }
    
    // Click the first button (usually "View" or "Select")
    const firstButton = allButtons[0];
    this.logger.success(`Clicking button: "${firstButton.textContent.trim()}"`);
    
    // Trigger click with multiple events for reliability
    firstButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    firstButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
    firstButton.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    firstButton.click();
    
    this.sendMessageToParent({
      type: 'button_clicked',
      requestId: requestId,
      data: { 
        success: true,
        type: 'button',
        buttonText: firstButton.textContent.trim(),
        buttonAriaLabel: firstButton.getAttribute('aria-label') || ''
      }
    });
  }

  /**
   * Click button matching specific text
   * Searches for buttons, links, and clickable elements
   */
  async clickButtonByText(buttonText, requestId) {
    this.logger.info(`Looking for clickable element with text: "${buttonText}"`);
    
    // Wait a bit for UI to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Search for ALL clickable elements: buttons, links, and elements with click handlers
    const allClickable = Array.from(document.querySelectorAll(
      'button, a, a[role="button"], [role="button"], [onclick], ' +
      'span[class*="Link"], div[class*="Link"], ' +
      '[class*="clickable"], [class*="Clickable"]'
    ));
    
    // Also search for any element containing the exact text
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().toLowerCase() === buttonText.toLowerCase()) {
        textNodes.push(node.parentElement);
      }
    }
    
    // Combine all potential clickable elements
    const allElements = [...allClickable, ...textNodes];
    
    this.logger.info(`Found ${allElements.length} total clickable elements and text matches`);
    
    // Find FIRST element matching text (case-insensitive)
    // IMPORTANT: Use .find() to get only the first match, not all matches
    const searchText = buttonText.toLowerCase();
    const targetElement = allElements.find(el => {
      if (!el) return false; // Skip null elements
      
      const elText = el.textContent.trim().toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      
      // Match exact text OR text that includes the search term
      return elText === searchText || 
             ariaLabel.includes(searchText) ||
             title.includes(searchText);
    });
    
    if (!targetElement) {
      this.logger.error(`Clickable element not found: "${buttonText}"`);
      this.logger.info('Available clickable elements:');
      allElements.slice(0, 20).forEach((el, i) => {
        this.logger.info(`  [${i}] tag=${el.tagName} text="${el.textContent.trim().substring(0, 50)}" class="${el.className}"`);
      });
      
      this.sendMessageToParent({
        type: 'button_clicked',
        requestId: requestId,
        data: { 
          success: false, 
          error: `Clickable element not found: ${buttonText}`,
          availableElements: allElements.slice(0, 10).map(el => ({
            tag: el.tagName,
            text: el.textContent.trim().substring(0, 50),
            class: el.className
          }))
        }
      });
      return;
    }
    
    this.logger.success(`Found and clicking element: tag=${targetElement.tagName} text="${targetElement.textContent.trim()}"`);
    
    // Trigger click with multiple events for maximum compatibility
    targetElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    targetElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
    targetElement.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    targetElement.click();
    
    this.sendMessageToParent({
      type: 'button_clicked',
      requestId: requestId,
      data: { 
        success: true,
        elementTag: targetElement.tagName,
        buttonText: targetElement.textContent.trim(),
        elementClass: targetElement.className
      }
    });
  }

  /**
   * Send message to parent window
   */
  sendMessageToParent(message) {
    window.parent.postMessage({
      source: 'joule-quest-iframe',
      ...message
    }, '*');
  }
}

// Initialize handler when iframe loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new JouleIframeHandler();
  });
} else {
  new JouleIframeHandler();
}
