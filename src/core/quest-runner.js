/**
 * QuestRunner - Orchestrates quest execution
 * Manages quest flow, step execution, and progress tracking
 */
class QuestRunner {
  constructor() {
    this.logger = window.JouleQuestLogger;
    this.jouleHandler = window.JouleQuestJouleHandler;
    this.shadowDOM = window.JouleQuestShadowDOM;
    this.currentQuest = null;
    this.currentStepIndex = 0;
    this.isRunning = false;
    this.mode = 'demo'; // 'demo' or 'real'
    this.overlay = null;
    this.selectors = null;
    this.failedSteps = []; // Track steps that failed
    this.stepResults = []; // Track all step results (success/error/skipped)
  }

  /**
   * Initialize runner with configurations
   * @param {Object} selectors - Selector configuration
   * @param {Object} overlay - Overlay instance for UI feedback
   */
  async init(selectors, overlay) {
    this.logger.info('Initializing QuestRunner');
    this.selectors = selectors;
    this.overlay = overlay;
    await this.jouleHandler.init(selectors);
  }

  /**
   * Start a quest
   * @param {Object} quest - Quest configuration from JSON
   * @param {string} mode - 'demo' or 'real'
   */
  async startQuest(quest, mode = 'demo') {
    this.logger.quest(quest.name, 'Starting quest', { mode });

    // CRITICAL FIX: Always force reset before starting a new quest
    // This prevents false "another quest is running" errors
    if (this.isRunning) {
      this.logger.warn('Quest state was stuck, force resetting before starting new quest');
      this.forceReset();
    }

    // CRITICAL: Destroy any existing overlay to prevent stacking
    if (this.overlay) {
      this.overlay.destroy();
      // Reinitialize to create fresh container
      this.overlay.init();
    }

    this.currentQuest = quest;
    this.currentStepIndex = 0;
    this.isRunning = true;
    this.mode = mode;

    // Show overlay with quest info
    if (this.overlay) {
      this.overlay.showQuestStart(quest);
    }

    try {
      // Execute quest based on mode
      if (mode === 'demo') {
        await this.runDemoMode();
      } else {
        await this.runRealMode();
      }

      this.logger.quest(quest.name, 'Quest completed successfully');
      
      // Show completion overlay with step results
      if (this.overlay) {
        this.overlay.showQuestComplete(quest, this.stepResults, this.failedSteps);
      }
    } catch (error) {
      this.logger.error('Quest failed', error);
      
      if (this.overlay) {
        this.overlay.showError(error.message);
      }
      
      throw error;
    } finally {
      this.isRunning = false;
      this.currentQuest = null;
      this.currentStepIndex = 0;
    }
  }

  /**
   * Run quest in demo mode (automated)
   * With error recovery - failed steps are marked but quest continues
   */
  async runDemoMode() {
    this.logger.info('Running quest in DEMO mode with error recovery');

    // Reset tracking arrays
    this.failedSteps = [];
    this.stepResults = [];

    // CRITICAL: Cache steps length to avoid accessing null during loop
    const steps = this.currentQuest.steps;
    const stepsLength = steps.length;

    for (let i = 0; i < stepsLength; i++) {
      // CRITICAL: Check if quest still exists (might have been stopped)
      if (!this.currentQuest || !this.currentQuest.steps) {
        this.logger.warn('Quest was stopped during execution');
        return;
      }

      this.currentStepIndex = i;
      const step = steps[i];

      this.logger.quest(this.currentQuest.name, `Executing step ${i + 1}: ${step.name}`);

      // Show step in overlay so user knows what's happening
      if (this.overlay) {
        this.overlay.showStep(step, i + 1, stepsLength);
      }

      // Wait so user can read what the step will do
      await this.sleep(2000);

      try {
        await this.executeStep(step);
        
        // Track successful step
        this.stepResults.push({
          stepIndex: i,
          stepName: step.name,
          status: 'success',
          error: null
        });
        
        // Show success message and WAIT so user can see it
        if (this.overlay) {
          this.overlay.showStepSuccess(step.successMessage);
        }

        // Wait after each step completes
        await this.sleep(3000);
      } catch (error) {
        this.logger.error(`Step ${i + 1} failed: ${error.message}`, error);
        
        // Track failed step
        this.failedSteps.push(i);
        this.stepResults.push({
          stepIndex: i,
          stepName: step.name,
          status: 'error',
          error: error.message
        });
        
        // Show error state in overlay but CONTINUE
        if (this.overlay) {
          this.overlay.showStepError(step, error.message);
        }
        
        // Wait before continuing to next step
        await this.sleep(3000);
        
        // Log that we're continuing despite error
        this.logger.warn(`⚠️ Step ${i + 1} failed but continuing quest...`);
      }
    }

    // Log summary of failed steps if any
    if (this.failedSteps.length > 0) {
      this.logger.warn(`Quest completed with ${this.failedSteps.length} failed step(s): ${this.failedSteps.map(i => i + 1).join(', ')}`);
    } else {
      this.logger.success('Quest completed successfully with all steps passing!');
    }
  }

