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
   * Draw Joule Quest logo on canvas
   */
  drawLogo(ctx, x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size * 0.4;

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.08;
    ctx.stroke();

    // Segmented middle ring
    ctx.save();
    ctx.translate(centerX, centerY);
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.rotate(Math.PI / 3);
      
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.9);
      ctx.lineTo(0, -radius * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = size * 0.06;
      ctx.stroke();
    }
    ctx.restore();

    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // Crosshair
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius * 0.4);
    ctx.lineTo(centerX, centerY + radius * 0.4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.4, centerY);
    ctx.lineTo(centerX + radius * 0.4, centerY);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#667eea';
    ctx.fill();
  }

  /**
   * Generate achievement badge canvas with logo
   */
  generateCard(questData, userStats = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = this.cardWidth;
    canvas.height = this.cardHeight;
    const ctx = canvas.getContext('2d');

    // Get gradient colors based on solution or difficulty
    let [color1, color2] = this.getGradientColors(questData.difficulty);
    
    // Override with solution theme if available
    if (questData.solution) {
      const solutionGradients = {
        's4hana': ['#ff6b35', '#ff9e00'],
        'successfactors': ['#7b2cbf', '#9d4edd']
      };
      if (solutionGradients[questData.solution]) {
        [color1, color2] = solutionGradients[questData.solution];
      }
    }

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

    // Draw Joule Quest logo (left side)
    this.drawLogo(ctx, 50, 50, 180);

    // Main heading
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.fillText('QUEST COMPLETE!', 280, 120);

    // Quest name (wrapped if needed)
    ctx.font = 'bold 42px Inter, Arial, sans-serif';
    const questName = this.wrapText(ctx, questData.name, 880);
    let yPos = 200;
    questName.forEach(line => {
      ctx.fillText(line, 280, yPos);
      yPos += 50;
    });

    // Stats section with icons
    yPos += 30;
    ctx.font = '36px Inter, Arial, sans-serif';
    
    // Points earned this quest
    ctx.fillText(`💎 Points Earned: ${questData.points}`, 280, yPos);
    yPos += 55;
    
    // Difficulty
    const difficultyEmoji = {
      'Easy': '⭐',
      'Medium': '⚡',
      'Hard': '🔥'
    }[questData.difficulty] || '⭐';
    ctx.fillText(`${difficultyEmoji} Difficulty: ${questData.difficulty}`, 280, yPos);
    
    // User stats section (if provided)
    if (userStats.totalPoints || userStats.questsCompleted) {
      yPos += 70;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(280, yPos);
      ctx.lineTo(1100, yPos);
      ctx.stroke();
      
      yPos += 50;
      ctx.font = 'bold 32px Inter, Arial, sans-serif';
      ctx.fillText('YOUR ACHIEVEMENTS', 280, yPos);
      
      yPos += 50;
      ctx.font = '32px Inter, Arial, sans-serif';
      
      if (userStats.totalPoints) {
        ctx.fillText(`⭐ Total Points: ${userStats.totalPoints}`, 280, yPos);
        yPos += 50;
      }
      
      if (userStats.questsCompleted) {
        ctx.fillText(`🏆 Quests Completed: ${userStats.questsCompleted}`, 280, yPos);
        yPos += 50;
      }
      
      if (userStats.streak) {
        ctx.fillText(`🔥 Current Streak: ${userStats.streak} days`, 280, yPos);
      }
    }

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
    return `🏆 Just completed "${questData.name}" in Joule Quest!

💎 ${questData.points} points earned
${this.getDifficultyEmoji(questData.difficulty)} ${questData.difficulty} difficulty

Master SAP SuccessFactors Joule with zero-risk, gamified training.

#JouleQuest #SAPSkills #SuccessFactors`;
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

// Make available globally in browser context
window.ShareCardGenerator = ShareCardGenerator;
