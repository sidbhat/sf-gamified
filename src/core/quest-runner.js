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
    this.currentSolution = null; // Current SAP solution
    this.errorHandler = null; // Solution-aware error handler
  }

  /**
   * Initialize runner with configurations
   * @param {Object} selectors - Selector configuration
   * @param {Object} overlay - Overlay instance for UI feedback
   * @param {Object} solution - Current SAP solution configuration
   */
  async init(selectors, overlay, solution) {
    this.logger.info('Initializing QuestRunner', { solution: solution.name });
    this.selectors = selectors;
    this.overlay = overlay;
    this.currentSolution = solution;
    
    // Initialize solution-aware error handler
    const ErrorHandler = window.JouleQuestErrorHandler;
    this.errorHandler = new ErrorHandler(solution);
    
    // CRITICAL FIX: Don't initialize jouleHandler here!
    // This was causing Joule iframe to open when clicking extension icon
    // because waitForJouleIframe() searches for the iframe and triggers it
    // We'll initialize jouleHandler lazily when a quest actually starts
    this.logger.info('Deferring jouleHandler initialization until quest starts');
    
    this.logger.success('QuestRunner initialized', {
      solution: solution.name,
      jouleConfig: solution.jouleConfig
    });
  }

  /**
   * Start a quest
   * @param {Object} questData - Quest configuration from JSON
   * @param {string} mode - 'demo' or 'real'
   */
  async startQuest(questData, mode = 'demo') {
    let quest;
    const questId = questData.id || questData.questId;

    if (questId && (!questData.name || !questData.steps)) {
      this.logger.info('Partial quest data received, fetching full quest object', { questId });
      const allQuests = await this.getAllQuests();
      const foundQuest = allQuests.find(q => q.id === questId);
      
      if (foundQuest) {
        quest = { ...foundQuest, ...questData }; // Merge to preserve properties
      } else {
        quest = questData; // Let it fail validation below
      }
    } else {
      quest = questData;
    }

    if (!quest || !quest.i18nKey || !quest.steps) { // Check for i18nKey now
      this.logger.error('Failed to start quest: Invalid or incomplete quest data (missing i18nKey).', { received: questData, processed: quest });
      if (this.overlay) {
        this.overlay.showError('Could not start quest. Quest data is missing or invalid.');
      }
      return;
    }
    
    // Fetch translated quest details
    const i18nQuest = {
      id: quest.id,
      name: this.overlay.i18n.t(`${quest.i18nKey}.name`),
      description: this.overlay.i18n.t(`${quest.i18nKey}.description`),
      tagline: this.overlay.i18n.t(`${quest.i18nKey}.tagline`),
      victoryText: this.overlay.i18n.t(`${quest.i18nKey}.victoryText`),
      storyArc: this.overlay.i18n.t(`${quest.i18nKey}.storyArc`),
      storyChapter: this.overlay.i18n.t(`${quest.i18nKey}.storyChapter`),
      storyIntro: this.overlay.i18n.t(`${quest.i18nKey}.storyIntro`),
      storyOutro: this.overlay.i18n.t(`${quest.i18nKey}.storyOutro`),
      nextQuestHint: this.overlay.i18n.t(`${quest.i18nKey}.nextQuestHint`),
      icon: quest.icon,
      points: quest.points,
      estimatedTime: quest.estimatedTime,
      difficulty: quest.difficulty,
      solutions: quest.solutions,
      requiresQuests: quest.requiresQuests,
      steps: quest.steps // Steps are not translated here
    };

    this.logger.quest(i18nQuest.name, 'Starting quest', { mode });

    // CRITICAL FIX: Always force reset before starting a new quest
    // This prevents false "another quest is running" errors
    if (this.isRunning) {
      this.logger.warn('Quest state was stuck, force resetting before starting new quest');
      this.forceReset();
    }

    // CRITICAL: Ensure overlay container exists and is ready
    // Don't destroy/recreate - just ensure it's initialized
    if (this.overlay && !this.overlay.container) {
      this.overlay.init();
    }


    this.currentQuest = i18nQuest; // Use the i18n-enriched quest object
    this.currentStepIndex = 0;
    this.isRunning = true;
    this.mode = mode;

    // CRITICAL FIX: Show overlay IMMEDIATELY with Start Quest button
    // User must click "Start Quest" to begin - this gives them time to read the story
    if (this.overlay) {
      this.overlay.showQuestStart(this.currentQuest);
    }

    // CRITICAL: Wait for user to click "Start Quest" button
    // This replaces the old 5-second auto-start with user-controlled pacing
    await this.waitForQuestStartConfirmation(this.currentQuest.id);

    try {
      // Execute quest based on mode
      if (mode === 'demo') {
        await this.runDemoMode();
      } else {
        await this.runRealMode();
      }

      this.logger.quest(this.currentQuest.name, 'Quest completed successfully');
      
      // Get all quests and completed quests for next quest logic
      const allQuests = await this.getAllQuests();
      const completedQuests = await this.getCompletedQuests();
      
      // Show completion overlay with step results
      if (this.overlay) {
        this.overlay.showQuestComplete(this.currentQuest, this.stepResults, this.failedSteps, allQuests, completedQuests);
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
    
    // Check if this is an agent quest (hide mascot arrow)
    const isAgentQuest = this.currentQuest.category === 'agent';

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
        this.overlay.showStep(step, i + 1, stepsLength, null, isAgentQuest);
      }

      // Wait so user can read what the step will do (shorter since intro was already shown)
      await this.sleep(1500);

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
          this.overlay.showStepSuccess(step.successMessage, isAgentQuest);
        }

        // Wait after each step completes
        await this.sleep(3000);
      } catch (error) {
        this.logger.error(`Step ${i + 1} failed: ${error.message}`, error);
        
        // Use error handler to classify and handle error
        let errorType = 'UNKNOWN_ERROR';
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('joule') && errorMsg.includes('not found')) {
          errorType = 'JOULE_NOT_FOUND';
        } else if (errorMsg.includes('button')) {
          errorType = 'BUTTON_NOT_FOUND';
        } else if (errorMsg.includes('card')) {
          errorType = 'CARD_NOT_FOUND';
        } else if (errorMsg.includes('timeout')) {
          errorType = 'RESPONSE_TIMEOUT';
        } else if (errorMsg.includes('element') && errorMsg.includes('not found')) {
          errorType = 'SELECTOR_NOT_FOUND';
        }
        
        // Handle error with solution context
        const errorObj = this.errorHandler.handle(errorType, {
          step: step.name,
          stepIndex: i + 1,
          quest: this.currentQuest.name
        });
        
        // Check if quest can continue (considers optional steps)
        const canContinue = this.errorHandler.canContinue(errorObj, step.optional);
        
        if (canContinue) {
          // Track failed or skipped step
          const status = step.optional ? 'skipped' : 'error';
          this.stepResults.push({
            stepIndex: i,
            stepName: step.name,
            status: status,
            error: errorObj.message,
            errorType: errorType
          });
          
          if (!step.optional) {
            this.failedSteps.push(i);
          }
          
          // Show error state in overlay
          if (this.overlay) {
            if (step.optional) {
              this.overlay.showStepSkipped(step, errorObj.recovery, isAgentQuest);
            } else {
              this.overlay.showStepError(step, errorType, error.message, isAgentQuest);
            }
          }
          
          // Wait before continuing (longer for non-optional errors)
          await this.sleep(step.optional ? 3000 : 5000);
          
          this.logger.warn(`⚠️ Step ${i + 1} ${step.optional ? 'skipped' : 'failed'} but continuing quest...`);
        } else {
          // Critical error - cannot continue
          this.logger.error('Critical error - quest cannot continue', errorObj);
          throw error;
        }
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
      
      case 'click_first_button':
        await this.executeClickFirstButton(step);
        break;
      
      case 'click_button_by_text':
        await this.executeClickButtonByText(step);
        break;
      
      // NEW AGENT ACTIONS (for GenAI UI interactions)
      case 'navigate':
        await this.executeNavigateAction(step);
        break;
      
      case 'type_in_field':
        await this.executeTypeInFieldAction(step);
        break;
      
      case 'click_button':
        await this.executeClickButtonAction(step);
        break;
      
      case 'wait':
        await this.executeWaitAction(step);
        break;
      
      case 'scroll_to_bottom':
        await this.executeScrollToBottomAction(step);
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
          const isAgentQuest = this.currentQuest.category === 'agent';
          this.overlay.showStep(
            { 
              ...step, 
              description: '✅ Joule is already open and ready!' 
            },
            this.currentStepIndex + 1,
            this.currentQuest.steps.length,
            null,
            isAgentQuest
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
   * Execute type and send action with smart response analysis
   * @param {Object} step - Step configuration
   */
  async executeTypeAndSendAction(step) {
    // Get prompt text - either from promptKey (i18n) or fallback to hardcoded prompt
    let promptText = step.prompt; // Fallback to hardcoded prompt (backwards compatibility)
    
    if (step.promptKey && this.overlay && this.overlay.i18n) {
      // Look up translated prompt from i18n
      promptText = this.overlay.i18n.t(step.promptKey);
      this.logger.info(`Using translated prompt: "${promptText}" from key: ${step.promptKey}`);
    } else if (step.promptKey) {
      this.logger.warn(`promptKey specified but i18n not available, falling back to English`);
    }
    
    // Send prompt using JouleHandler (waits for response internally)
    const result = await this.jouleHandler.sendPrompt(
      promptText,
      step.waitForResponse,
      step.responseKeywords || []
    );

    if (!result.success) {
      throw new Error('Failed to send prompt');
    }

    // Analyze response if we got one
    if (result.response) {
      const analysis = this.jouleHandler.analyzeJouleResponse(
        result.response,
        step.responseKeywords || [],
        step.errorKeywords || []
      );
      
      this.logger.info('Response analysis:', analysis);
      
      // Handle error responses
      if (analysis.type === 'error') {
        const errorMsg = `${step.name} failed: ${analysis.message}`;
        this.logger.warn(errorMsg);
        
        // If step is optional, skip gracefully
        if (step.optional) {
          this.logger.info(`Step is optional, marking as skipped and continuing quest`);
          
          // Track as skipped
          this.stepResults.push({
            stepIndex: this.currentStepIndex,
            stepName: step.name,
            status: 'skipped',
            error: analysis.message,
            errorType: 'OPTIONAL_STEP_FAILED'
          });
          
          // Show skip message
          if (this.overlay && this.currentQuest && this.currentQuest.steps) {
            const isAgentQuest = this.currentQuest.category === 'agent';
            this.overlay.showStepSkipped(
              step,
              `⚠️ ${analysis.message}`,
              isAgentQuest
            );
            await this.sleep(3000);
          }
          
          return; // Continue to next step
        }
        
        // Not optional, throw error
        throw new Error(errorMsg);
      }
      
      // Handle quick actions response
      if (analysis.type === 'quick_actions' && analysis.suggestedAction === 'click_first_button') {
        this.logger.info('Quick actions detected, attempting to click first option');
        try {
          await this.jouleHandler.selectFirstOption();
          this.logger.success('Quick action selected successfully');
        } catch (e) {
          this.logger.warn('Could not select quick action, continuing anyway', e);
        }
      }
    }

    // Response is already shown in runDemoMode flow via showStepSuccess
    // No need to show it again here to avoid duplicate display
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
   * Execute click first button action (for dynamic card interactions)
   * Clicks the first interactive button found in Joule's response
   * Useful for card lists like team members with "View" buttons
   * @param {Object} step - Step configuration
   */
  async executeClickFirstButton(step) {
    this.logger.info('Executing click_first_button action');

    // Wait for response to fully render
    await this.sleep(2000);

    // Click first button using JouleHandler
    const result = await this.jouleHandler.selectFirstOption();

    if (!result.success) {
      throw new Error('Failed to click first button');
    }

    this.logger.success(`Clicked first button: ${result.buttonText || 'button'}`);

    // Wait after clicking for new content to load
    await this.sleep(2000);
  }

  /**
   * Execute click button by text action (for interactive flows)
   * Searches for button matching specific text and clicks it
   * Button may open new tab but quest stays on current page
   * @param {Object} step - Step configuration
   */
  async executeClickButtonByText(step) {
    this.logger.info(`Executing click_button_by_text action: "${step.buttonText}"`);

    // Wait longer for UI to be fully ready (cards with buttons take time to render)
    this.logger.info('Waiting 4 seconds for buttons to fully render...');
    await this.sleep(4000);

    // Click button matching text
    const result = await this.jouleHandler.clickButtonByText(step.buttonText);

    if (!result.success) {
      throw new Error(`Failed to click button: ${step.buttonText}`);
    }

    this.logger.success(`Clicked button: ${result.buttonText}`);

    // Wait after clicking (don't wait for response as button may open new tab)
    await this.sleep(2000);
  }

  /**
   * Execute navigate action (for agent workflows)
   * Navigates to a specific URL in SuccessFactors
   * Saves quest state before navigation and restores after
   * @param {Object} step - Step configuration
   */
  async executeNavigateAction(step) {
    this.logger.info(`[Navigate] Target URL: ${step.url}`);
    this.logger.info(`[Navigate] Current URL: ${window.location.href}`);
    this.logger.info(`[Navigate] Current origin: ${window.location.origin}`);
    this.logger.info(`[Navigate] Current pathname: ${window.location.pathname}`);
    this.logger.info(`[Navigate] Current hash: ${window.location.hash}`);
    this.logger.info(`[Navigate] Preserve params: ${step.preserveParams}`);
    
    // CRITICAL FIX: Get current tab ID to make quest state tab-specific
    // This prevents cross-tab contamination when SF and S/4HANA tabs are both open
    // NOTE: Content scripts can't access chrome.tabs directly, must use message passing
    let tabId = 'unknown';
    try {
      // Try to get tab ID via message to background script
      const response = await chrome.runtime.sendMessage({ action: 'getTabId' });
      tabId = response?.tabId || 'unknown';
    } catch (error) {
      // Fallback: Generate a unique ID based on URL
      tabId = `url_${window.location.href.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
      this.logger.warn('Could not get tab ID from background, using URL-based ID', { tabId });
    }
    
    // Save quest state to storage before navigation (page will reload)
    const questState = {
      questId: this.currentQuest.id,
      questName: this.currentQuest.name,
      currentStepIndex: this.currentStepIndex,
      mode: this.mode,
      timestamp: Date.now(),
      tabId: tabId,  // Track which tab this quest belongs to
      solutionId: this.currentSolution?.id || 'unknown'  // Track which solution
    };
    
    try {
      // Use tab-specific storage key to prevent cross-tab conflicts
      const storageKey = `activeQuestState_tab${tabId}`;
      await chrome.storage.local.set({ [storageKey]: questState });
      this.logger.info('Quest state saved before navigation (tab-specific)', { questState, storageKey });
    } catch (error) {
      this.logger.error('Failed to save quest state', error);
    }
    
    // Get base URL from current page
    const baseUrl = window.location.origin;
    let fullUrl = step.url.startsWith('http') 
      ? step.url 
      : `${baseUrl}${step.url}`;
    
    // If preserveParams is true, extract parameters from current URL and add them
    if (step.preserveParams) {
      this.logger.info('Preserving URL parameters from current page');
      
      // Extract params from current hash URL (after #)
      const currentHash = window.location.hash;
      const currentParamsString = currentHash.includes('?') ? currentHash.split('?')[1] : '';
      
      if (currentParamsString) {
        const currentParams = new URLSearchParams(currentParamsString);
        this.logger.info('Current URL parameters:', Object.fromEntries(currentParams));
        
        // Parse the target URL to see if it already has params
        const targetUrl = new URL(fullUrl);
        const targetHash = targetUrl.hash || ''; // Empty string if no hash
        
        // Split hash into path and params
        let targetPath = '';
        let targetParamsString = '';
        
        if (targetHash) {
          // Remove leading # if present
          const hashWithoutPound = targetHash.replace(/^#/, '');
          const parts = hashWithoutPound.split('?');
          targetPath = parts[0];
          targetParamsString = parts[1] || '';
        }
        
        // Merge params: target URL params take precedence
        const targetParams = new URLSearchParams(targetParamsString);
        
        // Add all current params that aren't already in target
        for (const [key, value] of currentParams) {
          if (!targetParams.has(key)) {
            targetParams.set(key, value);
          }
        }
        
        // Reconstruct URL with merged params
        const mergedParamsString = targetParams.toString();
        
        // Build final URL based on whether target has hash or not
        if (targetPath) {
          // Hash-based URL like /sf/goals#/goal-form?params
          fullUrl = `${targetUrl.origin}${targetUrl.pathname}#${targetPath}${mergedParamsString ? '?' + mergedParamsString : ''}`;
        } else {
          // Regular URL like /sf/goals?params (no hash)
          fullUrl = `${targetUrl.origin}${targetUrl.pathname}${mergedParamsString ? '?' + mergedParamsString : ''}`;
        }
        
        this.logger.info('URL reconstructed with preserved params:', fullUrl);
        this.logger.info('Merged URL parameters:', Object.fromEntries(targetParams));
      } else {
        this.logger.info('No parameters found in current URL to preserve, using target URL as-is');
      }
    }
    
    this.logger.info(`Full URL constructed for navigation: ${fullUrl}`);
    
    // Determine if it's a hash-based navigation or full URL navigation
    const currentUrl = new URL(window.location.href);
    const targetUrlParsed = new URL(fullUrl);

    if (currentUrl.origin === targetUrlParsed.origin && 
        currentUrl.pathname === targetUrlParsed.pathname && 
        targetUrlParsed.hash) {
      // It's a hash-based navigation (SPA), directly update hash
      this.logger.info(`Performing hash-based navigation to: ${targetUrlParsed.hash}`);
      window.location.hash = targetUrlParsed.hash;
      // For hash navigation, the page does not reload, so manually call checkActiveQuest
      window.postMessage({ type: 'CHECK_ACTIVE_QUEST' }, '*');
    } else {
      // Full URL navigation, will cause page reload
      this.logger.info(`Performing full URL navigation to: ${fullUrl}`);
      window.location.href = fullUrl;
    }
    
    // Note: Code after this line won't execute if it's a full page reload
  }

  /**
   * Execute type in field action (for agent workflows)
   * Types text into a form field in the main page (not Joule iframe)
   * @param {Object} step - Step configuration
   */
  async executeTypeInFieldAction(step) {
    const selectorKey = step.selector;
    const selectors = this.getSelectorsFromKey(selectorKey);
    
    this.logger.info(`Looking for input field: ${selectorKey}`, selectors);
    
    // Find the field in main page (including Shadow DOM)
    const element = await this.shadowDOM.waitForElement(selectors, 10000);
    
    if (!element) {
      const errorMsg = `Input field not found: ${selectorKey}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    this.logger.success('Input field found, typing...', element);
    
    // Use shadowDOM helper to properly set value with Shadow DOM events
    this.shadowDOM.setInputValue(element, step.value);
    
    this.logger.success(`Typed into field: "${step.value}"`);
    
    await this.sleep(500);
  }

  /**
   * Execute click button action (for agent workflows)
   * Clicks a button in the main page (not Joule iframe)
   * Generic button click for form submissions, AI generation, etc.
   * Uses enhanced click logic with retry and UI5 shadow piercing
   * @param {Object} step - Step configuration
   */
  async executeClickButtonAction(step) {
    const selectorKey = step.selector;
    const selectors = this.getSelectorsFromKey(selectorKey);
    
    this.logger.info(`Looking for button: ${selectorKey}`, selectors);
    
    // Try standard selector approach with enhanced clicking
    try {
      const element = await this.shadowDOM.waitForElement(selectors, 10000);
      
      if (element) {
        this.logger.success('Button found via selectors!', element);
        
        // Use clickElementWithRetry for better reliability
        // This handles UI5 shadow piercing, clickability checks, and retries
        const success = await this.shadowDOM.clickElementWithRetry(element, 3);
        
        if (success) {
          this.logger.success('Button clicked successfully with retry logic!');
          await this.sleep(3000);
          return;
        }
      }
    } catch (err) {
      this.logger.warn('Standard selector approach failed, trying text-based search', err);
    }
    
    // Fallback: Search by text content for UI5 buttons
    this.logger.info('Fallback: Searching all UI5 buttons by text content');
    
    const allUI5Buttons = document.querySelectorAll('ui5-button, ui5-button-xweb-goalmanagement, [class*="ui5-button"]');
    this.logger.info(`Found ${allUI5Buttons.length} UI5 button elements`);
    
    // Determine search keywords based on selector key (English + German)
    let searchKeywords = [];
    if (selectorKey === 'goalForm.createButton') {
      searchKeywords = ['create', 'erstellen', 'anlegen'];
    } else if (selectorKey === 'goalForm.submitButton') {
      searchKeywords = ['submit', 'save', 'senden', 'speichern'];
    } else if (selectorKey === 'goalForm.saveButton') {
      searchKeywords = ['save', 'speichern'];
    } else if (selectorKey === 'goalForm.generateButton') {
      searchKeywords = ['generate', 'generieren', 'ki', 'ai'];
    }
    
    for (const btnElement of allUI5Buttons) {
      const text = btnElement.textContent?.trim().toLowerCase() || '';
      const tagName = btnElement.tagName.toLowerCase();
      
      this.logger.info(`Checking ${tagName} with text: "${text}"`);
      
      // Check if text contains any of the keywords
      const matches = searchKeywords.some(keyword => text.includes(keyword));
      
      if (matches) {
        this.logger.success(`Found matching button in ${tagName}!`, btnElement);
        
        // Try to get the actual button from shadow root
        const shadowButton = btnElement.shadowRoot?.querySelector('button');
        if (shadowButton) {
          this.logger.success('Found button inside shadow root, clicking...');
          shadowButton.click();
          await this.sleep(3000);
          return;
        } else {
          this.logger.warn('No shadow root found, clicking host element directly');
          btnElement.click();
          await this.sleep(3000);
          return;
        }
      }
    }
    
    // If we get here, button was not found
    this.logger.error('Could not find button by selectors or text content');
    this.logger.error('Available UI5 buttons:', Array.from(allUI5Buttons).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim(),
      class: el.className
    })));
    throw new Error(`Button not found: ${selectorKey}`);
  }

  /**
   * Execute wait action (for agent workflows)
   * Waits for a specified duration or for content to load
   * @param {Object} step - Step configuration
   */
  async executeWaitAction(step) {
    const duration = step.duration || 3000; // Default 3 seconds
    this.logger.info(`Waiting for ${duration}ms for content to load...`);
    
    await this.sleep(duration);
    
    this.logger.success('Wait completed');
  }

  /**
   * Execute scroll to bottom action (for agent workflows)
   * Scrolls the page to the bottom to reveal submit buttons
   * @param {Object} step - Step configuration
   */
  async executeScrollToBottomAction(step) {
    this.logger.info('Scrolling to bottom of page');
    
    // Try multiple scroll targets to ensure we reach the bottom
    // 1. Scroll main window
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
    
    await this.sleep(500);
    
    // 2. Also try scrolling the body
    document.body.scrollTop = document.body.scrollHeight;
    
    await this.sleep(500);
    
    // 3. Find and scroll any scrollable containers
    const scrollableElements = document.querySelectorAll('[class*="scroll"], [class*="content"], main, article');
    for (const el of scrollableElements) {
      if (el.scrollHeight > el.clientHeight) {
        this.logger.info(`Found scrollable element: ${el.className || el.tagName}`);
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    
    // Wait for all scrolls to complete
    await this.sleep(1500);
    
    this.logger.success('Scrolled to bottom');
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
   * Wait for user to click "Start Quest" button
   * @param {string} questId - Quest ID to wait for
   * @returns {Promise<void>}
   */
  waitForQuestStartConfirmation(questId) {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.type === 'QUEST_START_CONFIRMED' && event.data.questId === questId) {
          window.removeEventListener('message', handler);
          this.logger.info('User confirmed quest start, proceeding with execution');
          resolve();
        }
      };
      
      window.addEventListener('message', handler);
      this.logger.info('Waiting for user to click Start Quest button...');
    });
  }

  /**
   * Get all quests from configuration
   * @returns {Promise<Array>} All quests filtered by current solution
   */
  async getAllQuests() {
    try {
      // Fetch quests from configuration file
      const response = await fetch(chrome.runtime.getURL('src/config/quests.json'));
      const questsData = await response.json();
      
      // Filter quests by current solution
      const allQuests = questsData.quests.filter(quest => 
        !quest.solutions || quest.solutions.includes(this.currentSolution?.id)
      );
      
      this.logger.info('All quests loaded', { 
        total: questsData.quests.length,
        filtered: allQuests.length,
        solution: this.currentSolution?.id
      });
      
      return allQuests;
    } catch (error) {
      this.logger.error('Failed to get all quests', error);
      return [];
    }
  }

  /**
   * Get completed quest IDs from storage
   * @returns {Promise<Array>} Array of completed quest IDs
   */
  async getCompletedQuests() {
    try {
      // Get completed quests from storage
      if (window.JouleQuestStorage) {
        const stats = await window.JouleQuestStorage.getUserStats(this.currentSolution?.id);
        return stats.completedQuests || [];
      }
      return [];
    } catch (error) {
      this.logger.error('Failed to get completed quests', error);
      return [];
    }
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