  /**
   * Run quest in real mode (user performs actions, we verify)
   */
  async runRealMode() {
    this.logger.info('Running quest in REAL mode');

    // CRITICAL: Cache steps length to avoid accessing null during loop
    const steps = this.currentQuest.steps;
    const stepsLength = steps.length;

    for (let i = 0; i < stepsLength; i++) {
      // CRITICAL: Check if quest still exists (might have been stopped)
      if (!this.currentQuest || !this.currentQuest.steps) {
        this.logger.warn('Quest was stopped during execution');
        return;
      }

      this.currentStepIndex = i;
      const step = steps[i];

      this.logger.quest(this.currentQuest.name, `Waiting for user to complete step ${i + 1}: ${step.name}`);

      // Show step instructions
      if (this.overlay) {
        this.overlay.showStepInstructions(step, i + 1, stepsLength);
      }

      try {
        // Wait for user to complete the step
        await this.waitForStepCompletion(step);
        
        // Show success message
        if (this.overlay) {
          const successMsg = step.successMessage || `Step ${i + 1} completed! ⭐`;
          this.overlay.showStepSuccess(successMsg);
        }

        // Wait before next step
        await this.sleep(1500);
      } catch (error) {
        this.logger.error(`Step ${i + 1} verification failed`, error);
        throw error;
      }
    }
  }

