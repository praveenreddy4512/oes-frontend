/**
 * AI Extension & Copilot Detection System - V2 (Premium UI)
 * Detects and blocks AI tools during exam sessions with striking UI
 */

class AIExtensionDetector {
  constructor(studentId, examId, options = {}) {
    this.studentId = studentId;
    this.examId = examId;
    this.aiExtensionEvents = [];
    this.strikeCount = 0;
    this.maxStrikes = options.maxStrikes || 5;
    this.onStrike = options.onStrike || (() => { });
    this.onLimitReached = options.onLimitReached || (() => { });
    this.isActive = false;
    this.devtoolsInterval = null;
  }

  init() {
    this.isActive = true;
    this.detectCopilotShortcuts();
    this.detectClipboardAccess();
    this.detectExtensionRequests();
    this.detectBrowserDevTools();
    this.detectSuspiciousNetwork();
    this.detectContextMenu();
    this.monitorFocusChange();
    this.injectStyles();
    this.disableBrowserShortcuts();
    console.log('🛡️ AI Security System Active');
  }

  /**
   * Stop all detection (called on submit)
   */
  stop() {
    this.isActive = false;
    if (this.devtoolsInterval) clearInterval(this.devtoolsInterval);
    document.body.classList.remove('exam-secure');
    console.log('🏁 AI Security System Deactivated');
  }

  /**
   * Inject premium CSS for high-end security visuals
   */
  injectStyles() {
    if (document.getElementById('ai-detector-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-detector-styles';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

      @keyframes security-fade-in {
        from { opacity: 0; filter: blur(10px); transform: scale(0.95); }
        to { opacity: 1; filter: blur(0); transform: scale(1); }
      }

      @keyframes strike-pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }

      .ai-security-overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(20px) saturate(160%);
        z-index: 2000000;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Outfit', sans-serif;
        color: #111827;
      }

      .ai-security-card {
        background: #FFFFFF;
        border: 1px solid rgba(0, 0, 0, 0.05);
        width: 90%;
        max-width: 440px;
        border-radius: 40px;
        padding: 56px 40px;
        text-align: center;
        animation: security-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15);
      }

      .security-icon-box {
        width: 84px;
        height: 84px;
        background: #F3F4F6;
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 38px;
        margin: 0 auto 32px;
      }

      .security-title {
        font-size: 30px;
        font-weight: 800;
        margin-bottom: 12px;
        letter-spacing: -0.02em;
        color: #111827;
      }

      .security-msg {
        font-size: 16px;
        color: #4B5563;
        line-height: 1.6;
        margin-bottom: 40px;
      }

      .strike-tracker {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .strike-dot {
        width: 48px;
        height: 10px;
        background: #E5E7EB;
        border-radius: 12px;
        transition: all 0.4s ease;
      }

      .strike-dot.active {
        background: #DC2626;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
      }

      .strike-dot.pulse {
        animation: strike-pulse 1.8s infinite;
      }

      .strike-text {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #9CA3AF;
      }

      .security-footer {
        margin-top: 48px;
        font-size: 13px;
        font-weight: 600;
        color: #9CA3AF;
      }

      body.exam-secure {
        user-select: none !important;
        cursor: default;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('exam-secure');
  }

  disableBrowserShortcuts() {
    document.addEventListener('keydown', (e) => {
      const isBlocked = (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase());
      if (isBlocked) {
        e.preventDefault();
        this.logAIEvent('RESTRICTED_KEYBOARD_SHORTCUT', { key: e.key });
      }
    }, true);
  }

  detectCopilotShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Detected shortcuts:
      // - Ctrl/Meta + I (Copilot/Inline AI)
      // - Ctrl/Meta + Shift + . (Microsoft Edge Copilot Sidebar)
      // - Alt + C (Microsoft Edge Copilot alternative)
      // - Ctrl/Meta + ? (Help/AI Assistance)
      // - Ctrl/Meta + Shift + G (Gemini/Google Sidebar)
      
      const isMicrosoftEdgeCopilot = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '.' || e.code === 'Period');
      const isAltCopilot = e.altKey && e.key.toLowerCase() === 'c';
      const isStandardAI = (e.ctrlKey || e.metaKey) && ['i', '?', 'g'].includes(e.key.toLowerCase());

