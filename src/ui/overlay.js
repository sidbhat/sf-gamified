/**
 * Overlay - Joule Quest UI overlay for quest progress
 * Shows quest steps, success messages, and confetti
 */
class QuestOverlay {
  constructor() {
    this.logger = window.JouleQuestLogger;
    this.container = null;
    this.isVisible = false;
  }

  /**
   * Initialize overlay
   */
  init() {
    this.logger.info('Initializing overlay');
    this.createContainer();
  }

  /**
   * Create overlay container
   */
  createContainer() {
    // Remove existing overlay if any
    const existing = document.getElementById('joule-quest-overlay');
    if (existing) {
      existing.remove();
    }

    // Create overlay container
    this.container = document.createElement('div');
    this.container.id = 'joule-quest-overlay';
    this.container.className = 'joule-quest-overlay hidden';
    
    document.body.appendChild(this.container);
    this.logger.success('Overlay container created');
  }

  /**
   * Show quest selection screen
   * @param {Array} quests - Array of all quests
   * @param {Array} completedQuests - Array of completed quest IDs
   * @param {Object} stats - User statistics
   * @param {Object} journeys - Journey metadata (names and descriptions)
   */
  showQuestSelection(quests, completedQuests, stats, journeys = {}) {
    this.logger.info('Showing quest selection', { quests, completedQuests, stats, journeys });

    const employeeQuests = quests.filter(q => q.category === 'employee');
    const managerQuests = quests.filter(q => q.category === 'manager');
    
    // Get journey info with defaults
    const employeeJourney = journeys.employee || { name: 'Employee Journey', description: 'Complete employee quests' };
    const managerJourney = journeys.manager || { name: 'Manager Journey', description: 'Complete manager quests' };
    
    const renderQuestNodes = (questList, category) => {
      return questList.map((quest, index) => {
        const isCompleted = completedQuests.includes(quest.id);
        const statusClass = isCompleted ? 'completed' : '';
        const nextIsCompleted = index < questList.length - 1 && completedQuests.includes(questList[index + 1].id);
        
        return `
          <div class="quest-node ${statusClass}" data-quest-id="${quest.id}" data-completed="${isCompleted}">
            <div class="quest-number">${index + 1}</div>
            <div class="quest-icon">${quest.icon}</div>
            <div class="quest-info">
              <div class="quest-name">${quest.name}</div>
              <div class="quest-meta">
                <span class="quest-badge">${quest.difficulty}</span>
                <span class="quest-badge">💎 ${quest.points}</span>
              </div>
            </div>
          </div>
          ${index < questList.length - 1 ? `<div class="path-line ${isCompleted ? 'completed' : ''}"></div>` : ''}
        `;
      }).join('');
    };

    const html = `
      <div class="joule-quest-card quest-selection">
        <button class="close-btn" id="quest-close-btn">✕</button>
        
        <div class="selection-header">
          <div class="logo">🎯</div>
          <h2>Joule Quest</h2>
          <button class="reset-btn" id="quest-reset-btn" title="Reset all progress">🔄</button>
        </div>

        <div class="selection-stats">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">${stats.totalPoints || 0}</div>
              <div class="stat-label">POINTS</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <div class="stat-value">${stats.questsCompleted || 0}</div>
              <div class="stat-label">QUESTS</div>
            </div>
          </div>
        </div>

        <div class="selection-tabs">
          <button class="tab-btn active" data-category="employee">👤 Employee</button>
          <button class="tab-btn" data-category="manager">👔 Manager</button>
        </div>

        <div class="selection-content">
          <div class="quest-category active" data-category="employee">
            <div class="journey-progress">
              <div class="progress-label">
                <span>🗺️ ${employeeJourney.name}</span>
                <strong>${employeeQuests.filter(q => completedQuests.includes(q.id)).length} / ${employeeQuests.length}</strong>
              </div>
              <div class="journey-bar">
                <div class="journey-fill" style="width: ${(employeeQuests.filter(q => completedQuests.includes(q.id)).length / employeeQuests.length) * 100}%">
                  <span class="journey-sparkle">✨</span>
                </div>
              </div>
            </div>
            <div class="quest-map-selection">
              <div class="map-start">🚩 START</div>
              ${renderQuestNodes(employeeQuests, 'employee')}
              <div class="path-line"></div>
              <div class="map-end">🏆 GOAL!</div>
            </div>
          </div>

          <div class="quest-category" data-category="manager">
            <div class="journey-progress">
              <div class="progress-label">
                <span>🗺️ ${managerJourney.name}</span>
                <strong>${managerQuests.filter(q => completedQuests.includes(q.id)).length} / ${managerQuests.length}</strong>
              </div>
              <div class="journey-bar">
                <div class="journey-fill" style="width: ${(managerQuests.filter(q => completedQuests.includes(q.id)).length / managerQuests.length) * 100}%">
                  <span class="journey-sparkle">✨</span>
                </div>
              </div>
            </div>
            <div class="quest-map-selection">
              <div class="map-start">🚩 START</div>
              ${renderQuestNodes(managerQuests, 'manager')}
              <div class="path-line"></div>
              <div class="map-end">🏆 GOAL!</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Add event listeners
    this.setupQuestSelectionListeners();
  }

  /**
   * Setup quest selection event listeners
   */
  setupQuestSelectionListeners() {
    // Close button
    const closeBtn = this.container.querySelector('#quest-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Reset button
    const resetBtn = this.container.querySelector('#quest-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const confirmed = confirm('⚠️ Reset All Progress?\n\nThis will:\n• Delete all completed quests\n• Reset points to 0\n• Start fresh\n\nThis action cannot be undone. Continue?');
        
        if (confirmed) {
          // Clear storage
          if (window.JouleQuestStorage) {
            await window.JouleQuestStorage.clearAllProgress();
            this.logger.info('All progress reset');
          }
          
          // Reload the overlay to show fresh state
          this.hide();
          setTimeout(() => {
            window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*');
          }, 100);
        }
      });
    }

    // Tab switching
    const tabs = this.container.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        const contents = this.container.querySelectorAll('.quest-category');
        contents.forEach(c => c.classList.remove('active'));
        this.container.querySelector(`.quest-category[data-category="${category}"]`).classList.add('active');
        
        // Play sound
        if (window.soundEffects) {
          window.soundEffects.playClick();
        }
      });
    });

    // Quest node clicks
    const questNodes = this.container.querySelectorAll('.quest-node');
    questNodes.forEach(node => {
      node.addEventListener('click', () => {
        const questId = node.dataset.questId;
        const isCompleted = node.dataset.completed === 'true';
        
        if (isCompleted) {
          const replay = confirm('🎯 Replay this quest?\n\nYou won\'t earn points again, but you can practice the quest flow.');
          if (replay) {
            if (window.soundEffects) window.soundEffects.playQuestStart();
            this.hide();
            // Trigger quest start with replay flag
            window.postMessage({ type: 'START_QUEST', questId, isReplay: true }, '*');
          }
        } else {
          if (window.soundEffects) window.soundEffects.playQuestStart();
          this.hide();
          // Trigger quest start
          window.postMessage({ type: 'START_QUEST', questId, isReplay: false }, '*');
        }
      });
    });

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Show quest start screen
   * @param {Object} quest - Quest configuration
   */
  showQuestStart(quest) {
    this.logger.info('Showing quest start', quest);

    // Defensive: ensure quest object has required properties
    if (!quest || !quest.steps) {
      this.logger.error('Quest object or steps array is missing in showQuestStart');
      return;
    }

    const html = `
      <div class="joule-quest-card quest-start">
        <div class="joule-icon">🎯</div>
        <h2>Quest Started!</h2>
        <h3>${quest.name}</h3>
        <p>${quest.description}</p>
        <div class="quest-info">
          <span class="difficulty">${quest.difficulty}</span>
          <span class="points">${quest.points} points</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <p class="step-counter">Step 1 of ${quest.steps.length}</p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Auto-hide after 3 seconds
    setTimeout(() => this.hide(), 3000);
  }

