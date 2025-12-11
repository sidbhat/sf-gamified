/**
 * Overlay - Joule Quest UI overlay for quest progress
 * Shows quest steps, success messages, confetti, and animated mascot
 */
class QuestOverlay {
  constructor() {
    this.logger = window.JouleQuestLogger;
    this.container = null;
    this.isVisible = false;
    this.currentSolution = null;
  }

  /**
   * Get i18n instance (lazy getter to ensure it's initialized)
   */
  get i18n() {
    const i18n = window.JouleQuestI18n;
    // CRITICAL FIX: Don't check if translations are loaded - just return i18n
    // The t() method will handle missing translations by returning the key
    return i18n;
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
    // CRITICAL: Prevent re-initialization if already initialized
    if (this.container && document.body.contains(this.container)) {
      this.logger.warn('Overlay already initialized, skipping init()');
      return;
    }
    
    this.logger.info('Initializing overlay');
    this.createContainer();
  }

  /**
   * Create overlay container
   */
  createContainer() {
    // NUCLEAR OPTION: Remove ALL existing overlays before doing anything
    this.logger.info('createContainer called - checking for existing overlays');
    
    const allExisting = document.querySelectorAll('[id="joule-quest-overlay"], .joule-quest-overlay, [class*="joule-quest"]');
    if (allExisting.length > 0) {
      this.logger.warn(`FOUND ${allExisting.length} existing overlay-related elements, removing ALL`);
      allExisting.forEach((el, index) => {
        this.logger.info(`Removing element ${index}: ${el.id || el.className}`);
        el.remove();
      });
    }

    // NOW create single new container
    this.container = document.createElement('div');
    this.container.id = 'joule-quest-overlay';
    this.container.className = 'joule-quest-overlay hidden';
    
    document.body.appendChild(this.container);
    this.logger.success('Overlay container created - should be ONLY ONE now');
    
    // Verify only one exists
    const verify = document.querySelectorAll('#joule-quest-overlay');
    this.logger.info(`Verification: ${verify.length} overlay(s) in DOM`);
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
   * Get procurement icon SVG
   * @returns {string} Procurement icon SVG HTML
   */
  getProcurementIconSVG() {
    return `
      <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <line x1="16" y1="13" x2="23" y2="13"></line>
      </svg>
    `;
  }

  /**
   * Get delivery icon SVG
   * @returns {string} Delivery icon SVG HTML
   */
  getDeliveryIconSVG() {
    return `
      <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 3h15v10H1zM16 8a4 4 0 014 4h4M1 18h2.5a2 2 0 002 2 2 2 0 002-2H1zm13 0h2.5a2 2 0 002 2 2 2 0 002-2H14z"/>
        <line x1="16" y1="8" x2="23" y2="8"></line>
        <line x1="20" y1="8" x2="20" y2="13"></line>
      </svg>
    `;
  }

  /**
   * Apply solution theme to overlay
   * @param {Object} solution - Solution configuration with theme
   */
  applySolutionTheme(solution) {
    this.logger.info('Applying solution theme', { solution: solution.name });
    this.currentSolution = solution;
    
    // Apply CSS custom properties for dynamic theming
    if (this.container) {
      this.container.style.setProperty('--solution-primary', solution.theme.primary);
      this.container.style.setProperty('--solution-secondary', solution.theme.secondary);
      this.container.style.setProperty('--solution-accent', solution.theme.accent);
      this.container.style.setProperty('--solution-gradient', solution.theme.gradient);
    }
    
    this.logger.success('Solution theme applied', { theme: solution.theme });
  }

  /**
   * Show custom confirmation dialog (replaces ugly browser confirm())
   * @param {Object} options - Dialog options
   * @returns {Promise<boolean>} True if user confirms, false if cancels
   */
  showConfirmDialog({ title, message, confirmText = null, cancelText = null, icon = '❓' }) {
    return new Promise((resolve) => {
      // CRITICAL: Save current overlay content before showing dialog
      const savedContent = this.container.innerHTML;
      const wasVisible = this.isVisible;
      
      const html = `
        <div class="joule-quest-card quest-confirm-dialog">
          <div class="confirm-icon">${icon}</div>
          <h3>${title}</h3>
          <p style="white-space: pre-line; margin: 16px 0 24px 0;">${message}</p>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="confirm-btn" id="confirm-yes-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
              ${confirmText || this.i18n.t('ui.buttons.confirm')}
            </button>
            <button class="cancel-btn" id="confirm-no-btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
              ${cancelText || this.i18n.t('ui.buttons.cancel')}
            </button>
          </div>
        </div>
      `;

      this.container.innerHTML = html;
      this.show();

      const yesBtn = this.container.querySelector('#confirm-yes-btn');
      const noBtn = this.container.querySelector('#confirm-no-btn');

      const restoreContent = () => {
        // Restore previous overlay content
        this.container.innerHTML = savedContent;
        if (wasVisible) {
          this.show();
          // Re-attach event listeners for quest selection if it was showing
          if (savedContent.includes('quest-selection')) {
            this.setupQuestSelectionListeners();
          }
        }
      };

      const escHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escHandler);
          restoreContent();
          resolve(false);
        }
      };

      yesBtn.addEventListener('click', () => {
        document.removeEventListener('keydown', escHandler);
        // Hide overlay immediately so quest can start
        this.hide();
        resolve(true);
      });

      noBtn.addEventListener('click', () => {
        document.removeEventListener('keydown', escHandler);
        restoreContent();
        resolve(false);
      });

      document.addEventListener('keydown', escHandler);
    });
  }

  /**
   * Show custom alert dialog (replaces ugly browser alert())
   * @param {Object} options - Dialog options
   * @returns {Promise<void>} Resolves when user dismisses
   */
  showAlertDialog({ title, message, buttonText = null, icon = 'ℹ️' }) {
    return new Promise((resolve) => {
      // CRITICAL: Save current overlay content before showing dialog
      const savedContent = this.container.innerHTML;
      const wasVisible = this.isVisible;
      
      const html = `
        <div class="joule-quest-card quest-alert-dialog">
          <div class="alert-icon">${icon}</div>
          <h3>${title}</h3>
          <p style="white-space: pre-line; margin: 16px 0 24px 0;">${message}</p>
          
          <button class="ok-btn" id="alert-ok-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 48px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
            ${buttonText || this.i18n.t('ui.buttons.ok')}
          </button>
        </div>
      `;

      this.container.innerHTML = html;
      this.show();

      const okBtn = this.container.querySelector('#alert-ok-btn');

      const restoreContent = () => {
        // Restore previous overlay content
        this.container.innerHTML = savedContent;
        if (wasVisible) {
          this.show();
          // Re-attach event listeners for quest selection if it was showing
          if (savedContent.includes('quest-selection')) {
            this.setupQuestSelectionListeners();
          }
        } else {
          this.hide();
        }
      };

      const cleanup = () => {
        document.removeEventListener('keydown', escHandler);
        restoreContent();
        resolve();
      };

      const escHandler = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          cleanup();
        }
      };

      okBtn.addEventListener('click', () => {
        cleanup();
      });

      document.addEventListener('keydown', escHandler);
    });
  }

  /**
   * Show quest selection screen
   * @param {Array} quests - Array of all quests
   * @param {Array} completedQuests - Array of completed quest IDs
   * @param {Object} stats - User statistics
   * @param {Object} journeys - Journey metadata (names and descriptions)
   * @param {Object} solution - Current SAP solution configuration
   */
  showQuestSelection(quests, completedQuests, stats, journeys = {}, solution = null) {
    this.logger.info('[DEBUG] overlay.showQuestSelection() called', { quests, completedQuests, stats, journeys, solution });
    
    // DEBUGGING: Check container state
    this.logger.info('[DEBUG] Container state:', {
      containerExists: !!this.container,
      containerInDOM: this.container && document.body.contains(this.container),
      isVisible: this.isVisible
    });
    
    // DEBUGGING: Check for existing overlays in DOM
    const existingOverlays = document.querySelectorAll('#joule-quest-overlay, .joule-quest-overlay');
    this.logger.info(`[DEBUG] Existing overlays in DOM at START of showQuestSelection: ${existingOverlays.length}`, {
      overlayIds: Array.from(existingOverlays).map(el => ({ id: el.id, class: el.className }))
    });

    // Get unique categories from available quests
    const categories = [...new Set(quests.map(q => q.category))];
    
    // Group quests by category
    const questsByCategory = {};
    categories.forEach(cat => {
      questsByCategory[cat] = quests.filter(q => q.category === cat);
    });
    
    this.logger.info('Quest categories', { categories, questsByCategory });
    
    // Define tab configurations per solution
    const getTabConfig = () => {
      if (solution.id === 's4hana') {
        return [
          { 
            id: 's4hana-sales', 
            label: this.i18n.t('ui.tabs.sales'), 
            icon: this.i18n.t('ui.icons.sales'),
            journey: { 
              name: this.i18n.t('journeys.s4hana-sales.name'), 
              description: this.i18n.t('journeys.s4hana-sales.description') 
            }
          },
          { 
            id: 's4hana-procurement', 
            label: this.i18n.t('ui.tabs.procurement'), 
            icon: this.getProcurementIconSVG(),
            journey: { 
              name: this.i18n.t('journeys.s4hana-procurement.name'), 
              description: this.i18n.t('journeys.s4hana-procurement.description') 
            }
          },
          { 
            id: 's4hana-delivery', 
            label: this.i18n.t('ui.tabs.delivery'), 
            icon: this.getDeliveryIconSVG(),
            journey: { 
              name: this.i18n.t('journeys.s4hana-delivery.name'), 
              description: this.i18n.t('journeys.s4hana-delivery.description') 
            }
          }
        ];
      } else {
        // SuccessFactors
        return [
          { 
            id: 'employee', 
            label: this.i18n.t('ui.tabs.employee'), 
            icon: this.getEmployeeIconSVG(),
            journey: { 
              name: this.i18n.t('journeys.employee.name'), 
              description: this.i18n.t('journeys.employee.description') 
            }
          },
          { 
            id: 'manager', 
            label: this.i18n.t('ui.tabs.manager'), 
            icon: this.getManagerIconSVG(),
            journey: { 
              name: this.i18n.t('journeys.manager.name'), 
              description: this.i18n.t('journeys.manager.description') 
            }
          },
          { 
            id: 'agent', 
            label: this.i18n.t('ui.tabs.agent'), 
            icon: this.getAgentIconSVG(),
            journey: { 
              name: this.i18n.t('journeys.agent.name'), 
              description: this.i18n.t('journeys.agent.description') 
            }
          }
        ];
      }
    };

    const tabConfig = getTabConfig();

    const renderQuestNodes = (questList, category) => {
      return questList.map((quest, index) => {
        // completedQuests is now an object mapping quest IDs to completion data
        const completionData = completedQuests[quest.id];
        const isCompleted = !!completionData;
        
        // Check if quest is locked (requires other quests to be completed first)
        const isLocked = quest.requiresQuests && 
          !quest.requiresQuests.every(reqId => completedQuests[reqId]);
        
        // Determine status class based on completion state
        let statusClass = '';
        if (isCompleted) {
          const state = completionData.completionState || 'success';
          if (state === 'success') {
            statusClass = 'completed';
          } else if (state === 'partial') {
            statusClass = 'completed quest-partial';
          } else if (state === 'failed') {
            statusClass = 'completed quest-failed';
          }
        } else if (isLocked) {
          statusClass = 'locked';
        }
        
        const nextCompletionData = index < questList.length - 1 ? completedQuests[questList[index + 1].id] : null;
        const nextIsCompleted = !!nextCompletionData;
        
        // For locked quests, show which prerequisites are needed
        let lockMessage = '';
        if (isLocked && quest.requiresQuests) {
          const remaining = quest.requiresQuests.filter(reqId => !completedQuests[reqId]);
          const count = remaining.length;
          const plural = count > 1 ? 's' : '';
          lockMessage = `<div class="quest-lock-info">${this.i18n.t('ui.messages.questLockedInfo', { count, s: plural })}</div>`;
        }
        
        return `
          <div class="quest-node ${statusClass}" data-quest-id="${quest.id}" data-completed="${isCompleted}" data-locked="${isLocked}">
            <div class="quest-number">${isLocked ? '🔒' : index + 1}</div>
            <div class="quest-icon" style="opacity: ${isLocked ? '0.4' : '1'}">${quest.icon}</div>
            <div class="quest-info">
              <div class="quest-name" style="opacity: ${isLocked ? '0.6' : '1'}">${this.i18n.t(`${quest.i18nKey}.name`)}</div>
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

    // Render tabs dynamically based on solution
    const renderTabs = () => {
      return tabConfig.map((tab, index) => `
        <button class="tab-btn ${index === 0 ? 'active' : ''}" data-category="${tab.id}">
          ${tab.icon} ${tab.label}
        </button>
      `).join('');
    };

    // Render category content dynamically
    const renderCategories = () => {
      return tabConfig.map((tab, index) => {
        const categoryQuests = questsByCategory[tab.id] || [];
        const completedCount = categoryQuests.filter(q => completedQuests[q.id]).length;
        const totalCount = categoryQuests.length;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return `
          <div class="quest-category ${index === 0 ? 'active' : ''}" data-category="${tab.id}">
            <div class="journey-progress">
              <div class="progress-label">
                <span>🗺️ ${tab.journey.name}</span>
                <strong>${completedCount} / ${totalCount}</strong>
              </div>
              <div class="journey-bar">
                <div class="journey-fill" style="width: ${progress}%">
                  <span class="journey-sparkle">✨</span>
                </div>
              </div>
            </div>
            <div class="quest-map-selection">
              <div class="map-start">🚩 START</div>
              ${renderQuestNodes(categoryQuests, tab.id)}
              <div class="path-line"></div>
              <div class="map-end">🏆 GOAL!</div>
            </div>
          </div>
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
                  <stop offset="0%" style="stop-color:${solution ? solution.theme.primary : '#667eea'}"/>
                  <stop offset="100%" style="stop-color:${solution ? solution.theme.secondary : '#764ba2'}"/>
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
              <circle cx="25" cy="30" r="10" fill="${solution ? solution.theme.secondary : '#764ba2'}"/>
              <line x1="25" y1="22" x2="25" y2="38" stroke="white" stroke-width="2.5"/>
              <line x1="17" y1="30" x2="33" y2="30" stroke="white" stroke-width="2.5"/>
              <circle cx="25" cy="30" r="4" fill="white"/>
            </svg>
            <div class="header-title">
              <h2>${this.i18n.t('ui.headers.questSelection')}</h2>
              ${solution ? `<div class="solution-badge" style="background: ${solution.theme.primary}">${solution.badge}</div>` : ''}
            </div>
          </div>
          
          <button class="close-btn" id="quest-close-btn">✕</button>
        </div>

        <div class="selection-stats">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">${stats.totalPoints || 0}</div>
              <div class="stat-label">${this.i18n.t('ui.labels.points')}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <div class="stat-value">${stats.questsCompleted || 0}</div>
              <div class="stat-label">${this.i18n.t('ui.labels.quests')}</div>
            </div>
          </div>
        </div>

        <div class="selection-tabs">
          ${renderTabs()}
        </div>

        <div class="selection-content">
          ${renderCategories()}
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
        const confirmed = await this.showConfirmDialog({
          title: this.i18n.t('ui.headers.resetProgress'),
          message: this.i18n.t('ui.messages.resetConfirm'),
          confirmText: this.i18n.t('ui.buttons.reset'),
          cancelText: this.i18n.t('ui.buttons.cancel'),
          icon: '⚠️'
        });
        
        if (confirmed) {
          // Clear storage for current solution
          if (window.JouleQuestStorage && this.currentSolution) {
            await window.JouleQuestStorage.resetAllProgress(this.currentSolution.id);
            this.logger.info('All progress reset for solution', { solution: this.currentSolution.id });
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
          this.showAlertDialog({
            title: this.i18n.t('ui.headers.questLocked'),
            message: this.i18n.t('ui.messages.questLockedInfo', { count: 1, s: '' }),
            buttonText: this.i18n.t('ui.buttons.ok'),
            icon: '🔒'
          });
          return;
        }
        
        if (isCompleted) {
          // Replay immediately - no delays, no sounds, just execute
          this.hide();
          window.postMessage({ type: 'START_QUEST', questId, isReplay: true }, '*');
        } else {
          // New quest - immediate execution
          this.hide();
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

    // Extract quest properties with defaults
    const questName = quest.name || 'Unknown Quest';
    const questPoints = quest.points || 0;
    const questDifficulty = quest.difficulty || 'Easy';

    // Add page-level border indicator immediately when quest starts
    document.body.classList.add('quest-running');

    // Build story context section if available
    const storyContextHTML = quest.storyChapter || quest.storyIntro ? `
      <div class="story-context">
        ${quest.storyChapter ? `<div class="story-chapter">📖 ${quest.storyChapter}</div>` : ''}
        ${quest.storyIntro ? `<p class="story-intro">${quest.storyIntro}</p>` : ''}
      </div>
    ` : '';

    const html = `
      <div class="joule-quest-card quest-start">
        <div class="complete-icon">🎯</div>
        
        <h2>${this.i18n.t('ui.headers.readyToStart')}</h2>
        <h3>${questName}</h3>
        
        ${storyContextHTML}
        
        <div class="quest-info">
          <span class="difficulty">${questDifficulty}</span>
          <span class="points">${questPoints} ${this.i18n.t('ui.labels.points').toLowerCase()}</span>
        </div>
        
        <p class="congrats">Read the story above, then click Start Quest when you're ready!</p>
        
        <!-- Start Quest button -->
        <div class="quest-start-actions">
          <button class="action-btn primary-btn" id="start-quest-btn">
            <span>▶️ ${this.i18n.t('ui.buttons.start')}</span>
          </button>
          <button class="action-btn secondary-btn" id="cancel-quest-btn">
            <span>✕ ${this.i18n.t('ui.buttons.cancel')}</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Setup button listeners
    const startBtn = this.container.querySelector('#start-quest-btn');
    const cancelBtn = this.container.querySelector('#cancel-quest-btn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.logger.info('User clicked Start Quest button');
        // Signal quest runner to continue
        window.postMessage({ type: 'QUEST_START_CONFIRMED', questId: quest.id }, '*');
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.logger.info('User cancelled quest');
        window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*');
      });
    }
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
          <span class="step-number">${this.i18n.t('ui.labels.step', { current, total })}</span>
          <span class="step-icon">🎮</span>
        </div>
        <h3>${step.name}</h3>
        <p>${step.description}</p>
        ${step.hint ? `<p class="hint">💡 ${this.i18n.t('ui.labels.hint')}: ${step.hint}</p>` : ''}
        ${jouleResponse ? `
          <div class="joule-response">
            <strong>🤖 Joule's Response:</strong>
            <div class="joule-response-text">${jouleResponse}</div>
          </div>
        ` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="waiting">⚡ Executing step...</p>
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
          <span class="step-number">${this.i18n.t('ui.labels.step', { current, total })}</span>
          <span class="step-icon">👆</span>
        </div>
        <h3>${this.i18n.t('ui.headers.yourTurn')}</h3>
        <h4>${step.name}</h4>
        <p class="instruction">${step.description}</p>
        ${step.hint ? `<p class="hint">💡 ${this.i18n.t('ui.labels.hint')}: ${step.hint}</p>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="waiting">${this.i18n.t('ui.labels.waitingForYou')}</p>
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
        <h3>${this.i18n.t('ui.headers.success')}</h3>
        <p>${message}</p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Auto-hide after 2 seconds
    setTimeout(() => this.hide(), 2000);
  }

  /**
   * Show step error message - quest STOPS here (no longer continues)
   * COMPACT UX: Simplified error display with key information only
   * @param {string} questName - Name of the quest that failed
   * @param {Object} step - Step configuration
   * @param {string} errorType - Error type code from UserFriendlyErrors
   * @param {Object} friendlyError - Error object from UserFriendlyErrors.getError()
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStepError(questName, step, errorType, friendlyError, isAgentQuest = false) {
    this.logger.error('Showing step error - QUEST STOPPED', { questName, step, errorType, friendlyError, isAgentQuest });

    // Remove page-level border indicator when quest stops due to error
    document.body.classList.remove('quest-running');

    // CRITICAL FIX: friendlyError object contains ALREADY TRANSLATED strings
    // Do NOT call this.i18n.t() on them - use them directly
    const errorIcon = friendlyError.icon || '❌';
    const errorTitle = friendlyError.title || 'Error';
    const errorMessage = friendlyError.message || 'An error occurred';
    const userAction = friendlyError.userAction || 'Please try again';

    // SIMPLIFIED: Only show 1-2 key action items, not full causes/solutions lists
    const actionHTML = `
      <div class="error-action">
        <strong>💡 What to do:</strong>
        <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">${userAction}</p>
      </div>
    `;

    const html = `
      <div class="joule-quest-card quest-error-compact">
        <div class="error-icon">${errorIcon}</div>
        <h3>${errorTitle}</h3>
        <p class="error-message">${errorMessage}</p>
        
        <div class="error-box">
          ${actionHTML}
        </div>
        
        <button class="action-btn secondary-btn" id="back-to-quests-btn" style="margin-top: 16px;">
          <span>🗺️ Back to Quests</span>
        </button>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Setup back button
    const backBtn = this.container.querySelector('#back-to-quests-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.hide();
        window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*');
      });
    }

    // Auto-redirect to quest selection after 5 seconds (increased from 3s to give time to read)
    setTimeout(() => {
      this.hide();
      window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*');
    }, 5000);
  }

  /**
   * Show step skipped message (optional step that was skipped)
   * @param {Object} step - Step configuration
   * @param {string} reason - Reason for skipping
   * @param {boolean} isAgentQuest - Whether this is an agent quest (hides arrow)
   */
  showStepSkipped(step, reason, isAgentQuest = false) {
    this.logger.info('Showing step skipped', { step, reason, isAgentQuest });

    const html = `
      <div class="joule-quest-card quest-warning">
        <!-- Mascot (hidden for agent quests) -->
        ${!isAgentQuest ? `
        <div class="quest-mascot" data-state="waiting">
          ${this.getMascotSVG('waiting', true)}
        </div>
        ` : ''}
        
        <div class="warning-icon">⏭️</div>
        <h3>${this.i18n.t('ui.headers.stepSkipped')}</h3>
        <h4>${step.name}</h4>
        <p style="font-size: 14px; opacity: 0.9; margin: 12px 0;">
          ${reason}
        </p>
        <p style="opacity: 0.7; font-size: 13px; margin-top: 12px;">
          ${this.i18n.t('ui.messages.questWillContinue')}
        </p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Auto-hide after 3 seconds
    setTimeout(() => this.hide(), 3000);
  }

  /**
   * Show quest complete screen with step results summary
   * @param {Object} quest - Quest configuration
   * @param {Array} stepResults - Array of step result objects
   * @param {Array} failedSteps - Array of failed step indices
   * @param {Array} allQuests - All quests to determine next quest
   * @param {Array} completedQuests - List of completed quest IDs to check journey completion
   */
  showQuestComplete(quest, stepResults = [], failedSteps = [], allQuests = [], completedQuests = []) {
    this.logger.info('Showing quest complete', { quest, stepResults, failedSteps, allQuests, completedQuests });

    // Defensive: ensure quest object has required properties
    if (!quest) {
      this.logger.error('Quest object is null or undefined in showQuestComplete');
      return;
    }

    const questName = quest.name || 'Unknown Quest';
    const questPoints = quest.points || 0;
    const questCategory = quest.category || 'employee';
    const questDifficulty = quest.difficulty || 'Easy';
    const questId = quest.id || 'unknown';
    const totalSteps = stepResults.length;
    const successfulSteps = stepResults.filter(r => r.status === 'success').length;
    const failedStepsCount = failedSteps.length;

    // PARTIAL SUCCESS SYSTEM: Calculate points based on completion percentage
    const successPercentage = totalSteps > 0 ? (successfulSteps / totalSteps) : 0;
    let pointsAwarded = 0;
    let completionState = 'failed'; // 'success', 'partial', 'failed'
    
    if (successPercentage === 1.0) {
      // 100% success - full points
      pointsAwarded = questPoints;
      completionState = 'success';
    } else if (successPercentage >= 0.5) {
      // 50%+ success - 50% points (yellow state)
      pointsAwarded = Math.floor(questPoints * 0.5);
      completionState = 'partial';
    } else {
      // <50% success - 0 points (red state)
      pointsAwarded = 0;
      completionState = 'failed';
    }
    
    this.logger.info('Partial success calculation:', {
      totalSteps,
      successfulSteps,
      successPercentage,
      pointsAwarded,
      completionState
    });

    // Find next quest in same category
    const categoryQuests = allQuests.filter(q => q.category === questCategory);
    const currentIndex = categoryQuests.findIndex(q => q.id === questId);
    
    this.logger.info('Next quest calculation:', {
      questId,
      questCategory,
      totalCategoryQuests: categoryQuests.length,
      currentIndex,
      categoryQuestIds: categoryQuests.map(q => q.id),
      hasNextQuest: currentIndex >= 0 && currentIndex < categoryQuests.length - 1
    });
    
    const nextQuest = currentIndex >= 0 && currentIndex < categoryQuests.length - 1 
      ? categoryQuests[currentIndex + 1] 
      : null;
    
    this.logger.info('Next quest result:', { nextQuest: nextQuest ? nextQuest.name : 'none' });

    // Check if ALL quests across ALL categories are complete (entire story complete)
    // After this quest completes, add it to the completed list for checking
    const allQuestIds = allQuests.map(q => q.id);
    const completedAfterThisQuest = [...new Set([...completedQuests, questId])];
    const isEntireStoryComplete = completedAfterThisQuest.length === allQuestIds.length;
    
    this.logger.info('Story completion check:', {
      totalQuests: allQuestIds.length,
      completedBefore: completedQuests.length,
      completedAfter: completedAfterThisQuest.length,
      isComplete: isEntireStoryComplete
    });

    // Remove page-level border indicator when quest completes
    document.body.classList.remove('quest-running');

    // Determine completion status based on completionState
    let completionIcon, completionTitle, completionColor;
    
    if (completionState === 'success') {
      completionIcon = '🏆';
      completionTitle = this.i18n.t('ui.headers.questComplete');
      completionColor = 'quest-complete';
    } else if (completionState === 'partial') {
      completionIcon = '⚠️';
      completionTitle = this.i18n.t('ui.headers.questCompleteWithErrors');
      completionColor = 'quest-partial';
    } else {
      completionIcon = '❌';
      completionTitle = 'Quest Failed';
      completionColor = 'quest-failed';
    }
    
    // Hide arrow for agent quests
    const isAgentQuest = questCategory === 'agent';

    // Build story continuation section if available (replaces step summary for consistency)
    const storyContinuationHTML = quest.storyOutro || quest.nextQuestHint ? `
      <div class="story-continuation">
        ${quest.storyOutro ? `<p class="story-outro">${quest.storyOutro}</p>` : ''}
        ${quest.nextQuestHint ? `<div class="next-hint">🔜 Next: ${quest.nextQuestHint}</div>` : ''}
      </div>
    ` : '';

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
        
        ${storyContinuationHTML}
        
        <div class="quest-info">
          <span class="difficulty">${questDifficulty}</span>
          <span class="points">${questPoints} ${this.i18n.t('ui.labels.points').toLowerCase()}</span>
        </div>
        
        <div class="rewards">
          <div class="reward-item">
            <span class="reward-icon">⭐</span>
            <span class="reward-value">+${pointsAwarded} ${this.i18n.t('ui.labels.points').toLowerCase()}</span>
          </div>
          ${completionState !== 'success' ? `
          <div class="completion-status" style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 13px;">
            <strong>${this.i18n.t('ui.labels.progress')}:</strong> ${successfulSteps}/${totalSteps} steps completed (${Math.round(successPercentage * 100)}%)
          </div>
          ` : ''}
        </div>
        <p class="congrats">${completionState === 'success' ? this.i18n.t('ui.labels.congrats') : this.i18n.t('ui.labels.congratsPartial')}</p>
        
        <!-- Action buttons: Side-by-side layout matching intro screen -->
        <div class="quest-complete-actions">
          ${nextQuest ? `
            <button class="action-btn primary-btn" id="next-quest-btn" data-quest-id="${nextQuest.id}">
              <span>▶️ ${this.i18n.t('ui.buttons.next')}</span>
            </button>
          ` : ''}
          <button class="action-btn secondary-btn" id="show-quests-btn">
            <span>🗺️ ${this.i18n.t('ui.buttons.allQuests')}</span>
          </button>
          ${isEntireStoryComplete ? `
            <button class="action-btn success-btn" id="download-badge-btn">
              <span>🏆 ${this.i18n.t('ui.buttons.downloadBadge')}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Trigger confetti only for full success (wrapped in try-catch for safety)
    if (completionState === 'success' && window.JouleQuestConfetti) {
      try {
        window.JouleQuestConfetti.celebrate();
      } catch (error) {
        console.warn('[JouleQuest] Confetti error (non-critical):', error);
      }
    }

    // Setup "Next Quest" button event listener (if exists)
    const nextQuestBtn = this.container.querySelector('#next-quest-btn');
    if (nextQuestBtn) {
      nextQuestBtn.addEventListener('click', () => {
        const nextQuestId = nextQuestBtn.dataset.questId;
        this.logger.info('Next Quest button clicked', { nextQuestId });
        
        // Hide current overlay
        this.hide();
        
        // Start next quest
        window.postMessage({ type: 'START_QUEST', questId: nextQuestId, isReplay: false }, '*');
      });
    }
    
    // Setup "Show All Quests" button event listener
    const showQuestsBtn = this.container.querySelector('#show-quests-btn');
    if (showQuestsBtn) {
      showQuestsBtn.addEventListener('click', () => {
        this.logger.info('Show All Quests button clicked');
        window.postMessage({ type: 'SHOW_QUEST_SELECTION' }, '*');
      });
    }

    // Setup "Download Badge" button event listener (only if journey complete)
    const downloadBadgeBtn = this.container.querySelector('#download-badge-btn');
    if (downloadBadgeBtn) {
      downloadBadgeBtn.addEventListener('click', async () => {
        try {
          this.logger.info('Download Badge button clicked');
          
          // Get current user stats
          const storage = window.JouleQuestStorage;
          const stats = storage ? await storage.getUserStats(this.currentSolution?.id) : {};
          
          // Prepare quest data for badge generation
          const questData = {
            id: questId,
            name: questName,
            points: questPoints,
            difficulty: questDifficulty,
            category: questCategory,
            solution: this.currentSolution?.id
          };
          
          // Prepare user stats for badge
          const userStats = {
            totalPoints: stats.totalPoints || 0,
            questsCompleted: stats.questsCompleted || 0,
            streak: stats.streak || 0
          };
          
          // Generate badge using ShareCardGenerator
          if (window.ShareCardGenerator) {
            const generator = new window.ShareCardGenerator();
            const canvas = generator.generateCard(quest, userStats);
            
            // Download the badge
            await generator.downloadCard(canvas, quest.id);
            
            // Show success feedback
            downloadBadgeBtn.innerHTML = '<span>✅ Downloaded!</span>';
            downloadBadgeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
              downloadBadgeBtn.innerHTML = '<span>📥 Download Badge</span>';
              downloadBadgeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }, 2000);
            
            this.logger.success('Badge downloaded successfully');
          } else {
            throw new Error('ShareCardGenerator not available');
          }
        } catch (error) {
          this.logger.error('Failed to download badge', error);
          
          // Show error feedback
          downloadBadgeBtn.innerHTML = '<span>❌ Failed</span>';
          downloadBadgeBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
          
          setTimeout(() => {
            downloadBadgeBtn.innerHTML = '<span>📥 Download Badge</span>';
            downloadBadgeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          }, 2000);
        }
      });
    }
    // Users can manually return to quest selection via button
    // No auto-timeout - let them read the story at their own pace
  }

  /**
   * Setup share button event listener
   * @param {Object} questData - Quest data for sharing
   */
  setupShareButtons(questData) {
    const shareLinkedInBtn = this.container.querySelector('#share-linkedin-btn');

    if (shareLinkedInBtn) {
      shareLinkedInBtn.addEventListener('click', async () => {
        try {
          // Generate simplified shareable text
          const shareText = `🏆 Just completed "${questData.name}" in Joule Quest!

💎 ${questData.points} points earned
${this.getDifficultyEmoji(questData.difficulty)} ${questData.difficulty} difficulty

Master SAP SuccessFactors Joule with zero-risk, gamified training.

#JouleQuest #SAPSkills #SuccessFactors`;

          // Create LinkedIn share URL with encoded text
          const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://chrome.google.com/webstore')}&summary=${encodeURIComponent(shareText)}`;

          // Open LinkedIn in new tab
          window.open(linkedInUrl, '_blank');

          // Show success feedback
          shareLinkedInBtn.textContent = '✅ Shared!';
          shareLinkedInBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          
          setTimeout(() => {
            shareLinkedInBtn.textContent = '📤 Share on LinkedIn';
            shareLinkedInBtn.style.background = '';
          }, 2000);
        } catch (error) {
          console.error('LinkedIn share error:', error);
          
          // Use custom alert dialog instead of browser alert
          await this.showAlertDialog({
            title: 'Share Failed',
            message: 'Failed to open LinkedIn. Please try again.',
            buttonText: 'OK',
            icon: '❌'
          });
        }
      });
    }
  }

  /**
   * Get difficulty emoji
   */
  getDifficultyEmoji(difficulty) {
    return {
      'Easy': '⭐',
      'Medium': '⚡',
      'Hard': '🔥'
    }[difficulty] || '⭐';
  }

  /**
   * Show error message with recovery options
   * @param {string} message - Error message
   */
  showError(message) {
    this.logger.error('Showing error overlay', message);

    // Remove page-level border indicator on error
    document.body.classList.remove('quest-running');

    const html = `
      <div class="joule-quest-card quest-error">
        <button class="close-btn" id="error-close-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 24px; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
        
        <div class="error-icon">❌</div>
        <h3>${this.i18n.t('ui.headers.oops')}</h3>
        <p style="margin: 16px 0 24px 0;">${message}</p>
        
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="retry-button" id="retry-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
            🔄 ${this.i18n.t('ui.buttons.retry')}
          </button>
          <button class="cancel-button" id="cancel-btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
            ✕ ${this.i18n.t('ui.buttons.close')}
          </button>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
          💡 Try closing this and clicking the extension icon again
        </p>
      </div>
    `;

    this.container.innerHTML = html;
    this.show();

    // Add event listeners for buttons
    const closeBtn = this.container.querySelector('#error-close-btn');
    const cancelBtn = this.container.querySelector('#cancel-btn');
    const retryBtn = this.container.querySelector('#retry-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

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
