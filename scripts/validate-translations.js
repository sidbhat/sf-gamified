#!/usr/bin/env node

/**
 * Translation Validation Script
 * Checks all translation files for missing keys, duplicates, and inconsistencies
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Translation file paths
const i18nDir = path.join(__dirname, '../src/i18n');
const languages = [
  'en-US.json',
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

// Load all translation files
function loadTranslations() {
  const translations = {};
  
  for (const lang of languages) {
    const filePath = path.join(i18nDir, lang);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
      console.log(`${colors.green}✓${colors.reset} Loaded ${lang}`);
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Failed to load ${lang}: ${error.message}`);
      translations[lang] = null;
    }
  }
  
  return translations;
}

// Extract all keys recursively from an object
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

// Get value at nested key path
function getValueAtPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Main validation function
function validateTranslations() {
  console.log(`\n${colors.cyan}=== Translation Validation Report ===${colors.reset}\n`);
  
  const translations = loadTranslations();
  
  // Use English as reference
  const referenceKeys = extractKeys(translations['en-US.json']);
  console.log(`\n${colors.blue}Reference (en-US):${colors.reset} ${referenceKeys.length} keys\n`);
  
  const issues = [];
  const summary = {
    totalLanguages: 0,
    totalMissingKeys: 0,
    totalExtraKeys: 0,
    languagesWithIssues: []
  };
  
  // Check each language against reference
  for (const lang of languages) {
    if (lang === 'en-US.json' || !translations[lang]) continue;
    
    summary.totalLanguages++;
    const langKeys = extractKeys(translations[lang]);
    const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
    const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));
    
    if (missingKeys.length > 0 || extraKeys.length > 0) {
      summary.languagesWithIssues.push(lang);
      
      console.log(`${colors.yellow}⚠ ${lang}${colors.reset}`);
      
      if (missingKeys.length > 0) {
        summary.totalMissingKeys += missingKeys.length;
        console.log(`  ${colors.red}Missing ${missingKeys.length} keys:${colors.reset}`);
        missingKeys.forEach(key => {
          const enValue = getValueAtPath(translations['en-US.json'], key);
          console.log(`    - ${key}: "${enValue}"`);
          issues.push({
            type: 'MISSING_KEY',
            language: lang,
            key: key,
            englishValue: enValue
          });
        });
      }
      
      if (extraKeys.length > 0) {
        summary.totalExtraKeys += extraKeys.length;
        console.log(`  ${colors.yellow}Extra ${extraKeys.length} keys (not in English):${colors.reset}`);
        extraKeys.forEach(key => {
          console.log(`    + ${key}`);
          issues.push({
            type: 'EXTRA_KEY',
            language: lang,
            key: key
          });
        });
      }
      
      console.log('');
    } else {
      console.log(`${colors.green}✓ ${lang}${colors.reset} - All keys match\n`);
    }
  }
  
  // Check for duplicate values in English (like viewJob/viewMyJob)
  console.log(`${colors.blue}Checking for duplicate values in English...${colors.reset}\n`);
  const enValues = {};
  const duplicates = [];
  
  referenceKeys.forEach(key => {
    const value = getValueAtPath(translations['en-US.json'], key);
    if (!enValues[value]) {
      enValues[value] = [];
    }
    enValues[value].push(key);
  });
  
  Object.entries(enValues).forEach(([value, keys]) => {
    if (keys.length > 1) {
      console.log(`${colors.yellow}⚠ Duplicate value:${colors.reset} "${value}"`);
      console.log(`  Used by: ${keys.join(', ')}\n`);
      duplicates.push({
        value: value,
        keys: keys
      });
    }
  });
  
  // Summary
  console.log(`${colors.cyan}=== Summary ===${colors.reset}\n`);
  console.log(`Languages checked: ${summary.totalLanguages}`);
  console.log(`Languages with issues: ${summary.languagesWithIssues.length}`);
  console.log(`Total missing keys: ${summary.totalMissingKeys}`);
  console.log(`Total extra keys: ${summary.totalExtraKeys}`);
  console.log(`Duplicate English values: ${duplicates.length}\n`);
  
  // Generate fix report
  if (issues.length > 0) {
    const reportPath = path.join(__dirname, '../TRANSLATION-VALIDATION-REPORT.md');
    generateReport(issues, duplicates, summary, reportPath);
    console.log(`${colors.green}✓ Detailed report saved to:${colors.reset} TRANSLATION-VALIDATION-REPORT.md\n`);
  }
  
  // Exit code
  if (summary.totalMissingKeys > 0) {
    console.log(`${colors.red}❌ Validation failed: Missing translations found${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ All translations valid!${colors.reset}\n`);
    process.exit(0);
  }
}

// Generate detailed markdown report
function generateReport(issues, duplicates, summary, reportPath) {
  let report = `# Translation Validation Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Languages checked: ${summary.totalLanguages}\n`;
  report += `- Languages with issues: ${summary.languagesWithIssues.length}\n`;
  report += `- Total missing keys: ${summary.totalMissingKeys}\n`;
  report += `- Total extra keys: ${summary.totalExtraKeys}\n`;
  report += `- Duplicate English values: ${duplicates.length}\n\n`;
  
  // Missing keys by language
  report += `## Missing Keys by Language\n\n`;
  
  const missingByLang = {};
  issues.filter(i => i.type === 'MISSING_KEY').forEach(issue => {
    if (!missingByLang[issue.language]) {
      missingByLang[issue.language] = [];
    }
    missingByLang[issue.language].push(issue);
  });
  
  Object.entries(missingByLang).forEach(([lang, missing]) => {
    report += `### ${lang} (${missing.length} missing)\n\n`;
    report += `\`\`\`json\n`;
    missing.forEach(issue => {
      report += `"${issue.key}": "${issue.englishValue}",\n`;
    });
    report += `\`\`\`\n\n`;
  });
  
  // Duplicate values
  if (duplicates.length > 0) {
    report += `## Duplicate Values in English\n\n`;
    report += `These keys have identical English values. Consider consolidating:\n\n`;
    
    duplicates.forEach(dup => {
      report += `- **"${dup.value}"**\n`;
      report += `  - Keys: ${dup.keys.join(', ')}\n\n`;
    });
  }
  
  // Extra keys
  const extraByLang = {};
  issues.filter(i => i.type === 'EXTRA_KEY').forEach(issue => {
    if (!extraByLang[issue.language]) {
      extraByLang[issue.language] = [];
    }
    extraByLang[issue.language].push(issue);
  });
  
  if (Object.keys(extraByLang).length > 0) {
    report += `## Extra Keys (Not in English)\n\n`;
    
    Object.entries(extraByLang).forEach(([lang, extra]) => {
      report += `### ${lang}\n\n`;
      extra.forEach(issue => {
        report += `- ${issue.key}\n`;
      });
      report += `\n`;
    });
  }
  
  fs.writeFileSync(reportPath, report);
}

// Run validation
validateTranslations();