  /**
   * Show current step
   * @param {Object} step - Step configuration
   * @param {number} current - Current step number
   * @param {number} total - Total steps
   * @param {string} jouleResponse - Optional Joule response text to display
   */
  showStep(step, current, total, jouleResponse = null) {
    this.logger.info('Showing step', { step, current, total, jouleResponse });

    const progress = (current / total) * 100;

    const html = `
      <div class="joule-quest-card quest-step">
        <div class="step-header">
          <span class="step-number">Step ${current}/${total}</span>
          <span class="step-icon">🎮</span>
        </div>
        <h3>${step.name}</h3>
        <p>${step.description}</p>
        ${step.hint ? `<p class="hint">💡 ${step.hint}</p>` : ''}
        ${jouleResponse ? `
          <div class="joule-response">
            <strong>🤖 Joule's Response:</strong>
            <div class="joule-response-text">${jouleResponse}</div>
          </div>
        ` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Add page-level border indicator
    document.body.classList.add('quest-running');
    
    this.show();
  }

  /**
   * Show step instructions (real mode)
   * @param {Object} step - Step configuration
   * @param {number} current - Current step number
   * @param {number} total - Total steps
   */
  showStepInstructions(step, current, total) {
    this.logger.info('Showing step instructions', { step, current, total });

    const progress = (current / total) * 100;

    const html = `
      <div class="joule-quest-card quest-step instructions">
        <div class="step-header">
          <span class="step-number">Step ${current}/${total}</span>
          <span class="step-icon">👆</span>
        </div>
        <h3>Your Turn!</h3>
        <h4>${step.name}</h4>
        <p class="instruction">${step.description}</p>
        ${step.hint ? `<p class="hint">💡 Hint: ${step.hint}</p>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="waiting">Waiting for you to complete this step...</p>
      </div>
    `;

    this.container.innerHTML = html;
    
    // Add page-level border indicator
    document.body.classList.add('quest-running');
    
    this.show();
  }

  /**
   * Show step success message
   * @param {string} message - Success message
   */
  showStepSuccess(message) {
    this.logger.info('Showing step success', message);

    const html = `
      <div class="joule-quest-card quest-success">
        <div class="success-icon">⭐</div>
        <h3>Success!</h3>
        <p>${message}</p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Auto-hide after 2 seconds
    setTimeout(() => this.hide(), 2000);
  }

  /**
   * Show step error message (but quest continues)
   * @param {Object} step - Step configuration
   * @param {string} errorMessage - Error message or error type
   * @param {string} technicalDetails - Optional technical details
   */
  showStepError(step, errorMessage, technicalDetails = null) {
    this.logger.warn('Showing step error (quest continues)', { step, errorMessage, technicalDetails });

    // Try to get formatted error from catalog
    let errorContent = '';
    let errorIcon = '⚠️';
    
    if (window.JouleQuestErrorMessages) {
      // Check if errorMessage is an error type from catalog
      const errorTypes = ['JOULE_NOT_FOUND', 'JOULE_IFRAME_NOT_FOUND', 'STEP_TIMEOUT', 
                         'ELEMENT_NOT_FOUND', 'PROMPT_SEND_FAILED', 'BUTTON_NOT_FOUND', 
                         'INPUT_FIELD_NOT_FOUND', 'UNKNOWN_ERROR'];
      
      if (errorTypes.includes(errorMessage)) {
        const errorObj = window.JouleQuestErrorMessages.getErrorMessage(
          errorMessage, 
          step.name, 
          technicalDetails
        );
        errorIcon = errorObj.icon;
        errorContent = window.JouleQuestErrorMessages.formatErrorForDisplay(errorObj);
      } else {
        // Regular error message string
        errorContent = `<p style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">Error: ${errorMessage}</p>`;
      }
    } else {
      // Fallback if error catalog not loaded
      errorContent = `<p style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">Error: ${errorMessage}</p>`;
    }