      if (isMicrosoftEdgeCopilot || isAltCopilot || isStandardAI) {
        e.preventDefault();
        this.logAIEvent('AI_INTEGRATION_SHORTCUT', { 
          shortcut: `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}` 
        });
      }
    }, true);
  }

  detectClipboardAccess() {
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      this.logAIEvent('SECURITY_BYPASS_COPY');
    }, true);

    document.addEventListener('paste', (e) => {
      e.preventDefault();
      this.logAIEvent('SECURITY_BYPASS_PASTE');
    }, true);
  }

  detectExtensionRequests() {
    const log = (msg) => this.logAIEvent('AI_EXTENSION_TRAFFIC', { msg });
    if (typeof chrome !== 'undefined' && chrome.runtime) chrome.runtime.sendMessage = () => { log('Chrome'); return null; };
    if (typeof browser !== 'undefined' && browser.runtime) browser.runtime.sendMessage = () => { log('Firefox'); return null; };
  }

  detectBrowserDevTools() {
    this.devtoolsInterval = setInterval(() => {
      if (!this.isActive) return;
      const start = performance.now();
      debugger;
      if (performance.now() - start > 100) this.logAIEvent('DEV_TOOLS_OVERLAY');
    }, 2000);
  }

  detectSuspiciousNetwork() {
    const orig = window.fetch;
    const self = this;
    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      if (['openai', 'anthropic', 'gemini'].some(key => url.includes(key))) {
        self.logAIEvent('AI_CLOUD_SYNC_DETECTED');
        return Promise.reject(new Error('Blocked'));
      }
      return orig.apply(this, args);
    };
  }

  detectContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.logAIEvent('UNAUTHORIZED_CONTEXT_MENU');
    }, true);
  }

  monitorFocusChange() {
    // 1. Detect when student switches tabs (Visibility API)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isActive) {
        this.logAIEvent('TAB_SWITCHED_AWAY');
      }
    });

    // 2. Detect when student clicks out of the window (blur)
    // Only logs if the tab is still visible (avoids double counting with visibilitychange)
    window.addEventListener('blur', () => {
      if (!document.hidden && this.isActive) {
        this.logAIEvent('UNAUTHORIZED_CONTEXT_SWITCH');
      }
    });
  }

  /**
   * Log strike and show the state-of-the-art UI
   */
  logAIEvent(eventType, data) {
    if (!this.isActive) return;
    
    this.strikeCount++;
    const strikesLeft = Math.max(0, this.maxStrikes - this.strikeCount);

    // Log event data
    const event = { 
      type: eventType, 
      data, 
      strikeCount: this.strikeCount, 
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleTimeString() // Capture student's local time
    };
    this.aiExtensionEvents.push(event);

    console.error(`[🚨 SECURITY BREACH] Level: HIGH | Count: ${this.strikeCount}/${this.maxStrikes}`);

    // SHOW POPUP FOR EVERY SINGLE EVENT
    if (this.strikeCount >= this.maxStrikes) {
      this.showPremiumSecurityModal('Exam Terminated', 'Multiple safety rules were broken. Your answers are now being submitted automatically.', true);
      this.onLimitReached();
    } else {
      const remaining = this.maxStrikes - this.strikeCount;
      this.showPremiumSecurityModal('Security Warning', `Unusual activity detected. Please stay focused. If you get ${remaining} more ${remaining === 1 ? 'warning' : 'warnings'}, your exam will end.`, false);
      this.onStrike(this.strikeCount, strikesLeft);
    }

    this.sendEventToServer({
      ...event,
      allEvents: this.aiExtensionEvents, // Include history for email "reason"
      isFinalStrike: this.strikeCount >= this.maxStrikes
    });
  }

  async sendEventToServer(event) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/submissions/ai-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, student_id: this.studentId, exam_id: this.examId })
      });
    } catch (e) { }
  }

  /**
   * High-end Modern Security Overlay
   */
  showPremiumSecurityModal(title, message, isBlocked) {
    document.querySelectorAll('.ai-security-overlay').forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.className = 'ai-security-overlay';

    const icon = isBlocked ? '🔒' : '⚠️';
    
    overlay.innerHTML = `
      <div class="ai-security-card">
        <div class="security-icon-box" style="${isBlocked ? 'color: #EF4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2);' : 'color: #FBBF24;'}">
          ${icon}
        </div>
        <h2 class="security-title">${title}</h2>
        <p class="security-msg">${message}</p>
        
        <div class="strike-tracker">
          ${Array.from({ length: this.maxStrikes }).map((_, i) => `
            <div class="strike-dot ${i < this.strikeCount ? 'active' : ''} ${i === this.strikeCount - 1 && !isBlocked ? 'pulse' : ''}"></div>
          `).join('')}
        </div>
        <div class="strike-text">
          ${isBlocked ? 'ACCESS REVOKED' : `STRIKE ${this.strikeCount} OF ${this.maxStrikes}`}
        </div>

        <div class="security-footer">
          Auto-closing in <span id="security-cd">5</span>s
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft--;
      const cd = document.getElementById('security-cd');
      if (cd) cd.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        if (!isBlocked) {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
          overlay.style.filter = 'blur(10px)';
          setTimeout(() => overlay.remove(), 500);
        } else {
          // Final redirect to home page
          window.location.href = '/dashboard';
        }
      }
    }, 1000);
  }

  getSummary() {
    return { events: this.aiExtensionEvents, strikeCount: this.strikeCount };
  }
}

export default AIExtensionDetector;
