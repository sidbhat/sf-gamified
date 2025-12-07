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
   * Tries CSS selectors first, then XPath, then Shadow DOM traversal
   * @param {string[]} selectors - Array of selector strings
   * @returns {Element|null} Found element or null
   */
  findElement(selectors) {
    this.logger.info('Finding element with selectors', selectors);

    for (const selector of selectors) {
      try {
        // Try regular CSS selector first
        if (!selector.startsWith('//')) {
          const element = document.querySelector(selector);
          if (element) {
            this.logger.success('Found element with CSS selector', selector);
            return element;
          }
        }

        // Try XPath selector
        if (selector.startsWith('//')) {
          const element = this.findByXPath(selector);
          if (element) {
            this.logger.success('Found element with XPath', selector);
            return element;
          }
        }

        // Try Shadow DOM traversal
        const shadowElement = this.findInShadowDOM(selector);
        if (shadowElement) {
          this.logger.success('Found element in Shadow DOM', selector);
          return shadowElement;
        }
      } catch (error) {
        this.logger.warn(`Selector failed: ${selector}`, error);
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
   * Recursively search for element in Shadow DOM
   * @param {string} selector - CSS selector
   * @param {Element} root - Root element to start search
   * @returns {Element|null} Found element or null
   */
  findInShadowDOM(selector, root = document.body) {
    // Try to find in current scope
    const element = root.querySelector(selector);
    if (element) return element;

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
        const shadowElement = this.findInShadowDOM(selector, node.shadowRoot);
        if (shadowElement) return shadowElement;
      }
    }

    return null;
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
   * @param {Element} element - Element to click
   */
  clickElement(element) {
    this.logger.info('Clicking element', element);

    try {
      // Dispatch mousedown, mouseup, click for full compatibility
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

      this.logger.success('Element clicked with events dispatched');
    } catch (error) {
      this.logger.error('Failed to click element', error);
      throw error;
    }
  }
}

// Create global helper instance
window.JouleQuestShadowDOM = new ShadowDOMHelper();
