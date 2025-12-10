/**
 * StorageManager - Handles Chrome storage operations
 * Manages quest progress, user data, and settings
 */
class StorageManager {
  constructor() {
    this.logger = window.JouleQuestLogger;
  }

  /**
   * Save quest progress
   * @param {string} questId - Quest ID
   * @param {Object} progress - Progress data
   */
  async saveQuestProgress(questId, progress) {
    this.logger.info('Saving quest progress', { questId, progress });

    try {
      const key = `quest_progress_${questId}`;
      const data = {
        ...progress,
        timestamp: Date.now()
      };

      await chrome.storage.local.set({ [key]: data });
      this.logger.success('Quest progress saved');
    } catch (error) {
      this.logger.error('Failed to save quest progress', error);
      throw error;
    }
  }

  /**
   * Get quest progress
   * @param {string} questId - Quest ID
   * @returns {Promise<Object|null>} Progress data or null
   */
  async getQuestProgress(questId) {
    this.logger.info('Getting quest progress', { questId });

    try {
      const key = `quest_progress_${questId}`;
      const result = await chrome.storage.local.get(key);
      
      if (result[key]) {
        this.logger.success('Quest progress retrieved', result[key]);
        return result[key];
      }

      this.logger.info('No progress found for quest');
      return null;
    } catch (error) {
      this.logger.error('Failed to get quest progress', error);
      throw error;
    }
  }

  /**
   * Save user statistics for a specific solution
   * @param {string} solutionId - Solution ID (e.g., 'successfactors', 's4hana')
   * @param {Object} stats - Statistics data
   */
  async saveUserStats(stats, solutionId = 'successfactors') {
    this.logger.info('Saving user stats', { stats, solutionId });

    try {
      const existing = await this.getUserStats(solutionId);
      const updated = {
        ...existing,
        ...stats,
        lastUpdated: Date.now()
      };

      const key = `user_stats_${solutionId}`;
      await chrome.storage.local.set({ [key]: updated });
      this.logger.success('User stats saved', { solutionId });
    } catch (error) {
      this.logger.error('Failed to save user stats', error);
      throw error;
    }
  }

  /**
   * Get user statistics for a specific solution
   * @param {string} solutionId - Solution ID (e.g., 'successfactors', 's4hana')
   * @returns {Promise<Object>} Statistics data
   */
  async getUserStats(solutionId = 'successfactors') {
    this.logger.info('Getting user stats', { solutionId });

    try {
      const key = `user_stats_${solutionId}`;
      const result = await chrome.storage.local.get(key);
      
      if (result[key]) {
        this.logger.success('User stats retrieved', result[key]);
        return result[key];
      }

      // Return default stats if none exist
      const defaultStats = {
        totalPoints: 0,
        questsCompleted: 0,
        questsAttempted: 0,
        lastQuestDate: null
      };

      this.logger.info('No stats found, returning defaults');
      return defaultStats;
    } catch (error) {
      this.logger.error('Failed to get user stats', error);
      throw error;
    }
  }

  /**
   * Increment quest completion for a specific solution
   * @param {number} points - Points earned
   * @param {string} solutionId - Solution ID
   */
  async incrementQuestCompletion(points, solutionId = 'successfactors') {
    this.logger.info('Incrementing quest completion', { points, solutionId });

    try {
      const stats = await this.getUserStats(solutionId);
      
      await this.saveUserStats({
        totalPoints: (stats.totalPoints || 0) + points,
        questsCompleted: (stats.questsCompleted || 0) + 1,
        questsAttempted: (stats.questsAttempted || 0) + 1,
        lastQuestDate: Date.now()
      }, solutionId);

      this.logger.success('Quest completion incremented', { solutionId });
    } catch (error) {
      this.logger.error('Failed to increment quest completion', error);
      throw error;
    }
  }

  /**
   * Save extension settings
   * @param {Object} settings - Settings object
   */
  async saveSettings(settings) {
    this.logger.info('Saving settings', settings);

    try {
      await chrome.storage.local.set({ settings: settings });
      this.logger.success('Settings saved');
    } catch (error) {
      this.logger.error('Failed to save settings', error);
      throw error;
    }
  }

  /**
   * Get extension settings
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    this.logger.info('Getting settings');

    try {
      const result = await chrome.storage.local.get('settings');
      
      if (result.settings) {
        this.logger.success('Settings retrieved', result.settings);
        return result.settings;
      }

      // Return default settings
      const defaultSettings = {
        mode: 'demo', // 'demo' or 'real'
        soundEnabled: true,
        autoStart: false
      };

      this.logger.info('No settings found, returning defaults');
      return defaultSettings;
    } catch (error) {
      this.logger.error('Failed to get settings', error);
      throw error;
    }
  }

  /**
   * Reset all progress for a specific solution (points, completed quests)
   * Used by the refresh button
   * @param {string} solutionId - Solution ID to reset
   */
  async resetAllProgress(solutionId = 'successfactors') {
    this.logger.warn('Resetting all progress', { solutionId });

    try {
      // Clear quest progress for this solution
      const result = await chrome.storage.local.get(null);
      const keysToRemove = [];

      for (const key in result) {
        if (key.startsWith('quest_progress_')) {
          const questId = key.replace('quest_progress_', '');
          // Only remove quests that belong to this solution
          // Quest IDs have solution prefix (e.g., 's4hana-', 'employee-', 'manager-')
          if (solutionId === 's4hana' && questId.startsWith('s4hana-')) {
            keysToRemove.push(key);
          } else if (solutionId === 'successfactors' && !questId.startsWith('s4hana-')) {
            keysToRemove.push(key);
          }
        }
      }

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }

      // Reset user stats for this solution
      await this.saveUserStats({
        totalPoints: 0,
        questsCompleted: 0,
        questsAttempted: 0,
        lastQuestDate: null
      }, solutionId);

      this.logger.success('All progress reset', { solutionId });
    } catch (error) {
      this.logger.error('Failed to reset progress', error);
      throw error;
    }
  }

  /**
   * Clear all progress (alias for resetAllProgress)
   */
  async clearAllProgress() {
    return this.resetAllProgress();
  }

  /**
   * Clear all data
   */
  async clearAll() {
    this.logger.warn('Clearing all storage data');

    try {
      await chrome.storage.local.clear();
      this.logger.success('All data cleared');
    } catch (error) {
      this.logger.error('Failed to clear data', error);
      throw error;
    }
  }

  /**
   * Get all completed quests (optionally filtered by solution)
   * @param {string} solutionId - Optional solution ID to filter by
   * @returns {Promise<string[]>} Array of completed quest IDs
   */
  async getCompletedQuests(solutionId = null) {
    this.logger.info('Getting completed quests', { solutionId });

    try {
      const result = await chrome.storage.local.get(null);
      const completedQuests = [];

      for (const key in result) {
        if (key.startsWith('quest_progress_')) {
          const progress = result[key];
          if (progress.completed) {
            const questId = key.replace('quest_progress_', '');
            
            // Filter by solution if specified
            if (solutionId) {
              if (solutionId === 's4hana' && questId.startsWith('s4hana-')) {
                completedQuests.push(questId);
              } else if (solutionId === 'successfactors' && !questId.startsWith('s4hana-')) {
                completedQuests.push(questId);
              }
            } else {
              completedQuests.push(questId);
            }
          }
        }
      }

      this.logger.success('Completed quests retrieved', completedQuests);
      return completedQuests;
    } catch (error) {
      this.logger.error('Failed to get completed quests', error);
      throw error;
    }
  }
}

// Create global storage manager instance
window.JouleQuestStorage = new StorageManager();
