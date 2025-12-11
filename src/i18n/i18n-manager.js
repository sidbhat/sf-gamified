/**
 * Internationalization Manager
 * Handles language detection, translation loading, and text replacement
 */

class I18nManager {
  constructor() {
    this.currentLanguage = 'en-US';
    this.translations = {};
    this.fallbackLanguage = 'en-US';
    this.supportedLanguages = [
      'en-US',
      'de-DE',
      'fr-FR',
      'es-ES',
      'pt-BR',
      'ja-JP',
      'ko-KR',
      'zh-CN',
      'vi-VN',
      'el-GR',
      'pl-PL'
    ];
    this.languageNames = {
      'en-US': 'English (US)',
      'de-DE': 'Deutsch (Deutschland)',
      'fr-FR': 'Français (France)',
      'es-ES': 'Español (España)',
      'pt-BR': 'Português (Brasil)',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'zh-CN': '简体中文',
      'vi-VN': 'Tiếng Việt',
      'el-GR': 'Ελληνικά',
      'pl-PL': 'Polski'
    };
  }

  /**
   * Initialize i18n system
   */
  async init() {
    try {
      // Detect language
      const detectedLanguage = await this.detectLanguage();
      console.log('[I18n] Detected language:', detectedLanguage);
      
      // Load translations
      await this.loadTranslations(detectedLanguage);
      
      console.log('[I18n] Initialized with language:', this.currentLanguage);
    } catch (error) {
      console.error('[I18n] Initialization error:', error);
      // Fall back to English on error
      await this.loadTranslations('en-US');
    }
  }

  /**
   * Detect user's language with priority:
   * 1. Saved preference in Chrome storage
   * 2. SAP UI5 URL parameter (sap-language)
   * 3. SAP UI5 localStorage/sessionStorage
   * 4. SAP UI5 framework objects
   * 5. Browser language
   */
  async detectLanguage() {
    // 1. Check saved preference
    const saved = await this.getSavedLanguage();
    if (saved) {
      console.log('[I18n] Using saved language:', saved);
      return saved;
    }

    // 2. Check SAP UI5 URL parameter
    const urlLang = this.detectSAPLanguageFromURL();
    if (urlLang) {
      console.log('[I18n] Detected from URL:', urlLang);
      await this.saveLanguage(urlLang);
      return urlLang;
    }

    // 3. Check SAP UI5 localStorage/sessionStorage
    const storageLang = this.detectSAPLanguageFromStorage();
    if (storageLang) {
      console.log('[I18n] Detected from storage:', storageLang);
      await this.saveLanguage(storageLang);
      return storageLang;
    }

    // 4. Check SAP UI5 framework objects
    const frameworkLang = this.detectSAPLanguageFromFramework();
    if (frameworkLang) {
      console.log('[I18n] Detected from framework:', frameworkLang);
      await this.saveLanguage(frameworkLang);
      return frameworkLang;
    }

    // 5. Fall back to browser language
    const browserLang = this.detectBrowserLanguage();
    console.log('[I18n] Using browser language:', browserLang);
    await this.saveLanguage(browserLang);
    return browserLang;
  }

