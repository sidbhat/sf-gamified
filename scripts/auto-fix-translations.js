#!/usr/bin/env node

/**
 * Auto-Fix Translation Script
 * Automatically adds missing keys to all translation files
 * Uses English as fallback for missing translations
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const i18nDir = path.join(__dirname, '../src/i18n');
const languages = [
  'de-DE.json',
  'es-ES.json',
  'fr-FR.json',
  'ja-JP.json',
  'ko-KR.json',
  'pl-PL.json',
  'pt-BR.json',
  'vi-VN.json',
  'zh-CN.json',
  'el-GR.json'
];

// Load JSON file
function loadJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// Save JSON file with formatting
function saveJSON(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content + '\n');
}

// Get value at nested path
function getValueAtPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Set value at nested path
function setValueAtPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

// Extract all keys recursively
function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys.push(...extractKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Remove extra keys not in reference
function removeExtraKeys(obj, path, extraKeys) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!current[key]) return;
    current = current[key];
  }
  
  if (current[lastKey]) {
    delete current[lastKey];
  }
}

// Main fix function
function autoFixTranslations() {
  console.log(`\n${colors.cyan}=== Auto-Fix Translation Script ===${colors.reset}\n`);
  
  // Load English as reference
  const enPath = path.join(i18nDir, 'en-US.json');
  const enData = loadJSON(enPath);
  const enKeys = extractKeys(enData);
  
  console.log(`${colors.blue}Reference (en-US):${colors.reset} ${enKeys.length} keys\n`);
  
  let totalFixed = 0;
  let totalRemoved = 0;
  
  // Fix each language
  for (const lang of languages) {
    const langPath = path.join(i18nDir, lang);
    
    try {
      console.log(`${colors.yellow}Processing ${lang}...${colors.reset}`);
      
      const langData = loadJSON(langPath);
      const langKeys = extractKeys(langData);
      
      // Find missing keys
      const missingKeys = enKeys.filter(key => !langKeys.includes(key));
      
      // Find extra keys
      const extraKeys = langKeys.filter(key => !enKeys.includes(key));
      
      let fixedCount = 0;
      let removedCount = 0;
      
      // Add missing keys with English fallback
      if (missingKeys.length > 0) {
        console.log(`  ${colors.red}Adding ${missingKeys.length} missing keys...${colors.reset}`);
        
        missingKeys.forEach(key => {
          const enValue = getValueAtPath(enData, key);
          setValueAtPath(langData, key, enValue);
          fixedCount++;
        });
      }
      
      // Remove extra keys
      if (extraKeys.length > 0) {
        console.log(`  ${colors.yellow}Removing ${extraKeys.length} extra keys...${colors.reset}`);
        
        extraKeys.forEach(key => {
          removeExtraKeys(langData, key, extraKeys);
          removedCount++;
        });
      }
      
      // Save updated file
      if (fixedCount > 0 || removedCount > 0) {
        saveJSON(langPath, langData);
        console.log(`  ${colors.green}✓ Saved ${lang}:${colors.reset} +${fixedCount} keys, -${removedCount} extra keys\n`);
        totalFixed += fixedCount;
        totalRemoved += removedCount;
      } else {
        console.log(`  ${colors.green}✓ ${lang} - No changes needed${colors.reset}\n`);
      }
      
    } catch (error) {
      console.log(`  ${colors.red}✗ Failed to process ${lang}:${colors.reset} ${error.message}\n`);
    }
  }
  
  // Summary
  console.log(`${colors.cyan}=== Summary ===${colors.reset}\n`);
  console.log(`${colors.green}✓ Added ${totalFixed} missing keys across all languages${colors.reset}`);
  console.log(`${colors.yellow}✓ Removed ${totalRemoved} extra keys${colors.reset}`);
  console.log(`\n${colors.blue}Note:${colors.reset} Keys were added with English fallback values.`);
  console.log(`${colors.blue}Recommendation:${colors.reset} Use professional translation service for proper localization.\n`);
}

// Run auto-fix
autoFixTranslations();
