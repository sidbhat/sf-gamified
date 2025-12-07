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
   * Save user statistics
   * @param {Object} stats - Statistics data
   */
  async saveUserStats(stats) {
    this.logger.info('Saving user stats', stats);

    try {
      const existing = await this.getUserStats();
      const updated = {
        ...existing,
        ...stats,
        lastUpdated: Date.now()
      };

      await chrome.storage.local.set({ user_stats: updated });
      this.logger.success('User stats saved');
    } catch (error) {
      this.logger.error('Failed to save user stats', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getUserStats() {
    this.logger.info('Getting user stats');

    try {
      const result = await chrome.storage.local.get('user_stats');
      
      if (result.user_stats) {
        this.logger.success('User stats retrieved', result.user_stats);
        return result.user_stats;
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
   * Increment quest completion
   * @param {number} points - Points earned
   */
  async incrementQuestCompletion(points) {
    this.logger.info('Incrementing quest completion', { points });

    try {
      const stats = await this.getUserStats();
      
      await this.saveUserStats({
        totalPoints: (stats.totalPoints || 0) + points,
        questsCompleted: (stats.questsCompleted || 0) + 1,
        questsAttempted: (stats.questsAttempted || 0) + 1,
        lastQuestDate: Date.now()
      });

      this.logger.success('Quest completion incremented');
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
   * Reset all progress (points, completed quests)
   * Used by the refresh button
   */
  async resetAllProgress() {
    this.logger.warn('Resetting all progress');

    try {
      // Clear quest progress
      const result = await chrome.storage.local.get(null);
      const keysToRemove = [];

      for (const key in result) {
        if (key.startsWith('quest_progress_')) {
          keysToRemove.push(key);
        }
      }

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }

      // Reset user stats
      await this.saveUserStats({
        totalPoints: 0,
        questsCompleted: 0,
        questsAttempted: 0,
        lastQuestDate: null
      });

      this.logger.success('All progress reset');
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
   * Get all completed quests
   * @returns {Promise<string[]>} Array of completed quest IDs
   */
  async getCompletedQuests() {
    this.logger.info('Getting completed quests');

    try {
      const result = await chrome.storage.local.get(null);
      const completedQuests = [];

      for (const key in result) {
        if (key.startsWith('quest_progress_')) {
          const progress = result[key];
          if (progress.completed) {
            const questId = key.replace('quest_progress_', '');
            completedQuests.push(questId);
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