  /**
   * Execute a single quest step (demo mode)
   * @param {Object} step - Step configuration
   */
  async executeStep(step) {
    this.logger.info(`Executing step: ${step.name}`, step);

    switch (step.action) {
      case 'click':
        await this.executeClickAction(step);
        break;
      
      case 'type_and_send':
        await this.executeTypeAndSendAction(step);
        break;
      
      case 'select_first_option':
        await this.executeSelectFirstOption(step);
        break;
      
      case 'click_button_by_text':
        await this.executeClickButtonByText(step);
        break;
      
      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Execute click action
   * @param {Object} step - Step configuration
   */
  async executeClickAction(step) {
    const selectorKey = step.selector;
    const selectors = this.getSelectorsFromKey(selectorKey);

    this.logger.info(`Looking for element: ${selectorKey}`, selectors);

    // Special handling for Joule button - check if already open FIRST
    if (selectorKey === 'joule.chatButton') {
      this.logger.info('Checking if Joule is already open...');
      
      // Robust check: iframe must exist AND be visible AND have proper dimensions
      const iframes = document.querySelectorAll('iframe');
      let jouleAlreadyOpen = false;
      
      for (const iframe of iframes) {
        if (iframe.src && iframe.src.includes('sapdas.cloud.sap')) {
          // Check if iframe is actually visible and rendered
          const rect = iframe.getBoundingClientRect();
          const isVisible = (
            iframe.offsetParent !== null &&  // Not hidden via display:none
            rect.width > 0 &&                // Has width
            rect.height > 0 &&               // Has height
            window.getComputedStyle(iframe).visibility !== 'hidden' &&  // Not visibility:hidden
            window.getComputedStyle(iframe).opacity !== '0'             // Not transparent
          );
          
          if (isVisible) {
            jouleAlreadyOpen = true;
            this.logger.success('✅ Joule iframe found AND visible - Joule is already open!');
            break;
          } else {
            this.logger.info('Found Joule iframe but it is not visible/rendered');
          }
        }
      }
      
      if (jouleAlreadyOpen) {
        // Show notification in overlay
        // CRITICAL: Check if quest still exists before accessing steps
        if (this.overlay && this.currentQuest && this.currentQuest.steps) {
          this.overlay.showStep(
            { 
              ...step, 
              description: '✅ Joule is already open and ready!' 
            },
            this.currentStepIndex + 1,
            this.currentQuest.steps.length
          );
          await this.sleep(2000);
        }
        return; // Skip clicking the button
      }
      
      // Joule not open, proceed with normal click
      this.logger.info('Joule is not open, will click button to open it');
    }

    // Normal click action (including clicking Joule button if not open)
    try {
      const element = await this.shadowDOM.waitForElement(selectors, 10000);
      
      if (!element) {
        const errorMsg = `Element not found: ${selectorKey}. Please check if Joule is available on this page and update selectors in src/config/selectors.json`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      this.logger.success('Element found, clicking...', element);
      this.shadowDOM.clickElement(element);
      
      // Wait for any animations/transitions
      await this.sleep(1000);
    } catch (error) {
      this.logger.error(`Failed to execute click action for ${selectorKey}`, error);
      throw error;
    }
  }

  /**
   * Execute type and send action
   * @param {Object} step - Step configuration
   */
  async executeTypeAndSendAction(step) {
    // Send prompt using JouleHandler (waits for response internally)
    const result = await this.jouleHandler.sendPrompt(
      step.prompt,
      step.waitForResponse,
      step.responseKeywords || []
    );

    if (!result.success) {
      throw new Error('Failed to send prompt');
    }

    // If we got a response, show it in the overlay
    // CRITICAL: Check if quest still exists (might have completed during async operation)
    if (result.response && this.overlay && this.currentQuest && this.currentQuest.steps) {
      const responseText = result.response.substring(0, 300); // Limit to 300 chars
      const truncated = result.response.length > 300 ? '...' : '';
      this.overlay.showStep(
        step,
        this.currentStepIndex + 1,
        this.currentQuest.steps.length,
        responseText + truncated
      );
      // Keep it visible so user can read the response
      await this.sleep(5000);
    }
  }

  /**
   * Execute select first option action (for interactive flows)
   * Handles both buttons and input fields intelligently
   * @param {Object} step - Step configuration
   */
  async executeSelectFirstOption(step) {
    this.logger.info('Executing select_first_option action');

    // Wait a bit for response to render
    await this.sleep(2000);

    // Try to select first interactive option
    const result = await this.jouleHandler.selectFirstOption();

    if (!result.success) {
      throw new Error('Failed to select first option');
    }

    // Check if an input field was detected
    if (result.type === 'input') {
      this.logger.info(`Input field detected (type: ${result.inputType})`);
      
      // If input detected and we have a value to enter, use type_and_send
      if (step.inputValue) {
        this.logger.info(`Entering value into input: "${step.inputValue}"`);
        
        // Send the value using type_and_send
        const typeResult = await this.jouleHandler.sendPrompt(
          step.inputValue,
          step.waitForResponse || true,
          step.responseKeywords || []
        );
        
        if (!typeResult.success) {
          throw new Error('Failed to enter value into input field');
        }
        
        this.logger.success(`Value entered into input field: ${step.inputValue}`);
      } else {
        this.logger.warn('Input field detected but no inputValue provided in step configuration');
        throw new Error('Input field detected but no inputValue configured. Add "inputValue" to step.');
      }
    } else {
      // Button was clicked
      this.logger.success(`Selected first option (button): ${result.buttonText}`);
      
      // Wait for next response if specified
      if (step.waitForResponse) {
        await this.sleep(2000);
      }
    }
  }

  /**
   * Execute click button by text action (for interactive flows)
   * @param {Object} step - Step configuration
   */
  async executeClickButtonByText(step) {
    this.logger.info(`Executing click_button_by_text action: "${step.buttonText}"`);

    // Wait a bit for UI to be ready
    await this.sleep(2000);

    // Click button matching text
    const result = await this.jouleHandler.clickButtonByText(step.buttonText);

    if (!result.success) {
      throw new Error(`Failed to click button: ${step.buttonText}`);
    }

    this.logger.success(`Clicked button: ${result.buttonText}`);

    // Wait after clicking
    await this.sleep(2000);
  }

  /**
   * Wait for user to complete step (real mode)
   * @param {Object} step - Step configuration
   */
  async waitForStepCompletion(step) {
    this.logger.info(`Waiting for step completion: ${step.name}`);

    // In real mode, we verify the step was completed
    // For now, we'll use a simple verification based on step type
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Step timeout - user did not complete step'));
      }, 60000); // 60 second timeout

      const checkCompletion = async () => {
        try {
          const completed = await this.verifyStepCompletion(step);
          
          if (completed) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkCompletion, 1000);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      checkCompletion();
    });
  }