  /**
   * Detect SAP language from URL parameter
   */
  detectSAPLanguageFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const sapLang = params.get('sap-language') || params.get('sap-ui-language');
      if (sapLang) {
        return this.normalizeSAPLanguageCode(sapLang);
      }
    } catch (error) {
      console.warn('[I18n] Error detecting language from URL:', error);
    }
    return null;
  }

  /**
   * Detect SAP language from browser storage
   */
  detectSAPLanguageFromStorage() {
    try {
      // Check localStorage
      const localLang = localStorage.getItem('sap-language') || 
                       localStorage.getItem('sap-ui-language') ||
                       localStorage.getItem('sapUiLanguage');
      if (localLang) {
        return this.normalizeSAPLanguageCode(localLang);
      }

      // Check sessionStorage
      const sessionLang = sessionStorage.getItem('sap-language') || 
                         sessionStorage.getItem('sap-ui-language') ||
                         sessionStorage.getItem('sapUiLanguage');
      if (sessionLang) {
        return this.normalizeSAPLanguageCode(sessionLang);
      }
    } catch (error) {
      console.warn('[I18n] Error detecting language from storage:', error);
    }
    return null;
  }

  /**
   * Detect SAP language from UI5 framework objects
   */
  detectSAPLanguageFromFramework() {
    try {
      // Check for SAP UI5 Core
      if (window.sap && window.sap.ui && window.sap.ui.getCore) {
        const core = window.sap.ui.getCore();
        if (core && core.getConfiguration) {
          const config = core.getConfiguration();
          if (config && config.getLanguage) {
            const lang = config.getLanguage();
            if (lang) {
              return this.normalizeSAPLanguageCode(lang);
            }
          }
        }
      }
    } catch (error) {
      console.warn('[I18n] Error detecting language from framework:', error);
    }
    return null;
  }

  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || 'en-US';
    return this.normalizeLanguageCode(browserLang);
  }

  /**
   * Normalize SAP language code (e.g., 'DE' -> 'de-DE')
   */
  normalizeSAPLanguageCode(code) {
    const upperCode = code.toUpperCase();
    const mapping = {
      'EN': 'en-US',
      'DE': 'de-DE',
      'FR': 'fr-FR',
      'ES': 'es-ES',
      'PT': 'pt-BR',
      'JA': 'ja-JP',
      'KO': 'ko-KR',
      'ZH': 'zh-CN',
      'VI': 'vi-VN',
      'EL': 'el-GR',
      'PL': 'pl-PL'
    };
    
    // If already in correct format (e.g., 'de-DE'), normalize case
    if (code.includes('-')) {
      return this.normalizeLanguageCode(code);
    }
    
    return mapping[upperCode] || 'en-US';
  }

  /**
   * Normalize language code to supported format
   */
  normalizeLanguageCode(code) {
    // Convert to lowercase and split
    const parts = code.toLowerCase().split('-');
    
    // Map common language codes to our supported languages
    const langMap = {
      'en': 'en-US',
      'de': 'de-DE',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'pt': 'pt-BR',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'vi': 'vi-VN',
      'el': 'el-GR',
      'pl': 'pl-PL'
    };

    const baseLang = parts[0];
    
    // Check if we have an exact match for language-country
    const fullCode = parts.length > 1 ? `${baseLang}-${parts[1].toUpperCase()}` : null;
    if (fullCode && this.supportedLanguages.includes(fullCode)) {
      return fullCode;
    }
    
    // Fall back to base language mapping
    return langMap[baseLang] || 'en-US';
  }

  /**
   * Get saved language from Chrome storage
   */
  async getSavedLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['language'], (result) => {
        resolve(result.language || null);
      });
    });
  }

  /**
   * Save language to Chrome storage
   */
  async saveLanguage(language) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ language }, () => {
        resolve();
      });
    });
  }

  /**
   * Load translations for specified language
   */
  async loadTranslations(language) {
    try {
      // Normalize language code
      const normalizedLang = this.normalizeLanguageCode(language);
      
      // Check if language is supported
      if (!this.supportedLanguages.includes(normalizedLang)) {
        console.warn(`[I18n] Language ${normalizedLang} not supported, falling back to ${this.fallbackLanguage}`);
        this.currentLanguage = this.fallbackLanguage;
      } else {
        this.currentLanguage = normalizedLang;
      }

      // Load translation file
      const response = await fetch(chrome.runtime.getURL(`i18n/${this.currentLanguage}.json`));
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${this.currentLanguage}`);
      }
      
      this.translations = await response.json();
      console.log('[I18n] Translations loaded for:', this.currentLanguage);
    } catch (error) {
      console.error('[I18n] Error loading translations:', error);
      
      // Fall back to English
      if (this.currentLanguage !== this.fallbackLanguage) {
        console.log('[I18n] Loading fallback language:', this.fallbackLanguage);
        this.currentLanguage = this.fallbackLanguage;
        const response = await fetch(chrome.runtime.getURL(`i18n/${this.fallbackLanguage}.json`));
        this.translations = await response.json();
      }
    }
  }

  /**
   * Get translated text by key
   * Supports nested keys using dot notation (e.g., 'ui.buttons.start')
   */
  t(key, replacements = {}) {
    try {
      // Navigate through nested object using dot notation
      const keys = key.split('.');
      let value = this.translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Key not found, return key itself for debugging
          console.warn(`[I18n] Translation key not found: ${key}`);
          return key;
        }
      }

      // If value is not a string, return key
      if (typeof value !== 'string') {
        console.warn(`[I18n] Translation value is not a string: ${key}`);
        return key;
      }

      // Replace placeholders
      let result = value;
      for (const [placeholder, replacement] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), replacement);
      }

      return result;
    } catch (error) {
      console.error('[I18n] Error getting translation:', error);
      return key;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get current language name
   */
  getCurrentLanguageName() {
    return this.languageNames[this.currentLanguage] || this.currentLanguage;
  }

  /**
   * Change language
   */
  async changeLanguage(language) {
    await this.loadTranslations(language);
    await this.saveLanguage(this.currentLanguage);
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map(code => ({
      code,
      name: this.languageNames[code]
    }));
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.JouleQuestI18n = new I18nManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}
