/**
 * Share Card Generator
 * Generates shareable social media cards for quest completions
 */

class ShareCardGenerator {
  constructor() {
    this.cardWidth = 1200;
    this.cardHeight = 630;
  }

  /**
   * Get gradient colors based on difficulty
   */
  getGradientColors(difficulty) {
    const gradients = {
      'Easy': ['#10b981', '#059669'],      // Green
      'Medium': ['#3b82f6', '#2563eb'],    // Blue
      'Hard': ['#8b5cf6', '#7c3aed']       // Purple
    };
    return gradients[difficulty] || gradients['Easy'];
  }

  /**
   * Generate share card canvas
   */
  generateCard(questData) {
    const canvas = document.createElement('canvas');
    canvas.width = this.cardWidth;
    canvas.height = this.cardHeight;
    const ctx = canvas.getContext('2d');

    // Get gradient colors
    const [color1, color2] = this.getGradientColors(questData.difficulty);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.cardHeight);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

    // Add subtle overlay pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * this.cardWidth,
        Math.random() * this.cardHeight,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Trophy emoji
    ctx.font = 'bold 140px Arial';
    ctx.fillText('🏆', 60, 180);

    // Main heading
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.fillText('QUEST COMPLETE!', 260, 120);

    // Quest name (wrapped if needed)
    ctx.font = 'bold 42px Inter, Arial, sans-serif';
    const questName = this.wrapText(ctx, questData.name, 880);
    let yPos = 200;
    questName.forEach(line => {
      ctx.fillText(line, 260, yPos);
      yPos += 50;
    });

    // Stats section
    yPos += 30;
    ctx.font = '36px Inter, Arial, sans-serif';
    
    // Points
    ctx.fillText(`💎 Points Earned: ${questData.points}`, 260, yPos);
    yPos += 55;
    
    // Difficulty
    const difficultyEmoji = {
      'Easy': '⭐',
      'Medium': '⚡',
      'Hard': '🔥'
    }[questData.difficulty] || '⭐';
    ctx.fillText(`${difficultyEmoji} Difficulty: ${questData.difficulty}`, 260, yPos);

    // Branding section
    yPos = this.cardHeight - 140;
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillText('🎮 Joule Quest', 260, yPos);
    
    yPos += 50;
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.fillText('Zero-risk SAP training in Chrome', 260, yPos);
    
    yPos += 45;
    ctx.font = '24px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('👉 chrome.google.com/webstore', 260, yPos);

    return canvas;
  }

  /**
   * Wrap text to fit within max width
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * Generate shareable text for clipboard
   */
  generateShareText(questData) {
    return `🏆 Just completed "${questData.name}"!

💎 Points: ${questData.points}
${this.getDifficultyEmoji(questData.difficulty)} Difficulty: ${questData.difficulty}

🎮 Training with Joule Quest - zero-risk SAP learning
👉 Get it: [Chrome Web Store Link]

#JouleQuest #SAPSkills #SuccessFactors #Joule`;
  }

  /**
   * Get difficulty emoji
   */
  getDifficultyEmoji(difficulty) {
    return {
      'Easy': '⭐',
      'Medium': '⚡',
      'Hard': '🔥'
    }[difficulty] || '⭐';
  }

  /**
   * Download card as PNG
   */
  async downloadCard(canvas, questId) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `joule-quest-${questId}.png`;
        link.href = url;
        link.click();
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);
        resolve();
      }, 'image/png');
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }

  /**
   * Copy image to clipboard (if supported)
   */
  async copyImageToClipboard(canvas) {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to copy image:', err);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareCardGenerator;
}
