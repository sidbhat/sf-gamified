/**
 * Shadow DOM Helper - Utility for finding elements in Shadow DOM
 * Based on research from enterprise platforms (Saleo, WalkMe, Pendo)
 */
class ShadowDOMHelper {
  constructor() {
    this.logger = window.JouleQuestLogger;
  }

  /**
   * Find element using multiple selector strategies
   * Tries CSS selectors first, then Shadow DOM traversal, then XPath
   * @param {string[]} selectors - Array of selector strings
   * @returns {Element|null} Found element or null
   */
  findElement(selectors) {
    this.logger.info('Finding element with selectors', selectors);

    for (const selector of selectors) {
      try {
        // Skip XPath selectors for now (process them last)
        if (selector.startsWith('//')) {
          continue;
        }

        // Try regular CSS selector first
        const element = document.querySelector(selector);
        if (element) {
          this.logger.success('Found element with CSS selector', selector);
          return element;
        }

        // Try Shadow DOM traversal with CSS selector
        const shadowElement = this.findInShadowDOM(selector);
        if (shadowElement) {
          this.logger.success('Found element in Shadow DOM', selector);
          return shadowElement;
        }
      } catch (error) {
        this.logger.warn(`Selector failed: ${selector}`, error);
      }
    }

    // Try XPath selectors last (as fallback)
    for (const selector of selectors) {
      if (selector.startsWith('//')) {
        try {
          const element = this.findByXPath(selector);
          if (element) {
            this.logger.success('Found element with XPath', selector);
            return element;
          }
        } catch (error) {
          this.logger.warn(`XPath selector failed: ${selector}`, error);
        }
      }
    }

    this.logger.error('Element not found with any selector');
    return null;
  }

  /**
   * Find element by XPath
   * @param {string} xpath - XPath expression
   * @returns {Element|null} Found element or null
   */
  findByXPath(xpath) {
    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (error) {
      this.logger.warn('XPath evaluation failed', error);
      return null;
    }
  }

  /**
   * Recursively search for element in Shadow DOM with depth limiting
   * Also handles :contains() pseudo-selector for text matching
   * Automatically pierces UI5 web components to find real buttons
   * @param {string} selector - CSS selector
   * @param {Element} root - Root element to start search
   * @param {number} maxDepth - Maximum recursion depth
   * @param {number} depth - Current depth
   * @returns {Element|null} Found element or null
   */
  findInShadowDOM(selector, root = document.body, maxDepth = 10, depth = 0) {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      this.logger.warn(`Max depth ${maxDepth} reached in shadow DOM traversal`);
      return null;
    }

    // Handle :contains() pseudo-selector (e.g., "ui5-button:contains('Create')")
    const containsMatch = selector.match(/^([^:]+):contains\(['"](.+)['"]\)$/);
    if (containsMatch) {
      const [, tagOrClass, text] = containsMatch;
      
      // Find all matching elements
      const elements = root.querySelectorAll(tagOrClass);
      for (const el of elements) {
        // Check if element's text content contains the search text
        if (el.textContent && el.textContent.trim().includes(text)) {
          this.logger.info(`Found element with text "${text}"`, el);
          
          // For UI5 web components, pierce shadow root to find real button
          const actualButton = this.pierceUI5Shadow(el);
          if (actualButton) return actualButton;
          
          return el;
        }
      }
    }
    
    // Try to find in current scope
    let element = root.querySelector(selector);
    if (element) {
      // If found element is a UI5 component, pierce its shadow
      const actualButton = this.pierceUI5Shadow(element);
      if (actualButton) return actualButton;
      
      return element;
    }

    // Recursively search in shadow roots
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        const shadowElement = this.findInShadowDOM(selector, node.shadowRoot, maxDepth, depth + 1);
        if (shadowElement) return shadowElement;
      }
    }

    return null;
  }

  /**
   * Pierce UI5 web component shadow root to find actual clickable button
   * UI5 components like ui5-button wrap real <button> elements in shadow DOM
   * @param {Element} element - Potential UI5 component
   * @returns {Element|null} Real button element or null
   */
  pierceUI5Shadow(element) {
    // Check if this is a UI5 web component
    const tagName = element.tagName.toLowerCase();
    if (tagName.startsWith('ui5-') && element.shadowRoot) {
      // Try to find the real button inside
      const realButton = element.shadowRoot.querySelector('button');
      if (realButton) {
        this.logger.info(`Pierced UI5 component ${tagName}, found real button`, realButton);
        return realButton;
      }
      
      // Some UI5 components might have nested structure
      const nestedButton = element.shadowRoot.querySelector('[role="button"]');
      if (nestedButton) {
        this.logger.info(`Found button role element in ${tagName}`, nestedButton);
        return nestedButton;
      }
    }
    
    return null;
  }

