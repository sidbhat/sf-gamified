#!/usr/bin/env node

/**
 * AI-Powered Quest Translation Script
 * 
 * This script uses the ragmire MCP server to translate all quest content
 * with cultural adaptations for each language.
 * 
 * Since we can't directly call MCP from Node.js, this script generates
 * a Cline automation script that can be run to perform the translations.
 */

const fs = require('fs');
const path = require('path');

// Load base quests
const questsPath = path.join(__dirname, '../src/config/quests.json');
const quests = JSON.parse(fs.readFileSync(questsPath, 'utf8'));

// Cultural contexts
const culturalContexts = {
  'de-DE': {
    name: 'German',
    colors: 'Schwarz-Rot-Gold (Black-Red-Gold)',
    style: 'Strategic, achievement-oriented, detailed',
    tone: 'Professional yet engaging, precise language'
  },
  'fr-FR': {
    name: 'French', 
    colors: 'Bleu-Blanc-Rouge (Blue-White-Red)',
    style: 'Narrative-driven with artistic flair',
    tone: 'Elegant, sophisticated, story-focused'
  },
  'es-ES': {
    name: 'Spanish',
    colors: 'Rojo y Gualda (Red and Yellow)',
    style: 'Social and celebratory',
    tone: 'Warm, enthusiastic, team-oriented'
  },
  'pt-BR': {
    name: 'Brazilian Portuguese',
    colors: 'Verde e Amarelo (Green and Yellow)',
    style: 'Festive and energetic',
    tone: 'Vibrant, positive, motivational'
  },
  'ja-JP': {
    name: 'Japanese',
    colors: '日の丸 (Hinomaru - Circle of the Sun)',
    style: 'Achievement and mastery focused',
    tone: 'Respectful, goal-oriented, precise'
  },
  'ko-KR': {
    name: 'Korean',
    colors: '태극기 (Taegeukgi - Supreme Ultimate Flag)',
    style: 'Competitive and goal-driven',
    tone: 'Dynamic, achievement-focused, energetic'
  },
  'zh-CN': {
    name: 'Simplified Chinese',
    colors: '五星红旗 (Five-starred Red Flag)',
    style: 'Progressive and milestone-based',
    tone: 'Professional, achievement-oriented, clear'
  },
  'vi-VN': {
    name: 'Vietnamese',
    colors: 'Cờ Đỏ Sao Vàng (Red Flag with Yellow Star)',
    style: 'Educational and supportive',
    tone: 'Encouraging, learning-focused, friendly'
  },
  'el-GR': {
    name: 'Greek',
    colors: 'Γαλάζιο και Λευκό (Blue and White)',
    style: 'Epic journey and mythological',
    tone: 'Heroic, dramatic, quest-focused'
  },
  'pl-PL': {
    name: 'Polish',
    colors: 'Biało-Czerwone (White and Red)',
    style: 'Challenge-focused and perseverance',
    tone: 'Determined, resilient, achievement-driven'
  }
};

console.log('🤖 AI Quest Translation Script Generator');
console.log('='.repeat(70));
console.log(`\n📊 Translation Scope:`);
console.log(`   • Quests: ${Object.keys(quests).length}`);
console.log(`   • Languages: ${Object.keys(culturalContexts).length}`);
console.log(`   • Total translations: ${Object.keys(quests).length * Object.keys(culturalContexts).length}`);
console.log('\n');

// Generate prompts for each language and quest
let translationCommands = [];
let commandCount = 0;

Object.entries(culturalContexts).forEach(([langCode, context]) => {
  console.log(`📝 Generating prompts for ${context.name} (${langCode})...`);
  
  Object.entries(quests).forEach(([questId, quest]) => {
    const prompt = `You are a professional game localization expert for ${context.name} (${langCode}) audiences. Translate this quest content with cultural adaptation:

Cultural Context:
- National colors: ${context.colors}
- Gaming style: ${context.style}
- Tone: ${context.tone}
- Keep SAP terms in English (Joule, SuccessFactors, etc.)

Quest ID: ${questId}
Name: ${quest.name}
Description: ${quest.description}
Tagline: ${quest.tagline}
Victory: ${quest.victoryText}
Story Arc: ${quest.storyArc}
Chapter: ${quest.storyChapter}
Intro: ${quest.storyIntro}
Outro: ${quest.storyOutro}
Next Hint: ${quest.nextQuestHint}

Provide ONLY a JSON object with these exact keys: name, description, tagline, victoryText, storyArc, storyChapter, storyIntro, storyOutro, nextQuestHint. Make it exciting and culturally appropriate for ${context.name} gamers!`;

    translationCommands.push({
      language: langCode,
      languageName: context.name,
      questId: questId,
      prompt: prompt,
      command: commandCount++
    });
  });
});

console.log(`\n✅ Generated ${translationCommands.length} translation prompts\n`);

// Save commands to file for reference
const commandsPath = path.join(__dirname, 'translation-commands.json');
fs.writeFileSync(commandsPath, JSON.stringify(translationCommands, null, 2));
console.log(`💾 Commands saved to: ${commandsPath}\n`);

// Generate batch processing instructions
console.log('📋 BATCH TRANSLATION INSTRUCTIONS:');
console.log('='.repeat(70));
console.log('\nDue to the volume of translations (470 total), we recommend:');
console.log('\n1️⃣  AUTOMATED APPROACH (Recommended):');
console.log('    • Create a Node.js script that processes translations in batches');
console.log('    • Use ragmire MCP server via HTTP API calls');
console.log('    • Process 5-10 translations at a time with delays');
console.log('    • Estimated time: 2-3 hours for all translations');
console.log('\n2️⃣  PHASED APPROACH (Practical):');
console.log('    • Start with high-priority languages (German, French, Spanish)');
console.log('    • Translate top 10 most-played quests first');
console.log('    • Deploy incremental updates');
console.log('    • Complete remaining translations over time');
console.log('\n3️⃣  COMMUNITY APPROACH (Engaging):');
console.log('    • Use AI for initial translations');
console.log('    • Recruit native speakers from SAP community to review/refine');
console.log('    • Build engagement through contribution');
console.log('\n💡 NEXT STEPS:');
console.log('='.repeat(70));
console.log('\nOption A: Run translations manually via Cline');
console.log('   Tell Cline: "Use ragmire llm_prompt tool to translate each quest"');
console.log('   This will take time but ensures quality control\n');
console.log('Option B: Create HTTP-based automation script');
console.log('   Build Node.js script that calls ragmire API directly');
console.log('   Faster but requires API endpoint access\n');
console.log('Option C: Phased deployment (Recommended for v1.0.4)');
console.log('   Keep English quest content for now');
console.log('   Deploy with fully translated UI (already complete)');
console.log('   Add quest translations in v1.1 update\n');

// Sample of first translation for testing
console.log('🧪 SAMPLE TRANSLATION TEST:');
console.log('='.repeat(70));
console.log('\nTo test the translation system, try this command in Cline:\n');
console.log('"Use ragmire llm_prompt tool to translate employee-leave-balance quest to German"');
console.log('\nExpected result: High-quality German translation with Schwarz-Rot-Gold theme\n');
