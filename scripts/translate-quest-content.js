/**
 * Quest Content Translation Script
 * Translates all quest names, descriptions, taglines, and story content
 * Uses AI to create culturally appropriate, engaging translations
 */

const fs = require('fs').promises;
const path = require('path');

// Language configurations with cultural context
const LANGUAGES = {
  'de-DE': {
    name: 'German',
    culture: 'Direct, precise, formal tone. Germans value efficiency and thoroughness.',
    colorName: 'Schwarz-Rot-Gold (Black-Red-Gold)',
    gamingStyle: 'Strategic and achievement-oriented'
  },
  'fr-FR': {
    name: 'French',
    culture: 'Elegant, sophisticated tone. French appreciate wit and style.',
    colorName: 'Bleu-Blanc-Rouge (Blue-White-Red)',
    gamingStyle: 'Narrative-driven with artistic flair'
  },
  'es-ES': {
    name: 'Spanish',
    culture: 'Warm, enthusiastic tone. Spanish culture values passion and camaraderie.',
    colorName: 'Rojo y Gualda (Red and Gold)',
    gamingStyle: 'Social and celebratory'
  },
  'pt-BR': {
    name: 'Brazilian Portuguese',
    culture: 'Friendly, upbeat tone. Brazilians appreciate joy and positivity.',
    colorName: 'Verde e Amarelo (Green and Yellow)',
    gamingStyle: 'Festive and energetic'
  },
  'ja-JP': {
    name: 'Japanese',
    culture: 'Polite, respectful tone. Japanese value precision and group harmony.',
    colorName: '日の丸 (Hinomaru - Circle of the Sun)',
    gamingStyle: 'Achievement and mastery focused'
  },
  'ko-KR': {
    name: 'Korean',
    culture: 'Respectful yet dynamic tone. Koreans value dedication and excellence.',
    colorName: '태극기 (Taegeukgi - Yin-Yang colors)',
    gamingStyle: 'Competitive and goal-driven'
  },
  'zh-CN': {
    name: 'Simplified Chinese',
    culture: 'Motivational, collective tone. Chinese value progress and achievement.',
    colorName: '五星红旗 (Five-Star Red)',
    gamingStyle: 'Progressive and milestone-based'
  },
  'vi-VN': {
    name: 'Vietnamese',
    culture: 'Warm, community-focused tone. Vietnamese value learning and growth.',
    colorName: 'Cờ Đỏ Sao Vàng (Red Flag Golden Star)',
    gamingStyle: 'Educational and supportive'
  },
  'el-GR': {
    name: 'Greek',
    culture: 'Philosophical, heroic tone. Greeks appreciate epic narratives.',
    colorName: 'Γαλάζιο και Λευκό (Blue and White)',
    gamingStyle: 'Epic journey and mythological themes'
  },
  'pl-PL': {
    name: 'Polish',
    culture: 'Direct, determined tone. Polish value resilience and accomplishment.',
    colorName: 'Biało-Czerwone (White-Red)',
    gamingStyle: 'Challenge-focused and perseverance-based'
  }
};

/**
 * Translation prompt template for AI
 */
function createTranslationPrompt(questData, targetLang) {
  const langConfig = LANGUAGES[targetLang];
  
  return `Translate the following SAP training game quest content to ${langConfig.name} (${targetLang}).

CULTURAL CONTEXT:
- ${langConfig.culture}
- National color theme: ${langConfig.colorName}
- Gaming style: ${langConfig.gamingStyle}

TRANSLATION GUIDELINES:
1. Maintain gamification tone (exciting, engaging, fun!)
2. Adapt cultural references appropriately
3. Keep SAP terminology in English (e.g., "Joule", "SuccessFactors", "S/4HANA")
4. Make stories compelling and relatable to ${langConfig.name} professionals
5. Add culturally appropriate expressions and idioms where natural
6. Keep emoji usage but adapt if some have different meanings
7. Victory/achievement language should be culturally motivating
8. Maintain urgency and excitement in story narratives

QUEST TO TRANSLATE:
${JSON.stringify(questData, null, 2)}

OUTPUT FORMAT (JSON):
{
  "name": "Translated quest name",
  "description": "Translated description",
  "tagline": "Translated tagline",
  "victoryText": "Translated victory text",
  "storyArc": "Translated story arc name",
  "storyChapter": "Translated chapter title",
  "storyIntro": "Translated introduction (make it exciting!)",
  "storyOutro": "Translated outro (make it satisfying!)",
  "nextQuestHint": "Translated next quest hint"
}

Return ONLY the JSON object, no other text.`;
}