  /**
   * Check if element is actually clickable
   * Inspired by Selenium's element_to_be_clickable condition
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is clickable
   */
  isClickable(element) {
    try {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        !element.disabled &&
        element.offsetParent !== null &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.pointerEvents !== 'none'
      );
    } catch (error) {
      this.logger.warn('Clickability check failed', error);
      return false;
    }
  }

  /**
   * Click element with retry logic (like Selenium)
   * Waits for element to be clickable before attempting click
   * @param {Element} element - Element to click
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<boolean>} Success status
   */
  async clickElementWithRetry(element, maxRetries = 3) {
    this.logger.info('Clicking element with retry', { element, maxRetries });

    for (let i = 0; i < maxRetries; i++) {
      try {
        // Wait for element to be clickable
        if (!this.isClickable(element)) {
          this.logger.warn(`Element not clickable yet, attempt ${i + 1}/${maxRetries}`);
          await this.sleep(200);
          continue;
        }
        
        // Element is clickable, perform click
        this.clickElement(element);
        
        // Wait for click to process
        await this.sleep(100);
        
        this.logger.success('Click with retry succeeded');
        return true;
      } catch (error) {
        this.logger.warn(`Click attempt ${i + 1}/${maxRetries} failed`, error);
        
        if (i === maxRetries - 1) {
          this.logger.error('All click attempts failed', error);
          throw error;
        }
        
        await this.sleep(300);
      }
    }
    
    return false;
  }

  /**
   * Sleep utility for async operations
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for element to appear in DOM or Shadow DOM
   * @param {string[]} selectors - Array of selector strings
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>} Promise that resolves with element
   */
  async waitForElement(selectors, timeout = 10000) {
    this.logger.info('Waiting for element', { selectors, timeout });

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Try to find immediately
      const element = this.findElement(selectors);
      if (element) {
        resolve(element);
        return;
      }

      // Set up MutationObserver to watch for changes
      const observer = new MutationObserver(() => {
        const element = this.findElement(selectors);
        if (element) {
          observer.disconnect();
          this.logger.success('Element appeared', element);
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          observer.disconnect();
          reject(new Error(`Timeout waiting for element: ${selectors[0]}`));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      // Also observe shadow roots that already exist
      this.observeShadowRoots(observer);
    });
  }

  /**
   * Observe existing shadow roots for changes
   * @param {MutationObserver} observer - Observer to add to shadow roots
   */
  observeShadowRoots(observer) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        observer.observe(node.shadowRoot, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }
    }
  }

  /**
   * Dispatch proper events for Shadow DOM inputs
   * SAP SF Shadow DOM requires full event dispatch
   * @param {Element} element - Input element
   * @param {string} value - Value to set
   */
  setInputValue(element, value) {
    this.logger.info('Setting input value', { element, value });

    try {
      // Set the value
      element.value = value;

      // Dispatch all necessary events for Shadow DOM
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, composed: true }));

      this.logger.success('Input value set with events dispatched');
    } catch (error) {
      this.logger.error('Failed to set input value', error);
      throw error;
    }
  }

  /**
   * Click element with proper event dispatch
   * Handles both native buttons and shadow DOM components (UI5)
   * @param {Element} element - Element to click
   */
  clickElement(element) {
    this.logger.info('Clicking element', element);

    try {
      // Step 1: Scroll element into view (like Selenium does)
      element.scrollIntoView({ block: 'center', behavior: 'smooth' });
      
      // Small delay for scroll animation
      const scrollDelay = 100;
      
      setTimeout(() => {
        try {
          // Step 2: Try native click first (most reliable for buttons)
          element.click();
          this.logger.success('Native click successful');
        } catch (clickError) {
          this.logger.warn('Native click failed, trying event dispatch', clickError);
          
          // Step 3: Fallback to event dispatch (for custom components)
          // Use composed: true to cross shadow DOM boundaries
          element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
          element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
          element.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
          
          this.logger.success('Event dispatch click completed');
        }
      }, scrollDelay);

    } catch (error) {
      this.logger.error('Failed to click element', error);
      throw error;
    }
  }
}

// Create global helper instance
window.JouleQuestShadowDOM = new ShadowDOMHelper();
