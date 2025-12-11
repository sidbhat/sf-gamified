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
      // Detect language (with retry logic for SAP framework)
      const detectedLanguage = await this.detectLanguageWithRetry();
      console.log('[I18n] Detected language:', detectedLanguage);
      console.log('[I18n] Detection details:', {
        url: window.location.href,
        urlParams: window.location.search,
        localStorage_sapLanguage: localStorage.getItem('sap-language'),
        localStorage_sapUiLanguage: localStorage.getItem('sap-ui-language'),
        sessionStorage_sapLanguage: sessionStorage.getItem('sap-language')
      });
      
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
   * Detect language with retry logic for SAP framework initialization
   * SAP UI5 Core may not be fully initialized on first attempt
   */
  async detectLanguageWithRetry() {
    // First attempt - immediate detection
    let language = await this.detectLanguage();
    
    // If we got a non-browser language, return it (SAP language was detected)
    const browserLang = this.detectBrowserLanguage();
    if (language !== browserLang) {
      console.log('[I18n] SAP language detected immediately:', language);
      return language;
    }
    
    // If we only got browser language, SAP might not be initialized yet
    // Try again after a short delay to allow SAP Core to initialize
    console.log('[I18n] Only browser language detected, waiting for SAP initialization...');
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    
    // Second attempt
    language = await this.detectLanguage();
    if (language !== browserLang) {
      console.log('[I18n] SAP language detected on retry:', language);
      return language;
    }
    
    // Third attempt after longer delay
    console.log('[I18n] Still no SAP language, waiting longer...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s more
    
    language = await this.detectLanguage();
    if (language !== browserLang) {
      console.log('[I18n] SAP language detected on second retry:', language);
      return language;
    }
    
    // Final fallback to browser language
    console.log('[I18n] No SAP language found after retries, using browser language:', browserLang);
    return browserLang;
  }

  /**
   * Detect user's language with priority:
   * 1. SAP UI5 URL parameter (sap-language) - HIGHEST PRIORITY
   * 2. SAP UI5 localStorage/sessionStorage
   * 3. SAP UI5 framework objects
   * 4. Browser language (NO caching - always detect from SAP)
   */
  async detectLanguage() {
    // 1. Check SAP UI5 URL parameter FIRST (highest priority)
    const urlLang = this.detectSAPLanguageFromURL();
    if (urlLang) {
      console.log('[I18n] Detected from URL:', urlLang);
      return urlLang;
    }

    // 2. Check SAP UI5 localStorage/sessionStorage
    const storageLang = this.detectSAPLanguageFromStorage();
    if (storageLang) {
      console.log('[I18n] Detected from SAP storage:', storageLang);
      return storageLang;
    }

    // 3. Check SAP UI5 framework objects
    const frameworkLang = this.detectSAPLanguageFromFramework();
    if (frameworkLang) {
      console.log('[I18n] Detected from SAP framework:', frameworkLang);
      return frameworkLang;
    }

    // 4. Fall back to browser language (don't cache, always re-detect)
    const browserLang = this.detectBrowserLanguage();
    console.log('[I18n] Using browser language:', browserLang);
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
   * Uses multiple strategies to find language in different SAP contexts
   */
  detectSAPLanguageFromFramework() {
    try {
      // Strategy 1: Check document.documentElement.lang (SAP SuccessFactors sets this)
      if (document.documentElement.lang) {
        const lang = document.documentElement.lang;
        console.log('[I18n] Found language from document.documentElement.lang:', lang);
        return this.normalizeSAPLanguageCode(lang);
      }
      
      // Strategy 2: SAP UI5 Core Configuration (most common)
      if (window.sap && window.sap.ui) {
        // Try getCore() method
        if (typeof window.sap.ui.getCore === 'function') {
          try {
            const core = window.sap.ui.getCore();
            if (core && core.getConfiguration) {
              const config = core.getConfiguration();
              if (config && typeof config.getLanguage === 'function') {
                const lang = config.getLanguage();
                if (lang) {
                  console.log('[I18n] Found language from UI5 Core:', lang);
                  return this.normalizeSAPLanguageCode(lang);
                }
              }
              
              // Try direct property access if method doesn't work
              if (config && config.language) {
                console.log('[I18n] Found language from config.language property:', config.language);
                return this.normalizeSAPLanguageCode(config.language);
              }
            }
          } catch (e) {
            // Silently continue to next strategy
          }
        }
        
        // Strategy 3: Direct access to Core configuration object
        try {
          if (window.sap.ui.getCore && window.sap.ui.getCore() && window.sap.ui.getCore().oConfiguration) {
            const config = window.sap.ui.getCore().oConfiguration;
            if (config.language) {
              console.log('[I18n] Found language from Core oConfiguration:', config.language);
              return this.normalizeSAPLanguageCode(config.language);
            }
          }
        } catch (e) {
          // Silently continue to next strategy
        }
      }
      
      // Strategy 4: SAP global configuration object
      if (window['sap-ui-config']) {
        const config = window['sap-ui-config'];
        if (config.language) {
          console.log('[I18n] Found language from sap-ui-config:', config.language);
          return this.normalizeSAPLanguageCode(config.language);
        }
      }
      
      // Strategy 5: Check data-sap-ui-language attribute on script tags
      const sapScripts = document.querySelectorAll('script[data-sap-ui-language]');
      if (sapScripts.length > 0) {
        const lang = sapScripts[0].getAttribute('data-sap-ui-language');
        if (lang) {
          console.log('[I18n] Found language from script data attribute:', lang);
          return this.normalizeSAPLanguageCode(lang);
        }
      }
      
      // Strategy 6: Check sap-ui-bootstrap script src parameter
      const bootstrapScripts = document.querySelectorAll('script[src*="sap-ui-core"]');
      for (const script of bootstrapScripts) {
        const src = script.getAttribute('src');
        if (src && src.includes('sap-language=')) {
          const match = src.match(/sap-language=([^&]+)/);
          if (match && match[1]) {
            console.log('[I18n] Found language from bootstrap script src:', match[1]);
            return this.normalizeSAPLanguageCode(match[1]);
          }
        }
      }
      
      // Strategy 7: Check meta tags
      const metaLang = document.querySelector('meta[name="sap-ui-language"]');
      if (metaLang) {
        const lang = metaLang.getAttribute('content');
        if (lang) {
          console.log('[I18n] Found language from meta tag:', lang);
          return this.normalizeSAPLanguageCode(lang);
        }
      }
      
      return null;
    } catch (error) {
      console.warn('[I18n] Error detecting language from framework:', error);
      return null;
    }
  }

  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || 'en-US';
    return this.normalizeLanguageCode(browserLang);
  }

  /**
   * Normalize SAP language code (e.g., 'DE' -> 'de-DE', 'de_DE' -> 'de-DE')
   */
  normalizeSAPLanguageCode(code) {
    // Replace underscores with hyphens (SAP uses both formats)
    const normalizedCode = code.replace('_', '-');
    
    const upperCode = normalizedCode.toUpperCase();
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
    if (normalizedCode.includes('-')) {
      return this.normalizeLanguageCode(normalizedCode);
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
      const response = await fetch(chrome.runtime.getURL(`src/i18n/${this.currentLanguage}.json`));
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${this.currentLanguage}`);
      }
      
      this.translations = await response.json();
      console.log('[I18n] Translations loaded for:', this.currentLanguage);
      console.log('[I18n] Translation keys count:', Object.keys(this.translations).length);
      console.log('[I18n] Sample translation test - ui.headers.questSelection:', this.t('ui.headers.questSelection'));
    } catch (error) {
      console.error('[I18n] Error loading translations:', error);
      
      // Fall back to English
      if (this.currentLanguage !== this.fallbackLanguage) {
        console.log('[I18n] Loading fallback language:', this.fallbackLanguage);
        this.currentLanguage = this.fallbackLanguage;
        const response = await fetch(chrome.runtime.getURL(`src/i18n/${this.fallbackLanguage}.json`));
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