  /**
   * Verify step completion (real mode)
   * @param {Object} step - Step configuration
   * @returns {Promise<boolean>} Completion status
   */
  async verifyStepCompletion(step) {
    switch (step.action) {
      case 'click':
        // Verify element was clicked (check if result is visible)
        if (step.waitForResponse) {
          const selectorKey = step.selector;
          const selectors = this.getSelectorsFromKey(selectorKey);
          const element = this.shadowDOM.findElement(selectors);
          return element !== null;
        }
        return true;
      
      case 'type_and_send':
        // Verify Joule response received
        if (step.waitForResponse && step.responseKeywords) {
          const response = this.jouleHandler.getLastResponse();
          if (response) {
            return step.responseKeywords.some(keyword =>
              response.toLowerCase().includes(keyword.toLowerCase())
            );
          }
        }
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Get selectors from key (e.g., "joule.chatButton")
   * @param {string} key - Selector key in dot notation
   * @returns {string[]} Array of selectors
   */
  getSelectorsFromKey(key) {
    const parts = key.split('.');
    let obj = this.selectors;
    
    for (const part of parts) {
      obj = obj[part];
      if (!obj) {
        throw new Error(`Selector not found: ${key}`);
      }
    }
    
    return obj;
  }

  /**
   * Stop current quest
   */
  stopQuest() {
    this.logger.warn('Stopping quest');
    this.isRunning = false;
    this.currentQuest = null;
    this.currentStepIndex = 0;
  }

  /**
   * Force reset the runner state
   * Use this to clear "another quest is running" errors
   */
  forceReset() {
    this.logger.warn('Force resetting quest runner state');
    this.isRunning = false;
    this.currentQuest = null;
    this.currentStepIndex = 0;
    if (this.overlay) {
      this.overlay.hide();
    }
  }

  /**
   * Check if a quest is currently running
   * @returns {boolean} Running status
   */
  isQuestRunning() {
    return this.isRunning;
  }

  /**
   * Get current quest progress
   * @returns {Object} Progress information
   */
  getProgress() {
    if (!this.currentQuest || !this.currentQuest.steps) {
      return null;
    }

    return {
      questName: this.currentQuest.name,
      currentStep: this.currentStepIndex + 1,
      totalSteps: this.currentQuest.steps.length,
      isRunning: this.isRunning,
      mode: this.mode
    };
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

// Create global runner instance
window.JouleQuestRunner = new QuestRunner();
