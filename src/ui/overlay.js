/**
 * Overlay - Joule Quest UI overlay for quest progress
 * Shows quest steps, success messages, confetti, and animated mascot
 */
class QuestOverlay {
  constructor() {
    this.logger = window.JouleQuestLogger;
    this.container = null;
    this.isVisible = false;
  }

  /**
   * Generate mascot SVG based on state
   * @param {string} state - Mascot state (waiting, active, success, error, complete)
   * @param {boolean} showArrow - Whether to show pointing arrow (false for agent quests)
   * @returns {string} SVG HTML string
   */
  getMascotSVG(state = 'waiting', showArrow = true) {
    // Determine colors based on state
    let bodyGradient = 'purpleGradient';
    let glowColor = '#9333ea';
    
    if (state === 'success') {
      bodyGradient = 'successGradient';
      glowColor = '#38ef7d';
    } else if (state === 'error') {
      bodyGradient = 'errorGradient';
      glowColor = '#ff6b6b';
    } else if (state === 'complete') {
      bodyGradient = 'completeGradient';
      glowColor = '#FFD700';
    }

    // Only check Joule visibility if showArrow is true
    // For agent quests, showArrow will be false, so arrow is never rendered
    const jouleVisible = showArrow ? this.isJouleVisible() : false;

    return `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Default purple gradient -->
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
          
          <!-- Success gradient -->
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#11998e"/>
            <stop offset="100%" style="stop-color:#38ef7d"/>
          </linearGradient>
          
          <!-- Error gradient -->
          <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b6b"/>
            <stop offset="100%" style="stop-color:#c92a2a"/>
          </linearGradient>
          
          <!-- Complete gradient -->
          <linearGradient id="completeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFD700"/>
            <stop offset="50%" style="stop-color:#FFA500"/>
            <stop offset="100%" style="stop-color:#FFD700"/>
          </linearGradient>
        </defs>
        
        <!-- Outer glow ring (pulsates) -->
        <circle class="mascot-glow" cx="25" cy="30" r="38" 
                fill="none" stroke="${glowColor}" stroke-width="2" opacity="0.4"/>
        
        <!-- Main body: Outer ring -->
        <circle class="mascot-body" cx="25" cy="30" r="20" 
                fill="url(#${bodyGradient})" opacity="0.9"/>
        
        <!-- Middle segmented ring -->
        <g class="mascot-segments" opacity="0.85">
          <path d="M 25 12 A 18 18 0 0 1 39 22 L 32 25 A 10 10 0 0 0 25 18 Z" 
                fill="url(#${bodyGradient})"/>
          <path d="M 39 22 A 18 18 0 0 1 39 38 L 32 35 A 10 10 0 0 0 32 25 Z" 
                fill="url(#${bodyGradient})"/>
          <path d="M 39 38 A 18 18 0 0 1 25 48 L 25 40 A 10 10 0 0 0 32 35 Z" 
                fill="url(#${bodyGradient})"/>
          <path d="M 25 48 A 18 18 0 0 1 11 38 L 18 35 A 10 10 0 0 0 25 40 Z" 
                fill="url(#${bodyGradient})"/>
          <path d="M 11 38 A 18 18 0 0 1 11 22 L 18 25 A 10 10 0 0 0 18 35 Z" 
                fill="url(#${bodyGradient})"/>
          <path d="M 11 22 A 18 18 0 0 1 25 12 L 25 18 A 10 10 0 0 0 18 25 Z" 
                fill="url(#${bodyGradient})"/>
        </g>
        
        <!-- Inner circle -->
        <circle cx="25" cy="30" r="10" fill="#764ba2"/>
        
        <!-- Crosshair center -->
        <g class="mascot-crosshair">
          <line x1="25" y1="22" x2="25" y2="38" stroke="white" stroke-width="2.5"/>
          <line x1="17" y1="30" x2="33" y2="30" stroke="white" stroke-width="2.5"/>
          <circle cx="25" cy="30" r="4" fill="white"/>
        </g>
        
        <!-- Pointing arrow (conditionally rendered based on Joule visibility) -->
        ${jouleVisible ? `
          <g class="pointing-arrow">
            <line x1="42" y1="30" x2="56" y2="30" 
                  stroke="white" stroke-width="3" stroke-linecap="round"/>
            <path d="M 51 25 L 56 30 L 51 35" 
                  fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          </g>
        ` : `
          <!-- Joule not visible: Show question mark -->
          <g class="pointing-arrow" opacity="0.4">
            <circle cx="48" cy="30" r="8" fill="none" stroke="white" stroke-width="2"/>
            <text x="48" y="34" fill="white" font-size="10" font-weight="bold" text-anchor="middle">?</text>
          </g>
        `}
      </svg>
    `;
  }

