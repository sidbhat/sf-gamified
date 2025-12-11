#!/usr/bin/env node

/**
 * Script to add "backToQuests" translation to all language files
 */

const fs = require('fs');
const path = require('path');

const translations = {
  'de-DE': 'Zurück zu Quests',
  'fr-FR': 'Retour aux quêtes',
  'es-ES': 'Volver a las misiones',
  'ja-JP': 'クエストに戻る',
  'zh-CN': '返回任务',
  'ko-KR': '퀘스트로 돌아가기',
  'pt-BR': 'Voltar às missões',
  'pl-PL': 'Powrót do zadań',
  'vi-VN': 'Quay lại nhiệm vụ',
  'el-GR': 'Επιστροφή στις αποστολές'
};

const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

let updatedCount = 0;
let errorCount = 0;

Object.entries(translations).forEach(([locale, translation]) => {
  const filePath = path.join(i18nDir, `${locale}.json`);
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Check if backToQuests already exists
    if (data.ui && data.ui.buttons && data.ui.buttons.backToQuests) {
      console.log(`✓ ${locale}: backToQuests already exists`);
      return;
    }
    
    // Add backToQuests to ui.buttons
    if (!data.ui) data.ui = {};
    if (!data.ui.buttons) data.ui.buttons = {};
    data.ui.buttons.backToQuests = translation;
    
    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    
    console.log(`✓ ${locale}: Added "backToQuests": "${translation}"`);
    updatedCount++;
    
  } catch (error) {
    console.error(`✗ ${locale}: Error - ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updatedCount} files`);
console.log(`   Errors: ${errorCount} files`);

if (errorCount === 0) {
  console.log(`\n✅ All language files updated successfully!`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some files had errors. Please check the output above.`);
  process.exit(1);
}
