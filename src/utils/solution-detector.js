/**
 * Solution Detector - Enterprise-grade SAP solution detection
 * Identifies which SAP solution is active (S/4HANA, SuccessFactors, etc.)
 * 
 * Architecture:
 * - Priority-based URL pattern matching
 * - Extensible for future SAP solutions (Ariba, Concur, Fieldglass)
 * - Graceful fallback to default solution
 */

window.JouleSolutionDetector = (function() {
  'use strict';

  const logger = window.JouleQuestLogger;

  class SolutionDetector {
    constructor(solutionsConfig) {
      this.solutions = solutionsConfig.solutions;
      this.fallback = solutionsConfig.fallback;
      this.currentSolution = null;
      
      logger.info('Solution Detector initialized', {
        solutionsCount: this.solutions.length,
        fallback: this.fallback
      });
    }

    /**
     * Detect active SAP solution from current URL
     * Priority-based matching: Higher priority patterns checked first
     * 
     * @returns {Object} Detected solution configuration
     */
    detect() {
      const url = window.location.href.toLowerCase();
      logger.info('🔍 [SOLUTION DETECTION] Starting detection', { 
        originalUrl: window.location.href,
        lowercaseUrl: url 
      });

      // Sort solutions by priority (higher first)
      const sortedSolutions = [...this.solutions].sort(
        (a, b) => b.detection.priority - a.detection.priority
      );

      logger.info('🔍 [SOLUTION DETECTION] Sorted solutions by priority', {
        solutions: sortedSolutions.map(s => ({
          id: s.id,
          name: s.name,
          priority: s.detection.priority,
          patterns: s.detection.urlPatterns
        }))
      });

      // Check each solution's URL patterns
      for (const solution of sortedSolutions) {
        logger.info(`🔍 [SOLUTION DETECTION] Checking solution: ${solution.name}`, {
          solutionId: solution.id,
          priority: solution.detection.priority,
          patterns: solution.detection.urlPatterns
        });

        for (const pattern of solution.detection.urlPatterns) {
          const lowercasePattern = pattern.toLowerCase();
          const matches = url.includes(lowercasePattern);
          
          logger.info(`🔍 [SOLUTION DETECTION] Pattern check`, {
            pattern: pattern,
            lowercasePattern: lowercasePattern,
            url: url,
            matches: matches,
            method: `url.includes("${lowercasePattern}")`
          });

          if (matches) {
            logger.success(`✅ [SOLUTION DETECTION] Solution detected: ${solution.name}`, {
              solutionId: solution.id,
              matchedPattern: pattern,
              priority: solution.detection.priority,
              url: url
            });
            
            this.currentSolution = solution;
            return solution;
          }
        }
      }

      // No match found - use fallback
      const fallbackSolution = this.solutions.find(s => s.id === this.fallback);
      logger.warn('⚠️ [SOLUTION DETECTION] No solution pattern matched - using fallback', {
        fallback: this.fallback,
        solution: fallbackSolution ? fallbackSolution.name : 'NOT FOUND',
        url: url,
        allPatternsChecked: sortedSolutions.flatMap(s => s.detection.urlPatterns)
      });

      this.currentSolution = fallbackSolution;
      return fallbackSolution;
    }

    /**
     * Get solution by ID
     * 
     * @param {string} id - Solution ID
     * @returns {Object|null} Solution configuration or null
     */
    getSolutionById(id) {
      const solution = this.solutions.find(s => s.id === id);
      if (!solution) {
        logger.warn(`Solution not found: ${id}`);
      }
      return solution || null;
    }

    /**
     * Get all available solutions
     * 
     * @returns {Array} Array of solution configurations
     */
    getAllSolutions() {
      return this.solutions;
    }

    /**
     * Get currently detected solution
     * 
     * @returns {Object|null} Current solution or null if not yet detected
     */
    getCurrentSolution() {
      return this.currentSolution;
    }

    /**
     * Check if current URL matches a specific solution
     * 
     * @param {string} solutionId - Solution ID to check
     * @returns {boolean} True if current solution matches
     */
    isSolution(solutionId) {
      if (!this.currentSolution) {
        this.detect();
      }
      return this.currentSolution && this.currentSolution.id === solutionId;
    }

    /**
     * Get solution theme colors
     * 
     * @param {Object} solution - Solution configuration
     * @returns {Object} Theme color object
     */
    getTheme(solution) {
      return solution ? solution.theme : null;
    }

    /**
     * Get solution badge text
     * 
     * @param {Object} solution - Solution configuration
     * @returns {string} Badge text
     */
    getBadge(solution) {
      return solution ? solution.badge : 'Unknown';
    }

    /**
     * Get Joule configuration for solution
     * 
     * @param {Object} solution - Solution configuration
     * @returns {Object} Joule configuration
     */
    getJouleConfig(solution) {
      return solution ? solution.jouleConfig : null;
    }

    /**
     * Reset detector state
     */
    reset() {
      this.currentSolution = null;
      logger.info('Solution detector reset');
    }
  }

  // Return constructor
  return SolutionDetector;
})();