    const html = `
      <div class="joule-quest-card quest-error">
        <div class="error-icon">${errorIcon}</div>
        <h3>Step Failed</h3>
        <h4>${step.name}</h4>
        ${errorContent}
        <p style="opacity: 0.8; font-size: 13px; margin-top: 12px;">
          ⏭️ Continuing to next step...
        </p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Auto-hide after 5 seconds (longer to read detailed error)
    setTimeout(() => this.hide(), 5000);
  }

  /**
   * Show quest complete screen with step results summary
   * @param {Object} quest - Quest configuration
   * @param {Array} stepResults - Array of step result objects
   * @param {Array} failedSteps - Array of failed step indices
   */
  showQuestComplete(quest, stepResults = [], failedSteps = []) {
    this.logger.info('Showing quest complete', { quest, stepResults, failedSteps });

    // Defensive: ensure quest object has required properties
    if (!quest) {
      this.logger.error('Quest object is null or undefined in showQuestComplete');
      return;
    }

    const questName = quest.name || 'Unknown Quest';
    const questPoints = quest.points || 0;
    const totalSteps = stepResults.length;
    const successfulSteps = stepResults.filter(r => r.status === 'success').length;
    const failedStepsCount = failedSteps.length;

    // Remove page-level border indicator when quest completes
    document.body.classList.remove('quest-running');

    // Determine completion status
    const isFullSuccess = failedStepsCount === 0;
    const completionIcon = isFullSuccess ? '🏆' : '⚠️';
    const completionTitle = isFullSuccess ? 'Quest Complete!' : 'Quest Completed (With Errors)';
    const completionColor = isFullSuccess ? 'quest-complete' : 'quest-partial';

    // Build step summary if there were failures
    let stepSummary = '';
    if (failedStepsCount > 0) {
      const failedStepsList = stepResults
        .filter(r => r.status === 'error')
        .map(r => `<li>❌ Step ${r.stepIndex + 1}: ${r.stepName}</li>`)
        .join('');
      
      stepSummary = `
        <div class="step-summary">
          <p style="font-size: 13px; margin-bottom: 8px;">
            <strong>Steps:</strong> ${successfulSteps}/${totalSteps} completed
          </p>
          <ul style="text-align: left; font-size: 12px; opacity: 0.9; margin: 0; padding-left: 20px;">
            ${failedStepsList}
          </ul>
        </div>
      `;
    }

    const html = `
      <div class="joule-quest-card ${completionColor}">
        <div class="complete-icon">${completionIcon}</div>
        <h2>${completionTitle}</h2>
        <h3>${questName}</h3>
        ${stepSummary}
        <div class="rewards">
          <div class="reward-item">
            <span class="reward-icon">⭐</span>
            <span class="reward-value">+${isFullSuccess ? questPoints : Math.floor(questPoints * 0.5)} points</span>
          </div>
        </div>
        <p class="congrats">${isFullSuccess ? 'You\'re a Joule master!' : 'Keep practicing to master Joule!'}</p>
        <button class="show-quests-btn" onclick="window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*')">
          🗺️ Show Quests
        </button>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Trigger confetti only for full success (wrapped in try-catch for safety)
    if (isFullSuccess && window.JouleQuestConfetti) {
      try {
        window.JouleQuestConfetti.celebrate();
      } catch (error) {
        console.warn('[JouleQuest] Confetti error (non-critical):', error);
      }
    }

    // Auto-hide after 8 seconds (longer to allow clicking button)
    setTimeout(() => {
      if (this.isVisible) {
        this.hide();
      }
    }, 8000);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.logger.error('Showing error overlay', message);

    // Remove page-level border indicator on error
    document.body.classList.remove('quest-running');

    const html = `
      <div class="joule-quest-card quest-error">
        <div class="error-icon">❌</div>
        <h3>Oops!</h3>
        <p>${message}</p>
        <button class="retry-button" onclick="window.location.reload()">Try Again</button>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();
  }

  /**
   * Show overlay
   */
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.isVisible = true;
      this.logger.info('Overlay shown');
    }
  }

  /**
   * Hide overlay
   */
  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
      this.isVisible = false;
      this.logger.info('Overlay hidden');
    }
  }

  /**
   * Remove overlay from DOM
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.isVisible = false;
      this.logger.info('Overlay destroyed');
    }
  }
}

// Create global overlay instance
window.JouleQuestOverlay = new QuestOverlay();
