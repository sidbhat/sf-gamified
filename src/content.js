/**
 * Content Script - Main entry point for the Chrome extension
 * Initializes all components and handles message passing
 */

(async function() {
  'use strict';

  // CRITICAL: Only run in top-level window, NOT in iframes
  // This prevents the extension from running in embedded iframes like WalkMe, Help panels, etc.
  if (window !== window.top) {
    console.log('[JouleQuest] Skipping content script - running in iframe, not top window');
    return;
  }

  // CRITICAL: Prevent multiple content script injections in same tab
  if (window.JOULE_QUEST_INITIALIZED) {
    console.warn('[JouleQuest] Content script already initialized, skipping duplicate injection');
    return;
  }
  window.JOULE_QUEST_INITIALIZED = true;

  const logger = window.JouleQuestLogger;
  logger.info('Content script loaded in top-level window');

  // Initialize i18n system
  const i18n = window.JouleQuestI18n;
  await i18n.init();
  logger.success('I18n initialized', { language: i18n.getCurrentLanguage() });
  logger.info(`Detected language: ${i18n.getCurrentLanguage()}`); // Added for debugging
  logger.info('Loaded translations:', i18n.translations); // Added for debugging

  // Load configuration files
  let selectors, quests, solutions, solutionDetector, currentSolution;

  try {
    // Fetch configurations (NO user credentials stored - extension uses browser's authenticated session)
    const [selectorsResponse, questsResponse, solutionsResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('src/config/selectors.json')),
      fetch(chrome.runtime.getURL('src/config/quests.json')),
      fetch(chrome.runtime.getURL('src/config/solutions.json'))
    ]);

    selectors = await selectorsResponse.json();
    quests = await questsResponse.json();
    solutions = await solutionsResponse.json();

    logger.success('Configurations loaded', { selectors, quests, solutions });

    // Initialize solution detector
    const SolutionDetector = window.JouleSolutionDetector;
    solutionDetector = new SolutionDetector(solutions);
    
    // Detect current SAP solution
    currentSolution = solutionDetector.detect();
    logger.success('Solution detected', { 
      solution: currentSolution.name,
      badge: currentSolution.badge,
      theme: currentSolution.theme 
    });

  } catch (error) {
    logger.error('Failed to load configurations', error);
    return;
  }

  // Initialize components
  const overlay = window.JouleQuestOverlay;
  const runner = window.JouleQuestRunner;
  const storage = window.JouleQuestStorage;

  overlay.init();
  await runner.init(selectors, overlay, currentSolution);

  logger.success('All components initialized', { solution: currentSolution.name });

  // Check if there's an active quest state from navigation (page reload)
  // CRITICAL FIX: Use tab-specific storage key to prevent cross-tab contamination
  try {
    // Get current tab ID - wrap in runtime check since content scripts can't use chrome.tabs
    let tabId = 'unknown';
    try {
      const tabs = await chrome.tabs?.query({ active: true, currentWindow: true });
      tabId = tabs?.[0]?.id || 'unknown';
    } catch (tabError) {
      // Content scripts can't access chrome.tabs, use a fallback
      tabId = `content_${Date.now()}`;
    }
    const storageKey = `activeQuestState_tab${tabId}`;
    
    logger.info('Checking for tab-specific quest state', { tabId, storageKey });
    
    const result = await chrome.storage.local.get(storageKey);
    if (result[storageKey]) {
      const questState = result[storageKey];
      logger.info('Found active quest state from navigation (tab-specific)', { questState, storageKey });
      
      // CRITICAL: Verify this quest state belongs to current solution
      if (questState.solutionId && questState.solutionId !== currentSolution.id) {
        logger.warn(`Quest state is for different solution (${questState.solutionId} vs ${currentSolution.id}), ignoring`);
        await chrome.storage.local.remove(storageKey);
        logger.info('Cleared mismatched solution quest state');
        return; // Don't resume quest from different solution
      }
      
      // CRITICAL FIX: Check if quest state is stale (older than 30 seconds)
      // This prevents auto-restart loops from manual page refreshes
      const age = Date.now() - questState.timestamp;
      const MAX_STATE_AGE = 30000; // 30 seconds (increased for slower page loads)
      
      if (age > MAX_STATE_AGE) {
        logger.warn(`Quest state is stale (${age}ms old), ignoring and clearing`);
        await chrome.storage.local.remove(storageKey);
        logger.info('Cleared stale quest state');
      } else {
        // State is fresh, this is a legitimate navigation
        logger.info(`Quest state is fresh (${age}ms old), resuming quest`);
        
        // DON'T clear state yet - we need it for continueQuestFromStep
        // It will be cleared by the smart clearing logic or at quest completion
        
        // Wait for page to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Resume quest from saved state
        const quest = quests.quests.find(q => q.id === questState.questId);
        if (quest) {
          logger.info(`Resuming quest: ${quest.name} from step ${questState.currentStepIndex + 1}`);
          
          // Calculate next step index
          const nextStepIndex = questState.currentStepIndex + 1;
          
        // Check if quest is already complete
        if (nextStepIndex >= quest.steps.length) {
          logger.warn('Quest already completed');
          await chrome.storage.local.remove(storageKey);
          return;
        }
          
          // Set runner state to resume from next step
          runner.currentQuest = quest;
          runner.currentStepIndex = nextStepIndex;
          runner.isRunning = true;
          runner.mode = questState.mode;
          
          // Initialize tracking arrays
          runner.failedSteps = runner.failedSteps || [];
          runner.stepResults = runner.stepResults || [];
          
          // Get next step and check if it's agent quest
          const nextStep = quest.steps[nextStepIndex];
          const isAgentQuest = quest.category === 'agent';
          
          // Show the quest is continuing
          overlay.showStep(
            nextStep,
            nextStepIndex + 1,
            quest.steps.length,
            null,
            isAgentQuest
          );
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Continue quest execution from next step
          await continueQuestFromStep(quest, nextStepIndex, questState.mode);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to restore quest state', error);
        // Clear state on error to prevent stuck loops
        try {
          // Try to get tab ID for cleanup
          let tabId;
          try {
            const tabs = await chrome.tabs?.query({ active: true, currentWindow: true });
            tabId = tabs?.[0]?.id;
          } catch (tabError) {
            tabId = `content_${Date.now()}`;
          }
          if (tabId) {
            const storageKey = `activeQuestState_tab${tabId}`;
            await chrome.storage.local.remove(storageKey);
            logger.info('Cleared quest state due to error');
          }
    } catch (clearError) {
      logger.error('Failed to clear quest state', clearError);
    }
  }

  // DEBUGGING: Track message handler invocations
  let messageHandlerCallCount = 0;

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    messageHandlerCallCount++;
    logger.info(`[DEBUG] Message received (#${messageHandlerCallCount})`, message);

    (async () => {
      try {
        switch (message.action) {
          case 'showQuestSelection':
            logger.info(`[DEBUG] showQuestSelection triggered (#${messageHandlerCallCount})`);
            await handleShowQuestSelection();
            sendResponse({ success: true });
            break;

          case 'startQuest':
            await handleStartQuest(message.questId, message.mode, message.isReplay);
            sendResponse({ success: true });
            break;

          case 'stopQuest':
            runner.stopQuest();
            overlay.hide();
            sendResponse({ success: true });
            break;

          case 'getProgress':
            const progress = runner.getProgress();
            sendResponse({ success: true, progress });
            break;

          case 'getStats':
            const stats = await storage.getUserStats();
            sendResponse({ success: true, stats });
            break;

          default:
            sendResponse({ success: false, error: 'Unknown action' });
        }
      } catch (error) {
        logger.error('Message handler error', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    // Return true to indicate async response
    return true;
  });

  // Listen for window messages from overlay
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'START_QUEST') {
      handleStartQuest(event.data.questId, 'demo', event.data.isReplay);
    } else if (event.data.type === 'SHOW_QUEST_SELECTION') {
      logger.info('[DEBUG] SHOW_QUEST_SELECTION window message received');
      handleShowQuestSelection();
    }
  });

  // DEBUGGING: Track handleShowQuestSelection invocations
  let showQuestSelectionCallCount = 0;

  /**
   * Handle show quest selection command
   * Filters quests based on detected SAP solution
   */
  async function handleShowQuestSelection() {
    showQuestSelectionCallCount++;
    logger.info(`[DEBUG] handleShowQuestSelection called (#${showQuestSelectionCallCount})`, { solution: currentSolution.name });
    
    // DEBUGGING: Check DOM state before proceeding
    const existingOverlays = document.querySelectorAll('#joule-quest-overlay, .joule-quest-overlay');
    logger.info(`[DEBUG] Existing overlays in DOM BEFORE processing: ${existingOverlays.length}`, {
      overlayIds: Array.from(existingOverlays).map(el => el.id || el.className)
    });

    try {
      // CRITICAL FIX: Force reset runner state to prevent "another quest already running" error
      // This clears any stuck quest state from previous runs
      if (runner.isQuestRunning()) {
        logger.warn('[DEBUG] Quest is running, force resetting state');
        runner.forceReset();
      } else {
        // Even if not running, do a safety reset to ensure clean state
        logger.info('[DEBUG] Safety reset of quest runner state');
        runner.forceReset();
      }

      // Filter quests by current solution
      const availableQuests = quests.quests.filter(quest => 
        !quest.solutions || quest.solutions.includes(currentSolution.id)
      );

      // Filter journeys by current solution
      const availableJourneys = Object.entries(quests.journeys)
        .filter(([_, journey]) => 
          !journey.solutions || journey.solutions.includes(currentSolution.id)
        )
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

      logger.info('[DEBUG] Quests filtered by solution', {
        solution: currentSolution.name,
        totalQuests: quests.quests.length,
        availableQuests: availableQuests.length,
        totalJourneys: Object.keys(quests.journeys).length,
        availableJourneys: Object.keys(availableJourneys).length
      });

      // Get completed quests and stats FOR THIS SOLUTION ONLY
      const completedQuests = await storage.getCompletedQuests(currentSolution.id);
      const stats = await storage.getUserStats(currentSolution.id);

      // Apply solution theme to overlay
      logger.info('[DEBUG] Applying solution theme');
      overlay.applySolutionTheme(currentSolution);

      // Show quest selection overlay (centered on screen) with journey metadata and solution badge
      logger.info('[DEBUG] Calling overlay.showQuestSelection()');
      overlay.showQuestSelection(
        availableQuests, 
        completedQuests, 
        stats, 
        availableJourneys,
        currentSolution
      );

      // DEBUGGING: Check DOM state after processing
      const overlaysAfter = document.querySelectorAll('#joule-quest-overlay, .joule-quest-overlay');
      logger.info(`[DEBUG] Overlays in DOM AFTER processing: ${overlaysAfter.length}`, {
        overlayIds: Array.from(overlaysAfter).map(el => el.id || el.className)
      });

      logger.success('[DEBUG] Quest selection overlay displayed', { 
        solution: currentSolution.name,
        questCount: availableQuests.length 
      });
    } catch (error) {
      logger.error('[DEBUG] Failed to show quest selection', error);
      overlay.showError('Failed to load quests. Please refresh the page and try again.');
      throw error;
    }
  }

  /**
   * Handle start quest command
   * @param {string} questId - Quest ID
   * @param {string} mode - 'demo' or 'real'
   * @param {boolean} isReplay - Whether this is a replay
   */
  async function handleStartQuest(questId, mode = 'demo', isReplay = false) {
    logger.quest('Starting quest', { questId, mode, isReplay });

    try {
      // Find quest in configuration
      const quest = quests.quests.find(q => q.id === questId);
      
      if (!quest) {
        throw new Error(`Quest not found: ${questId}`);
      }

      // Start the quest
      await runner.startQuest(quest, mode);

      // Save progress (only if not replay) FOR THIS SOLUTION
      if (!isReplay) {
        try {
          if (storage && typeof storage.saveQuestProgress === 'function') {
            await storage.saveQuestProgress(questId, {
              completed: true,
              completedAt: Date.now(),
              mode: mode
            });

            // Update stats FOR THIS SOLUTION
            await storage.incrementQuestCompletion(quest.points, currentSolution.id);
            logger.success('Quest progress saved to storage', { solution: currentSolution.id });
          } else {
            logger.warn('Storage manager not available, skipping save');
          }
        } catch (storageError) {
          logger.error('Failed to save progress, but quest completed', storageError);
          // Don't throw - quest still succeeded
        }
      } else {
        logger.info('Replay mode - skipping progress save');
      }

      logger.success('Quest completed successfully');

      // DON'T auto-redirect - user should manually click "Show Quests" button
      // This allows them time to enjoy the victory screen and use share buttons

    } catch (error) {
      logger.error('Quest execution failed', error);
      overlay.showError(error.message);
      throw error;
    }
  }

  // Notify background that content script is ready
  chrome.runtime.sendMessage({ action: 'contentScriptReady' }, (response) => {
    if (chrome.runtime.lastError) {
      logger.warn('Could not notify background script', chrome.runtime.lastError);
    } else {
      logger.info('Background script notified');
    }
  });

  /**
   * Continue quest execution from a specific step
   * Used when resuming after page navigation
   */
  async function continueQuestFromStep(quest, startStepIndex, mode) {
    logger.info(`Continuing quest from step ${startStepIndex + 1}`);
    
    // CRITICAL: Don't clear state at start - we might have more navigation steps coming
    // State will be cleared intelligently after we're past all page reloads
    logger.info('Quest state preserved - checking for additional navigation steps');
    
    runner.failedSteps = runner.failedSteps || [];
    runner.stepResults = runner.stepResults || [];
    
    const steps = quest.steps;
    const stepsLength = steps.length;
    
    // Check if this is an agent quest (hide mascot arrow)
    const isAgentQuest = quest.category === 'agent';

    for (let i = startStepIndex; i < stepsLength; i++) {
      if (!runner.currentQuest || !runner.currentQuest.steps) {
        logger.warn('Quest was stopped during execution');
        // CRITICAL: Clear state when stopping (tab-specific)
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tabId = tabs[0]?.id;
          if (tabId) {
            const storageKey = `activeQuestState_tab${tabId}`;
            await chrome.storage.local.remove(storageKey);
            logger.info('Cleared quest state after stop');
          }
        } catch (error) {
          logger.error('Failed to clear quest state on stop', error);
        }
        return;
      }

      runner.currentStepIndex = i;
      const step = steps[i];

      logger.quest(quest.name, `Executing step ${i + 1}: ${step.name}`);

      if (overlay) {
        overlay.showStep(step, i + 1, stepsLength, null, isAgentQuest);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        await runner.executeStep(step);
        
        runner.stepResults.push({
          stepIndex: i,
          stepName: step.name,
          status: 'success',
          error: null
        });
        
        if (overlay) {
          overlay.showStepSuccess(step.successMessage, isAgentQuest);
        }

        // SMART STATE CLEARING: Clear state after steps that cause page reloads
        // But only if the NEXT step won't cause another reload
        const currentStep = steps[i];
        const nextStep = steps[i + 1];
        
        // Actions that might cause page reloads
        const reloadActions = ['navigate', 'click_button'];
        const currentMightReload = reloadActions.includes(currentStep.action);
        const nextWillReload = nextStep && reloadActions.includes(nextStep.action);
        
        // Clear state if current step might have caused reload AND next won't
        if (currentMightReload && !nextWillReload) {
          try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tabId = tabs[0]?.id;
            if (tabId) {
              const storageKey = `activeQuestState_tab${tabId}`;
              await chrome.storage.local.remove(storageKey);
              logger.info(`Cleared quest state after ${step.name} - no more reloads expected`);
            }
          } catch (error) {
            logger.error('Failed to clear quest state', error);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        logger.error(`Step ${i + 1} failed: ${error.message}`, error);
        
        runner.failedSteps.push(i);
        runner.stepResults.push({
          stepIndex: i,
          stepName: step.name,
          status: 'error',
          error: error.message
        });
        
        if (overlay) {
          overlay.showStepError(step, 'UNKNOWN_ERROR', error.message, isAgentQuest);
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Quest completed
    logger.quest(quest.name, 'Quest completed after navigation');
    
    if (overlay) {
      overlay.showQuestComplete(quest, runner.stepResults, runner.failedSteps);
    }
    
    // Save progress FOR THIS SOLUTION
    try {
      await storage.saveQuestProgress(quest.id, {
        completed: true,
        completedAt: Date.now(),
        mode: mode
      });
      await storage.incrementQuestCompletion(quest.points, currentSolution.id);
      logger.success('Quest progress saved', { solution: currentSolution.id });
    } catch (error) {
      logger.error('Failed to save progress', error);
    }
    
    // CRITICAL FIX: Final cleanup - ensure state is cleared when quest completes (tab-specific)
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (tabId) {
        const storageKey = `activeQuestState_tab${tabId}`;
        await chrome.storage.local.remove(storageKey);
        logger.info('Final cleanup: Cleared quest state after completion');
      }
    } catch (error) {
      logger.error('Failed final quest state cleanup', error);
    }
    
    runner.isRunning = false;
    runner.currentQuest = null;
    runner.currentStepIndex = 0;
  }

  logger.info('Content script initialization complete');
})();
