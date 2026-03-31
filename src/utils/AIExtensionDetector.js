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
    this.maxStrikes = options.maxStrikes || 3;
    this.onStrike = options.onStrike || (() => { });
    this.onLimitReached = options.onLimitReached || (() => { });
  }

  /**
   * Initialize AI extension detection
   */
  init() {
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
   * Inject premium CSS for high-end security visuals
   */
  injectStyles() {
    if (document.getElementById('ai-detector-styles')) return;

    const style = document.createElement('style');
    style.id = 'ai-detector-styles';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');

      @keyframes ai-pulse {
        0% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 0px rgba(239, 68, 68, 0)); }
        50% { transform: translate(-50%, -50%) scale(1.02); filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.4)); }
        100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 0px rgba(239, 68, 68, 0)); }
      }

      @keyframes ai-slide-up {
        from { opacity: 0; transform: translate(-50%, -30%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }

      .ai-security-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(12px) saturate(180%);
        z-index: 1000000;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 0.3s ease;
      }

      .ai-security-card {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.3);
        width: 90%;
        max-width: 480px;
        border-radius: 32px;
        padding: 48px 40px;
        text-align: center;
        box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
        font-family: 'Outfit', sans-serif;
        position: relative;
        animation: ai-slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .ai-badge-suspicious {
        display: inline-block;
        background: linear-gradient(90deg, #F87171, #EF4444);
        color: white;
        padding: 6px 16px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      .ai-icon-pulse {
        width: 96px;
        height: 96px;
        background: #FEE2E2;
        border-radius: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 32px;
        font-size: 48px;
        color: #EF4444;
        animation: ai-pulse 2s infinite ease-in-out;
      }

      .ai-security-title {
        color: #111827;
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 16px;
        letter-spacing: -0.02em;
      }

      .ai-security-desc {
        color: #4B5563;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 36px;
      }

      .ai-strike-bar {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .ai-strike-segment {
        flex: 1;
        height: 10px;
        border-radius: 5px;
        background: #F3F4F6;
        overflow: hidden;
        position: relative;
      }

      .ai-strike-segment.filled {
        background: linear-gradient(90deg, #EF4444, #B91C1C);
      }

      .ai-strike-label {
        font-size: 13px;
        font-weight: 600;
        color: #9CA3AF;
        margin-top: 12px;
      }

      .ai-security-timer {
        position: absolute;
        bottom: -60px;
        left: 0;
        width: 100%;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        font-weight: 500;
      }

      /* Disable all text interactions */
      body.exam-secure {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
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
    setInterval(() => {
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
    window.addEventListener('blur', () => {
      if (!document.hidden) this.logAIEvent('UNAUTHORIZED_CONTEXT_SWITCH');
    });
  }

  /**
   * Log strike and show the state-of-the-art UI
   */
  logAIEvent(eventType, data) {
    this.strikeCount++;
    const strikesLeft = Math.max(0, this.maxStrikes - this.strikeCount);

    // Log event data
    const event = { type: eventType, data, strikeCount: this.strikeCount, timestamp: new Date().toISOString() };
    this.aiExtensionEvents.push(event);

    console.error(`[🚨 SECURITY BREACH] Level: HIGH | Count: ${this.strikeCount}/${this.maxStrikes}`);

    // SHOW POPUP FOR EVERY SINGLE EVENT
    if (this.strikeCount >= this.maxStrikes) {
      this.showPremiumSecurityModal('Security Breach: Critical', 'The maximum limit for suspicious activity has been exceeded. The system is now initiating an automatic submission to protect exam integrity.', true);
      this.onLimitReached();
    } else {
      this.showPremiumSecurityModal('Suspicious Activity: High', 'Unauthorized interaction detected. Your actions have been flagged and recorded by the system. Please remain focused on the exam interface.', false);
      this.onStrike(this.strikeCount, strikesLeft);
    }

    this.sendEventToServer(event);
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
  showPremiumSecurityModal(title, message, isLast) {
    document.querySelectorAll('.ai-security-overlay').forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.className = 'ai-security-overlay';

    const card = document.createElement('div');
    card.className = 'ai-security-card';

    const icon = isLast ? '⛔' : '🛡️';
    const statusText = isLast ? 'ACCOUNT FLAG: CRITICAL' : 'SUSPICIOUS ACTIVITY: HIGH';

    card.innerHTML = `
      <div class="ai-badge-suspicious" style="${isLast ? 'background: #000;' : ''}">${statusText}</div>
      <div class="ai-icon-pulse" style="${isLast ? 'background: #111; color: #fff;' : ''}">
        <span>${icon}</span>
      </div>
      <h2 class="ai-security-title">${title}</h2>
      <p class="ai-security-desc">${message}</p>
      
      <div class="ai-strike-bar">
        ${Array.from({ length: this.maxStrikes }).map((_, i) => `
          <div class="ai-strike-segment ${i < this.strikeCount ? 'filled' : ''}"></div>
        `).join('')}
      </div>
      <div class="ai-strike-label">
        ${isLast ? 'FINAL BREACH RECORDED' : `SECURITY STRIKE ${this.strikeCount} OF ${this.maxStrikes}`}
      </div>

      <div class="ai-security-timer">This window will dismiss in <span id="security-cd">5</span>s</div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Countdown and auto-dismiss
    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft--;
      if (document.getElementById('security-cd')) {
        document.getElementById('security-cd').textContent = timeLeft;
      }
      if (timeLeft <= 0) {
        clearInterval(interval);
        if (!isLast) {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 300);
        }
      }
    }, 1000);
  }

  getSummary() {
    return { events: this.aiExtensionEvents, strikeCount: this.strikeCount };
  }
}

export default AIExtensionDetector;