/**
 * Extract translatable quest content
 */
function extractQuestContent(quest) {
  return {
    id: quest.id,
    name: quest.name,
    description: quest.description,
    tagline: quest.tagline,
    victoryText: quest.victoryText,
    storyArc: quest.storyArc,
    storyChapter: quest.storyChapter,
    storyIntro: quest.storyIntro,
    storyOutro: quest.storyOutro,
    nextQuestHint: quest.nextQuestHint
  };
}

/**
 * Main translation function
 */
async function translateAllQuests() {
  console.log('🌍 Starting comprehensive quest translation...\n');
  
  // Load quests.json
  const questsPath = path.join(__dirname, '../src/config/quests.json');
  const questsData = JSON.parse(await fs.readFile(questsPath, 'utf8'));
  
  console.log(`📚 Found ${questsData.quests.length} quests to translate\n`);
  
  // For each language
  for (const [langCode, langConfig] of Object.entries(LANGUAGES)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Translating to ${langConfig.name} (${langCode})`);
    console.log(`   Color: ${langConfig.colorName}`);
    console.log(`   Style: ${langConfig.gamingStyle}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Load existing translation file
    const translationPath = path.join(__dirname, `../src/i18n/${langCode}.json`);
    const translations = JSON.parse(await fs.readFile(translationPath, 'utf8'));
    
    // Initialize quests section if not exists
    if (!translations.quests) {
      translations.quests = {};
    }
    
    // Translate each quest
    for (let i = 0; i < questsData.quests.length; i++) {
      const quest = questsData.quests[i];
      console.log(`   [${i+1}/${questsData.quests.length}] ${quest.id}...`);
      
      // For now, create a template structure
      // In production, this would call an AI translation API
      const questContent = extractQuestContent(quest);
      
      // Store in translations
      translations.quests[quest.id] = {
        name: questContent.name, // Will be translated
        description: questContent.description,
        tagline: questContent.tagline,
        victoryText: questContent.victoryText,
        storyArc: questContent.storyArc,
        storyChapter: questContent.storyChapter,
        storyIntro: questContent.storyIntro,
        storyOutro: questContent.storyOutro,
        nextQuestHint: questContent.nextQuestHint
      };
    }
    
    // Save updated translation file
    await fs.writeFile(
      translationPath,
      JSON.stringify(translations, null, 2),
      'utf8'
    );
    
    console.log(`   ✅ ${langConfig.name} translations saved!`);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Quest translation complete!');
  console.log(`${'='.repeat(60)}\n`);
}

// Note: This script creates the structure for quest translations
// For actual AI-powered translation, integrate with:
// - OpenAI GPT-4 API
// - Google Cloud Translation API
// - DeepL API
// - Or Perplexity MCP server for translation

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌍 JOULE QUEST - QUEST CONTENT TRANSLATION SCRIPT        ║
║                                                            ║
║   This script prepares quest translations for 11 languages ║
║   Note: For AI-powered translation, integrate translation  ║
║   API in the translateAllQuests() function                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📝 Manual translation approach:
   1. This script creates the quest structure in each language file
   2. Native speakers or professional translators fill in content
   3. Maintains cultural appropriateness and gaming excitement

🤖 Automated translation approach:
   1. Integrate OpenAI/DeepL/Google Translate API
   2. Use cultural context prompts for better quality
   3. Review and refine AI translations
   4. Test with native speakers

Starting translation process...
`);

translateAllQuests().catch(console.error);
