/**
 * Confetti Animation - Celebration effect for quest completion
 * Lightweight canvas-based confetti
 */
class ConfettiAnimation {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
  }

  /**
   * Initialize confetti canvas
   */
  init() {
    // Create canvas if it doesn't exist
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'joule-quest-confetti';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999998;
      `;
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    // Set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Create confetti particles
   */
  createParticles() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        width: Math.random() * 10 + 5,
        height: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }
  }

  /**
   * Update particle positions
   */
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      
      // Remove particles that are off screen
      if (p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Draw particles
   */
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      this.ctx.restore();
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.updateParticles();
    this.drawParticles();

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.cleanup();
    }
  }

  /**
   * Start confetti celebration
   */
  celebrate() {
    console.log('[JouleQuest] 🎉 Starting confetti celebration');
    
    // Defensive check: ensure document.body exists
    if (!document.body) {
      console.warn('[JouleQuest] Cannot start confetti - document.body not ready');
      return;
    }
    
    this.init();
    this.createParticles();
    this.animate();
  }

  /**
   * Stop animation and cleanup
   */
  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.particles = [];
  }

  /**
   * Remove canvas from DOM
   */
  destroy() {
    this.cleanup();
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
  }
}

// Create global confetti instance
window.JouleQuestConfetti = new ConfettiAnimation();
