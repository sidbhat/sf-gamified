/**
 * Content Script - Main entry point for the Chrome extension
 * Initializes all components and handles message passing
 */

(async function() {
  'use strict';

  const logger = window.JouleQuestLogger;
  logger.info('Content script loaded');

  // Load configuration files
  let selectors, quests;

  try {
    // Fetch configurations (NO user credentials stored - extension uses browser's authenticated session)
    const [selectorsResponse, questsResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('src/config/selectors.json')),
      fetch(chrome.runtime.getURL('src/config/quests.json'))
    ]);

    selectors = await selectorsResponse.json();
    quests = await questsResponse.json();

    logger.success('Configurations loaded', { selectors, quests });
  } catch (error) {
    logger.error('Failed to load configurations', error);
    return;
  }

  // Initialize components
  const overlay = window.JouleQuestOverlay;
  const runner = window.JouleQuestRunner;
  const storage = window.JouleQuestStorage;

  overlay.init();
  await runner.init(selectors, overlay);

  logger.success('All components initialized');

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info('Message received', message);

    (async () => {
      try {
        switch (message.action) {
          case 'showQuestSelection':
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
      handleShowQuestSelection();
    }
  });

  /**
   * Handle show quest selection command
   */
  async function handleShowQuestSelection() {
    logger.info('Showing quest selection overlay');

    try {
      // CRITICAL FIX: Force reset runner state to prevent "another quest already running" error
      // This clears any stuck quest state from previous runs
      if (runner.isQuestRunning()) {
        logger.warn('Quest is running, force resetting state');
        runner.forceReset();
      } else {
        // Even if not running, do a safety reset to ensure clean state
        logger.info('Safety reset of quest runner state');
        runner.forceReset();
      }

      // Get completed quests and stats
      const completedQuests = await storage.getCompletedQuests();
      const stats = await storage.getUserStats();

      // Show quest selection overlay (centered on screen)
      overlay.showQuestSelection(quests.quests, completedQuests, stats);

      logger.success('Quest selection overlay displayed');
    } catch (error) {
      logger.error('Failed to show quest selection', error);
      overlay.showError('Failed to load quests. Please refresh the page and try again.');
      throw error;
    }
  }

  // Listen for quest start from overlay
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'START_QUEST') {
      handleStartQuest(event.data.questId, 'demo', event.data.isReplay);
    }
  });

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

      // Save progress (only if not replay)
      if (!isReplay) {
        try {
          if (storage && typeof storage.saveQuestProgress === 'function') {
            await storage.saveQuestProgress(questId, {
              completed: true,
              completedAt: Date.now(),
              mode: mode
            });

            // Update stats
            await storage.incrementQuestCompletion(quest.points);
            logger.success('Quest progress saved to storage');
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

      // Auto-reopen quest selection after 3 seconds (removed manual "Show Quests" button)
      setTimeout(async () => {
        try {
          await handleShowQuestSelection();
        } catch (error) {
          logger.error('Failed to reopen quest selection', error);
        }
      }, 3000);

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

  logger.info('Content script initialization complete');
})();
