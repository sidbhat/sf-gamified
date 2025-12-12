/**
 * AutomationCursor - Visual indicator for automation actions
 * Shows a purple ball that moves to click/interaction points
 */
class AutomationCursor {
  constructor() {
    this.cursor = null;
    this.isActive = false;
    this.logger = window.JouleQuestLogger;
  }

  /**
   * Initialize the automation cursor
   */
  init() {
    if (this.cursor) {
      this.logger.warn('AutomationCursor already initialized');
      return;
    }

    // Create cursor element
    this.cursor = document.createElement('div');
    this.cursor.className = 'automation-cursor';
    document.body.appendChild(this.cursor);

    this.logger.info('AutomationCursor initialized');
  }

  /**
   * Show cursor at specific coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} immediate - Skip animation if true
   */
  showAt(x, y, immediate = false) {
    if (!this.cursor) {
      this.init();
    }

    // Update cursor position
    this.cursor.style.left = `${x}px`;
    this.cursor.style.top = `${y}px`;

    // Add/remove animation classes
    if (immediate) {
      this.cursor.classList.remove('moving');
    } else {
      this.cursor.classList.add('moving');
    }

    // Show cursor
    this.cursor.classList.add('active');
    this.isActive = true;

    this.logger.debug('AutomationCursor shown at', { x, y, immediate });
  }

  /**
   * Move cursor to element's center
   * @param {HTMLElement} element - Target element
   */
  moveToElement(element) {
    if (!element) {
      if (this.logger && this.logger.warn) {
        this.logger.warn('AutomationCursor.moveToElement: element is null');
      }
      return;
    }

    try {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.showAt(centerX, centerY, false);
    } catch (error) {
      if (this.logger && this.logger.error) {
        this.logger.error('AutomationCursor.moveToElement failed', error);
      }
      // Fail silently - don't break quest execution
    }
  }

  /**
   * Show click ripple effect at current cursor position
   */
  showClickRipple() {
    if (!this.cursor || !this.isActive) {
      return;
    }

    // Get current cursor position
    const x = parseFloat(this.cursor.style.left);
    const y = parseFloat(this.cursor.style.top);

    // Create ripple element
    const ripple = document.createElement('div');
    ripple.className = 'automation-cursor-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    // Add clicking animation to cursor
    this.cursor.classList.add('clicking');

    // Remove ripple and clicking class after animation
    setTimeout(() => {
      ripple.remove();
      this.cursor.classList.remove('clicking');
    }, 600);

    this.logger.debug('AutomationCursor click ripple shown');
  }

  /**
   * Hide cursor
   */
  hide() {
    if (this.cursor) {
      this.cursor.classList.remove('active', 'moving', 'clicking');
      this.isActive = false;
      this.logger.debug('AutomationCursor hidden');
    }
  }

  /**
   * Destroy cursor element
   */
  destroy() {
    if (this.cursor) {
      this.cursor.remove();
      this.cursor = null;
      this.isActive = false;
      this.logger.info('AutomationCursor destroyed');
    }
  }
}

// Create global instance
window.JouleQuestAutomationCursor = new AutomationCursor();