  /**
   * Update mascot state
   * @param {string} state - New state (waiting, active, success, error, complete)
   */
  updateMascotState(state) {
    const mascot = this.container.querySelector('.quest-mascot');
    if (mascot) {
      mascot.setAttribute('data-state', state);
      mascot.innerHTML = this.getMascotSVG(state);
      this.logger.info(`Mascot state updated to: ${state}`);
    }
  }

  /**
   * Check if Joule iframe is visible
   * @returns {boolean} True if Joule iframe exists and is visible
   */
  isJouleVisible() {
    const iframe = document.querySelector('iframe[src*="sapdas.cloud.sap"]');
    if (!iframe) {
      return false;
    }
    
    const rect = iframe.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
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
   * Get logo SVG
   * @returns {string} Logo SVG HTML
   */
  getLogoSVG() {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="8"/>
        <path d="M 50 10 A 40 40 0 0 1 85 35" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <path d="M 90 50 A 40 40 0 0 1 85 65" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <path d="M 50 90 A 40 40 0 0 1 15 65" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <path d="M 10 50 A 40 40 0 0 1 15 35" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
        <circle cx="50" cy="50" r="15" fill="white"/>
        <line x1="50" y1="38" x2="50" y2="62" stroke="#764ba2" stroke-width="3"/>
        <line x1="38" y1="50" x2="62" y2="50" stroke="#764ba2" stroke-width="3"/>
        <circle cx="50" cy="50" r="5" fill="#764ba2"/>
      </svg>
    `;
  }

  /**
   * Get employee icon SVG
   * @returns {string} Employee icon SVG HTML
   */
  getEmployeeIconSVG() {
    return `
      <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20v-1a6 6 0 0112 0v1"/>
        <path d="M17 12l3-3m0 0l-3-3m3 3h-5"/>
      </svg>
    `;
  }

  /**
   * Get manager icon SVG
   * @returns {string} Manager icon SVG HTML
   */
  getManagerIconSVG() {
    return `
      <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <circle cx="6" cy="15" r="2.5"/>
        <circle cx="18" cy="15" r="2.5"/>
        <path d="M12 8v4M9 12l-2.5 2M15 12l2.5 2"/>
      </svg>
    `;
  }

  /**
   * Get agent icon SVG
   * @returns {string} Agent icon SVG HTML
   */
  getAgentIconSVG() {
    return `
      <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    `;
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
    const agentQuests = quests.filter(q => q.category === 'agent');
    
    // Get journey info with defaults
    const employeeJourney = journeys.employee || { name: 'Employee Journey', description: 'Complete employee quests' };
    const managerJourney = journeys.manager || { name: 'Manager Journey', description: 'Complete manager quests' };
    const agentJourney = journeys.agent || { name: 'AI Agent Workflows', description: 'Master GenAI-powered workflows' };
    
    const renderQuestNodes = (questList, category) => {
      return questList.map((quest, index) => {
        const isCompleted = completedQuests.includes(quest.id);
        
        // Check if quest is locked (requires other quests to be completed first)
        const isLocked = quest.requiresQuests && 
          !quest.requiresQuests.every(reqId => completedQuests.includes(reqId));
        
        const statusClass = isCompleted ? 'completed' : (isLocked ? 'locked' : '');
        const nextIsCompleted = index < questList.length - 1 && completedQuests.includes(questList[index + 1].id);
        
        // For locked quests, show which prerequisites are needed
        let lockMessage = '';
        if (isLocked && quest.requiresQuests) {
          const remaining = quest.requiresQuests.filter(reqId => !completedQuests.includes(reqId));
          lockMessage = `<div class="quest-lock-info">🔒 Complete ${remaining.length} more quest${remaining.length > 1 ? 's' : ''} to unlock</div>`;
        }
        
        return `
          <div class="quest-node ${statusClass}" data-quest-id="${quest.id}" data-completed="${isCompleted}" data-locked="${isLocked}">
            <div class="quest-number">${isLocked ? '🔒' : index + 1}</div>
            <div class="quest-icon" style="opacity: ${isLocked ? '0.4' : '1'}">${quest.icon}</div>
            <div class="quest-info">
              <div class="quest-name" style="opacity: ${isLocked ? '0.6' : '1'}">${quest.name}</div>
              ${lockMessage}
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
        <div class="selection-header">
          <button class="reset-btn" id="quest-reset-btn" title="Reset all progress">🔄</button>
          
          <div class="header-center">
            <svg class="logo-icon" width="36" height="36" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
              </defs>
              <circle cx="25" cy="30" r="20" fill="url(#headerGradient)" opacity="0.9"/>
              <g opacity="0.85">
                <path d="M 25 12 A 18 18 0 0 1 39 22 L 32 25 A 10 10 0 0 0 25 18 Z" fill="url(#headerGradient)"/>
                <path d="M 39 22 A 18 18 0 0 1 39 38 L 32 35 A 10 10 0 0 0 32 25 Z" fill="url(#headerGradient)"/>
                <path d="M 39 38 A 18 18 0 0 1 25 48 L 25 40 A 10 10 0 0 0 32 35 Z" fill="url(#headerGradient)"/>
                <path d="M 25 48 A 18 18 0 0 1 11 38 L 18 35 A 10 10 0 0 0 25 40 Z" fill="url(#headerGradient)"/>
                <path d="M 11 38 A 18 18 0 0 1 11 22 L 18 25 A 10 10 0 0 0 18 35 Z" fill="url(#headerGradient)"/>
                <path d="M 11 22 A 18 18 0 0 1 25 12 L 25 18 A 10 10 0 0 0 18 25 Z" fill="url(#headerGradient)"/>
              </g>
              <circle cx="25" cy="30" r="10" fill="#764ba2"/>
              <line x1="25" y1="22" x2="25" y2="38" stroke="white" stroke-width="2.5"/>
              <line x1="17" y1="30" x2="33" y2="30" stroke="white" stroke-width="2.5"/>
              <circle cx="25" cy="30" r="4" fill="white"/>
            </svg>
            <h2>Joule Quest</h2>
          </div>
          
          <button class="close-btn" id="quest-close-btn">✕</button>
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
          <button class="tab-btn active" data-category="employee">
            <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20v-1a6 6 0 0112 0v1"/>
              <path d="M17 12l3-3m0 0l-3-3m3 3h-5"/>
            </svg>
            Employee
          </button>
          <button class="tab-btn" data-category="manager">
            <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <circle cx="6" cy="15" r="2.5"/>
              <circle cx="18" cy="15" r="2.5"/>
              <path d="M12 8v4M9 12l-2.5 2M15 12l2.5 2"/>
            </svg>
            Manager
          </button>
          <button class="tab-btn" data-category="agent">
            <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Agent
          </button>
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

          <div class="quest-category" data-category="agent">
            <div class="journey-progress">
              <div class="progress-label">
                <span>⚡ ${agentJourney.name}</span>
                <strong>${agentQuests.filter(q => completedQuests.includes(q.id)).length} / ${agentQuests.length}</strong>
              </div>
              <div class="journey-bar">
                <div class="journey-fill" style="width: ${(agentQuests.filter(q => completedQuests.includes(q.id)).length / agentQuests.length) * 100}%">
                  <span class="journey-sparkle">✨</span>
                </div>
              </div>
            </div>
            <div class="quest-map-selection">
              <div class="map-start">🚩 START</div>
              ${renderQuestNodes(agentQuests, 'agent')}
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

    // Quest node clicks (persistent - doesn't hide quest selection)
    const questNodes = this.container.querySelectorAll('.quest-node');
    questNodes.forEach(node => {
      node.addEventListener('click', () => {
        const questId = node.dataset.questId;
        const isCompleted = node.dataset.completed === 'true';
        const isLocked = node.dataset.locked === 'true';
        
        // Prevent starting locked quests
        if (isLocked) {
          alert('🔒 This quest is locked!\n\nComplete the previous quests first to unlock this one.');
          return;
        }
        
        if (isCompleted) {
          const replay = confirm('🎯 Replay this quest?\n\nYou won\'t earn points again, but you can practice the quest flow.');
          if (replay) {
            if (window.soundEffects) window.soundEffects.playQuestStart();
            // DON'T hide quest selection - keep it visible
            // Trigger quest start with replay flag
            window.postMessage({ type: 'START_QUEST', questId, isReplay: true }, '*');
          }
        } else {
          if (window.soundEffects) window.soundEffects.playQuestStart();
          // DON'T hide quest selection - keep it visible
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
        <svg class="joule-icon" width="64" height="64" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="startGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.95)"/>
              <stop offset="100%" style="stop-color:rgba(255,255,255,0.85)"/>
            </linearGradient>
          </defs>
          <circle cx="25" cy="30" r="20" fill="url(#startGradient)" opacity="0.9"/>
          <g opacity="0.85">
            <path d="M 25 12 A 18 18 0 0 1 39 22 L 32 25 A 10 10 0 0 0 25 18 Z" fill="url(#startGradient)"/>
            <path d="M 39 22 A 18 18 0 0 1 39 38 L 32 35 A 10 10 0 0 0 32 25 Z" fill="url(#startGradient)"/>
            <path d="M 39 38 A 18 18 0 0 1 25 48 L 25 40 A 10 10 0 0 0 32 35 Z" fill="url(#startGradient)"/>
            <path d="M 25 48 A 18 18 0 0 1 11 38 L 18 35 A 10 10 0 0 0 25 40 Z" fill="url(#startGradient)"/>
            <path d="M 11 38 A 18 18 0 0 1 11 22 L 18 25 A 10 10 0 0 0 18 35 Z" fill="url(#startGradient)"/>
            <path d="M 11 22 A 18 18 0 0 1 25 12 L 25 18 A 10 10 0 0 0 18 25 Z" fill="url(#startGradient)"/>
          </g>
          <circle cx="25" cy="30" r="10" fill="rgba(118,75,162,0.7)"/>
          <line x1="25" y1="22" x2="25" y2="38" stroke="white" stroke-width="2.5"/>
          <line x1="17" y1="30" x2="33" y2="30" stroke="white" stroke-width="2.5"/>
          <circle cx="25" cy="30" r="4" fill="white"/>
        </svg>
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
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStep(step, current, total, jouleResponse = null, isAgentQuest = false) {
    this.logger.info('Showing step', { step, current, total, jouleResponse, isAgentQuest });

    const progress = (current / total) * 100;

    const html = `
      <div class="joule-quest-card quest-step">
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="active">
          ${this.getMascotSVG('active', true)}
        </div>
        ` : ''}
        
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
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStepInstructions(step, current, total, isAgentQuest = false) {
    this.logger.info('Showing step instructions', { step, current, total, isAgentQuest });

    const progress = (current / total) * 100;

    const html = `
      <div class="joule-quest-card quest-step instructions">
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="waiting">
          ${this.getMascotSVG('waiting', true)}
        </div>
        ` : ''}
        
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
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStepSuccess(message, isAgentQuest = false) {
    this.logger.info('Showing step success', message, { isAgentQuest });

    const html = `
      <div class="joule-quest-card quest-success">
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="success">
          ${this.getMascotSVG('success', true)}
        </div>
        ` : ''}
        
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
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStepError(step, errorMessage, technicalDetails = null, isAgentQuest = false) {
    this.logger.warn('Showing step error (quest continues)', { step, errorMessage, technicalDetails, isAgentQuest });

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
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="error">
          ${this.getMascotSVG('error', true)}
        </div>
        ` : ''}
        
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
    const questCategory = quest.category || 'employee';
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
    
    // Hide arrow for agent quests
    const isAgentQuest = questCategory === 'agent';

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
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="complete">
          ${this.getMascotSVG('complete', true)}
        </div>
        ` : ''}
        
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

    // DON'T auto-hide - keep quest complete screen visible
    // User will click "Show Quests" button or close manually
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
